# 0 to shipped resume parser

## One Vercel project with multiple services

Import this repository once with the project Root Directory set to the repository root. The root `vercel.json` defines the `backend` Express service and `frontend` Vite service. Build and output settings belong to each service. The previous per-folder configuration files have been replaced by this root configuration.

- Public routing: `/api/*` reaches `backend` with the original `/api` prefix intact; all other paths reach `frontend`. The frontend service includes its own SPA fallback. No service is internal-only in this configuration.
- Calls and bindings: the static React frontend runs in the browser and fetches `/api/resumes/analyze` on the same origin. There are no function-to-function calls, so no internal bindings are declared. Runtime binding URLs must never be embedded in a Vite build. If a server-side caller is added later, declare a binding on that caller with all four fields (`type`, `service`, `format`, `env`) and read the generated URL at function runtime; do not manually set the generated variable.
- Set `MONGODB_URI` and `LABD_API_KEY` in the Vercel project. The backend uses the labd key to analyze extracted resume text against the JD. Database credentials and API keys must not use the browser-exposed `VITE_` prefix. Allow connections from Vercel in your database network settings.
- Remove the previous `VITE_API_URL` setting; it is no longer read. Same-origin calls do not require `FRONTEND_URL`; that setting is only for optional separate-origin clients. Existing backend CORS support remains available.
- Check `https://your-project.vercel.app/api/health`, then upload through the frontend on that same domain.

### Local services verification

With the Vercel CLI installed, run `vercel dev -L` from the repository root (or `vercel dev` for a linked project). Ensure `MONGODB_URI` is supplied to the backend runtime, through your local environment or local Vercel environment settings. Check `/api/health` and submit a PDF plus job description through the displayed local URL. This tests the services routing together; a Vite production build and backend unit/API tests alone do not verify Vercel's service router. Binding variables, if introduced in future, are injected by Vercel automatically.

Vercel Functions have a 4.5 MB request-body limit, including multipart overhead. Keep deployed PDF uploads below 4 MB, even though the local app permits 10 MB. Larger uploads require a direct-to-storage upload flow.

React/Vite frontend and Express/MongoDB backend. The backend extracts PDF text and calls `https://agent.thedevlabs.io/v1/api/chat` with server-only bearer authentication. The AI compares skills, relevant experience and qualifications against the JD, returning an estimated 0–100 job-fit score, present skills, missing skills and a summary. Results are validated before saving. Scanned PDFs need OCR, which is not implemented. The former keyword comparison service is retained for its tests but is not used by the analysis endpoint.

Each analysis sends resume text and the JD to labd and spends the account's allowance. A 45-second timeout, readable provider error messages and no automatic retries prevent silent repeated charges. Invalid or malformed AI replies fail without a fabricated fallback score. Allowance information is not exposed through the public endpoint. Configure `LABD_API_KEY` in `backend/.env` locally and in Vercel environment settings when deployed.

## Local setup

1. Install Node.js 22.12+ (or 24) and run `npm install` from this folder. On PowerShell with script execution disabled, use `npm.cmd` instead of `npm`.
2. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI` to your local MongoDB or Atlas connection string. Start local MongoDB if you use the example URI. Keep credentials out of source control.
3. Run `npm run dev`. Open http://localhost:5173. The frontend proxies `/api` to the API on port 5000. If changing the API port, update `frontend/vite.config.js` too.
4. Upload a text-based PDF (up to 10 MB), paste the JD, and select **Analyze my resume**.

`npm test` runs backend tests. `npm run build` creates `frontend/dist`. `npm start` runs only the local API. `npm run dev` remains a standalone development alternative, using the local Vite proxy on port 5000; use `vercel dev` to test the actual multi-service routing. The app has no accounts.

## Structure

- `frontend/src/App.jsx`: React page, upload state, JD input and API results.
- `backend/server.js`: environment, MongoDB connection, HTTP startup.
- `backend/routes/`: API endpoints.
- `backend/controller/`: request validation and response orchestration.
- `backend/service/`: PDF extraction and labd AI analysis with response validation.
- `backend/config/`: database connection and analysis schema.
- `backend/middleware/`: memory upload handling and centralized errors.
- `backend/utils.js`: shared error helper.

`POST /api/resumes/analyze` accepts multipart `resume` (PDF) and `jobDescription` (text), returning `id`, `filename`, `score`, `presentSkills`, `missingSkills`, `requiredSkills`, `summary` and `method` (`labd-ai`). `GET /api/health` reports database readiness.

PDF bytes and extracted resume text are not persisted. MongoDB stores the filename, job description, score, skill lists and timestamps. The server requires a working MongoDB connection before starting and reports failures rather than returning fake results. The sample button is explicitly illustrative and makes no API call.
