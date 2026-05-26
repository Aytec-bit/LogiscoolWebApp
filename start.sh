#!/usr/bin/env bash
# Script de demarrage — LogiscoolWebApp
# Usage : ./start.sh
# Prerequis : Docker installe et demarre

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_DIR="$SCRIPT_DIR/LogiscoolEventWebSite"
COMPOSE_FILE="$COMPOSE_DIR/docker-compose.yml"
ENV_FILE="$COMPOSE_DIR/.env"
ENV_EXAMPLE="$SCRIPT_DIR/.env.example"

# --- Verifications ---

if ! command -v docker &>/dev/null; then
    echo "ERREUR : Docker n'est pas installe."
    echo "Telechargez Docker Desktop : https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! docker info &>/dev/null; then
    echo "ERREUR : Docker n'est pas demarre. Lancez Docker Desktop et reessayez."
    exit 1
fi

# --- Fichier .env ---

if [ ! -f "$ENV_FILE" ]; then
    if [ ! -f "$ENV_EXAMPLE" ]; then
        echo "ERREUR : .env.example introuvable a la racine du projet."
        exit 1
    fi
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    echo ""
    echo "Fichier .env cree dans LogiscoolEventWebSite/ depuis .env.example."
    echo "Les mots de passe par defaut sont suffisants pour un environnement local."
    echo "Modifiez 'LogiscoolEventWebSite/.env' si necessaire, puis appuyez sur Entree."
    read -r
fi

# --- Lancement ---

echo ""
echo "=== Demarrage de LogiscoolWebApp ==="
echo "(premiere fois : ~5 min pour compiler le backend et le frontend)"
echo ""

docker compose --project-directory "$COMPOSE_DIR" -f "$COMPOSE_FILE" up --build -d

echo ""
echo "=== Services lances ==="
echo ""
echo "  Frontend  ->  http://localhost"
echo "  Backend   ->  http://localhost:8090"
echo "  Keycloak  ->  http://localhost:8180"
echo ""
echo "Comptes de test :"
echo "  user1  / user1pass   (role USER)"
echo "  admin1 / admin1pass  (roles USER + ADMIN)"
echo ""
echo "Autres commandes :"
echo "  Voir les logs  :  ./logs.sh"
echo "  Arreter        :  ./stop.sh"
