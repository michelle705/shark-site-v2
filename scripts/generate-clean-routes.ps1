$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$htmlFiles = Get-ChildItem -Path $root -File -Filter *.html

foreach ($file in $htmlFiles) {
  $content = Get-Content -LiteralPath $file.FullName -Raw

  if ($content -notmatch '<base\s+href="/"\s*/?>') {
    if ($content -match '<meta\s+name="viewport"[^>]*>') {
      $content = [regex]::Replace(
        $content,
        '(<meta\s+name="viewport"[^>]*>)',
        "`$1`r`n<base href=`"/`">",
        1
      )
    } elseif ($content -match '<head>') {
      $content = [regex]::Replace($content, '<head>', "<head>`r`n<base href=`"/`">", 1)
    }

    Set-Content -LiteralPath $file.FullName -Value $content -Encoding utf8
  }
}

foreach ($file in $htmlFiles) {
  if ($file.Name -ieq 'index.html') {
    continue
  }

  $routeDir = Join-Path $root $file.BaseName
  New-Item -ItemType Directory -Path $routeDir -Force | Out-Null
  Copy-Item -LiteralPath $file.FullName -Destination (Join-Path $routeDir 'index.html') -Force
}

$aliases = [ordered]@{
  'ai-vs-seo-whats-the-difference' = '/ai-vs-seo-what-changed-and-what-hasnt'
  'what-is-geo-generative-engine-optimization' = '/what-is-geo-and-why-it-matters-for-local-businesses'
  'how-to-rank-on-chatgpt' = '/how-to-rank-on-chatgpt-for-local-businesses'
  'generative-engine-optimization' = '/geo-for-local-businesses'
  'chambers-toolkit' = '/north-tampa-bay-chamber-ai-visibility-toolkit'
  'north-tampa-bay-chamber-case-study' = '/north-tampa-bay-chamber-ai-visibility-case-study'
  'emorys-rock-realty-case-study' = '/emorys-rock-realty-ai-visibility-case-study'
  'blog-24-hour-visibility-fix' = '/blog-24-hour-rule-local-trust-ai'
  'blog-ai-local-search-map' = '/blog-ai-map-consistent-business-listings'
  'blog-ai-visibility-funnel-part-1' = '/blog-ai-funnel-chatgpt-new-front-door'
  'blog-ai-visibility-funnel-part-2' = '/blog-ai-funnel-chatgpt-gemini-path-to-purchase'
  'blog-north-tampa-bay-chamber-partnership' = '/blog-ntbc-ai-ready-partnership'
  'blog-becoming-trusted-ai-recommendation' = '/blog-trusted-ai-review-responses'
  'blog-end-phone-tag-ai-booking' = '/blog-end-of-phone-tag-google-ai-check-prices'
  'blog-google-reviews-ai-trust-signal' = '/blog-google-reviews-ai-recommendations'
}

foreach ($alias in $aliases.Keys) {
  $target = $aliases[$alias]
  $routeDir = Join-Path $root $alias
  New-Item -ItemType Directory -Path $routeDir -Force | Out-Null

  $redirectPage = @"
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="refresh" content="0; url=$target">
<link rel="canonical" href="https://sharkbrandingsolutions.com$target">
<title>Redirecting...</title>
<script>window.location.replace('$target');</script>
</head>
<body>
<p>Redirecting to <a href="$target">$target</a>.</p>
</body>
</html>
"@

  Set-Content -LiteralPath (Join-Path $routeDir 'index.html') -Value $redirectPage -Encoding utf8
}
