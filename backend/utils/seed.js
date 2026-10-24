const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const Listing = require('../models/Listing.model');
const SavedSearch = require('../models/SavedSearch.model');
const Inquiry = require('../models/Inquiry.model');

const DEMO_PASSWORD = 'Demo@1234';

// Real-ish Pune coordinates
const AREAS = {
  Kothrud: { lat: 18.5074, lng: 73.8077 },
  Baner: { lat: 18.5596, lng: 73.7868 },
  'Viman Nagar': { lat: 18.5679, lng: 73.9143 },
  Hadapsar: { lat: 18.5018, lng: 73.9260 },
  'Karve Nagar': { lat: 18.4890, lng: 73.8230 },
  Aundh: { lat: 18.5642, lng: 73.8077 },
};

async function seed() {
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const [owner, tenant] = await User.create(
    { name: 'Sunil Patil', email: 'owner@demo.com', passwordHash: hash, role: 'owner', phone: '9845012345' },
    { name: 'Anita Desai', email: 'tenant@demo.com', passwordHash: hash, role: 'tenant', phone: '9845098765' }
  );

  const LISTINGS = [
    ['2BHK near Kothrud metro', '2BHK', 24000, 72000, 'Kothrud', ['parking', 'lift', 'gated'], 5],
    ['Cozy 1BHK, fully furnished', '1BHK', 16000, 40000, 'Kothrud', ['furnished', 'ac', 'lift'], 9],
    ['Spacious 3BHK family flat', '3BHK', 42000, 126000, 'Baner', ['parking', 'gated', 'power backup', 'balcony'], 2],
    ['Studio 1RK for bachelors', '1RK', 9500, 20000, 'Karve Nagar', ['furnished', 'pets ok'], 11],
    ['PG with meals, girls only', 'PG', 8500, 8500, 'Viman Nagar', ['ac', 'furnished', 'gated'], 7],
    ['1BHK with big balcony', '1BHK', 18500, 55000, 'Aundh', ['balcony', 'parking', 'lift'], 3],
    ['2BHK new construction', '2BHK', 27000, 81000, 'Hadapsar', ['parking', 'lift', 'power backup'], 1],
    ['1RK budget gem', '1RK', 8000, 16000, 'Hadapsar', [], 14],
  ];
  for (const [title, type, rent, deposit, area, amenities, daysAgo] of LISTINGS) {
    const created = new Date(Date.now() - daysAgo * 86400000);
    await Listing.create({
      owner: owner._id, title, type, rent, deposit,
      lat: AREAS[area].lat + (Math.random() - 0.5) * 0.004,
      lng: AREAS[area].lng + (Math.random() - 0.5) * 0.004,
      address: `${area}, Pune`, area, amenities, createdAt: created,
      priceHistory: [{ at: created, rent }], views: Math.floor(Math.random() * 90),
    });
  }

  const saved = await SavedSearch.create({
    tenant: tenant._id,
    name: '2BHK under 25k near Kothrud',
    filters: { lat: AREAS.Kothrud.lat, lng: AREAS.Kothrud.lng, radiusKm: 6, maxRent: 25000, type: '2BHK' },
    lastRunAt: new Date(Date.now() - 3 * 86400000),
  });

  const listing = await Listing.findOne({ title: { $regex: 'Kothrud metro' } });
  await Inquiry.create({
    listing: listing._id, tenant: tenant._id,
    message: 'Hi, is the flat available from the 1st? Any broker charge?',
    moveIn: new Date(Date.now() + 10 * 86400000),
    replies: [{ by: owner._id, byName: owner.name, message: 'Available! No broker. Direct agreement.' }],
  });

  return { owner, tenant, saved };
}

module.exports = seed;
module.exports.DEMO_PASSWORD = DEMO_PASSWORD;
