# Journal de développement — LogiscoolWebApp

> Chaque entrée documente un problème détecté, sa cause, la solution appliquée,
> les fichiers modifiés et comment vérifier la correction.

---

## [INFRA-001] Conteneurisation, CI/CD, secrets, healthchecks, logging structuré

**Date :** 2026-05-11
**Catégorie :** Infrastructure / DevOps

### Objectif
Préparer le projet pour un déploiement réel : plus aucun secret en dur, conteneurisation complète, pipeline CI/CD, healthchecks, logs adaptés à chaque environnement.

### Secrets via variables d'environnement

**Problème :** `docker-compose.yml` et `application.yaml` contenaient mots de passe et credentials en dur.

**Solution :**
- `application.yaml` : toutes les valeurs sensibles passent par `${VAR:valeur_dev}` (compatible dev local sans config)
- `docker-compose.yml` : idem via `${VAR}`
- `.env.example` créé à la racine de `LogiscoolEventWebSite/` — modèle à copier en `.env` (non commité)
- `.env` ajouté au `.gitignore` racine et backend

### Dockerfiles

- `LogiscoolEventWebSite/Dockerfile` — build Maven multi-stage (JDK 21 → JRE 21 slim)
- `logiscool-frontend/Dockerfile` — build Node 22 multi-stage → Nginx Alpine
- `logiscool-frontend/nginx.conf` — routing SPA (`try_files`) + proxy `/api/` vers le backend

### Configuration multi-environnement

- `application-dev.yaml` — `show-sql: true`, logs DEBUG (actif par défaut en local)
- `application-prod.yaml` — `ddl-auto: validate` (sécurité prod), logs INFO/WARN
- `SPRING_PROFILES_ACTIVE=dev` par défaut via `${SPRING_PROFILES_ACTIVE:dev}`

### Spring Boot Actuator — healthchecks

- Dépendance `spring-boot-starter-actuator` ajoutée dans `pom.xml`
- `application.yaml` : endpoint `/actuator/health` et `/actuator/info` exposés
- `docker-compose.yml` : `healthcheck:` configuré sur les 4 services avec `depends_on: condition: service_healthy`
- `SecurityConfig.java` : `/actuator/health` et `/actuator/info` ajoutés en `permitAll()`

**Correction bonus dans SecurityConfig :** `PUT /api/events/**` manquait dans les règles → ajouté avec `hasRole("ADMIN")`.

### Logging structuré

- `logback-spring.xml` créé dans `src/main/resources/`
- Profil `prod` : format JSON (parsable par ELK, Loki, etc.)
- Profil `dev`/`default` : format texte lisible avec timestamp et niveau

### Couverture de code — JaCoCo

- Plugin `jacoco-maven-plugin 0.8.12` ajouté dans `pom.xml`
- Rapport généré automatiquement lors de `mvn verify` dans `target/site/jacoco/`

### Pipeline CI/CD GitHub Actions

- `.github/workflows/ci.yml` — build Maven + tests + rapport JaCoCo sur chaque push/PR vers `main` ou `develop`
- `.github/workflows/cd.yml` — build images Docker → push Docker Hub → déploiement staging (automatique) → déploiement prod (avec approbation manuelle via `environment: production`)

### Fichiers créés / modifiés

| Fichier | Action |
|---|---|
| `LogiscoolEventWebSite/src/main/resources/application.yaml` | Secrets → variables d'env, Actuator, profil actif |
| `LogiscoolEventWebSite/src/main/resources/application-dev.yaml` | Nouveau |
| `LogiscoolEventWebSite/src/main/resources/application-prod.yaml` | Nouveau |
| `LogiscoolEventWebSite/src/main/resources/logback-spring.xml` | Nouveau |
| `LogiscoolEventWebSite/pom.xml` | Actuator + JaCoCo ajoutés |
| `LogiscoolEventWebSite/docker-compose.yml` | Secrets → env vars, services backend+frontend, healthchecks |
| `LogiscoolEventWebSite/.env` | Nouveau (valeurs dev, non commité) |
| `LogiscoolEventWebSite/Dockerfile` | Nouveau |
| `logiscool-frontend/Dockerfile` | Nouveau |
| `logiscool-frontend/nginx.conf` | Nouveau |
| `.env.example` | Nouveau |
| `.gitignore` | Nouveau (racine) |
| `.github/workflows/ci.yml` | Nouveau |
| `.github/workflows/cd.yml` | Nouveau |
| `infrastructure/security/SecurityConfig.java` | `/actuator/health` permitAll + PUT events ADMIN |

### Comment vérifier

```bash
# Healthcheck backend
curl http://localhost:8090/actuator/health
# → {"status":"UP"}

# Tests Playwright (26/26 PASS confirmés après ces changements)
cd logiscool-frontend && node playwright-full-test.js
```

### Fix [TEST-002] Race condition B7 Playwright en mode headed

En mode `headless: false`, le `Promise.all([waitForResponse, click()])` causait un timeout car le listener et le clic partaient simultanément. Résolu en séparant les deux : le listener est enregistré avant `await cancelBtn.click()`, garantissant qu'aucune réponse DELETE ne peut être ratée.

---

## [2026-05-10] Refonte visuelle — suppression des emojis et ton professionnel

**Problème :** L'interface contenait de nombreux emojis (📅, 📍, ⏱, 🪑, ✅, 📭, 📋, ➕, 🔒) dans les templates HTML, des textes à connotation promotionnelle ("Découvrez et réservez nos prochains ateliers"), un gradient coloré dans l'en-tête de la fiche événement, et une navbar avec les liens positionnés au centre plutôt qu'à droite. L'ensemble donnait une apparence de page marketing plutôt que d'application de gestion.

**Cause :** Choix stylistiques initiaux orientés "landing page" incompatibles avec une présentation en soutenance devant exiger crédibilité et sobriété.

**Solution :**
- Suppression de tous les emojis dans les templates HTML.
- Remplacement des textes promotionnels par des formulations neutres et fonctionnelles.
- Remplacement du `linear-gradient` de l'en-tête `event-detail` par un fond blanc uni (`var(--color-surface)`).
- Repositionnement des liens navbar à droite (`margin-left: auto` déplacé de `.navbar-actions` vers `.navbar-links`).
- Nettoyage des classes SCSS orphelines (`.meta-icon`, `.empty-icon`) devenues inutiles après la suppression des emojis.

**Fichiers modifiés :**
- `logiscool-frontend/src/app/features/events/event-list/event-list.component.html`
- `logiscool-frontend/src/app/features/events/event-list/event-list.component.scss`
- `logiscool-frontend/src/app/features/events/event-detail/event-detail.component.html`
- `logiscool-frontend/src/app/features/events/event-detail/event-detail.component.scss`
- `logiscool-frontend/src/app/features/reservations/my-reservations/my-reservations.component.html`
- `logiscool-frontend/src/app/features/reservations/my-reservations/my-reservations.component.scss`
- `logiscool-frontend/src/app/features/admin/admin-dashboard/admin-dashboard.component.html`
- `logiscool-frontend/src/app/features/admin/admin-dashboard/admin-dashboard.component.scss`
- `logiscool-frontend/src/app/features/forbidden/forbidden.component.ts`
- `logiscool-frontend/src/app/shared/components/navbar/navbar.component.scss`

**Comment vérifier :** Lancer `npm start` dans `logiscool-frontend/`, naviguer sur toutes les pages (liste, détail, réservations, admin, accès refusé) et vérifier l'absence d'emojis, la sobriété des couleurs, et la navbar avec brand à gauche / liens + actions à droite.

---

## [FEAT-001] Champ prix sur les événements + validation formulaire admin

**Date :** 2026-05-11
**Catégorie :** Fullstack — Nouveau champ

### Objectif
Permettre à l'admin de définir un prix pour chaque événement. Le prix est optionnel : `null` = gratuit. Base posée en vue d'une intégration future d'un service de paiement.

### Backend — fichiers modifiés

| Fichier | Modification |
|---|---|
| `domain/model/Event.java` | Ajout `BigDecimal price` |
| `application/dto/EventRequestDTO.java` | Ajout `BigDecimal price` |
| `application/dto/EventResponseDTO.java` | Ajout `BigDecimal price` |
| `infrastructure/.../entity/EventJpaEntity.java` | Ajout `@Column(precision=10, scale=2) BigDecimal price` |
| `application/mapper/EventApplicationMapper.java` | `price` propagé dans `toDomain()` et `toResponseDTO()` |
| `infrastructure/.../mapper/EventPersistenceMapper.java` | `price` propagé dans `toDomain()` et `toJpaEntity()` |

Hibernate ajoute automatiquement la colonne `price NUMERIC(10,2)` à la table `events` au redémarrage grâce à `ddl-auto: update`.

### Frontend — fichiers modifiés

| Fichier | Modification |
|---|---|
| `admin-dashboard.component.ts` | Interface `EventResponse` + objet `newEvent` + payload `body` + réinitialisations : champ `price: number \| null` |
| `admin-dashboard.component.html` | Champ `<input type="number" min="0" step="0.01">` dans le formulaire, colonne "Prix" dans le tableau |
| `event-list.component.ts` | Interface `EventResponse` : ajout `price` ; import `DecimalPipe` |
| `event-list.component.html` | Affichage "Prix : X,XX €" ou "Prix : Gratuit" sur chaque card |
| `event-detail.component.ts` | Interface `EventResponse` : ajout `price` ; import `DecimalPipe` |
| `event-detail.component.html` | Ligne "Prix" dans la grille d'infos du détail |

### Validation
Côté TypeScript (avant envoi HTTP) : si `price !== null && price < 0`, affiche le message _"Le prix ne peut pas être négatif."_ et bloque la soumission. L'attribut HTML `min="0"` bloque aussi la saisie au niveau du navigateur.

### Comment vérifier
1. Admin : créer un événement sans prix → affiché "Gratuit" partout.
2. Admin : saisir un prix négatif → message d'erreur, aucun appel HTTP.
3. Admin : créer un événement avec prix 15.99 → affiché "15,99 €" dans la table admin, la liste publique et la page détail.

---

## Guide de démarrage

Le guide complet pour lancer le projet sur une machine vierge est dans **[GUIDE_DEMARRAGE.md](./GUIDE_DEMARRAGE.md)** (à la racine du dépôt).

Ordre de démarrage résumé :
1. `docker compose up -d` (dans `LogiscoolEventWebSite/`) — attendre ~60 s
2. Spring Boot via IntelliJ ou `./mvnw spring-boot:run`
3. `npm install && npm start` (dans `logiscool-frontend/`)
4. Ouvrir `http://localhost:4200`

Comptes de test : `user1 / user1pass` (USER) · `admin1 / admin1pass` (ADMIN)

---

## [FIX-001] App Angular : page blanche au démarrage (Keycloak injoignable)

**Date :** 2026-05-09
**Priorité :** 🔴 BLOQUANT
**Diagnostiqué via :** Playwright — `<app-root>` vide, console `Timeout when waiting for 3rd party check iframe message`

### Problème
L'application Angular affichait une page totalement blanche dès le lancement.
Playwright a confirmé que `<app-root>` restait vide et que deux erreurs consécutives
étaient levées dans la console.

### Cause
`APP_INITIALIZER` utilisait `useFactory: initializeKeycloak`.
`keycloak.init({ onLoad: 'check-sso' })` lançait un iframe silencieux vers
`http://localhost:8080` (Keycloak). Si Keycloak est injoignable, l'iframe
timeout et la promesse est **rejetée**. Angular propageait ce rejet en tant
qu'erreur fatale du bootstrap → l'app ne se montait jamais.

### Solution
1. Ajout de `.catch(() => false)` dans `initializeKeycloak()` pour absorber
   l'échec de connexion à Keycloak sans bloquer le bootstrap.
2. Remplacement de `APP_INITIALIZER` (déprécié depuis Angular v19) par
   `provideAppInitializer` (API Angular 19+).

### Fichiers modifiés
- `logiscool-frontend/src/app/core/auth/keycloak.init.ts`
- `logiscool-frontend/src/app/app.config.ts`

### Comment vérifier
1. Lancer `ng serve` **sans** Docker (Keycloak injoignable).
2. Ouvrir `http://localhost:4200` — la navbar et la liste d'événements doivent
   s'afficher (même si la liste indique « Impossible de charger » car le
   backend aussi est arrêté).
3. La console ne doit plus bloquer le rendu ; l'erreur Keycloak reste un simple
   log non fatal.

---

## [FIX-002] Backend : `LocalDateTime`/`LocalTime` sérialisés en tableau JSON

**Date :** 2026-05-09
**Priorité :** 🔴 CRITIQUE
**Catégorie :** Backend — Sérialisation Jackson

### Problème
L'API renvoyait les dates sous forme de tableau numérique, par exemple :
```json
"date": [2024, 1, 15, 10, 30, 0]
"lengthTime": [2, 30, 0]
```
Le `DatePipe` Angular (`date:'dd/MM/yyyy HH:mm'`) ne peut pas parser un tableau —
les dates s'affichaient comme `Invalid Date` ou vides côté frontend.

### Cause
Comportement par défaut de Jackson : sans configuration explicite, les types
`java.time.LocalDateTime` et `java.time.LocalTime` (module `jackson-datatype-jsr310`)
sont sérialisés en tableaux numériques (`write-dates-as-timestamps=true` par défaut).

**Difficulté supplémentaire** : Spring Boot 4.x / Jackson 3.x ont migré
`WRITE_DATES_AS_TIMESTAMPS` de `SerializationFeature` vers `DateTimeFeature`
(`tools.jackson.databind.cfg.DateTimeFeature`). La propriété YAML
`spring.jackson.serialization.write-dates-as-timestamps: false` ne fonctionne
**plus** avec Jackson 3.x (erreur : `No enum constant … SerializationFeature.write-dates-as-timestamps`).

### Solution
Création d'une classe de configuration Java `JacksonConfig.java` implémentant
`JsonMapperBuilderCustomizer` (API Spring Boot 4) :
```java
@Component
public class JacksonConfig implements JsonMapperBuilderCustomizer {
    @Override
    public void customize(JsonMapper.Builder builder) {
        builder.disable(DateTimeFeature.WRITE_DATES_AS_TIMESTAMPS);
    }
}
```
Les dates sont désormais sérialisées en strings ISO-8601 :
```json
"date": "2024-01-15T10:30:00"
"lengthTime": "02:30:00"
```

### Fichiers modifiés
- `LogiscoolEventWebSite/src/main/java/.../infrastructure/config/JacksonConfig.java` (nouveau)

### Comment vérifier
1. Démarrer le backend avec Docker (PostgreSQL + Keycloak).
2. `GET http://localhost:8090/api/events` → vérifier que `date` est une string
   ISO-8601 (ex. `"2024-01-15T10:30:00"`) et non un tableau.
3. Côté Angular, la liste d'événements doit afficher les dates correctement
   via le `DatePipe`.

---

## [FIX-003] Sécurité : `DELETE /api/reservations/{id}` sans contrôle d'ownership

**Date :** 2026-05-09
**Priorité :** 🔴 SÉCURITÉ
**Catégorie :** Backend — Autorisation

### Problème
N'importe quel utilisateur authentifié (rôle `USER`) pouvait supprimer la
réservation d'un autre utilisateur en connaissant son ID.

### Cause
Le endpoint `DELETE /api/reservations/{id}` appelait directement
`reservationUseCase.deleteById(id)` sans vérifier que l'utilisateur
connecté était bien le propriétaire de la réservation.

### Solution
1. Renommage de `deleteById` en `cancelReservation(Long id, String requestingUserId)`
   dans `ReservationUseCase`.
2. Dans `ReservationService.cancelReservation()` :
   - Récupère la réservation (→ 404 si inexistante via `ResponseStatusException`).
   - Compare `reservation.getUserId()` avec `requestingUserId` (→ 403 si différent).
   - Supprime uniquement si l'owner correspond.
3. Dans `ReservationController.cancelReservation()` : injection de
   `@AuthenticationPrincipal Jwt jwt` et passage de `jwt.getSubject()`.

### Fichiers modifiés
- `domain/port/in/ReservationUseCase.java`
- `application/service/ReservationService.java`
- `infrastructure/.../controller/ReservationController.java`

### Comment vérifier
- Créer deux utilisateurs dans Keycloak (userA, userB).
- userA crée une réservation (ID=1).
- userB tente `DELETE /api/reservations/1` → doit recevoir **403 Forbidden**.
- userA tente `DELETE /api/reservations/1` → doit recevoir **204 No Content**.

---

## [FIX-004] Backend : `EventNotFoundException` renvoyait HTTP 500 au lieu de 404

**Date :** 2026-05-09
**Priorité :** 🟠 IMPORTANT
**Catégorie :** Backend — Gestion d'exceptions

### Problème
Lorsque `POST /api/reservations` était appelé avec un `eventId` inexistant,
`ReservationService` levait `EventNotFoundException` qui n'était pas mappée
à un code HTTP → Spring renvoyait une **500 Internal Server Error**.

### Cause
`EventNotFoundException extends RuntimeException` sans annotation
`@ResponseStatus` et sans `@RestControllerAdvice` global.

### Solution
Ajout de `@ResponseStatus(HttpStatus.NOT_FOUND)` sur `EventNotFoundException`.
Spring MVC intercepte désormais automatiquement cette exception et renvoie
un **404 Not Found**.

### Fichiers modifiés
- `domain/exception/EventNotFoundException.java`

### Comment vérifier
`POST http://localhost:8090/api/reservations` avec `{ "eventId": 9999 }`
(ID inexistant) → doit renvoyer **404** et non plus **500**.

---

## [FIX-005] Docker : incompatibilité Keycloak v24 (serveur) vs v26 (client JS)

**Date :** 2026-05-09
**Priorité :** 🟠 IMPORTANT
**Catégorie :** Infrastructure — Docker Compose

### Problème
`docker-compose.yml` démarrait Keycloak **24.0** mais `package.json` utilisait
`keycloak-js` **26.2.3**. Depuis Keycloak 26, les variables d'environnement
admin ont été renommées (`KEYCLOAK_ADMIN` → `KC_BOOTSTRAP_ADMIN_USERNAME`),
ce qui causait un démarrage silencieux sans compte admin.

### Cause
Oubli de synchronisation entre la version du serveur Keycloak et celle du
client JavaScript lors d'une mise à jour de `keycloak-js`.

### Solution
- Image mise à jour : `quay.io/keycloak/keycloak:26.2.3`
- Variables renommées :
  - `KEYCLOAK_ADMIN` → `KC_BOOTSTRAP_ADMIN_USERNAME`
  - `KEYCLOAK_ADMIN_PASSWORD` → `KC_BOOTSTRAP_ADMIN_PASSWORD`

### Fichiers modifiés
- `LogiscoolEventWebSite/docker-compose.yml`

### Comment vérifier
`docker compose up -d` → accéder à `http://localhost:8180` → connexion avec
`admin / admin` doit fonctionner dans Keycloak 26.

---

## [FIX-006] Frontend : intercepteur `catchError` envoyait la requête sans token

**Date :** 2026-05-09
**Priorité :** 🟠 IMPORTANT
**Catégorie :** Frontend — Sécurité / HTTP

### Problème
Après un échec de `keycloak.updateToken(30)`, le `catchError` appelait
`authService.login()` (redirect vers Keycloak) puis continuait avec
`return next(req)` — la requête partait sans header `Authorization`,
générant une réponse 401 inutile avant la redirection.

### Cause
`next(req)` avait été utilisé à la place de `EMPTY` comme valeur de retour
du `catchError`.

### Solution
Remplacement de `return next(req)` par `return EMPTY` (RxJS) dans le
`catchError`. L'Observable se complète proprement sans émettre la requête.

### Fichiers modifiés
- `logiscool-frontend/src/app/core/interceptors/auth.interceptor.ts`

### Comment vérifier
Expirer manuellement le token Keycloak → toute requête `/api/` ne doit
plus générer de 401 ; l'utilisateur est redirigé directement vers la page
de login Keycloak.

---

## [FIX-007] Frontend : URLs hardcodées → fichiers `environments`

**Date :** 2026-05-09
**Priorité :** 🟠 IMPORTANT
**Catégorie :** Frontend — Configuration

### Problème
Les 4 composants et `keycloak.init.ts` contenaient `http://localhost:8090`
et `http://localhost:8080` en dur. Impossible de cibler un autre environnement
(staging, prod) sans modifier chaque fichier.

### Cause
Absence des fichiers `src/environments/` dans le projet.

### Solution
1. Création de `src/environments/environment.ts` (production) et
   `src/environments/environment.development.ts` avec `apiUrl`, `keycloakUrl`,
   `keycloakRealm`, `keycloakClientId`.
2. Ajout des `fileReplacements` dans `angular.json` pour substitution par
   build target.
3. Remplacement de toutes les URLs hardcodées par `environment.apiUrl` /
   `environment.keycloakUrl`.

### Fichiers modifiés
- `src/environments/environment.ts` (nouveau)
- `src/environments/environment.development.ts` (nouveau)
- `angular.json`
- `src/app/core/auth/keycloak.init.ts`
- `src/app/features/events/event-list/event-list.component.ts`
- `src/app/features/events/event-detail/event-detail.component.ts`
- `src/app/features/admin/admin-dashboard/admin-dashboard.component.ts`
- `src/app/features/reservations/my-reservations/my-reservations.component.ts`

### Comment vérifier
`ng build --configuration production` → vérifier dans `dist/` que les URLs
dans les chunks JS pointent vers les valeurs de `environment.ts`.

---

## [FIX-008] Frontend : `ChangeDetectorRef` inutile + migration `@for`/`@if`

**Date :** 2026-05-09
**Priorité :** 🟡 MINEUR
**Catégorie :** Frontend — Qualité de code

### Problème
1. `event-list.component.ts` injectait `ChangeDetectorRef` et appelait
   `cdr.detectChanges()` dans les callbacks `subscribe`. Avec la détection
   de changements par **défaut** (non `OnPush`), c'est redondant.
2. Les 5 composants + navbar importaient `NgFor`, `NgIf` explicitement
   (ancienne syntaxe pré-Angular 17). Angular 17+ intègre `@for`, `@if`,
   `@empty` directement dans le compilateur de templates.

### Solution
1. Suppression de `ChangeDetectorRef` et ses appels dans `event-list.component.ts`.
2. Migration de tous les templates HTML vers la syntaxe `@if`/`@for`/`@empty`.
3. Suppression des imports `NgFor` et `NgIf` dans les `imports[]` de chaque composant.

### Fichiers modifiés
- `event-list.component.ts` + `.html`
- `event-detail.component.ts` + `.html`
- `admin-dashboard.component.ts` + `.html`
- `my-reservations.component.ts` + `.html`
- `navbar.component.ts` + `.html`

### Comment vérifier
`ng build --configuration development` → zéro erreur. Ouvrir l'app → les
listes et conditions s'affichent correctement.

---

## [FIX-009] Docker : export realm Keycloak pour import automatique

**Date :** 2026-05-09
**Priorité :** 🟡 MINEUR
**Catégorie :** Infrastructure — DevX

### Problème
Le realm `logiscool`, le client `logiscool-angular` et les rôles `USER`/`ADMIN`
devaient être configurés manuellement dans l'interface Keycloak après chaque
`docker compose up`. Aucun fichier d'export n'existait dans le dépôt.

### Solution
1. Création de `keycloak/realm-export.json` contenant :
   - Realm `logiscool`
   - Client `logiscool-angular` (public, redirect `http://localhost:4200/*`)
   - Rôles `USER` et `ADMIN`
   - Deux utilisateurs de test : `user1 / user1pass` (USER) et `admin1 / admin1pass` (USER + ADMIN)
2. Ajout du volume et de `--import-realm` dans `docker-compose.yml`.

### Fichiers modifiés
- `LogiscoolEventWebSite/keycloak/realm-export.json` (nouveau)
- `LogiscoolEventWebSite/docker-compose.yml`

### Comment vérifier
```bash
docker compose up -d
# Attendre ~30s que Keycloak démarre
curl http://localhost:8180/realms/logiscool/.well-known/openid-configuration
# → doit retourner la config OIDC du realm logiscool
```
Login avec `user1/user1pass` ou `admin1/admin1pass` sur l'app Angular.

---

## [FIX-010] Docker : conflit port 8080 avec `AgentService` Windows → Keycloak sur 8180

**Date :** 2026-05-09
**Priorité :** 🔴 BLOQUANT
**Catégorie :** Infrastructure — Docker Compose

### Problème
`docker compose up -d` démarrait le conteneur Keycloak mais il était inaccessible.
Le port 8080 était déjà occupé par `AgentService.exe` (PID 4324, service Windows).
Keycloak démarrait en interne mais aucune requête externe ne pouvait l'atteindre.

### Cause
Keycloak écoute sur le port 8080 en interne. Le mapping `8080:8080` dans
`docker-compose.yml` entrait en conflit avec le service Windows `AgentService`
qui occupait déjà le port 8080 sur l'hôte.

### Solution
Changement du mapping de port hôte : `8080:8080` → `8180:8080`.
Mise à jour de toutes les références à Keycloak dans le projet :
- `application.yaml` : `issuer-uri: http://localhost:8180/realms/logiscool`
- `environment.ts` / `environment.development.ts` : `keycloakUrl: 'http://localhost:8180'`

### Fichiers modifiés
- `LogiscoolEventWebSite/docker-compose.yml`
- `LogiscoolEventWebSite/src/main/resources/application.yaml`
- `logiscool-frontend/src/environments/environment.ts`
- `logiscool-frontend/src/environments/environment.development.ts`

### Comment vérifier
```bash
docker compose up -d
curl http://localhost:8180/realms/logiscool/.well-known/openid-configuration
# → doit retourner la config OIDC (HTTP 200)
```

---

## [FIX-011] Frontend : mode zoneless Angular 21 → détection de changements non déclenchée

**Date :** 2026-05-09
**Priorité :** 🔴 CRITIQUE
**Catégorie :** Frontend — Change Detection

### Problème
La liste d'événements affichait en permanence « Chargement en cours... » même
après une réponse HTTP 200 du backend. Le spinner ne disparaissait jamais et
aucun événement ne s'affichait.

### Cause
Les projets Angular 19+ générés par le CLI utilisent **`provideBrowserGlobalErrorListeners()`**
et sont en mode **zoneless par défaut**. Sans `provideZoneChangeDetection()`, Angular 21
ne fournit pas `NgZone` (erreur `NG0201: No provider for NgZone`). Les callbacks
`subscribe()` exécutent bien `this.loading = false` mais aucune détection de
changements n'est déclenchée → le DOM reste figé.

`zone.js` était également absent (`package.json`), ce qui aggravait le problème.

Diagnostic Playwright :
```js
window.Zone === undefined           // zone.js non chargé
// NG0201: No provider found for NgZone  // Angular en mode zoneless
```

### Solution
1. Installation de `zone.js` : `npm install zone.js`
2. Import explicite au sommet de `main.ts` avant le bootstrap :
   ```typescript
   import 'zone.js';
   import { bootstrapApplication } from '@angular/platform-browser';
   ```
3. Ajout de `"polyfills": ["zone.js"]` dans `angular.json`.
4. **Correction principale** : ajout de `provideZoneChangeDetection()` dans
   `app.config.ts` pour enregistrer `NgZone` et activer la détection par zone :
   ```typescript
   import { provideZoneChangeDetection } from '@angular/core';
   providers: [
     provideBrowserGlobalErrorListeners(),
     provideZoneChangeDetection({ eventCoalescing: true }),
     // ...
   ]
   ```

### Fichiers modifiés
- `logiscool-frontend/package.json` (zone.js ajouté)
- `logiscool-frontend/src/main.ts` (`import 'zone.js'` ajouté)
- `logiscool-frontend/angular.json` (`polyfills: ["zone.js"]` ajouté)
- `logiscool-frontend/src/app/app.config.ts` (`provideZoneChangeDetection` ajouté)

### Comment vérifier
1. Lancer `ng serve --configuration=development`.
2. Ouvrir `http://localhost:4200` → « Aucun événement disponible » (DB vide)
   ou la liste d'événements s'affiche. Plus de spinner bloqué.
3. Tests Playwright : **13/13 PASS** (login Keycloak inclus).


---

## [TEST-001] Suite de tests Playwright complète — 27/27

**Date :** 2026-05-09
**Catégorie :** Tests end-to-end

### Contexte
Suite de tests Playwright couvrant l'ensemble des parcours fonctionnels.
Exécutable via : `cd logiscool-frontend && node playwright-full-test.js`

### Résultats : 27/27 PASS

#### SETUP — Infrastructure de test
| Test | Résultat |
|---|---|
| Token Keycloak admin1 | ✅ |
| Token Keycloak user1 | ✅ |
| Création événements de test via API (rôle ADMIN) | ✅ |

#### A — Utilisateur anonyme
| Test | Résultat |
|---|---|
| A1 — Liste événements visible sans login | ✅ |
| A2 — Bouton "Se connecter" présent | ✅ |
| A3 — Détail événement accessible sans login | ✅ |
| A4 — Événement inexistant → message 404 | ✅ |
| A5 — `/reservations` sans login → redirect Keycloak | ✅ |
| A6 — `/admin` sans login → redirect Keycloak | ✅ |
| A7 — `POST /api/events` sans token → 401 | ✅ |

#### B — Utilisateur user1 (rôle USER)
| Test | Résultat |
|---|---|
| B1 — Login user1 → redirect Keycloak → retour app | ✅ |
| B2 — Liste événements visible après login | ✅ |
| B3 — `/reservations` accessible pour USER | ✅ |
| B4 — `/admin` avec rôle USER → page `/forbidden` | ✅ |
| B5 — Réserver un événement via UI (bouton + succès) | ✅ |
| B6 — Réservation visible dans `/reservations` | ✅ |
| B7 — Annuler la réservation (DELETE 204 + liste rechargée vide) | ✅ |
| B8 — `POST /api/events` avec token USER → 403 | ✅ |

#### C — Utilisateur admin1 (rôle ADMIN)
| Test | Résultat |
|---|---|
| C1 — Login admin1 réussi | ✅ |
| C2 — Dashboard `/admin` accessible pour ADMIN | ✅ |
| C3 — Création événement via formulaire UI admin | ✅ |
| C4 — Suppression événement via UI admin | ✅ |
| C5 — Ownership check : user1 ne peut pas annuler la réservation d'admin1 (403) | ✅ |

#### CLEANUP
| Test | Résultat |
|---|---|
| Suppression des événements de test via API | ✅ |

### Problèmes rencontrés lors de la mise au point des tests
1. **B5** : message de succès `"Votre réservation a bien été enregistrée."` — la détection initiale cherchait "succès"/"confirmé" (corrigé).
2. **B7** : `cancel()` déclenche `load()` asynchrone ; `waitForLoadState('networkidle')` insuffisant. Résolu avec `waitForResponse` sur la réponse DELETE (204) puis sur le GET suivant.
3. **Données résiduelles** : les runs précédents laissaient des réservations en DB. Résolu par un nettoyage préventif `GET + DELETE` sur toutes les réservations de user1 avant le test B5.

### Comment rejouer les tests
```bash
# Prérequis : Docker + Spring Boot + Angular tous démarrés
cd logiscool-frontend
node playwright-full-test.js
```

---

## [CLEAN-001] Nettoyage données de test résiduelles en DB

**Date :** 2026-05-09
**Catégorie :** Maintenance

### Problème
Après plusieurs exécutions de `playwright-full-test.js`, 3 événements résiduels
subsistaient en DB (`id=7` "Test Cancel Debug", `id=8` et `id=11` "Atelier Scratch
Débutants"). Cause : le test C4 (suppression via UI) cible le premier bouton
"Supprimer" visible — l'événement `id+0` est supprimé mais l'événement `id+1`
(créé par C3) peut rester si le test se termine avant le rechargement.

### Solution
Suppression manuelle via API (token admin1) :
```bash
for ID in 7 8 11; do
  curl -X DELETE http://localhost:8090/api/events/$ID \
    -H "Authorization: Bearer <admin_token>"
done
```

### État final
DB vide. `playwright-full-test.js` crée et nettoie ses données à chaque run.

### Note sur `silent-check-sso.html`
Le fichier `public/assets/silent-check-sso.html` existe bien et contient le
script standard Keycloak (`parent.postMessage(location.href, location.origin)`).
Le `silentCheckSsoRedirectUri` dans `keycloak.init.ts` pointe correctement vers
`/assets/silent-check-sso.html`.

---

## [UI-001] Refonte interface — Design sobre et moderne (plateforme éducative)

**Date :** 2026-05-09
**Catégorie :** Frontend — UX/Design

### Objectif
Remplacer les styles Bootstrap par défaut par un design system cohérent, sobre et
moderne, inspiré d'une plateforme éducative. Aucune reproduction de la charte
graphique officielle Logiscool (non fournie).

### Principe directeur
Design system CSS personnalisé avec variables CSS (custom properties), typographie
claire, fond gris-bleu clair (`#F1F5F9`), cartes blanches avec ombre légère,
couleur principale bleue (`#2D6BE4`).

### Fichiers créés / modifiés

#### Design system global
- `src/styles.scss` — réécriture complète : variables CSS, reset, boutons (`.btn`,
  `.btn-primary`, `.btn-danger`, `.btn-sm`), badges (`.badge-success`, `.badge-neutral`),
  alertes, états de chargement, grille de page, formulaires

#### Navbar (`shared/components/navbar/`)
- `navbar.component.scss` (nouveau) — barre sticky 64 px, marque en bleu primaire,
  liens avec hover, chip utilisateur arrondi
- `navbar.component.html` — affichage du `preferred_username` (plus de UUID),
  boutons `btn-sm`
- `navbar.component.ts` — ajout `styleUrl`

#### Liste événements (`features/events/event-list/`)
- `event-list.component.scss` (nouveau) — grille responsive `auto-fill minmax(310px,1fr)`,
  cards avec effet hover lift, lignes méta avec emoji, badge places, état vide
- `event-list.component.html` — nouveau template avec `page-header` et `event-grid`
- `event-list.component.ts` — ajout `styleUrl`

#### Détail événement (`features/events/event-detail/`)
- `event-detail.component.scss` (nouveau) — lien retour, header avec badge, `info-grid`
  2 colonnes (Date/Durée + Lieu), section description, section réservation, login-prompt
  en pointillés
- `event-detail.component.html` — nouveau template complet
- `event-detail.component.ts` — ajout `styleUrl`

#### Mes réservations (`features/reservations/my-reservations/`)
- `my-reservations.component.scss` (nouveau) — cards flex-row, badges statut
  vert/gris, opacité 60 % sur les annulées, état vide avec CTA
- `my-reservations.component.html` — nouveau template
- `my-reservations.component.ts` — ajout `styleUrl`

#### Dashboard admin (`features/admin/admin-dashboard/`)
- `admin-dashboard.component.scss` (nouveau) — layout 2 colonnes (360 px / 1fr),
  create-card sticky, events-card avec tableau stylé (hover rows, headers uppercase),
  count-badge
- `admin-dashboard.component.html` — nouveau template avec `admin-header` + badge ADMIN
- `admin-dashboard.component.ts` — ajout `styleUrl`

#### Page interdite (`features/forbidden/`)
- `forbidden.component.ts` — styles inline + template inline : icône 🔒, texte clair,
  lien retour à l'accueil

### Comment vérifier
Ouvrir `http://localhost:4200` avec `ng serve`. Vérifier :
1. Page liste : grille de cards, fond gris, navbar bleue
2. Page détail (anonyme) : login-prompt en pointillés, pas de bouton réserver
3. Page détail (connecté) : bouton "Réserver cet événement"
4. Mes réservations : card avec badge vert "Confirmée" + bouton "Annuler"
5. Admin dashboard : formulaire à gauche, tableau à droite, badge "ADMIN" dans le header
