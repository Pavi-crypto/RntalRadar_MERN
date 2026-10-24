const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { startTest, stopTest, api, login } = require('./helpers');

let ctx, tenant, kothrudId;

before(async () => {
  ctx = await startTest();
  tenant = await login(ctx, 'tenant@demo.com');
  const browse = await api(ctx, 'GET', '/listings?lat=18.5074&lng=73.8077&radiusKm=50');
  kothrudId = browse.body.find((l) => l.area === 'Kothrud')?._id || browse.body[0]._id;
});

after(async () => stopTest(ctx));

test('price intelligence aggregates median/avg rent per area', async () => {
  const r = await api(ctx, 'GET', '/intelligence/prices');
  assert.equal(r.status, 200);
  const kothrud = r.body.areas.find((a) => a.area === 'Kothrud');
  assert.ok(kothrud, 'Kothrud present');
  assert.ok(kothrud.count >= 2);
  assert.ok(kothrud.medianRent >= kothrud.minRent);
  assert.ok(r.body.areas.every((a) => a.avgRent >= a.minRent));
});

test('similar listings: same type, within 2km, ±25% rent', async () => {
  const detail = await api(ctx, 'GET', `/listings/${kothrudId}`, { token: tenant.token });
  const target = detail.body;
  const r = await api(ctx, 'GET', `/listings/${kothrudId}/similar`, { token: tenant.token });
  assert.equal(r.status, 200);
  assert.ok(r.body.every((c) => c.type === target.type));
  assert.ok(r.body.every((c) => c.rent >= target.rent * 0.75 && c.rent <= target.rent * 1.25));
  assert.ok(r.body.every((c) => c.distanceKm <= 2));
  assert.ok(r.body.every((c) => c._id !== kothrudId));
});
