const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const a = require('../controllers/auth.controller');
const l = require('../controllers/listing.controller');
const s = require('../controllers/search.controller');
const q = require('../controllers/inquiry.controller');
const { requireAuth } = require('../middlewares/auth');

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 50, standardHeaders: true, legacyHeaders: false });

router.post('/auth/register', authLimiter, a.register);
router.post('/auth/login', authLimiter, a.login);
router.get('/auth/me', requireAuth, a.me);

router.get('/amenities', l.amenities);
router.get('/listings', l.search); // public browse

router.use(requireAuth);
router.post('/listings', l.create);
router.get('/listings/mine', l.ownerDashboard); // before /:id
router.get('/listings/:id', l.getOne);
router.patch('/listings/:id', l.update);
router.patch('/listings/:id/rented', l.markRented);
router.delete('/listings/:id', l.remove);
router.post('/listings/:id/inquiries', q.send);

router.post('/searches', s.save);
router.get('/searches', s.listMine);
router.delete('/searches/:id', s.remove);
router.get('/alerts', s.alerts);
router.post('/alerts/read', s.markRead);

router.get('/inquiries/mine', q.mine);
router.get('/inquiries/:id', q.thread);
router.post('/inquiries/:id/reply', q.reply);

router.post('/jobs/run-alerts', async (req, res, next) => {
  try {
    const { runAlerts } = require('../jobs/alerts');
    res.json(await runAlerts());
  } catch (err) { next(err); }
});

module.exports = router;
