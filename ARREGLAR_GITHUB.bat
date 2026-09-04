@echo off
chcp 65001 >nul
cd /d "%~dp0"

if not exist "_arreglo_github.ps1" (
  echo ERROR: Falta _arreglo_github.ps1
  echo Descomprime los dos archivos juntos en la raiz del repositorio.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "_arreglo_github.ps1"
if errorlevel 1 (
  echo.
  echo Ha ocurrido un error. No hagas commit.
  echo Haz una captura de esta ventana y mandamela.
  pause
  exit /b 1
)

echo.
echo Ya esta. Abre GitHub Desktop:
echo 1. Revisa que aparezcan origen-ratoncito-perez.html y scripts/check_site.py
echo 2. Commit to main
echo 3. Push origin
echo.
pause
