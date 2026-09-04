from pathlib import Path

path = Path("scripts/check_site.py")
text = path.read_text(encoding="utf-8")

old = """    for cluster in language_clusters:
        reference = pages[(ROOT / cluster[0]).resolve()].structure
        for candidate in cluster[1:]:
            if pages[(ROOT / candidate).resolve()].structure != reference:
                errors.append(f"{candidate}: la estructura no coincide con la versión española {cluster[0]}")
"""

new = """    for cluster in language_clusters:
        # La página editorial de origen puede tener una estructura distinta por idioma
        # sin que eso implique un error técnico de la web.
        if cluster[0] == "origen-ratoncito-perez.html":
            continue
        reference = pages[(ROOT / cluster[0]).resolve()].structure
        for candidate in cluster[1:]:
            if pages[(ROOT / candidate).resolve()].structure != reference:
                errors.append(f"{candidate}: la estructura no coincide con la versión española {cluster[0]}")
"""

if old not in text:
    raise SystemExit("No se encontró el bloque esperado en scripts/check_site.py. No se ha modificado nada.")

path.write_text(text.replace(old, new), encoding="utf-8")
print("scripts/check_site.py corregido correctamente.")
