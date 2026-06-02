# E-Learning Platform

Plateforme e-learning basee sur une architecture modulaire avec `frontend`, `gateway` et microservices.

---

## Technologies

- Frontend: React, Vite, TypeScript
- Backend: Node.js, Express
- Auth: JWT + Refresh Token
- Database: PostgreSQL avec Prisma
- Architecture: API Gateway + microservices

---

## Fonctionnalites

- Inscription / connexion
- Refresh token automatique
- Dashboard et profil utilisateur
- Catalogue de cours et details
- Routes protegees par role
- CRUD admin sur cours, modules et lecons

---

## Points importants

- Routing frontend: `frontend/src/App.tsx`
- Auth context: `frontend/src/auth/AuthContext.tsx`
- Couche API frontend: `frontend/src/api/http.ts`
- Gateway: `gateway/src/main.ts`
- Auth service: `auth-service/src/main.ts`
- Course catalog service: `services/course-catalog-service/src/main.ts`

---

## Lancer le projet

Installation de toutes les dependances:

```bash
npm run setup
```

Lancement de tout le projet avec une seule commande:

```bash
npm run dev
```

Commandes utiles:

```bash
# backend seulement
npm run dev:backend

# frontend seulement
npm run dev:frontend

# build de tous les projets
npm run build
```

---

## Notes

- Le frontend demarre via Vite sur `http://localhost:5173`
- Le gateway utilise `http://localhost:8080`
- L'auth-service utilise `http://localhost:8081`
- Le course-catalog-service utilise `http://localhost:8082`
- Si Prisma n'est pas encore initialise, lance aussi les migrations dans les services concernes
