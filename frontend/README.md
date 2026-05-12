# Frontend (Vite + React + TypeScript)

Architecture (inside `frontend/`):

```
frontend/
├─ index.html
├─ package.json
├─ tsconfig.json
├─ tsconfig.node.json
├─ vite.config.ts
└─ src/
   ├─ main.tsx
   ├─ App.tsx
   ├─ styles.css
   ├─ api/ (fetch wrapper + endpoints + types)
   ├─ auth/ (context + token storage + protected route)
   ├─ components/ (Navbar + Loading)
   └─ pages/ (Home/Login/Register/Dashboard/Courses/...)
```

## Run

```bash
cd frontend
npm install
npm run dev
```

## Env

- Optional: set `VITE_API_BASE_URL` (default: `http://localhost:8000`).
