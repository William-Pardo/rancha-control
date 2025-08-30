<#
Set multiple GitHub Actions secrets for this repository using the GitHub REST API.

Usage (PowerShell):
  $env:GITHUB_TOKEN = 'ghp_...'
  .\set_secrets_via_api.ps1 -RepoOwner 'William-Pardo' -RepoName 'rancha-control' -GcpSaPath '.\\deploy\\service-account.b64' -GeminiKey 'YOUR_GEMINI_KEY' -GcpRegion 'us-central1'

This script requires a GitHub personal access token with `repo` scope stored in env var GITHUB_TOKEN.
It will set the following secrets: GCP_PROJECT_ID, GCP_SA_KEY, GCP_REGION, GEMINI_API_KEY

#>

param(
  [Parameter(Mandatory=$true)] [string]$RepoOwner,
  [Parameter(Mandatory=$true)] [string]$RepoName,
  [Parameter(Mandatory=$true)] [string]$GcpSaPath,
  [Parameter(Mandatory=$false)] [string]$GeminiKey,
  [string]$GcpRegion = 'us-central1'
)

if (-not $env:GITHUB_TOKEN) {
  Write-Error "Set environment variable GITHUB_TOKEN with a PAT that has repo scope."
  exit 1
}

function Set-RepoSecret($name, $value) {
  $publicKeyUrl = "https://api.github.com/repos/$RepoOwner/$RepoName/actions/secrets/public-key"
  $pk = Invoke-RestMethod -Headers @{ Authorization = "token $env:GITHUB_TOKEN"; 'User-Agent' = 'ps' } -Uri $publicKeyUrl -Method Get

  # Encrypt value using the public key (using .NET)
  $valueBytes = [System.Text.Encoding]::UTF8.GetBytes($value)
  $publicKeyBytes = [System.Convert]::FromBase64String($pk.key)

  Add-Type -AssemblyName System.Security
  $rsa = [System.Security.Cryptography.RSA]::Create()
  $rsa.ImportSubjectPublicKeyInfo($publicKeyBytes, [ref]0) | Out-Null
  $encrypted = $rsa.Encrypt($valueBytes, [System.Security.Cryptography.RSAEncryptionPadding]::OaepSHA1)
  $encryptedValue = [System.Convert]::ToBase64String($encrypted)

  $body = @{ encrypted_value = $encryptedValue; key_id = $pk.key_id } | ConvertTo-Json
  $url = "https://api.github.com/repos/$RepoOwner/$RepoName/actions/secrets/$name"
  Invoke-RestMethod -Headers @{ Authorization = "token $env:GITHUB_TOKEN"; 'User-Agent' = 'ps' } -Uri $url -Method Put -ContentType 'application/json' -Body $body
  Write-Output "Set secret $name"
}

# If GeminiKey not provided as parameter, try environment variable
if ([string]::IsNullOrWhiteSpace($GeminiKey)) {
  $GeminiKey = $env:GEMINI_KEY
}

# Read and decode service account base64 if provided
if (-not (Test-Path $GcpSaPath)) {
  Write-Error "Service account base64 not found at $GcpSaPath"
  exit 1
}

$saBase64 = Get-Content -Raw $GcpSaPath
$saJson = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($saBase64))
$saObj = $saJson | ConvertFrom-Json

$projectId = $saObj.project_id

Write-Output "Detected GCP project id: $projectId"

if ([string]::IsNullOrWhiteSpace($GeminiKey)) {
  Write-Error "Gemini API key is empty. Provide it as -GeminiKey or set environment variable GEMINI_KEY."
  exit 1
}

Set-RepoSecret -name 'GCP_PROJECT_ID' -value $projectId
Set-RepoSecret -name 'GCP_SA_KEY' -value $saJson
Set-RepoSecret -name 'GCP_REGION' -value $GcpRegion
Set-RepoSecret -name 'GEMINI_API_KEY' -value $GeminiKey

Write-Output "All secrets set. Run the GitHub Actions workflow 'Deploy backend to Cloud Run' in Actions tab."
