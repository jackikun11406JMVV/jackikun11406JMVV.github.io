@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo ============================================
echo   ARREGLO GITHUB - VERSION ROBUSTA
echo ============================================
echo.

if not exist "_arreglo_github_robusto.ps1" (
  echo ERROR: Falta _arreglo_github_robusto.ps1
  echo Descomprime los dos archivos juntos en la raiz del repositorio.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "_arreglo_github_robusto.ps1"

if errorlevel 1 (
  echo.
  echo Ha ocurrido un error. No hagas commit.
  echo Copia el texto de esta ventana y mandamelo.
  pause
  exit /b 1
)

echo.
echo TODO CORREGIDO.
echo.
echo Ahora:
echo 1. Abre GitHub Desktop
echo 2. Revisa los cambios
echo 3. Commit to main
echo 4. Push origin
echo.
pause
