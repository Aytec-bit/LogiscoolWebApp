# Arrete tous les services LogiscoolWebApp
$composeDir  = Join-Path $PSScriptRoot "LogiscoolEventWebSite"
$composeFile = Join-Path $composeDir "docker-compose.yml"

docker compose --project-directory "$composeDir" -f "$composeFile" down
