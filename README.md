# AADC IPC Checklist

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

## Deployment Guide (Render)

This repository functions as a "mono-repo", meaning both the frontend and backend live in the same Git repository. Render is an excellent platform for this. Follow these exact steps to host them for free.

### Step 1: Deploy Backend (Web Service)

1. Go to [Render.com](https://render.com/) and create a new **Web Service**.
2. Connect your `AL-Sayed2/Checklist` GitHub repository.
3. In the setup screen, configure the following:
   * **Name:** `checklist-api` (or similar)
   * **Root Directory:** `backend`
   * **Environment:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
4. Expand the **Environment Variables** section and paste the exact contents of your `backend/.env` file. 
   *(Note: Leave `FRONTEND_URL` blank or as `http://localhost:5173` just for testing until Step 2 is finished!)*
5. Click **Create Web Service**. Wait for the backend to deploy, and copy the `.onrender.com` URL shown at the top left of the screen!

### Step 2: Deploy Frontend (Static Site)

1. Go back to the Render dashboard and click **New > Static Site**.
2. Connect your `AL-Sayed2/Checklist` repository again.
3. In the setup screen, configure the following:
   * **Name:** `checklist-app` (or similar)
   * **Root Directory:** `frontend`
   * **Build Command:** `npm install && npm run build`
   * **Publish directory:** `dist`
4. Expand the **Environment Variables** section and add:
   * Key: `VITE_API_URL`
   * Value: `[Paste your Backend's .onrender.com URL from Step 1]`
5. Click **Create Static Site**.
6. **Important Routing Rule:** Once the static site is created, click the **Redirects/Rewrites** tab on the left.
   * Add a new rule: 
     * **Source:** `/*`
     * **Destination:** `/index.html`
     * **Action:** `Rewrite`
   * Click **Save Changes**. This prevents your React App from showing a 404 error when refreshing the page!

### Step 3: Connect Them Together

1. Grab the public `.onrender.com` URL from your newly deployed Frontend Static Site.
2. Go back to your **Backend Web Service > Environment** tab.
3. Update the `FRONTEND_URL` variable, pasting your exact Frontend URL (e.g. `https://checklist-app.onrender.com`).
4. Click **Save Changes** (this will trigger a backend redeploy). The applications are now successfully linked and live!
