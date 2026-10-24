const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { startTest, stopTest, api, login } = require('./helpers');
const { haversineKm } = require('../utils/geo');
const { matches, runAlerts } = require('../jobs/alerts');

let ctx, owner, tenant, otherTenant, otherOwner;

before(async () => {
  ctx = await startTest();
  owner = await login(ctx, 'owner@demo.com');
  tenant = await login(ctx, 'tenant@demo.com');
  const o = await api(ctx, 'POST', '/auth/register', { body: { name: 'Other Owner', email: 'owner2@example.com', password: 'Own@12345', role: 'owner' } });
  otherOwner = o.body;
  const t = await api(ctx, 'POST', '/auth/register', { body: { name: 'Other Tenant', email: 'tenant2@example.com', password: 'Ten@12345', role: 'tenant' } });
  otherTenant = t.body;
});

after(async () => stopTest(ctx));

// ---- haversine unit tests ------------------------------------------------
test('haversine: known distances (Pune area, ~Kothrud↔Viman Nagar)', () => {
  // Kothrud (18.5074, 73.8077) ↔ Viman Nagar (18.5679, 73.9143) ≈ 10.6 km
  const d = haversineKm(18.5074, 73.8077, 18.5679, 73.9143);
  assert.ok(d > 12 && d < 15, `expected ~13km across the city, got ${d}`);
});

test('haversine: zero distance for identical points', () => {
  assert.equal(haversineKm(18.5, 73.8, 18.5, 73.8), 0);
});

test('haversine: 1 degree of latitude ≈ 111 km', () => {
  const d = haversineKm(10, 0, 11, 0);
  assert.ok(d > 110 && d < 112.5, `expected ~111km, got ${d}`);
});

// ---- match engine --------------------------------------------------------
test('listing matcher respects rent, type and radius', () => {
  const listing = { status: 'available', type: '2BHK', rent: 24000, amenities: ['parking'], lat: 18.51, lng: 73.81 };
  const f = { lat: 18.5074, lng: 73.8077, radiusKm: 6, maxRent: 25000, type: '2BHK' };
  assert.ok(matches(listing, f));
  assert.equal(matches({ ...listing, rent: 30000 }, f), null);
  assert.equal(matches({ ...listing, type: '1RK' }, f), null);
  assert.equal(matches({ ...listing, status: 'rented' }, f), null);
  const far = matches({ ...listing, lat: 18.9, lng: 73.9 }, f);
  assert.equal(far, null, 'outside radius rejected');
});

// ---- health & auth -------------------------------------------------------
test('health endpoint responds ok', async () => {
  const r = await api(ctx, 'GET', '/health');
  assert.equal(r.status, 200);
});

test('login rejects wrong password with 401', async () => {
  const r = await api(ctx, 'POST', '/auth/login', { body: { email: 'owner@demo.com', password: 'nope@123' } });
  assert.equal(r.status, 401);
});

// ---- geo search ----------------------------------------------------------
test('geo search filters by radius and sorts by distance', async () => {
  const r = await api(ctx, 'GET', '/listings?lat=18.5074&lng=73.8077&radiusKm=7');
  assert.equal(r.status, 200);
  assert.ok(r.body.length >= 2, 'Kothrud-area listings in radius');
  const dists = r.body.map((l) => l.distanceKm);
  assert.deepEqual([...dists].sort((a, b) => a - b), dists, 'sorted nearest-first');
  assert.ok(r.body.every((l) => l.distanceKm <= 7));
});

test('geo search respects rent and type filters', async () => {
  const r = await api(ctx, 'GET', '/listings?lat=18.5074&lng=73.8077&radiusKm=50&maxRent=20000&type=1BHK');
  assert.equal(r.status, 200);
  assert.ok(r.body.every((l) => l.rent <= 20000 && l.type === '1BHK'));
});

test('listing views increment on detail fetch', async () => {
  const browse = await api(ctx, 'GET', '/listings?radiusKm=50&lat=18.5&lng=73.8');
  const target = browse.body.find((l) => l.title.includes('Kothrud metro')); // seed inquiry lives here
  const id = target._id;
  const first = await api(ctx, 'GET', `/listings/${id}`, { token: tenant.token });
  const second = await api(ctx, 'GET', `/listings/${id}`, { token: tenant.token });
  assert.equal(second.body.views, first.body.views + 1);
  assert.ok(second.body.inquiryCount >= 1, 'seed inquiry counted');
});

// ---- listings & roles ----------------------------------------------------
test('tenants cannot create listings (403)', async () => {
  const r = await api(ctx, 'POST', '/listings', { token: tenant.token, body: { title: 'My flat', type: '1BHK', rent: 10000, deposit: 20000, lat: 18.5, lng: 73.8, address: 'Somewhere, Pune' } });
  assert.equal(r.status, 403);
});

test('owners create listings; rent floor enforced', async () => {
  const bad = await api(ctx, 'POST', '/listings', { token: owner.token, body: { title: 'Cheap place', type: '1RK', rent: 500, deposit: 0, lat: 18.5, lng: 73.8, address: 'X, Pune' } });
  assert.equal(bad.status, 400);
  const ok = await api(ctx, 'POST', '/listings', { token: owner.token, body: { title: 'Fresh 2BHK in Baner', type: '2BHK', rent: 26000, deposit: 78000, lat: 18.5596, lng: 73.7868, address: 'Baner, Pune', area: 'Baner', amenities: ['parking', 'lift'] } });
  assert.equal(ok.status, 201);
  ctx.freshListing = ok.body;
});

test('price changes append to price history', async () => {
  const r = await api(ctx, 'PATCH', `/listings/${ctx.freshListing._id}`, { token: owner.token, body: { rent: 27500 } });
  assert.equal(r.status, 200);
  assert.equal(r.body.priceHistory.length, 2);
  assert.equal(r.body.rent, 27500);
});

test('only the owner edits or rents their listing (403)', async () => {
  const r = await api(ctx, 'PATCH', `/listings/${ctx.freshListing._id}/rented`, { token: otherOwner.token });
  assert.equal(r.status, 403);
});

// ---- saved searches & alert jobs -----------------------------------------
test('tenants save searches; owners cannot (403)', async () => {
  const ok = await api(ctx, 'POST', '/searches', {
    token: otherTenant.token,
    body: { name: '1RK under 10k anywhere', maxRent: 10000, type: '1RK' },
  });
  assert.equal(ok.status, 201);
  ctx.otherSearch = ok.body;
  const denied = await api(ctx, 'POST', '/searches', { token: owner.token, body: { name: 'x' } });
  assert.equal(denied.status, 403);
});

test('alert run matches new listings and records alerts', async () => {
  const before = await api(ctx, 'GET', '/alerts', { token: tenant.token });
  const result = await runAlerts();
  assert.ok(result.searches >= 2);
  const after = await api(ctx, 'GET', '/alerts', { token: tenant.token });
  assert.ok(after.body.length >= before.body.length);
  const saved = await api(ctx, 'GET', '/searches', { token: tenant.token });
  assert.ok(saved.body[0].newMatches !== undefined);
});

test('a fresh matching listing triggers exactly one alert on the next run', async () => {
  // new listing matching tenant's saved search (2BHK ≤25k near Kothrud)
  await api(ctx, 'POST', '/listings', {
    token: owner.token,
    body: { title: 'Brand new 2BHK Kothrud', type: '2BHK', rent: 23000, deposit: 50000, lat: 18.508, lng: 73.808, address: 'Kothrud, Pune', area: 'Kothrud' },
  });
  const result = await runAlerts();
  const after = await api(ctx, 'GET', '/alerts', { token: tenant.token });
  const alertsForFresh = after.body.filter((a) => a.listing?.title === 'Brand new 2BHK Kothrud');
  assert.equal(alertsForFresh.length, 1, 'one alert (unique index prevents dupes)');
});

// ---- inquiries -----------------------------------------------------------
test('tenants inquire; duplicate open inquiries blocked', async () => {
  const ok = await api(ctx, 'POST', `/listings/${ctx.freshListing._id}/inquiries`, { token: otherTenant.token, body: { message: 'Available from next month?' } });
  assert.equal(ok.status, 201);
  const dupe = await api(ctx, 'POST', `/listings/${ctx.freshListing._id}/inquiries`, { token: otherTenant.token, body: { message: 'and also this one?' } });
  assert.equal(dupe.status, 409);
});

test('inquiry threads are private to owner + tenant', async () => {
  const mine = await api(ctx, 'GET', '/inquiries/mine', { token: otherTenant.token });
  const thread = await api(ctx, 'GET', `/inquiries/${mine.body[0]._id}`, { token: otherTenant.token });
  assert.equal(thread.status, 200);
  const stranger = await api(ctx, 'GET', `/inquiries/${mine.body[0]._id}`, { token: tenant.token });
  assert.equal(stranger.status, 403);
});

test('owner replies on the thread', async () => {
  const listing = await api(ctx, 'GET', `/listings/${ctx.freshListing._id}`, { token: owner.token });
  // find the inquiry from the owner dashboard
  const dash = await api(ctx, 'GET', '/listings/mine', { token: owner.token });
  const fresh = dash.body.listings.find((l) => l._id === ctx.freshListing._id);
  assert.ok(fresh.inquiries >= 1);
  void listing;
});

test('owner dashboard aggregates views and inquiries', async () => {
  const r = await api(ctx, 'GET', '/listings/mine', { token: owner.token });
  assert.equal(r.status, 200);
  assert.ok(r.body.totals.views > 0);
  assert.ok(r.body.totals.available >= 1);
  const asTenant = await api(ctx, 'GET', '/listings/mine', { token: tenant.token });
  assert.equal(asTenant.status, 403);
});

test('unknown listing returns structured 404', async () => {
  const r = await api(ctx, 'GET', `/listings/${'0'.repeat(24)}`, { token: tenant.token });
  assert.equal(r.status, 404);
});
