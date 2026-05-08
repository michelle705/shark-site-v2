param(
  [string]$RootPath = "C:\Users\Miche\Downloads",
  [switch]$Execute,
  [int]$PreviewLimit = 50
)

$ErrorActionPreference = "Stop"

$projectMarkers = @(
  ".git",
  "package.json",
  "pyproject.toml",
  "requirements.txt",
  "Pipfile",
  "Cargo.toml",
  "go.mod",
  "composer.json",
  "Gemfile",
  "pubspec.yaml",
  "*.sln",
  "*.xcodeproj",
  "*.xcworkspace"
)

$skipDirNames = New-Object System.Collections.Generic.HashSet[string]([System.StringComparer]::OrdinalIgnoreCase)
@(
  ".git", ".svn", ".hg", ".idea", ".vscode",
  "node_modules", "vendor", "__pycache__", ".venv", "venv",
  "dist", "build", "out", "target", ".next", ".nuxt",
  ".cache", "coverage", "test-results",
  "AppData", "Application Data", "Local Settings",
  "Cookies", "NetHood", "PrintHood", "Recent",
  "SendTo", "Start Menu", "Templates"
) | ForEach-Object { [void]$skipDirNames.Add($_) }

$generatedCategoryDirs = New-Object System.Collections.Generic.HashSet[string]([System.StringComparer]::OrdinalIgnoreCase)
@("assets", "docs", "data", "scripts", "archives", "installers") | ForEach-Object {
  [void]$generatedCategoryDirs.Add($_)
}

$categoryMap = @{
  ".png"  = "assets\images"
  ".jpg"  = "assets\images"
  ".jpeg" = "assets\images"
  ".gif"  = "assets\images"
  ".webp" = "assets\images"
  ".svg"  = "assets\images"
  ".bmp"  = "assets\images"
  ".tif"  = "assets\images"
  ".tiff" = "assets\images"
  ".ico"  = "assets\images"
  ".heic" = "assets\images"
  ".avif" = "assets\images"

  ".mp4"  = "assets\videos"
  ".mov"  = "assets\videos"
  ".avi"  = "assets\videos"
  ".mkv"  = "assets\videos"
  ".webm" = "assets\videos"
  ".m4v"  = "assets\videos"

  ".mp3"  = "assets\audio"
  ".wav"  = "assets\audio"
  ".aac"  = "assets\audio"
  ".m4a"  = "assets\audio"
  ".flac" = "assets\audio"
  ".ogg"  = "assets\audio"

  ".pdf"  = "docs\pdfs"
  ".doc"  = "docs\word"
  ".docx" = "docs\word"
  ".rtf"  = "docs\text"
  ".txt"  = "docs\text"
  ".md"   = "docs\text"

  ".xls"  = "docs\spreadsheets"
  ".xlsx" = "docs\spreadsheets"
  ".ods"  = "docs\spreadsheets"

  ".ppt"  = "docs\presentations"
  ".pptx" = "docs\presentations"
  ".key"  = "docs\presentations"

  ".csv"  = "data\csv"
  ".tsv"  = "data\csv"
  ".json" = "data\json"
  ".jsonl" = "data\json"
  ".xml"  = "data\structured"
  ".yaml" = "data\structured"
  ".yml"  = "data\structured"
  ".sql"  = "data\structured"

  ".py"   = "scripts\code"
  ".js"   = "scripts\code"
  ".cjs"  = "scripts\code"
  ".mjs"  = "scripts\code"
  ".ts"   = "scripts\code"
  ".tsx"  = "scripts\code"
  ".jsx"  = "scripts\code"
  ".ps1"  = "scripts\code"
  ".sh"   = "scripts\code"
  ".bat"  = "scripts\code"
  ".cmd"  = "scripts\code"
  ".rb"   = "scripts\code"
  ".php"  = "scripts\code"
  ".java" = "scripts\code"
  ".cs"   = "scripts\code"

  ".html" = "scripts\web"
  ".htm"  = "scripts\web"
  ".css"  = "scripts\web"
  ".scss" = "scripts\web"
  ".sass" = "scripts\web"
  ".less" = "scripts\web"

  ".zip"  = "archives"
  ".rar"  = "archives"
  ".7z"   = "archives"
  ".tar"  = "archives"
  ".gz"   = "archives"
  ".tgz"  = "archives"

  ".exe"  = "installers"
  ".msi"  = "installers"
  ".dmg"  = "installers"
  ".pkg"  = "installers"
  ".ipa"  = "installers"
  ".apk"  = "installers"

  ".ttf"  = "assets\fonts-models"
  ".otf"  = "assets\fonts-models"
  ".woff" = "assets\fonts-models"
  ".woff2" = "assets\fonts-models"
  ".pth"  = "assets\fonts-models"
  ".ckpt" = "assets\fonts-models"
  ".safetensors" = "assets\fonts-models"
}

function Test-IsHiddenOrSystem {
  param([System.IO.FileSystemInfo]$Item)
  return (
    ($Item.Attributes -band [IO.FileAttributes]::Hidden) -or
    ($Item.Attributes -band [IO.FileAttributes]::System)
  )
}

function Test-IsProjectRoot {
  param([string]$DirectoryPath)

  foreach ($marker in $projectMarkers) {
    $found = Get-ChildItem -LiteralPath $DirectoryPath -Force -Name $marker -ErrorAction SilentlyContinue
    if ($found) {
      return $true
    }
  }

  return $false
}

function Get-CategoryRelativePath {
  param([System.IO.FileInfo]$File)

  $extension = $File.Extension.ToLowerInvariant()
  if ($categoryMap.ContainsKey($extension)) {
    return $categoryMap[$extension]
  }

  return $null
}

function Get-UniqueDestinationPath {
  param(
    [string]$DirectoryPath,
    [string]$FileName
  )

  $baseName = [IO.Path]::GetFileNameWithoutExtension($FileName)
  $extension = [IO.Path]::GetExtension($FileName)
  $candidate = Join-Path $DirectoryPath $FileName
  $counter = 1

  while (Test-Path -LiteralPath $candidate) {
    $candidate = Join-Path $DirectoryPath ("{0} ({1}){2}" -f $baseName, $counter, $extension)
    $counter += 1
  }

  return $candidate
}

function Ensure-Directory {
  param([string]$Path)

  if (-not (Test-Path -LiteralPath $Path)) {
    New-Item -ItemType Directory -Path $Path -Force | Out-Null
  }
}

$rootItem = Get-Item -LiteralPath $RootPath
if (-not $rootItem.PSIsContainer) {
  throw "RootPath must be a directory."
}

$skippedProjectRoots = New-Object System.Collections.Generic.List[string]
$moveLog = New-Object System.Collections.Generic.List[object]
$preview = New-Object System.Collections.Generic.List[string]

$stack = New-Object System.Collections.Stack
$stack.Push($rootItem.FullName)

while ($stack.Count -gt 0) {
  $currentPath = [string]$stack.Pop()
  try {
    $currentDir = Get-Item -LiteralPath $currentPath -ErrorAction Stop
  } catch {
    continue
  }

  if ($currentDir.FullName -ne $rootItem.FullName) {
    if ($currentDir.Name.StartsWith(".")) {
      continue
    }

    if (Test-IsHiddenOrSystem -Item $currentDir) {
      continue
    }

    if ($skipDirNames.Contains($currentDir.Name)) {
      continue
    }

    if ($generatedCategoryDirs.Contains($currentDir.Name)) {
      continue
    }
  }

  if (Test-IsProjectRoot -DirectoryPath $currentDir.FullName) {
    $skippedProjectRoots.Add($currentDir.FullName) | Out-Null
    continue
  }

  try {
    $children = Get-ChildItem -LiteralPath $currentDir.FullName -Force -ErrorAction Stop
  } catch {
    continue
  }
  $subdirs = @($children | Where-Object { $_.PSIsContainer })
  $files = @($children | Where-Object { -not $_.PSIsContainer })

  foreach ($subdir in $subdirs) {
    $stack.Push($subdir.FullName)
  }

  foreach ($file in $files) {
    if ($file.Name.StartsWith(".")) {
      continue
    }

    if (Test-IsHiddenOrSystem -Item $file) {
      continue
    }

    $relativeCategory = Get-CategoryRelativePath -File $file
    if (-not $relativeCategory) {
      continue
    }

    $destinationDir = Join-Path $currentDir.FullName $relativeCategory
    $destinationPath = Get-UniqueDestinationPath -DirectoryPath $destinationDir -FileName $file.Name

    $entry = [PSCustomObject]@{
      Source = $file.FullName
      Destination = $destinationPath
      Category = $relativeCategory
    }
    $moveLog.Add($entry) | Out-Null

    if ($preview.Count -lt $PreviewLimit) {
      $preview.Add(("{0} -> {1}" -f $file.FullName, $destinationPath)) | Out-Null
    }

    if ($Execute) {
      Ensure-Directory -Path $destinationDir
      Move-Item -LiteralPath $file.FullName -Destination $destinationPath
    }
  }
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logPath = Join-Path $rootItem.FullName ("downloads-organize-log-{0}.csv" -f $timestamp)

if ($Execute -and $moveLog.Count -gt 0) {
  $moveLog | Export-Csv -NoTypeInformation -Path $logPath
}

$summary = [PSCustomObject]@{
  RootPath = $rootItem.FullName
  Mode = $(if ($Execute) { "execute" } else { "preview" })
  ProposedMoves = $moveLog.Count
  SkippedProjectRoots = $skippedProjectRoots.Count
  LogPath = $(if ($Execute -and $moveLog.Count -gt 0) { $logPath } else { "" })
}

$summary | Format-List

if ($preview.Count -gt 0) {
  Write-Output ""
  Write-Output "Preview sample:"
  $preview | ForEach-Object { Write-Output $_ }
}

if ($skippedProjectRoots.Count -gt 0) {
  Write-Output ""
  Write-Output "Skipped project roots:"
  $skippedProjectRoots | Sort-Object | Select-Object -First 30 | ForEach-Object { Write-Output $_ }
}
