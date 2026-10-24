const cron = require('node-cron');
const SavedSearch = require('../models/SavedSearch.model');
const Listing = require('../models/Listing.model');
const Alert = require('../models/Alert.model');
const { haversineKm } = require('../utils/geo');

// Matches a listing against one saved search's filters.
function matches(listing, filters) {
  if (listing.status !== 'available') return null;
  if (filters.type && listing.type !== filters.type) return null;
  if (filters.minRent && listing.rent < filters.minRent) return null;
  if (filters.maxRent && listing.rent > filters.maxRent) return null;
  if (filters.amenities?.length && !filters.amenities.every((a) => listing.amenities.includes(a))) return null;
  if (filters.lat !== undefined && filters.lng !== undefined && filters.radiusKm) {
    const d = haversineKm(filters.lat, filters.lng, listing.lat, listing.lng);
    if (d > filters.radiusKm) return null;
  }
  return listing;
}

// Runs every saved search against listings that appeared (or re-listed) since
// its last run. Injectable `since` for tests. Returns per-search match counts.
async function runAlerts({ now = new Date() } = {}) {
  const searches = await SavedSearch.find().populate('tenant', '_id');
  const summary = [];
  for (const search of searches) {
    const candidates = await Listing.find({
      createdAt: { $gt: search.lastRunAt || new Date(0) },
      status: 'available',
    });
    const matched = candidates.map((l) => matches(l, search.filters)).filter(Boolean);

    for (const listing of matched) {
      await Alert.updateOne(
        { tenant: search.tenant._id, listing: listing._id, savedSearch: search._id },
        {
          $setOnInsert: {
            tenant: search.tenant._id,
            listing: listing._id,
            savedSearch: search._id,
            reason: `Matches "${search.name}" — ₹${listing.rent.toLocaleString('en-IN')}/mo ${listing.type} in ${listing.area || listing.address}`,
          },
        },
        { upsert: true }
      );
    }
    search.lastRunAt = now;
    await search.save();
    summary.push({ search: search.name, new: matched.length });
  }
  return { searches: searches.length, summary };
}

function startScheduler() {
  // every 10 minutes
  return cron.schedule('*/10 * * * *', () => {
    runAlerts().catch((err) => console.error('Alert run failed:', err.message));
  });
}

module.exports = { runAlerts, matches, startScheduler };
