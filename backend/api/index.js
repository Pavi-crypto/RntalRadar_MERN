
const app = require('../app');
const { connectDB } = require('../config/db');

let dbPromise;

module.exports = async (req, res) => {
  try {
    if (!dbPromise) {
      dbPromise = connectDB().catch((err) => {
        dbPromise = null;
        throw err;
      });
    }

    await dbPromise;
    return app(req, res);
  } catch (err) {
    console.error('Database connection failed:', err.message);

    return res.status(500).json({
      error: 'Backend initialization failed',
    });
  }
};
