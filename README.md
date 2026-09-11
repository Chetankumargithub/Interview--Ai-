# Interview AI

## Prerequisites

- Node.js 20 or newer and npm
- MongoDB running locally, or a MongoDB Atlas connection string
- A Google Gemini API key with access to the model configured in `Backend/src/services/ai.service.js`

## First-time setup

Open PowerShell in the repository root and install dependencies:

```powershell
cd Backend
npm install
Copy-Item .env.example .env

cd ..\Frontend
npm install
Copy-Item .env.example .env
```

Edit `Backend/.env` and replace the placeholder values:

- `MONGO_URI`: for local MongoDB, use `mongodb://127.0.0.1:27017/interview-ai`
- `JWT_SECRET`: any long, private random string
- `GOOGLE_GENAI_API_KEY`: your Google AI API key

Keep `Frontend/.env` as `VITE_API_URL=http://localhost:3000` for local development.

## Run locally

Use two PowerShell terminals from the repository root.

Terminal 1, backend:

```powershell
cd Backend
npm run dev
```

The backend runs at `http://localhost:3000`.

Terminal 2, frontend:

```powershell
cd Frontend
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

## Verify the complete flow

1. Open the frontend and register a new account.
2. Log in with that account.
3. Upload a PDF resume, enter the job description and self description, and generate a report.
4. Open the generated report and try the resume PDF download.

The first three steps require MongoDB and the Gemini key. Resume PDF download also requires Puppeteer, which is installed by `npm install`.

## Useful checks

```powershell
cd Frontend
npm run build
npm run lint
```

The build should pass. `npm run lint` currently reports pre-existing React/ESLint issues in the frontend; these do not prevent `npm run dev` or `npm run build`.

Never commit either `.env` file. The backend already ignores it, and the frontend now ignores local environment files while keeping `.env.example` trackable.
