# Synthèse complète du projet — LogiscoolWebApp

> Ce document explique le projet de A à Z, avec les choix techniques justifiés et les termes complexes expliqués simplement. Il est conçu pour que tu puisses présenter et défendre ce travail avec confiance.

---

## Table des matières

1. [C'est quoi ce projet ?](#1-cest-quoi-ce-projet-)
2. [La stack technique — les outils choisis](#2-la-stack-technique--les-outils-choisis)
3. [Comment les trois parties communiquent](#3-comment-les-trois-parties-communiquent)
4. [L'architecture hexagonale — le coeur du backend](#4-larchitecture-hexagonale--le-coeur-du-backend)
5. [La sécurité — Keycloak et les rôles](#5-la-sécurité--keycloak-et-les-rôles)
6. [Le frontend Angular — ce que voit l'utilisateur](#6-le-frontend-angular--ce-que-voit-lutilisateur)
7. [Le backend Spring Boot — les API REST](#7-le-backend-spring-boot--les-api-rest)
8. [Parcours complet d'une réservation](#8-parcours-complet-dune-réservation)
9. [Les fonctionnalités développées](#9-les-fonctionnalités-développées)
10. [Comment démarrer le projet](#10-comment-démarrer-le-projet)
11. [Questions fréquentes d'un promoteur](#11-questions-fréquentes-dun-promoteur)

---

## 1. C'est quoi ce projet ?

C'est une **application web complète de gestion d'événements** pour Logiscool. Elle permet à deux types d'utilisateurs d'interagir avec le système :

- **Les utilisateurs normaux** peuvent consulter les événements disponibles, voir leurs détails, s'inscrire (réserver une place) et annuler leurs réservations.
- **Les administrateurs** peuvent en plus créer de nouveaux événements, modifier ceux qui n'ont pas encore eu lieu, et supprimer des événements.

L'application est composée de **trois parties distinctes** qui travaillent ensemble :

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│    FRONTEND     │────▶│     BACKEND      │────▶│   BASE DONNÉES   │
│   (Angular)     │     │  (Spring Boot)   │     │  (PostgreSQL)    │
│  Ce que voit    │     │  La logique,     │     │  Stockage des    │
│  l'utilisateur  │     │  les règles      │     │  données         │
└─────────────────┘     └──────────────────┘     └──────────────────┘
                                  ▲
                                  │ gestion des
                                  │ identités
                         ┌────────┴─────────┐
                         │    KEYCLOAK      │
                         │  Connexion /     │
                         │  Authentification│
                         └──────────────────┘
```

---

## 2. La stack technique — les outils choisis

### Angular 21 (le Frontend)

**C'est quoi ?** Un framework JavaScript — autrement dit, un ensemble d'outils qui permettent de construire des interfaces web dynamiques. Angular est développé par Google.

**Pourquoi Angular ?**
- Il impose une structure claire au code : chaque "page" est un **composant** (un bloc autonome avec son HTML, son CSS et sa logique)
- Il gère la navigation entre les pages sans rechargement complet (ce qu'on appelle une **SPA — Single Page Application** : l'utilisateur reste sur une seule page, c'est Angular qui change ce qui est affiché)
- Il est largement utilisé en entreprise, ce qui facilite la maintenance par d'autres développeurs

**Composants standalone :** Dans ce projet, chaque composant Angular est "autonome" — il déclare lui-même ce dont il a besoin (les modules à importer) plutôt que de tout centraliser dans un fichier unique. C'est la façon moderne de faire avec Angular.

---

### Spring Boot (le Backend)

**C'est quoi ?** Un framework Java qui simplifie la création de serveurs web et d'API. Une **API** (Application Programming Interface) est un ensemble de "portes d'entrée" que le frontend peut appeler pour demander ou envoyer des données.

**Pourquoi Spring Boot ?**
- Standard dans l'industrie Java, très utilisé en entreprise
- Intègre nativement la gestion de la sécurité, de la base de données, et des routes HTTP
- Facilite l'écriture d'une architecture propre

Le backend tourne sur le port **8090**, ce qui signifie qu'il répond aux adresses du type `http://localhost:8090/api/...`

---

### PostgreSQL (la Base de données)

**C'est quoi ?** Un système de gestion de base de données relationnelle. Une base relationnelle stocke les données sous forme de **tables** (comme des feuilles Excel) avec des relations entre elles.

Dans ce projet, il y a deux tables principales :
- `events` : stocke tous les événements (titre, date, lieu, nombre de places...)
- `reservations` : stocke qui a réservé quoi

**Pourquoi PostgreSQL ?** C'est une base de données open-source, fiable, et très performante. Elle est utilisée dans des milliers d'applications professionnelles.

Le mode `ddl-auto: update` est activé en développement — cela veut dire que Spring Boot **crée et met à jour automatiquement les tables** à partir du code Java, sans qu'on ait besoin d'écrire du SQL à la main. En production, le profil `application-prod.yaml` passe automatiquement en `ddl-auto: validate` — Spring Boot vérifie que le schéma correspond au code, mais ne le modifie jamais.

---

### Keycloak (l'Authentification)

**C'est quoi ?** Un serveur dédié à la gestion des identités et des accès. Il s'occupe de tout ce qui concerne "qui est connecté" et "à quoi a-t-il le droit".

**Pourquoi Keycloak plutôt que coder soi-même la connexion ?**

Coder un système de connexion sécurisé est extrêmement complexe : gestion des mots de passe chiffrés, expiration des sessions, protection contre les attaques... Keycloak fait tout cela de façon éprouvée et sécurisée. On l'intègre au projet plutôt que de réinventer la roue.

**Concept clé — le token JWT :**
Un **JWT (JSON Web Token)** est comme un "badge électronique". Quand tu te connectes, Keycloak te donne un badge. Ensuite, à chaque fois que tu veux accéder à une ressource protégée, tu présentes ton badge. Le backend vérifie que le badge est valide (signé par Keycloak) sans avoir besoin de "rappeler" Keycloak à chaque fois.

---

### Docker (l'Infrastructure)

**C'est quoi ?** Un outil qui permet de lancer des applications dans des **conteneurs** — des environnements isolés et reproductibles. C'est comme une "boîte virtuelle" qui contient tout ce dont l'application a besoin pour tourner.

**Pourquoi Docker ?**
- PostgreSQL et Keycloak sont lancés via un seul fichier `docker-compose.yml` avec la commande `docker compose up -d`
- Le backend Spring Boot et le frontend Angular ont chacun leur `Dockerfile` — l'application entière (4 services) peut être lancée avec une seule commande
- Fonctionne de la même façon sur toutes les machines (Windows, Mac, Linux)
- Évite les problèmes du type "ça marchait chez moi mais pas chez toi"
- Les healthchecks Docker garantissent l'ordre de démarrage : le backend attend que la DB et Keycloak soient prêts, le frontend attend que le backend soit prêt

---

## 3. Comment les trois parties communiquent

```
UTILISATEUR
    │
    │  ouvre http://localhost:4200
    ▼
┌────────────────────────────────────────────────────┐
│              ANGULAR (Frontend)                    │
│  Affiche les pages HTML                           │
│  Quand besoin de données → appelle le backend     │
│  Attache le token JWT à chaque requête            │
└────────────────┬───────────────────────────────────┘
                 │  HTTP avec token JWT
                 │  ex: GET http://localhost:8090/api/events
                 ▼
┌────────────────────────────────────────────────────┐
│            SPRING BOOT (Backend)                   │
│  Reçoit la requête HTTP                           │
│  Vérifie le token JWT auprès de Keycloak          │
│  Applique la logique métier                       │
│  Interroge la base de données                     │
│  Renvoie les données en JSON                      │
└────────────────┬───────────────────────────────────┘
                 │  SQL
                 ▼
┌────────────────────────────────────────────────────┐
│           POSTGRESQL (Base de données)             │
│  Stocke et retourne les données                   │
└────────────────────────────────────────────────────┘
```

**JSON** : c'est le format de données utilisé pour communiquer entre le frontend et le backend. C'est du texte structuré, lisible par les humains et les machines. Exemple :
```json
{
  "id": 1,
  "title": "Atelier Python",
  "location": "Bruxelles",
  "seat": 20,
  "price": 15.99
}
```

---

## 4. L'architecture hexagonale — le coeur du backend

C'est le **choix d'architecture le plus important** du projet. Il mérite une explication détaillée.

### Le problème que cette architecture résout

Imagine que tout ton code est mélangé : la logique métier (les règles de l'application) est mélangée avec le code qui parle à la base de données, qui est lui-même mélangé avec le code HTTP. Si demain tu veux changer de base de données (passer de PostgreSQL à MySQL), tu dois toucher à tout.

L'architecture hexagonale résout ça en **isolant totalement le coeur de l'application**.

### Les trois couches

```
        Requête HTTP (depuis Angular)
               │
               ▼
┌──────────────────────────────────────────────────┐
│          COUCHE INFRASTRUCTURE                   │
│                                                  │
│  EventController.java    ← reçoit les requêtes  │
│  ReservationController.java                      │
│                                                  │
│  EventRepositoryImpl.java ← parle à PostgreSQL  │
│  EventJpaEntity.java      ← représente une      │
│                             ligne en base        │
└──────────────────┬───────────────────────────────┘
                   │ appelle
                   ▼
┌──────────────────────────────────────────────────┐
│          COUCHE APPLICATION                      │
│                                                  │
│  EventService.java        ← orchestre la logique│
│  ReservationService.java                         │
│                                                  │
│  EventRequestDTO.java     ← données qui entrent │
│  EventResponseDTO.java    ← données qui sortent │
│  EventApplicationMapper.java ← conversion entre│
│                               DTO et domaine    │
└──────────────────┬───────────────────────────────┘
                   │ utilise
                   ▼
┌──────────────────────────────────────────────────┐
│          COUCHE DOMAINE (le coeur pur)           │
│                                                  │
│  Event.java           ← ce qu'est un événement  │
│  Reservation.java     ← ce qu'est une réservation│
│                                                  │
│  EventUseCase.java    ← ce que l'app PEUT faire │
│  (interface)            (sans dire COMMENT)      │
│                                                  │
│  EventRepository.java ← "j'ai besoin d'un       │
│  (interface)            endroit pour stocker"    │
│                         (sans dire OÙ)           │
└──────────────────────────────────────────────────┘
```

### Pourquoi c'est important — le concept de "port"

Un **port** (dans ce contexte) est un contrat, une interface. C'est une liste de promesses sans implémentation.

Par exemple, `EventUseCase.java` dit :
> "L'application peut faire : `findAll()`, `findById()`, `createEvent()`, `updateEvent()`, `deleteById()`"

Mais il ne dit **pas comment** c'est fait. C'est `EventService.java` qui l'implémente.

De même, `EventRepository.java` dit :
> "J'ai besoin d'un endroit pour sauvegarder et récupérer des événements"

Mais il ne dit **pas où** (PostgreSQL ? MySQL ? En mémoire ?). C'est `EventRepositoryImpl.java` dans la couche Infrastructure qui le décide.

### Le bénéfice concret

Le **domaine** (Event.java, EventUseCase.java) **n'importe rien de Spring, rien de PostgreSQL**. C'est du Java pur. On peut le tester sans lancer de base de données, sans lancer de serveur HTTP. Il sera encore valide même si on change toute la technologie autour.

### Les DTO — pourquoi deux représentations du même objet ?

**DTO** = Data Transfer Object = objet de transfert de données.

On a deux versions d'un événement :
- `Event.java` (le domaine) : c'est l'événement "métier", avec toutes ses règles internes
- `EventRequestDTO.java` : ce que le frontend envoie pour créer un événement (pas d'ID, car il n'existe pas encore)
- `EventResponseDTO.java` : ce que le frontend reçoit en retour (avec l'ID assigné par la base)

Pourquoi cette séparation ? Parce qu'on ne veut pas que l'objet interne de l'application soit directement exposé à l'extérieur. Si demain on ajoute un champ interne sensible à `Event.java`, il n'apparaîtra pas dans la réponse HTTP sauf si on l'ajoute explicitement au DTO.

`EventApplicationMapper.java` se charge de la conversion entre les deux.

---

## 5. La sécurité — Keycloak et les rôles

### Comment fonctionne la connexion (OAuth2 / OpenID Connect)

Ces noms barbares désignent des protocoles standardisés pour la gestion des identités. Voici ce qui se passe concrètement quand un utilisateur se connecte :

```
1. L'utilisateur clique "Se connecter" sur Angular
        │
        ▼
2. Angular redirige vers Keycloak (localhost:8180)
        │
        ▼
3. L'utilisateur saisit ses identifiants sur la page Keycloak
        │
        ▼
4. Keycloak vérifie et crée un token JWT (le "badge")
        │
        ▼
5. Keycloak redirige vers Angular avec le token
        │
        ▼
6. Angular stocke le token en mémoire
        │
        ▼
7. À chaque appel HTTP vers le backend, Angular ajoute :
   Authorization: Bearer <le_token>
        │
        ▼
8. Spring Boot vérifie la signature du token (sans rappeler Keycloak)
   et extrait l'identité et les rôles de l'utilisateur
```

### L'intercepteur HTTP — le mécanisme automatique

Dans le fichier `auth.interceptor.ts`, on a configuré un intercepteur. Un **intercepteur** est un "middleware" — un code qui s'exécute automatiquement entre chaque requête HTTP et sa destination.

```typescript
// auth.interceptor.ts — simplifié pour l'explication
export const authInterceptor = (req, next) => {
  // Si la requête va vers /api/ et que l'utilisateur est connecté...
  if (req.url.includes('/api/') && authService.isLoggedIn()) {
    // ...on renouvelle le token si nécessaire (updateToken(30))
    // ...et on clone la requête en ajoutant le header Authorization
    return next(req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    }));
  }
  return next(req); // sinon, on laisse passer normalement
};
```

Grâce à cela, le développeur n'a pas besoin d'ajouter manuellement le token à chaque appel HTTP. C'est automatique.

### Les deux rôles

| Rôle | Droits | Compte de test |
|------|--------|----------------|
| `USER` | Voir les événements, réserver, annuler ses réservations | `user1` / `user1pass` |
| `ADMIN` | Tout ce que fait USER + créer, modifier, supprimer des événements | `admin1` / `admin1pass` |

### La vérification côté backend

Dans le `ReservationController.java`, Spring Boot extrait l'identité de l'utilisateur directement depuis le token JWT :

```java
// @AuthenticationPrincipal Jwt jwt = Spring injecte automatiquement
// les informations du token JWT dans ce paramètre
public ResponseEntity<ReservationResponseDTO> createReservation(
        @RequestBody ReservationRequestDTO dto,
        @AuthenticationPrincipal Jwt jwt) {

    String userId = jwt.getSubject(); // l'ID unique de l'utilisateur dans Keycloak
    // ...
}
```

Cela signifie qu'un utilisateur ne peut jamais prétendre être quelqu'un d'autre : son identité est certifiée par Keycloak dans le token.

### La vérification côté frontend

Dans `admin-dashboard.component.ts`, dès le chargement de la page :

```typescript
ngOnInit(): void {
  // Si l'utilisateur connecté n'a pas le rôle ADMIN...
  if (!this.authService.getUserRoles().includes('ADMIN')) {
    // ...on le redirige immédiatement vers la page "Accès refusé"
    this.router.navigate(['/forbidden']);
    return;
  }
  this.loadEvents();
}
```

**Note importante :** cette vérification frontend est pour l'expérience utilisateur (éviter d'afficher une page vide). La vraie sécurité est au niveau du backend, qui rejette toute requête sans le bon rôle. Un utilisateur malveillant qui désactiverait cette vérification côté navigateur ne pourrait quand même pas appeler les API protégées.

---

## 6. Le frontend Angular — ce que voit l'utilisateur

### Structure des composants

Un **composant Angular** est un bloc autonome composé de trois fichiers :
- `.html` : le template (la structure de la page)
- `.scss` : les styles CSS (la mise en forme)
- `.ts` : le TypeScript (la logique)

```
src/app/
│
├── core/                          ← services partagés
│   ├── auth/
│   │   ├── auth.service.ts        ← gère la connexion/déconnexion/rôles
│   │   └── keycloak.init.ts       ← initialise Keycloak au démarrage
│   └── interceptors/
│       └── auth.interceptor.ts    ← ajoute le token à chaque requête
│
└── features/                      ← les "pages" de l'application
    ├── events/
    │   ├── event-list/            ← page d'accueil : liste des événements
    │   └── event-detail/          ← page d'un événement avec bouton réserver
    ├── reservations/
    │   └── my-reservations/       ← page "mes réservations"
    ├── admin/
    │   └── admin-dashboard/       ← tableau de bord administrateur
    └── forbidden/                 ← page "accès refusé"
```

### Le routing (la navigation)

Le **routing** est le mécanisme qui décide quelle page afficher selon l'URL. Dans Angular, il est configuré dans `app.config.ts`. Exemple :

```
/events         → affiche EventListComponent
/events/5       → affiche EventDetailComponent pour l'événement n°5
/my-reservations → affiche MyReservationsComponent
/admin          → affiche AdminDashboardComponent
/forbidden      → affiche ForbiddenComponent
```

Les composants utilisent le **lazy loading** : ils ne sont chargés par le navigateur que quand l'utilisateur navigue vers eux, pas tous d'un coup au démarrage. Cela rend l'application plus rapide.

### Le dashboard admin — le composant le plus complexe

Ce composant gère plusieurs états à la fois :
- **Mode liste** : affiche tous les événements dans un tableau
- **Mode création** : affiche un formulaire pour créer un événement
- **Mode édition** : affiche le même formulaire pré-rempli pour modifier un événement existant

La bascule entre création et édition est gérée par une seule variable :
```typescript
editingEventId: number | null = null;
// null = on est en mode création
// un nombre = on édite l'événement avec cet ID
```

Le bouton "Modifier" n'est visible que pour les événements **futurs** (dont la date est après aujourd'hui), car modifier un événement passé n'aurait pas de sens :
```typescript
isFutureEvent(dateStr: string): boolean {
  return new Date(dateStr) > new Date();
}
```

---

## 7. Le backend Spring Boot — les API REST

### Qu'est-ce qu'une API REST ?

**REST** (Representational State Transfer) est un style d'architecture pour les APIs web. Une API REST utilise les méthodes HTTP standard pour définir des actions :

| Méthode HTTP | Signification | Analogie |
|---|---|---|
| `GET` | Récupérer des données | Lire un fichier |
| `POST` | Créer une nouvelle ressource | Créer un fichier |
| `PUT` | Remplacer complètement une ressource | Écraser un fichier |
| `DELETE` | Supprimer une ressource | Supprimer un fichier |

### Les endpoints disponibles

#### Événements (`EventController.java`)

| Méthode | URL | Description | Rôle requis |
|---|---|---|---|
| GET | `/api/events` | Récupère tous les événements | Public (non authentifié) |
| GET | `/api/events/{id}` | Récupère un événement par son ID | Public |
| POST | `/api/events` | Crée un nouvel événement | ADMIN |
| PUT | `/api/events/{id}` | Modifie un événement existant | ADMIN |
| DELETE | `/api/events/{id}` | Supprime un événement | ADMIN |

**Champs d'un événement :** `id`, `title`, `description`, `location`, `seat`, `date`, `lengthTime`, `price` (`null` = gratuit).

#### Réservations (`ReservationController.java`)

| Méthode | URL | Description | Rôle requis |
|---|---|---|---|
| POST | `/api/reservations` | Crée une réservation | USER |
| GET | `/api/reservations/my` | Récupère mes réservations | USER |
| DELETE | `/api/reservations/{id}` | Annule une réservation | USER (le propriétaire uniquement) |

**Sécurité de l'annulation :** dans `ReservationService.java`, quand quelqu'un demande à annuler une réservation, le service vérifie que l'ID de l'utilisateur dans le token JWT correspond à l'ID enregistré sur la réservation :

```java
if (!reservation.getUserId().equals(requestingUserId)) {
  throw new ResponseStatusException(HttpStatus.FORBIDDEN,
    "Cannot cancel another user's reservation");
}
```

Un utilisateur ne peut donc pas annuler la réservation de quelqu'un d'autre.

### Comment le backend "expose" ses données — les annotations Spring

Les annotations (les `@...`) sont des métadonnées qui indiquent à Spring comment configurer les classes :

```java
@RestController                     // "cette classe répond aux requêtes HTTP"
@RequestMapping("/api/events")      // "toutes les routes commencent par /api/events"
public class EventController {

    @GetMapping                     // "répond aux GET /api/events"
    public ResponseEntity<List<EventResponseDTO>> getAllEvents() { ... }

    @GetMapping("/{id}")            // "répond aux GET /api/events/5 (par exemple)"
    public ResponseEntity<EventResponseDTO> getEventById(@PathVariable Long id) { ... }

    @PostMapping                    // "répond aux POST /api/events"
    public ResponseEntity<EventResponseDTO> createEvent(@RequestBody EventRequestDTO dto) { ... }

    @PutMapping("/{id}")            // "répond aux PUT /api/events/5"
    public ResponseEntity<EventResponseDTO> updateEvent(...) { ... }

    @DeleteMapping("/{id}")         // "répond aux DELETE /api/events/5"
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) { ... }
}
```

`ResponseEntity` est un objet Spring qui représente une réponse HTTP complète (avec le code de statut, les headers, et le corps).

---

## 8. Parcours complet d'une réservation

Voici le déroulement pas à pas quand un utilisateur réserve une place à un événement :

```
1. L'utilisateur est sur la page /events/3 (détail d'un événement)
   └── Angular a chargé EventDetailComponent

2. Il clique "Réserver"
   └── La méthode reserve() s'exécute dans event-detail.component.ts

3. Angular envoie une requête HTTP :
   POST http://localhost:8090/api/reservations
   Headers: Authorization: Bearer eyJhbGciOi... (le token JWT)
   Body: { "eventId": 3 }

4. L'intercepteur auth.interceptor.ts a automatiquement ajouté le token

5. Spring Boot reçoit la requête
   └── Vérifie la signature du token (token valide ? pas expiré ?)
   └── Extrait l'ID de l'utilisateur depuis le token

6. ReservationController.java prend le relais
   └── Récupère userId = jwt.getSubject()
   └── Appelle reservationUseCase.createReservation(userId, 3)

7. ReservationService.java exécute la logique :
   └── Vérifie que l'événement n°3 existe (sinon : erreur 404)
   └── Crée un objet Reservation avec statut "CONFIRMED"
   └── Sauvegarde en base de données

8. La base de données PostgreSQL enregistre la nouvelle ligne dans la table reservations

9. Spring Boot renvoie la réservation créée en JSON :
   { "id": 12, "eventTitle": "...", "status": "CONFIRMED", ... }

10. Angular affiche un message de confirmation à l'utilisateur
```

---

## 9. Les fonctionnalités développées

### Pour tous les utilisateurs (même non connectés)

- **Liste des événements** (`/events`) : affiche tous les événements avec leur titre, date, lieu, nombre de places et prix (ou "Gratuit")
- **Détail d'un événement** (`/events/:id`) : page complète avec la description, le prix, et un bouton de réservation (visible uniquement si connecté)

### Pour les utilisateurs connectés (rôle USER)

- **Réserver un événement** : via le bouton sur la page de détail
- **Mes réservations** (`/my-reservations`) : liste de toutes ses réservations avec la possibilité d'annuler

### Pour les administrateurs (rôle ADMIN)

- **Dashboard admin** (`/admin`) : tableau listant tous les événements
- **Créer un événement** : formulaire avec les champs titre, description, lieu, nombre de places, date, durée, et prix (optionnel — vide = gratuit ; validation : refus des valeurs négatives)
- **Modifier un événement** : bouton "Modifier" visible uniquement pour les événements futurs — le formulaire se pré-remplit avec les valeurs actuelles (prix inclus), et envoie un `PUT` au lieu d'un `POST`
- **Supprimer un événement** : bouton de suppression avec confirmation implicite (l'événement disparaît du tableau)

### Page "Accès refusé"

Page dédiée affichée quand un utilisateur essaie d'accéder à une route pour laquelle il n'a pas les droits.

---

## 10. Comment démarrer le projet

### Prérequis

- Docker Desktop installé et en cours d'exécution
- Java 21 installé
- Node.js et npm installés

### Ordre de démarrage (obligatoire)

```bash
# ÉTAPE 0 — Créer le fichier .env (une seule fois)
# (depuis le dossier LogiscoolEventWebSite/)
copy .env.example .env   # Windows  |  cp .env.example .env (macOS/Linux)

# ÉTAPE 1 — Lancer PostgreSQL et Keycloak via Docker
# (depuis le dossier LogiscoolEventWebSite/)
docker compose up -d

# Attendre que Keycloak soit prêt (environ 30-60 secondes)
# Vérification : ouvrir http://localhost:8180 dans le navigateur

# ÉTAPE 2 — Lancer Spring Boot
# Option A : via IntelliJ → bouton Run sur LogiscoolEventWebsiteApplication.java
# Option B : terminal (depuis LogiscoolEventWebSite/)
./mvnw spring-boot:run

# ÉTAPE 3 — Lancer Angular
# (depuis logiscool-frontend/)
npm install   # uniquement la première fois
npm start
```

### Accès

| Service | URL | Description |
|---|---|---|
| Application | http://localhost:4200 | L'interface utilisateur |
| Backend API | http://localhost:8090 | Les endpoints REST |
| Keycloak Admin | http://localhost:8180 | Console d'administration Keycloak |
| PostgreSQL | localhost:5433 | Base de données (via pgAdmin ou DBeaver) |

### Comptes de test

| Nom d'utilisateur | Mot de passe | Rôle |
|---|---|---|
| `user1` | `user1pass` | USER (utilisateur normal) |
| `admin1` | `admin1pass` | ADMIN (administrateur) |

### Arrêt propre

```bash
# Arrêter Angular : Ctrl+C dans le terminal Angular
# Arrêter Spring Boot : Ctrl+C dans le terminal Spring ou Stop dans IntelliJ
# Arrêter Docker :
docker compose down
```

---

## 11. Questions fréquentes d'un promoteur

### "Pourquoi l'architecture hexagonale ?"

> L'architecture hexagonale sépare le cœur métier de l'application (les règles de gestion des événements et des réservations) de tout ce qui est technique (la base de données, le protocole HTTP). Le domaine ne connaît ni Spring Boot, ni PostgreSQL — il est testable de façon isolée. Si demain on veut changer de base de données ou exposer l'application via GraphQL au lieu de REST, on ne touche qu'à la couche Infrastructure, sans modifier une seule ligne de logique métier.

### "Pourquoi Keycloak plutôt qu'une authentification maison ?"

> Coder un système d'authentification sécurisé est complexe : gestion des mots de passe hashés, protection contre le brute force, rotation des tokens, gestion des sessions... Keycloak implémente les standards OAuth2 et OpenID Connect, qui sont des protocoles éprouvés par l'industrie. Intégrer Keycloak plutôt que le réécrire est la bonne pratique professionnelle — on n'est pas une entreprise de sécurité, on fabrique une application métier.

### "Pourquoi des DTOs plutôt qu'exposer directement les entités ?"

> Les DTOs (Data Transfer Objects) sont une couche de découplage entre le modèle de données interne et ce qu'on expose via l'API. Si on exposait directement les entités JPA (les objets liés à la base de données), tout changement en base impacterait immédiatement l'API publique. Avec des DTOs, on contrôle exactement ce qu'on envoie et ce qu'on reçoit. C'est aussi une mesure de sécurité : aucun champ interne ne peut "fuiter" accidentellement vers l'extérieur.

### "Pourquoi les composants Angular sont-ils standalone ?"

> Les composants standalone (autonomes) sont la nouvelle approche recommandée depuis Angular 14 et maintenant la norme dans Angular 17+. Chaque composant déclare explicitement ses dépendances, ce qui le rend plus facile à comprendre, tester, et réutiliser. L'ancienne approche (NgModules) centralise tout dans des modules globaux, ce qui crée des dépendances implicites difficiles à tracer.

### "Comment es-tu sûr qu'un utilisateur ne peut pas annuler la réservation de quelqu'un d'autre ?"

> La vérification se fait côté backend dans `ReservationService.java`. Quand une demande d'annulation arrive, le service compare l'ID de l'utilisateur extrait du token JWT (fourni par Keycloak, impossible à falsifier) avec l'ID enregistré sur la réservation en base de données. S'ils ne correspondent pas, une erreur 403 Forbidden est renvoyée. La vérification côté frontend est uniquement cosmétique.

### "Qu'est-ce que tu améliorerais si tu avais plus de temps ?"

> Plusieurs pistes :
> 1. Ajouter un système de vérification du nombre de places restantes avant de confirmer une réservation (pour l'instant, on peut réserver même si l'événement est complet)
> 2. Intégrer un vrai service de paiement (Stripe ou autre) — la base est prête avec le champ `price` en base de données et dans l'API
> 3. Ajouter des tests d'intégration complets sur le backend avec une base H2 en mémoire ou Testcontainers

---

*Document mis à jour le 27 mai 2026 — Projet LogiscoolWebApp*
