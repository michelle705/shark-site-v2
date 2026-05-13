param(
    [int]$TopApps = 12,
    [int]$TopProcesses = 20,
    [int]$MinMemoryMB = 150,
    [switch]$IncludeWindowsProcesses
)

$ErrorActionPreference = "SilentlyContinue"

function Format-MemoryMB {
    param([double]$Bytes)
    [math]::Round($Bytes / 1MB, 1)
}

function Get-ProcessPath {
    param($Process)

    if ($Process.Path) {
        return $Process.Path
    }

    try {
        return (Get-Process -Id $Process.ProcessId -FileVersionInfo).FileName
    }
    catch {
        return $null
    }
}

$windowsProcessNames = @(
    "system", "idle", "registry", "smss", "csrss", "wininit", "services",
    "lsass", "svchost", "fontdrvhost", "dwm", "explorer", "spoolsv", "sihost",
    "taskhostw", "startmenuexperiencehost", "searchhost", "searchindexer",
    "shellexperiencehost", "runtimebroker", "widgetservice", "textinputhost"
)

$processes = Get-CimInstance Win32_Process | ForEach-Object {
    [PSCustomObject]@{
        Name = $_.Name -replace "\.exe$", ""
        ProcessId = $_.ProcessId
        MemoryMB = Format-MemoryMB $_.WorkingSetSize
        Path = Get-ProcessPath $_
    }
}

if (-not $IncludeWindowsProcesses) {
    $processes = $processes | Where-Object { $windowsProcessNames -notcontains $_.Name.ToLowerInvariant() }
}

$memoryEaters = $processes |
    Where-Object { $_.MemoryMB -ge $MinMemoryMB } |
    Sort-Object MemoryMB -Descending

$topAppGroups = $memoryEaters |
    Group-Object Name |
    ForEach-Object {
        $group = $_.Group
        [PSCustomObject]@{
            Name = $_.Name
            TotalMemoryMB = [math]::Round((($group | Measure-Object -Property MemoryMB -Sum).Sum), 1)
            ProcessCount = $group.Count
            LargestProcessMB = [math]::Round((($group | Measure-Object -Property MemoryMB -Maximum).Maximum), 1)
        }
    } |
    Sort-Object TotalMemoryMB -Descending |
    Select-Object -First $TopApps

Write-Host ""
Write-Host "Top memory eater apps" -ForegroundColor Cyan
if ($topAppGroups) {
    $topAppGroups |
        Select-Object Name, TotalMemoryMB, ProcessCount, LargestProcessMB |
        Format-Table -AutoSize
}
else {
    Write-Host "No apps are above the current memory threshold." -ForegroundColor Green
}

Write-Host ""
Write-Host "Largest individual processes" -ForegroundColor Yellow
if ($memoryEaters) {
    $memoryEaters |
        Select-Object -First $TopProcesses Name, ProcessId, MemoryMB, Path |
        Format-Table -Wrap -AutoSize
}
else {
    Write-Host "No processes are above the current memory threshold." -ForegroundColor Green
}

Write-Host ""
Write-Host "Notes:" -ForegroundColor DarkCyan
Write-Host "- This script only shows memory-heavy processes."
Write-Host "- Raise or lower -MinMemoryMB to change how aggressive the list is."
Write-Host "- Use -IncludeWindowsProcesses if you also want core Windows items in the report."
