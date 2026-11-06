$baseSkillsDir = "C:\Users\$'alvz'\.config\opencode\skills"
$skills = Get-ChildItem $baseSkillsDir -Directory
$count = 0
$missing = 0

foreach ($skill in $skills) {
    $skillMd = Join-Path $skill.FullName "SKILL.md"
    $count++
    if (Test-Path $skillMd) {
        Write-Host ("OK: " + $skill.Name) -ForegroundColor Green
    } else {
        Write-Host ("MISSING: " + $skill.Name) -ForegroundColor Red
        $missing++
    }
}

Write-Host ""
Write-Host ("Total skills: " + $count) -ForegroundColor Cyan
Write-Host ("With SKILL.md: " + ($count - $missing)) -ForegroundColor Green
Write-Host ("Missing SKILL.md: " + $missing) -ForegroundColor Red