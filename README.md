# Clinic Weekly Checklist

A full-stack web application designed for dental and medical clinics to manage and digitize their weekly room inspection checklists. Features a responsive React frontend with data visualization, a Node.js backend with MongoDB, and an AI-powered insights generator using Google Gemini.

## Features

* **Weekly Tracking:** Grid-based interface to mark 21 inspection items across 10 rooms.
* **Smart Dashboard:** Aggregates pass/fail compliance percentages instantly using custom charts.
* **Historical Memory:** Keeps 52 weeks of history with easy recall capabilities.
* **AI Agent:** Integrates directly with Gemini 1.5 Flash to automatically interpret compliance trends and suggest weekly operational adjustments.
* **Secure Access:** Single shared clinic password approach protected by JWT authentication.

## Pre-requisites
- Node.js installed locally.
- A MongoDB cluster URL.
- A Google Gemini API key.

## Installation & Setup

1. **Environment Variables Deployment**
   There are two separate `.env` files required for this project to run.

   * **Backend (`backend/.env`):**
     Create the file with your production secrets.
     ```env
     MONGODB_URI=<your-mongodb-connection-string>
     GEMINI_API_KEY=<your-gemini-api-key>
     JWT_SECRET=<your-random-jwt-key-string>
     FRONTEND_URL=http://localhost:5173
     PORT=5000
     CLINIC_PASSWORD=clinic2024
     ```

   * **Frontend (`frontend/.env`):**
     Create a file to connect the React application to the Node server.
     ```env
     VITE_API_URL=http://localhost:5000
     ```

2. **Starting the Backend**
   Open a terminal and run the following commands to install dependencies and deploy the backend server:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Starting the Frontend**
   Open a separate terminal window and run the React app:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Deployment Guide (Vercel & Railway)

This repository functions as a "mono-repo", meaning both the frontend and backend live in the same Git repository. Follow these exact steps to host them for free.

### Step 1: Deploy Backend to Railway

1. Go to [Railway.app](https://railway.app/) and create a new project by clicking **Deploy from GitHub repo**.
2. Select your `AL-Sayed2/Checklist` repository.
3. Railway will start scanning. Before it finishes mapping the root folder (which has nothing to build), click into the new service's settings.
4. Go to the **Settings** tab. Scroll down to **Root Directory** and change it to `/backend`.
5. Scroll down to **Start Command** and ensure it says: `npm start`
6. Go to the **Variables** tab and paste the exact contents of your `backend/.env` file. Important: For `FRONTEND_URL`, leave it blank or as `http://localhost:5173` for now, we will update it in Step 2!
7. Railway will now automatically build and deploy your Node.js backend. Once complete, click **Settings > Networking > Generate Domain**. Copy this domain (e.g., `https://checklist-backend-production.up.railway.app`).

### Step 2: Deploy Frontend to Vercel

1. Go to [Vercel.com](https://vercel.com/) and click **Add New... > Project**.
2. Import your `AL-Sayed2/Checklist` GitHub repository.
3. In the "Configure Project" screen, look for **Root Directory**. Click **Edit** and select the `frontend` folder.
4. Framework Preset will automatically switch to **Vite**.
5. In **Environment Variables**, add:
   * Name: `VITE_API_URL`
   * Value: `[Paste the Railway domain you generated in Step 1]`
6. Click **Deploy**. Vercel will build your React application and generate a public URL for your frontend (e.g., `https://checklist-frontend.vercel.app`).
7. Copy this Vercel URL.

### Step 3: Connect Them Together

1. Go back to your **Railway Dashboard**.
2. Navigate to your backend service -> **Variables**.
3. Update the `FRONTEND_URL` variable, and paste the Vercel URL you copied in Step 2.
4. Your Railway app will rapidly reload. The applications are now successfully linked and live!
