param(
  [string]$DbName = "rvfitness_dev",
  [string]$DbUser = "root",
  [string]$DbPass = "",
  [string]$BackupDir = (Join-Path $PSScriptRoot "..\backups"),
  [int]$RetentionDays = 30
)

# Resolve mysqldump executable
$mysqldump = Get-Command "mysqldump" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
if (-not $mysqldump) {
  $candidateDumps = @(
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe",
    "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqldump.exe",
    "C:\xampp\mysql\bin\mysqldump.exe",
    "D:\xampp\mysql\bin\mysqldump.exe",
    "N:\cyber\mysql\bin\mysqldump.exe"
  )
  foreach ($p in $candidateDumps) {
    if (Test-Path $p) {
      $mysqldump = $p
      break
    }
  }
}

if (-not $mysqldump) {
  Write-Error "mysqldump utility could not be located in PATH or standard MySQL/XAMPP paths."
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
