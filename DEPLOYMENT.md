# Vercel Deployment Guide

## Problem Fixed
The "NetworkError when attempting to fetch resource" error was caused by:
1. ❌ Backend not deployed to Vercel
2. ❌ Frontend pointing to non-existent `http://localhost:5001`
3. ❌ Missing API routing configuration

## Solution Implemented
✅ Backend converted to Vercel Serverless Functions
✅ Frontend configured to use relative `/api` paths on production
✅ Updated `vercel.json` with proper routing

## How to Deploy

### Step 1: Set Environment Variables in Vercel Dashboard
1. Go to your project on https://vercel.com/dashboard
2. Click **Settings** → **Environment Variables**
3. Add these variables:
   - `DB_HOST` - Your database host
   - `DB_USER` - Your database username
   - `DB_PASSWORD` - Your database password
   - `DB_NAME` - Your database name
   - `REACT_APP_API_URL` - For local dev: `http://localhost:5000`

### Step 2: Update your .env file locally
Copy `.env.example` to `.env` and fill in your database credentials:
```bash
cp .env.example .env
```

### Step 3: Push to Git and Deploy
```bash
git add .
git commit -m "Convert backend to Vercel serverless functions"
git push
```

Vercel will automatically detect the changes and redeploy.

## API Endpoints (After Deployment)

**Production (Vercel):**
- `GET /api/select` - Fetch data from table
- `GET /api/select?id=123` - Get single record
- `POST /api/insert` - Insert new data
- `PUT /api/update` - Update data
- `DELETE /api/delete` - Delete data
- `GET /api/health` - Health check

**Development (Local):**
- Use backend server: `npm run dev` in backend folder
- Frontend calls: `http://localhost:5000/api/*`

## Testing

### Local Development
1. Terminal 1 - Backend:
```bash
cd backend
npm install
npm run dev  # Make sure this starts on port 5000
```

2. Terminal 2 - Frontend:
```bash
cd frontend
npm install
npm start
```

### Production (Vercel)
Frontend will automatically call `/api/*` endpoints which map to serverless functions.

## Troubleshooting

If you still get NetworkError:
1. Check Vercel logs: `vercel logs`
2. Verify environment variables are set in Vercel dashboard
3. Check database connection with: `curl https://your-project.vercel.app/api/health`
4. Enable detailed logging by adding `console.log()` in your API handlers

## File Structure
```
dev/
├── api/                        # NEW: Serverless functions
│   ├── utils.js
│   ├── health.js
│   ├── select.js
│   ├── insert.js
│   ├── update.js
│   └── delete.js
├── frontend/                   # React frontend
├── backend/                    # Express server (local dev only)
├── vercel.json                 # UPDATED: Routing config
├── .env.example                # NEW: Environment template
└── build.sh
```

## Notes
- The backend server.js is still useful for local development with `npm run dev`
- Production deployment uses serverless functions in `/api` directory
- Database credentials remain private through Vercel environment variables
