param(
  [string]$DbName = "rvfitness_dev",
  [string]$DbUser = "root",
  [string]$DbPass = "",
  [string]$BackupDir = "I:\Antigravity\RV_Fitness\backups",
  [int]$RetentionDays = 30
)

# Resolve mysqldump executable
$mysqldump = Get-Command "mysqldump" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
if (-not $mysqldump -and (Test-Path "N:\cyber\mysql\bin\mysqldump.exe")) {
  $mysqldump = "N:\cyber\mysql\bin\mysqldump.exe"
}

if (-not $mysqldump) {
  Write-Error "mysqldump utility could not be located."
  exit 1
}

if (!(Test-Path $BackupDir)) {
  New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
}

$date = Get-Date -Format "yyyyMMdd_HHmmss"
$sqlFile = Join-Path $BackupDir "${DbName}_${date}.sql"
$zipFile = "${sqlFile}.zip"

Write-Host "Starting backup of ${DbName} using ${mysqldump}..."

$dumpArgs = @(
  "--host=localhost",
  "--port=3306",
  "--user=$DbUser",
  "--single-transaction",
  "--quick",
  "--routines",
  "--triggers",
  "--hex-blob",
  "--default-character-set=utf8mb4",
  "--databases",
  $DbName
)

if ($DbPass -ne "") {
  $dumpArgs = @("--password=$DbPass") + $dumpArgs
}

& $mysqldump $dumpArgs | Out-File -FilePath $sqlFile -Encoding utf8

if (Test-Path $sqlFile) {
  Compress-Archive -Path $sqlFile -DestinationPath $zipFile
  Remove-Item $sqlFile
  Write-Host "Backup successfully created and compressed: ${zipFile}"
}

# Retention cleanup
$cutoff = (Get-Date).AddDays(-$RetentionDays)
Get-ChildItem -Path $BackupDir -Filter "*.zip" | Where-Object { $_.LastWriteTime -lt $cutoff } | Remove-Item -Force
Write-Host "Backup job completed."
