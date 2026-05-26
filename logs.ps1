# Affiche les logs en temps reel (Ctrl+C pour quitter)
$composeDir  = Join-Path $PSScriptRoot "LogiscoolEventWebSite"
$composeFile = Join-Path $composeDir "docker-compose.yml"

docker compose --project-directory "$composeDir" -f "$composeFile" logs -f
