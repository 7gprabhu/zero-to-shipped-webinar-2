# Project decisions

- Convert the original landing page to React, preserving its visual design and existing copy.
- Keep the React/Vite app in `frontend/` and Express API in `backend/`.
- Backend includes `server.js`, `routes/`, `controller/`, `service/`, `config/`, `middleware/`, and `utils.js`.
- Accept a resume PDF and job description together for comparison.
- Connect MongoDB using `backend/.env`; save comparison results and the JD, without storing PDF bytes or extracted resume text.
- Use explicit keyword matching for now. AI integration will be added later in the comparison service.
- Distinguish illustrative sample results from real keyword comparison results. Do not fabricate a score when no supported JD skills are recognized.
