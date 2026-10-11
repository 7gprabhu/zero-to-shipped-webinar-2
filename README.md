# 0 to shipped resume parser

## Two Vercel projects

Import this repository twice, selecting `backend` and `frontend` as the respective Root Directories. Enable access to files outside the Root Directory in each project's build settings so npm can use the workspace lockfile.

- Backend: the Express framework is configured in `backend/vercel.json`. Set `MONGODB_URI` to your hosted MongoDB connection string and `FRONTEND_URL` to the exact frontend origin, such as `https://your-frontend.vercel.app` (no trailing slash). Multiple allowed frontend origins can be comma-separated. Ensure your database network settings allow connections from Vercel. The app reuses its MongoDB connection across warm function requests.
- Frontend: Vite build, `dist` output and SPA fallback are configured in `frontend/vercel.json`. Set `VITE_API_URL=https://your-backend.vercel.app` (no `/api` suffix). Redeploy after changing this build-time variable.
- Check `https://your-backend.vercel.app/api/health`, then upload through the frontend. Vercel deployment protection must permit browser requests to the backend.

Vercel Functions have a 4.5 MB request-body limit, including multipart overhead. Keep deployed PDF uploads below 4 MB, even though the local app permits 10 MB. Larger uploads require a direct-to-storage upload flow.

React/Vite frontend and Express/MongoDB backend. AI is not integrated yet. The current service extracts text from a PDF and compares a predefined skill vocabulary with the job description. The score is the percentage of recognized JD skills found in the resume; it does not assess proficiency or overall resume quality. Scanned PDFs need OCR, which is not implemented.

## Local setup

1. Install Node.js 22.12+ (or 24) and run `npm install` from this folder. On PowerShell with script execution disabled, use `npm.cmd` instead of `npm`.
2. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI` to your local MongoDB or Atlas connection string. Start local MongoDB if you use the example URI. Keep credentials out of source control.
3. Run `npm run dev`. Open http://localhost:5173. The frontend proxies `/api` to the API on port 5000. If changing the API port, update `frontend/vite.config.js` too.
4. Upload a text-based PDF (up to 10 MB), paste the JD, and select **Analyze my resume**.

`npm test` runs backend tests. `npm run build` creates `frontend/dist`. `npm start` runs only the API; serve the frontend separately with a same-origin `/api` proxy for deployment. This project is configured for local development, without accounts or public deployment.

## Structure

- `frontend/src/App.jsx`: React page, upload state, JD input and API results.
- `backend/server.js`: environment, MongoDB connection, HTTP startup.
- `backend/routes/`: API endpoints.
- `backend/controller/`: request validation and response orchestration.
- `backend/service/`: PDF extraction and comparison; future AI integration belongs here.
- `backend/config/`: database connection and analysis schema.
- `backend/middleware/`: memory upload handling and centralized errors.
- `backend/utils.js`: shared error helper.

`POST /api/resumes/analyze` accepts multipart `resume` (PDF) and `jobDescription` (text), returning `id`, `filename`, `score`, `presentSkills`, `missingSkills`, `requiredSkills` and `method`. `GET /api/health` reports database readiness.

PDF bytes and extracted resume text are not persisted. MongoDB stores the filename, job description, score, skill lists and timestamps. The server requires a working MongoDB connection before starting and reports failures rather than returning fake results. The sample button is explicitly illustrative and makes no API call.
