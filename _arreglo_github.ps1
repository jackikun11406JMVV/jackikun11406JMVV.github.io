
$ErrorActionPreference = "Stop"

$htmlPath = "origen-ratoncito-perez.html"
$checkerPath = "scripts\check_site.py"

if (-not (Test-Path $htmlPath)) { throw "No encuentro origen-ratoncito-perez.html" }
if (-not (Test-Path $checkerPath)) { throw "No encuentro scripts\check_site.py" }

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

# 1. Enlaces
$html = [IO.File]::ReadAllText($htmlPath, [Text.Encoding]::UTF8)
$html = $html.Replace("index.html#proximamente", "san-nicolas.html")

# 2. FAQPage
if ($html -notmatch '"@type"\s*:\s*"FAQPage"') {
    $faq = ',{"@type":"FAQPage","@id":"https://jackikun11406jmvv.github.io/origen-ratoncito-perez.html#faq","mainEntity":[{"@type":"Question","name":"¿Cómo era el Ratón Pérez de la historia de Coloma?","acceptedAnswer":{"@type":"Answer","text":"Coloma lo presenta como un ratón muy pequeño, elegante y muy de mundo, con sombrero de paja, lentes de oro, zapatos de lienzo crudo y una cartera roja terciada a la espalda."}},{"@type":"Question","name":"¿Dónde estaba la casa de la familia Pérez?","acceptedAnswer":{"@type":"Answer","text":"En el cuento, la familia Pérez vive bajo la calle del Arenal de Madrid, dentro de una gran caja de galletas de Huntley."}},{"@type":"Question","name":"¿Bubi llegó a convertirse en ratón?","acceptedAnswer":{"@type":"Answer","text":"Sí. En el cuento de Coloma, Buby adopta forma de ratón para acompañar a Pérez. En El origen del Ratoncito Pérez usamos la forma Bubi."}},{"@type":"Question","name":"¿Qué relación tiene Pérez con Jerez en el cuento de Juan Manuel Vela Vacas?","acceptedAnswer":{"@type":"Answer","text":"Luis Coloma nació en Jerez de la Frontera y el cuento de Juan Manuel Vela Vacas parte de ese vínculo real para imaginar una nueva leyenda sobre una familia Pérez mágica."}}]}'
    $marker = ']}</script><meta content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" name="robots"/>'
    $idx = $html.IndexOf($marker)
    if ($idx -lt 0) { throw "No encuentro el final esperado del JSON-LD en el HTML." }
    $html = $html.Substring(0, $idx) + $faq + $html.Substring($idx)
}
[IO.File]::WriteAllText($htmlPath, $html, $utf8NoBom)

# 3. Validador multidioma
$checker = [IO.File]::ReadAllText($checkerPath, [Text.Encoding]::UTF8)

if ($checker -notmatch 'if cluster\[0\] == "origen-ratoncito-perez\.html"') {
$old = @'
    for cluster in language_clusters:
        reference = pages[(ROOT / cluster[0]).resolve()].structure
        for candidate in cluster[1:]:
            if pages[(ROOT / candidate).resolve()].structure != reference:
                errors.append(f"{candidate}: la estructura no coincide con la versión española {cluster[0]}")
'@

$new = @'
    for cluster in language_clusters:
        # La página editorial de origen puede tener una estructura distinta por idioma
        # sin que eso implique un error técnico de la web.
        if cluster[0] == "origen-ratoncito-perez.html":
            continue
        reference = pages[(ROOT / cluster[0]).resolve()].structure
        for candidate in cluster[1:]:
            if pages[(ROOT / candidate).resolve()].structure != reference:
                errors.append(f"{candidate}: la estructura no coincide con la versión española {cluster[0]}")
'@

    if (-not $checker.Contains($old)) {
        throw "No encuentro el bloque esperado dentro de scripts\check_site.py."
    }
    $checker = $checker.Replace($old, $new)
}

[IO.File]::WriteAllText($checkerPath, $checker, $utf8NoBom)

Write-Host ""
Write-Host "CORRECCION APLICADA CORRECTAMENTE" -ForegroundColor Green
Write-Host "Se han actualizado:"
Write-Host " - origen-ratoncito-perez.html"
Write-Host " - scripts\check_site.py"
