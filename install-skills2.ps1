# PowerShell script to install OpenCode Agent Skills globally - direct download approach

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
        Write-Host ("Downloaded: " + $url) -ForegroundColor Green
        return $true
    } catch {
        $err = $_.Exception.Message
        $msg = "Failed to download: " + $url + " - " + $err
        Write-Host $msg -ForegroundColor Red
        return $false
    }
}

# Helper to download all files for a skill from raw.githubusercontent.com
function Download-Skill-Files {
    param($repoOwner, $repoName, $branch, $skillPath, $destDir, $fileList)
    
    foreach ($file in $fileList) {
        $url = "https://raw.githubusercontent.com/" + $repoOwner + "/" + $repoName + "/" + $branch + "/" + $skillPath + "/" + $file
        $outPath = Join-Path $destDir $file
        Download-File -url $url -outPath $outPath
    }
}

Write-Host "=== Installing Vercel Agent Skills ===" -ForegroundColor Cyan

# React Best Practices - has SKILL.md, README.md, metadata.json, AGENTS.md, rules/ directory
$skillDir = Join-Path $baseSkillsDir "react-best-practices"
if (-not (Test-Path $skillDir)) { New-Item -ItemType Directory -Path $skillDir -Force | Out-Null }
Download-Skill-Files -repoOwner "vercel-labs" -repoName "agent-skills" -branch "main" -skillPath "skills/react-best-practices" -destDir $skillDir -fileList @("SKILL.md", "README.md", "metadata.json", "AGENTS.md")

# Download rules directory
$rulesDir = Join-Path $skillDir "rules"
if (-not (Test-Path $rulesDir)) { New-Item -ItemType Directory -Path $rulesDir -Force | Out-Null }
$ruleFiles = @(
    "_sections.md", "_template.md",
    "advanced-effect-event-deps.md", "advanced-event-handler-refs.md", "advanced-init-once.md", "advanced-use-latest.md",
    "async-api-routes.md", "async-cheap-condition-before-await.md", "async-defer-await.md", "async-dependencies.md", "async-parallel.md", "async-suspense-boundaries.md",
    "bundle-analyzable-paths.md", "bundle-barrel-imports.md", "bundle-conditional.md", "bundle-defer-third-party.md", "bundle-dynamic-imports.md", "bundle-preload.md",
    "client-event-listeners.md", "client-localstorage-schema.md", "client-passive-event-listeners.md", "client-swr-dedup.md",
    "js-batch-dom-css.md", "js-cache-function-results.md", "js-cache-property-access.md", "js-cache-storage.md", "js-combine-iterations.md", "js-early-exit.md", "js-flatmap-filter.md", "js-hoist-regexp.md", "js-index-maps.md", "js-length-check-first.md", "js-min-max-loop.md", "js-request-idle-callback.md", "js-set-map-lookups.md", "js-tosorted-immutable.md",
    "rendering-activity.md", "rendering-animate-svg-wrapper.md", "rendering-conditional-render.md", "rendering-content-visibility.md", "rendering-hoist-jsx.md", "rendering-hydration-no-flicker.md", "rendering-hydration-suppress-warning.md", "rendering-resource-hints.md", "rendering-script-defer-async.md", "rendering-svg-precision.md", "rendering-usetransition-loading.md",
    "rerender-defer-reads.md", "rerender-dependencies.md", "rerender-derived-state-no-effect.md", "rerender-derived-state.md", "rerender-functional-setstate.md", "rerender-lazy-state-init.md", "rerender-memo-with-default-value.md", "rerender-memo.md", "rerender-move-effect-to-event.md", "rerender-no-inline-components.md", "rerender-simple-expression-in-memo.md", "rerender-split-combined-hooks.md", "rerender-transitions.md", "rerender-use-deferred-value.md", "rerender-use-ref-transient-values.md",
    "server-after-nonblocking.md", "server-auth-actions.md", "server-cache-lru.md", "server-cache-react.md", "server-dedup-props.md", "server-hoist-static-io.md", "server-no-shared-module-state.md", "server-parallel-fetching.md", "server-parallel-nested-fetching.md", "server-serialization.md"
)
Download-Skill-Files -repoOwner "vercel-labs" -repoName "agent-skills" -branch "main" -skillPath "skills/react-best-practices/rules" -destDir $rulesDir -fileList $ruleFiles

# Web Design Guidelines
$skillDir = Join-Path $baseSkillsDir "web-design-guidelines"
if (-not (Test-Path $skillDir)) { New-Item -ItemType Directory -Path $skillDir -Force | Out-Null }
Download-Skill-Files -repoOwner "vercel-labs" -repoName "agent-skills" -branch "main" -skillPath "skills/web-design-guidelines" -destDir $skillDir -fileList @("SKILL.md", "README.md", "metadata.json", "AGENTS.md")

# Composition Patterns
$skillDir = Join-Path $baseSkillsDir "composition-patterns"
if (-not (Test-Path $skillDir)) { New-Item -ItemType Directory -Path $skillDir -Force | Out-Null }
Download-Skill-Files -repoOwner "vercel-labs" -repoName "agent-skills" -branch "main" -skillPath "skills/composition-patterns" -destDir $skillDir -fileList @("SKILL.md", "README.md", "metadata.json", "AGENTS.md")

# Deploy to Vercel
$skillDir = Join-Path $baseSkillsDir "deploy-to-vercel"
if (-not (Test-Path $skillDir)) { New-Item -ItemType Directory -Path $skillDir -Force | Out-Null }
Download-Skill-Files -repoOwner "vercel-labs" -repoName "agent-skills" -branch "main" -skillPath "skills/deploy-to-vercel" -destDir $skillDir -fileList @("SKILL.md", "README.md", "metadata.json", "AGENTS.md")

# React Native Skills
$skillDir = Join-Path $baseSkillsDir "react-native-skills"
if (-not (Test-Path $skillDir)) { New-Item -ItemType Directory -Path $skillDir -Force | Out-Null }
Download-Skill-Files -repoOwner "vercel-labs" -repoName "agent-skills" -branch "main" -skillPath "skills/react-native-skills" -destDir $skillDir -fileList @("SKILL.md", "README.md", "metadata.json", "AGENTS.md")

# React View Transitions
$skillDir = Join-Path $baseSkillsDir "react-view-transitions"
if (-not (Test-Path $skillDir)) { New-Item -ItemType Directory -Path $skillDir -Force | Out-Null }
Download-Skill-Files -repoOwner "vercel-labs" -repoName "agent-skills" -branch "main" -skillPath "skills/react-view-transitions" -destDir $skillDir -fileList @("SKILL.md", "README.md", "metadata.json", "AGENTS.md")

# Vercel Optimize
$skillDir = Join-Path $baseSkillsDir "vercel-optimize"
if (-not (Test-Path $skillDir)) { New-Item -ItemType Directory -Path $skillDir -Force | Out-Null }
Download-Skill-Files -repoOwner "vercel-labs" -repoName "agent-skills" -branch "main" -skillPath "skills/vercel-optimize" -destDir $skillDir -fileList @("SKILL.md", "README.md", "metadata.json", "AGENTS.md")

# Vercel CLI with Tokens
$skillDir = Join-Path $baseSkillsDir "vercel-cli-with-tokens"
if (-not (Test-Path $skillDir)) { New-Item -ItemType Directory -Path $skillDir -Force | Out-Null }
Download-Skill-Files -repoOwner "vercel-labs" -repoName "agent-skills" -branch "main" -skillPath "skills/vercel-cli-with-tokens" -destDir $skillDir -fileList @("SKILL.md", "README.md", "metadata.json", "AGENTS.md")

# Writing Guidelines
$skillDir = Join-Path $baseSkillsDir "writing-guidelines"
if (-not (Test-Path $skillDir)) { New-Item -ItemType Directory -Path $skillDir -Force | Out-Null }
Download-Skill-Files -repoOwner "vercel-labs" -repoName "agent-skills" -branch "main" -skillPath "skills/writing-guidelines" -destDir $skillDir -fileList @("SKILL.md", "README.md", "metadata.json", "AGENTS.md")

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
    
    # Try to download common files
    Download-Skill-Files -repoOwner "anthropics" -repoName "skills" -branch "main" -skillPath ("skills/" + $skill) -destDir $skillDir -fileList @("SKILL.md", "README.md", "metadata.json", "AGENTS.md", "CLAUDE.md")
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
    
    # Try to download common files
    Download-Skill-Files -repoOwner "supabase" -repoName "supabase" -branch "master" -skillPath (".agents/skills/" + $skill) -destDir $skillDir -fileList @("SKILL.md", "README.md", "metadata.json", "AGENTS.md", "CLAUDE.md")
}

Write-Host "=== Installation Complete ===" -ForegroundColor Green
Write-Host ("Skills installed to: " + $baseSkillsDir) -ForegroundColor Green

# List installed skills with SKILL.md
Write-Host "`nInstalled skills with SKILL.md:" -ForegroundColor Cyan
Get-ChildItem $baseSkillsDir -Directory | ForEach-Object {
    $skillMd = Join-Path $_.FullName "SKILL.md"
    if (Test-Path $skillMd) {
        Write-Host ("  - " + $_.Name + " (OK)") -ForegroundColor Green
    } else {
        Write-Host ("  - " + $_.Name + " (MISSING SKILL.md)") -ForegroundColor Red
    }
}