# tfe-assets-final — LogiscoolWebApp

Dossier généré automatiquement le **2026-05-14** via Playwright + extraction de code source.  
Le projet principal n'a **pas été modifié**.

---

## Fichiers générés

### Screenshots — Application (`screenshots/app/`)

| Fichier | Écran | Chemin de navigation |
|---|---|---|
| `01_event-list.png` | Liste des événements (visiteur) | `http://localhost:4200/` |
| `02_event-detail.png` | Détail d'un événement | `/events/32` |
| `03_login-keycloak.png` | Page de connexion Keycloak | Redirect OAuth2 depuis `/` |
| `04_reservation-form.png` | Formulaire de réservation (connecté) | `/events/32` — user1 |
| `05_reservation-confirmee.png` | Confirmation après réservation | `/events/32` — après click |
| `06_mes-reservations.png` | Liste "Mes réservations" | `/reservations` |
| `07_annulation.png` | Après annulation d'une réservation | `/reservations` — après DELETE |
| `08_forbidden.png` | Page 403 Forbidden | `/forbidden` |
| `09_admin-dashboard.png` | Dashboard admin (admin1) | `/admin` |
| `10_creation-evenement.png` | Formulaire de création d'événement | `/admin` — formulaire rempli |
| `11_modification-evenement.png` | Formulaire de modification | `/admin` — click "Modifier" |

### Screenshots — Technique (`screenshots/technique/`)

| Fichier | Sujet |
|---|---|
| `actuator-health.png` | Réponse JSON `GET /actuator/health` (Spring Boot) |
| `docker-compose.png` | Services Docker actifs + extrait `docker-compose.yml` |
| `github-actions-ci.png` | Pipeline CI GitHub Actions (2 jobs : backend + frontend) |
| `tests-vitest.png` | Résultat d'exécution des tests unitaires (`npx vitest run`) |

### Extraits de code (`code/`)

| Fichier | Rôle dans le TFE |
|---|---|
| `KeycloakJwtConverter.java` | Convertisseur JWT → Spring Security — extrait les rôles Keycloak (`realm_access.roles`) |
| `SecurityConfig.java` | Configuration Spring Security — règles d'autorisation par rôle et CORS |
| `ReservationController.java` | REST `/api/reservations` — `cancelReservation` avec vérification JWT subject |
| `EventController.java` | REST `/api/events` — `updateEvent` réservé ADMIN |
| `auth.interceptor.ts` | Intercepteur HTTP Angular — refresh token + injection `Authorization: Bearer` |
| `role.guard.ts` | Guard Angular — redirige vers `/forbidden` si rôle ADMIN absent |
| `app.spec.ts` | Test unitaire Angular (TestBed) |
| `ci.yml` | Workflow GitHub Actions CI (Java 21 + Maven + Node 22) |
| `docker-compose.yml` | Stack complète : PostgreSQL 17, Keycloak 26, backend Spring Boot, frontend Angular |

---

## Section TFE conseillée — où utiliser ces assets

### Chapitre Sécurité
- **Figure** : `03_login-keycloak.png` — flux OAuth2/OIDC avec Keycloak
- **Code** : `KeycloakJwtConverter.java` — extraction des rôles depuis le claim `realm_access`
- **Code** : `SecurityConfig.java` — règles `hasRole("ADMIN")` / `hasAnyRole("USER","ADMIN")`
- **Code** : `auth.interceptor.ts` — `updateToken(30)` + header `Authorization`
- **Code** : `role.guard.ts` — protection côté Angular

### Chapitre Fonctionnalités
- **Figures** : `01` à `07` — parcours utilisateur complet (liste → détail → login → réservation → annulation)
- **Figures** : `09` à `11` — parcours administrateur (dashboard → création → modification)
- **Figure** : `08_forbidden.png` — gestion des accès non autorisés

### Chapitre Infrastructure
- **Figure** : `docker-compose.png` — orchestration des services avec health checks
- **Figure** : `actuator-health.png` — endpoint de monitoring Spring Boot
- **Figure** : `github-actions-ci.png` — intégration continue (CI/CD)
- **Code** : `docker-compose.yml` — configuration complète

### Chapitre Tests
- **Figure** : `tests-vitest.png` — rapport d'exécution des tests
- **Code** : `app.spec.ts` — exemple de test unitaire Angular

---

## Captures manquantes / échecs

| Capture | Raison |
|---|---|
| GitHub Actions — run en cours | Non capturé depuis l'interface GitHub.com (pas d'accès navigateur externe configuré). Remplacé par une vue HTML du YAML. |
| Tests Playwright e2e | Aucun fichier e2e Playwright n'existe dans le projet (playwright installé, dossier `e2e/` absent). |
| Screenshot Docker build backend | Le backend a été démarré via `mvn spring-boot:run` (dev), pas via `docker compose up backend`. |

---

## Actions manuelles restantes

1. **Insérer les captures dans Word** : copier/coller les `.png` depuis `screenshots/app/` et `screenshots/technique/` dans les sections correspondantes.
2. **Légendes** : ajouter une légende sous chaque figure (`Figure X — Nom de l'écran`), puis mettre à jour la table des illustrations.
3. **Tests e2e manquants** : si requis, créer `logiscool-frontend/e2e/app.spec.ts` avec Playwright et exécuter `npx playwright test`.
4. **Screenshot GitHub Actions réel** : pousser un commit sur `main` ou `develop`, puis capturer l'onglet **Actions** sur github.com.

---

## Régénérer les captures

```bash
# 1. Démarrer les services (depuis LogiscoolEventWebSite/)
docker compose up -d db my-keycloak

# 2. Démarrer le backend
cd LogiscoolEventWebSite
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# 3. Démarrer le frontend (autre terminal)
cd logiscool-frontend
npm start

# 4. Relancer les captures manuellement via Playwright MCP ou :
npx playwright screenshot http://localhost:4200 tfe-assets-final/screenshots/app/01_event-list.png
```

**Utilisateurs de test Keycloak :**
- `user1` / `user1pass` (rôle USER)
- `admin1` / `admin1pass` (rôle ADMIN)
