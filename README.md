 E-Learning Platform

Plateforme e-learning basée sur une architecture **modulaire (frontend + microservices)**.




---

## ⚙️ Technologies

- **Frontend** : React, Vite, TypeScript
- **Backend** : Node.js, Express
- **Auth** : JWT + Refresh Token
- **Database** : PostgreSQL (Prisma ORM)
- **Architecture** : Microservices + API Gateway

---

## 🚀 Fonctionnalités

### 👤 Utilisateur
- Inscription / Connexion
- Refresh Token automatique
- Accès Dashboard
- Liste des cours
- Détail des cours
- Mise à jour profil

### 🔐 Sécurité
- JWT Access + Refresh Token
- Middleware d’authentification
- Routes protégées (Admin / Instructor / User)

### 📚 Cours
- Catalogue paginé
- Détail des cours
- Structure : Course → Module → Lesson

### 🛠️ Admin
- CRUD complet :
  - Cours
  - Modules
  - Leçons

---

## 🔁 Architecture des flux

- Le **Gateway** gère :
  - CORS
  - Rate limiting
  - Vérification JWT
  - Proxy vers les services

---

## 🔑 Authentification

- Login → retourne `accessToken` + `refreshToken`
- Stockage côté frontend
- Refresh automatique si 401

---

## 📂 Points importants du code

- Routing : `frontend/src/App.tsx`
- Auth Context : `frontend/src/auth/AuthContext.tsx`
- API layer : `frontend/src/api/http.ts`
- Gateway : `gateway/src/main.ts`
- Auth logic : `auth-service/src/main.ts`
- Prisma schema :
  - auth → `auth-service/prisma/schema.prisma`
  - courses → `services/course-catalog-service/prisma/schema.prisma`

---

## ⚠️ Limitations actuelles

- Page Instructor (placeholder)
- UI Home non finalisée
- CourseDetails partiellement mockée

---

## ▶️ Lancer le projet (exemple)

```bash
# frontend
cd frontend
npm install
npm run dev

# gateway
cd gateway
npm install
npm run dev

# auth-service
cd auth-service
npm install
npx prisma migrate dev
npm run dev

# course service
cd services/course-catalog-service
npm install
npx prisma migrate dev
npm run dev