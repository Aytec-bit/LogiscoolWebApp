#!/usr/bin/env bash
# Affiche les logs en temps reel (Ctrl+C pour quitter)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_DIR="$SCRIPT_DIR/LogiscoolEventWebSite"

docker compose --project-directory "$COMPOSE_DIR" -f "$COMPOSE_DIR/docker-compose.yml" logs -f
