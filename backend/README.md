# RentalRadar backend

Express + Mongoose API for RentalRadar. See the repo root README for the full product overview.

- `npm start` — production start (alert cron every 10 min)
- `npm run dev` — watch mode
- `npm test` — 21-check smoke suite incl. haversine + matcher tests (in-memory MongoDB)
- `npm run seed` — seed demo data into `MONGODB_URI`
- `npm run atlas-check` — verify the Atlas connection string

Zero-config demo: `USE_MEMORY_DB=1 npm start` boots an ephemeral database,
seeds it if empty, and logs the demo credentials. Manual alert run:
`curl -X POST localhost:5114/api/jobs/run-alerts`.
