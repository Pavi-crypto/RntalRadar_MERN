# RentalRadar — Never Miss a Flat Again

A geo-aware rental search platform that helps tenants discover nearby rental properties, save their search preferences, and receive alerts when matching listings become available.

## 1. Problem Statement

Finding a suitable rental property can be time-consuming. Rental listings become outdated quickly, searching across multiple platforms requires repeated manual effort, and neighbourhood labels do not accurately represent the actual distance between a property and a user's preferred location.

RentalRadar addresses these problems through location-based property search, customizable filters, saved searches, and automated matching of new listings against existing search preferences.

## 2. Target Users

- **Tenants:** People searching for rental properties near their workplace, gym, family, or another preferred location.
- **Property Owners:** People who want to list rental properties, manage inquiries, and track interest in their listings.

## 3. Solution

RentalRadar provides a centralized interface for discovering and managing rental properties.

Tenants can search using location, radius, rent range, property type, and amenities. The backend calculates geographical distances using the Haversine formula and sorts matching listings by proximity.

Users can save their searches and receive in-app alerts when newly created listings match their preferences. Property owners can manage their listings, monitor views and inquiries, update rental prices, and mark properties as rented.

The application also supports conversations between tenants and property owners, helping keep rental inquiries organized.

## 4. Key Features

### Location-Based Property Search
- Search for properties around a selected geographical point.
- Filter listings by rent, property type, amenities, and search radius.
- Calculate actual geographical distances using the Haversine formula.
- Sort search results by proximity.
- Explore properties using an interactive SVG city map with a radius circle and property markers.

### Authentication and Authorization
- User registration and login.
- JWT-based authentication with seven-day token validity.
- Password hashing using bcryptjs.
- Separate tenant and owner roles.
- Protected operations and ownership-based access control.

### Property Management
- Create and manage rental listings as a property owner.
- Update property details and rental prices.
- Maintain price-change history.
- Mark properties as rented.
- View listing performance through the owner dashboard.

### Saved Searches and Alerts
- Save customized rental searches.
- Match new listings against saved search criteria.
- Generate in-app alerts for matching properties.
- Track the last execution time of saved searches.
- Prevent duplicate alerts through uniqueness constraints.
- Provide a manual endpoint for triggering alert matching during testing and demonstrations.

### Inquiries and Conversations
- Send inquiries about rental properties.
- Maintain threaded conversations between tenants and owners.
- Restrict conversation access to authorized participants.

### Additional Features
- Property view and inquiry statistics.
- Average and median rent insights by area.
- Similar-property recommendations based on location, property type, and rental price.
- Loading, empty, success, and error states for relevant user interactions.

## 5. Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React 18, Vite |
| Styling | Tailwind CSS 4 |
| Routing | React Router 6 |
| Backend | Node.js, Express 4 |
| Database | MongoDB, Mongoose 8 |
| Validation | Zod |
| Authentication | JWT, bcryptjs |
| Background Scheduling | node-cron |
| Testing | Node.js `node:test`, mongodb-memory-server |
| Version Control | Git, GitHub |
| Frontend Deployment | Vercel |
| Backend Deployment | Vercel |

## 6. System Architecture

RentalRadar follows a client-server architecture.

```text
                 User
                  |
                  v
       React Frontend (Vercel)
          React Router
          Axios Requests
                  |
                  | HTTP / JSON
                  | JWT Bearer Token
                  v
        Express REST API
          (Vercel Deployment)
                  |
       +----------+-----------+
       |          |           |
       v          v           v
   Listings    Searches    Inquiries
       |          |           |
       +----------+-----------+
                  |
                  v
             MongoDB
                  |
                  v
         Saved Search Matching
                  |
                  v
          In-App Alerts
```

### Major Components

- **Frontend:** Provides the user interface for searching properties, managing accounts, viewing alerts, and interacting with listings.
- **REST API:** Handles requests, validates input, enforces access permissions, and executes application logic.
- **Database:** Stores users, property listings, saved searches, inquiries, alerts, and price history.
- **Geospatial Utility:** Calculates distances between geographical coordinates and applies radius-based filtering.
- **Alert Engine:** Matches newly created listings against saved searches and generates unique alerts.
- **Authentication Middleware:** Verifies JWTs and protects authenticated routes.

### Important API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register an account |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/auth/me` | Retrieve the authenticated user |
| GET | `/api/listings` | Search and filter rental listings |
| POST | `/api/listings` | Create a listing |
| GET | `/api/listings/:id` | Retrieve listing details |
| PATCH | `/api/listings/:id` | Update a listing |
| PATCH | `/api/listings/:id/rented` | Update rental availability |
| DELETE | `/api/listings/:id` | Delete a listing |
| GET | `/api/listings/mine` | Retrieve the owner's listings |
| POST | `/api/listings/:id/inquiries` | Create an inquiry |
| GET | `/api/inquiries/:id` | Retrieve an inquiry thread |
| POST | `/api/inquiries/:id/reply` | Reply to an inquiry |
| POST | `/api/searches` | Save a search |
| GET | `/api/searches` | Retrieve saved searches |
| DELETE | `/api/searches/:id` | Delete a saved search |
| GET | `/api/alerts` | Retrieve alerts |
| POST | `/api/alerts/read` | Mark alerts as read |
| POST | `/api/jobs/run-alerts` | Trigger alert matching manually |
| GET | `/api/health` | Check API health |

## 7. Local Setup

### Prerequisites

Install the following before running the project:

- Node.js and npm
- Git
- MongoDB Atlas account or a compatible MongoDB instance

### Step 1: Clone the Repository

```bash
git clone https://github.com/Pavi-crypto/RntalRadar_MERN.git
cd RntalRadar_MERN
```

### Step 2: Configure the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory using the environment variables documented below.

Start the backend:

```bash
npm start
```

The default local backend port is `5114`, unless configured otherwise.

### Step 3: Configure the Frontend

Open a separate terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend` directory and configure the API base URL:

```env
VITE_API_URL=http://localhost:5114/api
```

Start the frontend:

```bash
npm run dev
```

Vite will display the local frontend URL in the terminal. The current project configuration uses port `5314`.

### Step 4: Run Tests

From the backend directory:

```bash
npm test
```

The project includes Node.js test coverage for important backend logic, including geographical distance calculations and saved-search matching.

Run the tests before deploying changes.

## 8. Environment Variables

Keep credentials in environment variables. Never commit the actual `.env` files containing secrets to GitHub.

### Backend — `backend/.env`

| Variable | Purpose |
|---|---|
| `PORT` | Backend port; defaults to `5114` in the local setup |
| `MONGODB_URI` | MongoDB connection string |
| `USE_MEMORY_DB` | Set to `1` to enable the in-memory database mode, if supported by the deployment |
| `JWT_SECRET` | Secret used to sign and verify JWTs |
| `CLIENT_ORIGIN` | Frontend origin allowed by CORS |

Example configuration:

```env
PORT=5114
MONGODB_URI=your_mongodb_connection_string
USE_MEMORY_DB=0
JWT_SECRET=your_long_random_secret
CLIENT_ORIGIN=http://localhost:5314
```

Replace the example values with your actual configuration. Do not use these example values as production credentials.

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:5114/api
```

For production, configure `VITE_API_URL` to point to the deployed backend API base URL, including `/api`.

**Note:** Vite exposes variables prefixed with `VITE_` to the client bundle. Do not place database credentials, JWT secrets, or other private secrets in frontend environment variables.

## 9. Deployment

### Live Application

- **Frontend:** [Open RentalRadar](https://rntal-radar-mern-x28p.vercel.app/my-radar)
- **Backend API:** [RentalRadar API](https://rntal-radar-mern.vercel.app)
- **Backend Health Check:** [Check API Health](https://rntal-radar-mern.vercel.app/api/health)
- **GitHub Repository:** [RntalRadar_MERN](https://github.com/Pavi-crypto/RntalRadar_MERN)
- **Demo Video:** [Watch the RentalRadar Demonstration](https://drive.google.com/file/d/1ojKcPRl3Vo2jdjl46sTkEneRs51REOWt/view?usp=sharing)

The frontend and backend are deployed separately. The frontend communicates with the backend through HTTP API requests.

The backend root URL may return a `Route GET / not found` response because the API does not necessarily define a route for `/`. Use the health-check endpoint to verify API availability.

### Production Configuration

Before deployment, configure the required environment variables in the hosting platform:

- Set `MONGODB_URI` to a persistent MongoDB database.
- Set a secure `JWT_SECRET`.
- Set `CLIENT_ORIGIN` to the deployed frontend origin.
- Set the frontend's `VITE_API_URL` to the deployed backend API base URL.
- Ensure the backend supports the application's required database connections and scheduled jobs.

**Deployment note:** Vercel serverless functions do not provide a continuously running Node.js process. If the alert scheduler relies on `node-cron`, ensure scheduled matching is implemented through a supported external scheduler or another persistent runtime. Also, in-memory database contents are temporary and should not be used when persistent production data is required.

## 10. Error Handling and Security

RentalRadar incorporates several practices to improve reliability and protect user data:

- Input validation using Zod.
- Password hashing using bcryptjs.
- JWT-based authentication.
- Role-based authorization for tenant and owner operations.
- Ownership checks before modifying or deleting listings.
- Access restrictions for private inquiry conversations.
- Rate limiting for authentication endpoints.
- Validation of rent values, geographical coordinates, and search radius.
- Duplicate-alert prevention through database uniqueness constraints.
- Handling of loading, empty, success, and error states in the frontend.
- Automatic logout handling for unauthorized API responses.

These measures help the application handle invalid input, unauthorized requests, missing resources, and other expected failure conditions.

## 11. Testing

The backend uses Node.js's built-in test runner and `mongodb-memory-server` for testing supported application logic.

The test suite described in the project includes checks for:

- Haversine distance calculations.
- Geographical search and radius matching.
- Saved-search matching.
- Important backend behavior and validation rules.

Run the available test suite with:

```bash
npm test
```

Test results should be verified against the current source code before making claims about test coverage.

## 12. Future Enhancements

Potential future improvements include:

- Integration with real map tiles using Leaflet.
- Map marker clustering for large numbers of properties.
- Email and WhatsApp notifications.
- Property-owner verification.
- More detailed rent-versus-area analytics.
- Improved listing recommendations and search relevance.

## 13. Conclusion

RentalRadar aims to make rental discovery more efficient by combining location-aware search, saved search preferences, property management, and in-app alerts in one application.

The project demonstrates the integration of a React frontend, Express REST API, MongoDB persistence, authentication, geographical calculations, and automated matching logic into a practical software product.

The application is designed to reduce repetitive searching for tenants while giving property owners tools to manage listings and respond to inquiries.

## 14. Project Links

| Resource | Link |
|---|---|
| Project Repository | [GitHub](https://github.com/Pavi-crypto/RntalRadar_MERN) |
| Live Frontend | [RentalRadar](https://rntal-radar-mern-x28p.vercel.app/my-radar) |
| Backend API | [RentalRadar API](https://rntal-radar-mern.vercel.app) |
| API Health Check | [Health Endpoint](https://rntal-radar-mern.vercel.app/api/health) |
| Demo Video | [Google Drive](https://drive.google.com/file/d/1ojKcPRl3Vo2jdjl46sTkEneRs51REOWt/view?usp=sharing) |
