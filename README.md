# LogiscoolWebApp

Plateforme de gestion d'événements et d'ateliers Logiscool — Spring Boot + Angular + Keycloak + PostgreSQL.

## Stack technique

| Couche | Technologie |
|---|---|
| Backend | Spring Boot 4.0.3 (Java 21) — architecture hexagonale |
| Frontend | Angular 21.2.0 — composants standalone |
| Auth | Keycloak 26.2.3 (OAuth2 / OIDC, PKCE) |
| Base de données | PostgreSQL 17 (volume Docker persistant) |
| Conteneurisation | Docker Compose |

## Fonctionnalités

- 📅 **Calendrier** FullCalendar (vue mois / semaine / jour, couleurs par type d'atelier)
- 🔍 **Filtres** : recherche texte, lieu, type d'atelier, tranche d'âge
- 🎫 **Réservation / annulation** en ligne avec contrôle de doublons (409)
- 👤 **Espace utilisateur** — "Mes réservations"
- 🛠️ **Dashboard admin** — créer, modifier, supprimer des événements
- 🔐 **Authentification** Keycloak avec rôles USER / ADMIN
- 📝 **Inscription** via le bouton "Register" de Keycloak — rôle USER attribué automatiquement
- 🗄️ **10 événements de démonstration** pré-chargés au premier démarrage
- 💾 **Données persistantes** — survivent aux `docker compose down`

## Démarrage rapide

Voir **[GUIDE_DEMARRAGE.md](GUIDE_DEMARRAGE.md)** pour les instructions complètes.

### Mode Docker (recommandé — Docker uniquement)

```bash
git clone https://github.com/Aytec-bit/LogiscoolWebApp.git
cd LogiscoolWebApp/LogiscoolEventWebSite
copy .env.example .env
docker compose up -d
```

Ouvrir **http://localhost** après ~60 secondes.

### Comptes de test

| Identifiant | Mot de passe | Rôle |
|---|---|---|
| `user1` | `user1pass` | USER |
| `admin1` | `admin1pass` | USER + ADMIN |

> Tout utilisateur créé via le bouton **"Register"** reçoit automatiquement le rôle USER.

## Structure

```
LogiscoolWebApp/
├── LogiscoolEventWebSite/   ← Backend Spring Boot
│   ├── docker-compose.yml   ← Infrastructure complète (DB + Keycloak + backend + frontend)
│   ├── Dockerfile
│   ├── .env.example
│   ├── keycloak/
│   │   └── realm-export.json
│   └── src/
├── logiscool-frontend/      ← Frontend Angular
│   ├── Dockerfile
│   └── src/
├── GUIDE_DEMARRAGE.md
├── JOURNAL_DEV.md
└── SYNTHESE_PROJET.md
```
