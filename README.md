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

## Images Docker

Build de toutes les images:

```bash
npm run docker:build
```

Tagger les images pour Docker Hub:

```bash
npm run docker:tag --namespace=ton_user_dockerhub --tag=latest
```

Pousser les images deja taggees:

```bash
docker login
npm run docker:push --namespace=ton_user_dockerhub --tag=latest
```

Faire build + tag + push en une seule commande:

```bash
docker login
npm run docker:publish --namespace=ton_user_dockerhub --tag=latest
```

Tu peux aussi utiliser des variables d'environnement:

```bash
$env:DOCKER_NAMESPACE="ton_user_dockerhub"
$env:IMAGE_TAG="latest"
npm run docker:publish
```

Les fichiers sensibles comme `.env` ne sont pas envoyes dans les images car ils sont ignores par Git et par les `.dockerignore`.

---

## Docker Compose

Lancer toute la plateforme avec une seule commande:

```bash
npm run docker:up
```

Ou directement:

```bash
docker compose up --build
```

Services exposes:

- Frontend: `http://localhost`
- Gateway: `http://localhost:8090`

Services internes au reseau Docker:

- Auth service: `http://auth-service:8081`
- Course catalog service: `http://course-catalog-service:8082`
- PostgreSQL: `postgres:5432`

Arreter et supprimer les conteneurs + volume Postgres:

```bash
npm run docker:down
```

Le `docker-compose.yml` lance aussi automatiquement les migrations Prisma avant `auth-service` et `course-catalog-service`.

---

## Kubernetes

Les manifests sont dans `k8s/` et se deploient avec `kustomize` via `kubectl`.

Avant le deploiement, republie les images Docker:

```bash
docker login
$env:DOCKER_NAMESPACE="mohammed11cpu"
$env:IMAGE_TAG="latest"
npm run docker:publish
```

Deploiement:

```bash
kubectl apply -k k8s
kubectl get pods -n elearning
kubectl get svc -n elearning
```

Suppression:

```bash
kubectl delete -k k8s
```

Services exposes:

- Frontend: `http://localhost:30080`
- Gateway: `http://localhost:30090`

Points importants:

- Le secret `k8s/secret.yaml` contient des valeurs de placeholder, change `POSTGRES_PASSWORD` et `JWT_SECRET` avant le deploiement.
- Le frontend passe par Nginx et reverse proxy `/api` vers `gateway` et `/catalog-api` vers `course-catalog-service`, ce qui evite les URLs absolues dans Kubernetes.

---

## Notes

- Le frontend demarre via Vite sur `http://localhost:5173`
- Le gateway utilise `http://localhost:8080`
- L'auth-service utilise `http://localhost:8081`
- Le course-catalog-service utilise `http://localhost:8082`
- Si Prisma n'est pas encore initialise, lance aussi les migrations dans les services concernes
