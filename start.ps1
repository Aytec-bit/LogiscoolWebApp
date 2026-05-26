# Script de demarrage — LogiscoolWebApp
# Usage : .\start.ps1
# Prerequis : Docker Desktop installe et demarre

$root        = $PSScriptRoot
$composeDir  = Join-Path $root "LogiscoolEventWebSite"
$composeFile = Join-Path $composeDir "docker-compose.yml"
$envFile     = Join-Path $composeDir ".env"
$envExample  = Join-Path $root ".env.example"

# --- Verifications ---

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "ERREUR : Docker n'est pas installe."
    Write-Host "Telechargez Docker Desktop : https://www.docker.com/products/docker-desktop"
    exit 1
}

$dockerCheck = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR : Docker n'est pas demarre. Lancez Docker Desktop et reessayez."
    exit 1
}

# --- Fichier .env ---

if (-not (Test-Path $envFile)) {
    if (-not (Test-Path $envExample)) {
        Write-Host "ERREUR : .env.example introuvable a la racine du projet."
        exit 1
    }
    Copy-Item $envExample $envFile
    Write-Host ""
    Write-Host "Fichier .env cree dans LogiscoolEventWebSite/ depuis .env.example."
    Write-Host "Les mots de passe par defaut sont suffisants pour un environnement local."
    Write-Host "Modifiez 'LogiscoolEventWebSite\.env' si necessaire, puis appuyez sur Entree."
    Read-Host
}

# --- Lancement ---

Write-Host ""
Write-Host "=== Demarrage de LogiscoolWebApp ==="
Write-Host "(premiere fois : ~5 min pour compiler le backend et le frontend)"
Write-Host ""

docker compose --project-directory "$composeDir" -f "$composeFile" up --build -d

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERREUR lors du demarrage. Consultez les logs :"
    Write-Host "  .\logs.ps1"
    exit 1
}

Write-Host ""
Write-Host "=== Services lances ==="
Write-Host ""
Write-Host "  Frontend  ->  http://localhost"
Write-Host "  Backend   ->  http://localhost:8090"
Write-Host "  Keycloak  ->  http://localhost:8180"
Write-Host ""
Write-Host "Comptes de test :"
Write-Host "  user1  / user1pass   (role USER)"
Write-Host "  admin1 / admin1pass  (roles USER + ADMIN)"
Write-Host ""
Write-Host "Autres commandes :"
Write-Host "  Voir les logs  :  .\logs.ps1"
Write-Host "  Arreter        :  .\stop.ps1"
