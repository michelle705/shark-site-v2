param(
  [string]$SiteRoot = "."
)

$ErrorActionPreference = "Stop"

$root = (Resolve-Path $SiteRoot).Path
$sitemapPath = Join-Path $root "sitemap.xml"

if (-not (Test-Path $sitemapPath)) {
  throw "Missing sitemap.xml at $sitemapPath"
}

[xml]$sitemap = Get-Content $sitemapPath -Raw

foreach ($url in $sitemap.urlset.url) {
  $absolutePath = ([uri][string]$url.loc).AbsolutePath.Trim("/")

  if ([string]::IsNullOrWhiteSpace($absolutePath)) {
    continue
  }

  $sourcePath = Join-Path $root "$absolutePath.html"
  if (-not (Test-Path $sourcePath)) {
    throw "Missing source file for route '$absolutePath': $sourcePath"
  }

  $targetDir = Join-Path $root $absolutePath
  $targetPath = Join-Path $targetDir "index.html"

  New-Item -ItemType Directory -Force -Path $targetDir | Out-Null

  $content = Get-Content $sourcePath -Raw

  if ($content -notmatch '<base\s+href="/"\s*/?>') {
    $content = $content -replace '(?i)(<head>\s*)', "`$1<base href=`"/`">`r`n"
  }

  Set-Content -Path $targetPath -Value $content -NoNewline
}
