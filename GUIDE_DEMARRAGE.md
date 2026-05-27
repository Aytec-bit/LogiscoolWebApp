# Guide de démarrage — LogiscoolWebApp

Ce guide permet de lancer l'application complète sur une machine vierge.

Il existe **deux modes** selon ce que tu veux faire :

| Mode | Prérequis | URL | Quand l'utiliser |
|---|---|---|---|
| **🐳 Docker complet** (recommandé) | Docker Desktop uniquement | `http://localhost` | Tester / démontrer / autre PC |
| **💻 Mode développement** | Docker + JDK 21 + Node.js | `http://localhost:4200` | Modifier le code |

---

## 🐳 Mode Docker complet — lancer en 3 commandes

> **Prérequis unique : Docker Desktop** installé et démarré.

```bash
# 1. Cloner le projet
git clone https://github.com/Aytec-bit/LogiscoolWebApp.git
cd LogiscoolWebApp/LogiscoolEventWebSite

# 2. Créer le fichier de configuration (obligatoire, une seule fois)
copy .env.example .env        # Windows
# cp .env.example .env        # macOS / Linux

# 3. Tout démarrer
docker compose up -d
```

Docker construit et démarre automatiquement :
- **PostgreSQL 17** — base de données (port `5433`)
- **Keycloak 26.2.3** — authentification OAuth2/OIDC (port `8180`)
- **Spring Boot** — API REST (port `8090`)
- **nginx + Angular** — interface web (port **`80`**)

**Attendre ~60 secondes** que tous les services soient `healthy` :
```bash
docker compose ps
```
Tous les services doivent afficher `healthy` ou `running`.

### Ouvrir l'application

👉 **http://localhost**

> Le realm Keycloak et les comptes de test sont **importés automatiquement** — aucune configuration manuelle.
> Au premier démarrage, **10 événements de démonstration** sont insérés automatiquement si la base est vide.

### Arrêter

```bash
docker compose down          # arrête les conteneurs — les données sont CONSERVÉES (volume postgres_data)
docker compose down -v       # arrête ET supprime le volume — les données sont EFFACÉES (reset complet)
```

---

## 💻 Mode développement — modifier le code

### Prérequis

Vérifier chaque outil avant d'installer :

```bash
docker --version   # Docker version 24.x ou supérieur
java -version      # openjdk version "21.x.x" (JDK 21 obligatoire)
node -v            # v20.x.x ou supérieur
npm -v             # 10.x.x ou supérieur
```

Liens d'installation si nécessaire :
- Docker Desktop : https://www.docker.com/products/docker-desktop
- JDK 21 : https://adoptium.net
- Node.js 20 LTS : https://nodejs.org

---

### Étape 1 — Cloner et configurer

```bash
git clone https://github.com/Aytec-bit/LogiscoolWebApp.git
cd LogiscoolWebApp/LogiscoolEventWebSite
copy .env.example .env        # Windows
# cp .env.example .env        # macOS / Linux
```

### Étape 2 — Démarrer l'infrastructure (PostgreSQL + Keycloak)

```bash
# Depuis LogiscoolEventWebSite/
docker compose up -d db my-keycloak
```

Attendre que Keycloak soit prêt (~30–60 s) :
```bash
curl http://localhost:8180/realms/logiscool/.well-known/openid-configuration
```
Quand la commande retourne un JSON → Keycloak est prêt.

### Étape 3 — Démarrer le backend Spring Boot

**Option A — IntelliJ IDEA (recommandé)**
1. `File > Open` → dossier `LogiscoolEventWebSite/`
2. Ouvrir `LogiscoolEventWebSiteApplication.java`
3. Cliquer sur le bouton **Run** (triangle vert)

**Option B — Ligne de commande**
```bash
# Depuis LogiscoolEventWebSite/
./mvnw spring-boot:run       # macOS / Linux
mvnw.cmd spring-boot:run     # Windows
```

Vérification :
```bash
curl http://localhost:8090/actuator/health
# Attendu : {"status":"UP"}
```

### Étape 4 — Démarrer le frontend Angular

```bash
cd logiscool-frontend
npm install          # uniquement au premier lancement ou après un git pull
npm start            # démarre sur http://localhost:4200
```

Ouvrir **http://localhost:4200**

---

## Comptes de test

Créés automatiquement par l'import du realm Keycloak :

| Identifiant | Mot de passe | Rôles | Accès |
|---|---|---|---|
| `user1` | `user1pass` | USER | Consulter, réserver, annuler |
| `admin1` | `admin1pass` | USER + ADMIN | Tout + créer/modifier/supprimer des événements |

> **Inscription libre :** tout utilisateur créé via le bouton **"New user? Register"** sur la page de connexion Keycloak reçoit automatiquement le rôle `USER` et peut réserver des événements sans configuration manuelle.

---

## Ports utilisés

| Service | Port | Mode Docker | Mode Dev |
|---|---|---|---|
| Frontend (nginx/Angular) | **80** | ✅ `http://localhost` | — |
| Frontend (dev server) | **4200** | — | ✅ `http://localhost:4200` |
| Backend Spring Boot | **8090** | ✅ (interne + exposé) | ✅ |
| Keycloak | **8180** | ✅ | ✅ |
| PostgreSQL | **5433** | ✅ | ✅ |

---

## Problèmes fréquents

### `.env` manquant — `docker compose up` échoue avec des variables manquantes

```bash
copy .env.example .env     # Windows
cp .env.example .env       # macOS / Linux
```

### Keycloak inaccessible — `Connection refused` sur :8180

```bash
docker compose ps               # vérifier l'état des conteneurs
docker compose logs my-keycloak # voir les logs Keycloak
```
Attendre 60 secondes supplémentaires — Keycloak est lent au premier démarrage.

### Le backend ne démarre pas — `missing column [type]` ou `[target_age]`

La base de données a un schéma ancien. Solution :
```bash
docker compose down -v    # efface le volume PostgreSQL (données perdues)
docker compose up -d      # repart d'une base vide, recrée les colonnes et réinsère les 10 événements de démo
```

### Port 8090 déjà utilisé (mode dev)

**Windows :**
```powershell
Get-NetTCPConnection -LocalPort 8090 -State Listen | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```
**macOS / Linux :**
```bash
kill $(lsof -ti:8090)
```

### Backend ne démarre pas — erreur OIDC Keycloak

```
Unable to resolve the Configuration with the provided Issuer
```
Keycloak n'est pas encore démarré. Attendre que `curl http://localhost:8180/realms/logiscool/.well-known/openid-configuration` réponde, puis relancer le backend.

### Frontend — page blanche après login

Vérifier la console du navigateur (F12). Si l'erreur mentionne Keycloak, le conteneur Keycloak n'est pas encore prêt.

### Mode dev — `npm start` échoue sur `ng: command not found`

```bash
npx ng serve --configuration=development
```

---

## Accès à l'administration Keycloak

Pour gérer les utilisateurs et clients directement dans Keycloak :

- URL : **http://localhost:8180**
- Identifiant : `admin` *(défini dans `.env` → `KC_ADMIN_USER`)*
- Mot de passe : `admin` *(défini dans `.env` → `KC_ADMIN_PASSWORD`)*

---

## Structure du projet

```
LogiscoolWebApp/
├── LogiscoolEventWebSite/         ← Backend Spring Boot
│   ├── docker-compose.yml         ← Infrastructure complète (DB + Keycloak + backend + frontend)
│   ├── Dockerfile                 ← Build multi-stage Maven → JRE 21
│   ├── .env                       ← Secrets locaux (non commité — créer depuis .env.example)
│   ├── .env.example               ← Modèle à copier en .env ✅ commité
│   ├── keycloak/
│   │   └── realm-export.json      ← Realm auto-importé (users + client + rôles)
│   └── src/main/resources/
│       ├── application.yaml               ← Config de base
│       ├── application-dev.yaml           ← Profil dev (logs DEBUG)
│       └── application-prod.yaml          ← Profil prod (logs INFO, ddl-auto configurable)
├── logiscool-frontend/            ← Frontend Angular 21
│   ├── Dockerfile                 ← Build Node 22 → Nginx Alpine
│   └── nginx.conf                 ← SPA routing + proxy /api/ → backend
├── GUIDE_DEMARRAGE.md             ← ce fichier
└── JOURNAL_DEV.md
```
