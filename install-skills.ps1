# PowerShell script to install OpenCode Agent Skills globally

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$baseSkillsDir = "C:\Users\$'alvz'\.config\opencode\skills"

# Create directories
if (-not (Test-Path $baseSkillsDir)) { New-Item -ItemType Directory -Path $baseSkillsDir -Force | Out-Null }

function Download-File {
    param($url, $outPath)
    try {
        $destDir = Split-Path $outPath -Parent
        if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
        Invoke-WebRequest -Uri $url -OutFile $outPath -UseBasicParsing
        Write-Host "Downloaded: $url" -ForegroundColor Green
        return $true
    } catch {
        $err = $_.Exception.Message
        $msg = "Failed to download: " + $url + " - " + $err
        Write-Host $msg -ForegroundColor Red
        return $false
    }
}

function Download-GitHubDirectory {
    param($repoOwner, $repoName, $branch, $sourcePath, $destPath)
    
    # Get the directory listing from GitHub API
    $apiUrl = "https://api.github.com/repos/$repoOwner/$repoName/contents/$sourcePath?ref=$branch"
    try {
        $response = Invoke-RestMethod -Uri $apiUrl -Headers @{ "Accept" = "application/vnd.github.v3+json" }
        
        foreach ($item in $response) {
            $itemDestPath = Join-Path $destPath $item.name
            
            if ($item.type -eq "file") {
                Download-File -url $item.download_url -outPath $itemDestPath
            } elseif ($item.type -eq "dir") {
                if (-not (Test-Path $itemDestPath)) { New-Item -ItemType Directory -Path $itemDestPath -Force | Out-Null }
                $newSourcePath = $sourcePath + "/" + $item.name
                Download-GitHubDirectory -repoOwner $repoOwner -repoName $repoName -branch $branch -sourcePath $newSourcePath -destPath $itemDestPath
            }
        }
    } catch {
        $err = $_.Exception.Message
        $msg = "Error downloading directory " + $sourcePath + ": " + $err
        Write-Host $msg -ForegroundColor Red
    }
}

Write-Host "=== Installing Vercel Agent Skills ===" -ForegroundColor Cyan

$vercelSkills = @(
    "react-best-practices",
    "web-design-guidelines",
    "composition-patterns",
    "deploy-to-vercel",
    "react-native-skills",
    "react-view-transitions",
    "vercel-optimize",
    "vercel-cli-with-tokens",
    "writing-guidelines"
)

foreach ($skill in $vercelSkills) {
    Write-Host ("Installing " + $skill + "...") -ForegroundColor Yellow
    $skillDir = Join-Path $baseSkillsDir $skill
    if (-not (Test-Path $skillDir)) { New-Item -ItemType Directory -Path $skillDir -Force | Out-Null }
    
    Download-GitHubDirectory -repoOwner "vercel-labs" -repoName "agent-skills" -branch "main" -sourcePath ("skills/" + $skill) -destPath $skillDir
}

Write-Host "=== Installing Anthropic Skills ===" -ForegroundColor Cyan

$anthropicSkills = @(
    "frontend-design",
    "webapp-testing",
    "mcp-builder",
    "skill-creator"
)

foreach ($skill in $anthropicSkills) {
    Write-Host ("Installing " + $skill + "...") -ForegroundColor Yellow
    $skillDir = Join-Path $baseSkillsDir $skill
    if (-not (Test-Path $skillDir)) { New-Item -ItemType Directory -Path $skillDir -Force | Out-Null }
    
    Download-GitHubDirectory -repoOwner "anthropics" -repoName "skills" -branch "main" -sourcePath ("skills/" + $skill) -destPath $skillDir
}

Write-Host "=== Installing Supabase Skills ===" -ForegroundColor Cyan

$supabaseSkills = @(
    "api-types",
    "ask-the-docs",
    "clickhouse-logs-queries",
    "code-review",
    "copywriting",
    "dev-toolbar-review",
    "edit-the-docs",
    "pm-the-docs",
    "react-hook-form",
    "review-the-docs",
    "safe-sql-execution",
    "studio-e2e-tests",
    "studio-error-handling",
    "studio-mock-api-tests",
    "studio-queries",
    "studio-shortcuts",
    "studio-testing",
    "studio-ui-patterns",
    "telemetry-standards",
    "test-the-docs",
    "vercel-composition-patterns",
    "vitest",
    "write-the-docs"
)

foreach ($skill in $supabaseSkills) {
    Write-Host ("Installing " + $skill + "...") -ForegroundColor Yellow
    $skillDir = Join-Path $baseSkillsDir $skill
    if (-not (Test-Path $skillDir)) { New-Item -ItemType Directory -Path $skillDir -Force | Out-Null }
    
    Download-GitHubDirectory -repoOwner "supabase" -repoName "supabase" -branch "master" -sourcePath (".agents/skills/" + $skill) -destPath $skillDir
}

Write-Host "=== Installing UI/UX Pro Max Skill ===" -ForegroundColor Cyan

$uiuxDir = Join-Path $baseSkillsDir "ui-ux-pro-max"
if (-not (Test-Path $uiuxDir)) { New-Item -ItemType Directory -Path $uiuxDir -Force | Out-Null }

# Download the main skill files from nextlevelbuilder/ui-ux-pro-max-skill
$uiuxFiles = @(
    "skill.json",
    "README.md",
    "LICENSE",
    "src/ui-ux-pro-max/scripts/search.py",
    "src/ui-ux-pro-max/data/styles.csv",
    "src/ui-ux-pro-max/data/products.csv",
    "src/ui-ux-pro-max/data/colors.csv",
    "src/ui-ux-pro-max/data/typography.csv",
    "src/ui-ux-pro-max/data/patterns.csv",
    "src/ui-ux-pro-max/data/charts.csv"
)

foreach ($file in $uiuxFiles) {
    $url = "https://raw.githubusercontent.com/nextlevelbuilder/ui-ux-pro-max-skill/main/" + $file
    $dest = Join-Path $uiuxDir $file
    Download-File -url $url -outPath $dest
}

# Also create a SKILL.md from the skill.json
$skillJsonPath = Join-Path $uiuxDir "skill.json"
if (Test-Path $skillJsonPath) {
    $skillJson = Get-Content $skillJsonPath -Raw | ConvertFrom-Json
    $skillMd = @"
---
name: $($skillJson.name)
description: $($skillJson.description)
license: $($skillJson.license)
metadata:
  author: $($skillJson.author)
  version: $($skillJson.version)
---

# $($skillJson.name)

$($skillJson.description)

## Features

$($skillJson.features -join "`n")

## Supported Stacks

$($skillJson.supported_stacks -join "`n")

## Installation

This skill is installed globally for OpenCode.
"@
    Set-Content -Path (Join-Path $uiuxDir "SKILL.md") -Value $skillMd -Encoding UTF8
}

Write-Host "=== Installing Superpowers (as plugin) ===" -ForegroundColor Cyan

# Superpowers is installed as a plugin, not as individual skills
# We'll configure it in opencode.json

Write-Host "=== Installation Complete ===" -ForegroundColor Green
Write-Host ("Skills installed to: " + $baseSkillsDir) -ForegroundColor Green

# List installed skills
Write-Host "`nInstalled skills:" -ForegroundColor Cyan
Get-ChildItem $baseSkillsDir -Directory | ForEach-Object { Write-Host ("  - " + $_.Name) }