# DrinkTracker

A cross-platform application for tracking your drinks with geolocation.

## Features

- Log drinks with geolocation data
- Track drink type, container, and rating
- View your drinking locations on a map
- Filter data by drink type, container, rating, and date
- Export data to CSV
- User profiles and authentication
- Cross-platform (web + mobile)

## Tech Stack

- **Frontend**: React (Next.js) for web, React Native for mobile
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: JWT
- **Maps**: Mapbox
- **Hosting**: Vercel (web), App stores (mobile)

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- MongoDB

### Installation

1. Clone this repository
2. Install dependencies for backend:
   ```
   cd backend
   npm install
   ```
3. Install dependencies for web app:
   ```
   cd webapp
   npm install
   ```
4. Install dependencies for mobile app:
   ```
   cd mobile
   npm install
   ```

### Configuration

1. Create `.env` files in each directory based on the provided `.env.example` files
2. Set up MongoDB connection
3. Configure authentication keys

### Running the Application

#### Backend
```
cd backend
npm run dev
```

#### Web App
```
cd webapp
npm run dev
```

#### Mobile App
```
cd mobile
npm run start
```