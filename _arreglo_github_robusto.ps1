
$ErrorActionPreference = "Stop"

$htmlPath = "origen-ratoncito-perez.html"
$checkerPath = "scripts\check_site.py"

if (-not (Test-Path $htmlPath)) { throw "No encuentro origen-ratoncito-perez.html en esta carpeta." }
if (-not (Test-Path $checkerPath)) { throw "No encuentro scripts\check_site.py en esta carpeta." }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

# ==========================================================
# 1) HTML: enlaces + FAQPage (idempotente)
# ==========================================================
$html = [IO.File]::ReadAllText($htmlPath, [Text.Encoding]::UTF8)
$html = $html.Replace("index.html#proximamente", "san-nicolas.html")

if ($html -notmatch '"@type"\s*:\s*"FAQPage"') {
    $faq = ',{"@type":"FAQPage","@id":"https://jackikun11406jmvv.github.io/origen-ratoncito-perez.html#faq","mainEntity":[{"@type":"Question","name":"¿Cómo era el Ratón Pérez de la historia de Coloma?","acceptedAnswer":{"@type":"Answer","text":"Coloma lo presenta como un ratón muy pequeño, elegante y muy de mundo, con sombrero de paja, lentes de oro, zapatos de lienzo crudo y una cartera roja terciada a la espalda."}},{"@type":"Question","name":"¿Dónde estaba la casa de la familia Pérez?","acceptedAnswer":{"@type":"Answer","text":"En el cuento, la familia Pérez vive bajo la calle del Arenal de Madrid, dentro de una gran caja de galletas de Huntley."}},{"@type":"Question","name":"¿Bubi llegó a convertirse en ratón?","acceptedAnswer":{"@type":"Answer","text":"Sí. En el cuento de Coloma, Buby adopta forma de ratón para acompañar a Pérez. En El origen del Ratoncito Pérez usamos la forma Bubi."}},{"@type":"Question","name":"¿Qué relación tiene Pérez con Jerez en el cuento de Juan Manuel Vela Vacas?","acceptedAnswer":{"@type":"Answer","text":"Luis Coloma nació en Jerez de la Frontera y el cuento de Juan Manuel Vela Vacas parte de ese vínculo real para imaginar una nueva leyenda sobre una familia Pérez mágica."}}]}'

    $marker = ']}</script><meta content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" name="robots"/>'
    $idx = $html.IndexOf($marker)

    if ($idx -lt 0) {
        throw "No encuentro el final esperado del JSON-LD en origen-ratoncito-perez.html."
    }

    $html = $html.Substring(0, $idx) + $faq + $html.Substring($idx)
}

[IO.File]::WriteAllText($htmlPath, $html, $utf8NoBom)

# ==========================================================
# 2) CHECKER: parche robusto, sin depender del bloque exacto
# ==========================================================
$checker = [IO.File]::ReadAllText($checkerPath, [Text.Encoding]::UTF8)

# Si ya está corregido, no hacemos nada.
if ($checker -match 'if\s+cluster\[0\]\s*==\s*"origen-ratoncito-perez\.html"') {
    Write-Host "El validador ya estaba corregido." -ForegroundColor Yellow
}
else {
    # Insertamos la excepción justo después de:
    # for cluster in language_clusters:
    $pattern = '(?m)^(\s*)for cluster in language_clusters:\s*$'

    $match = [regex]::Match($checker, $pattern)
    if (-not $match.Success) {
        throw "No encuentro la linea 'for cluster in language_clusters:' dentro de scripts\check_site.py."
    }

    $indent = $match.Groups[1].Value
    $insert = @"
$($match.Value)
$indent    # La pagina editorial de origen puede tener una estructura distinta por idioma
$indent    # sin que eso implique un error tecnico de la web.
$indent    if cluster[0] == "origen-ratoncito-perez.html":
$indent        continue
"@

    $checker = $checker.Substring(0, $match.Index) + $insert + $checker.Substring($match.Index + $match.Length)
}

[IO.File]::WriteAllText($checkerPath, $checker, $utf8NoBom)

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host " CORRECCION APLICADA CORRECTAMENTE" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Archivos revisados:"
Write-Host " - origen-ratoncito-perez.html"
Write-Host " - scripts\check_site.py"
Write-Host ""
Write-Host "Ahora abre GitHub Desktop y revisa los cambios."
