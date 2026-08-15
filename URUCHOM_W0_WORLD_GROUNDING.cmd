@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Jozz Splat Game Lab - W0.2 World Grounding

echo ============================================================
echo Jozz Splat Game Lab - W0.2 World Grounding
echo ============================================================
echo.
echo Otworzy sie zwykle okno wyboru pliku Windows.
echo Wybierz ten sam oryginalny ZIP z Luma albo plik PLY.
echo Potem World Grounding otworzy sie automatycznie w przegladarce.
echo.

powershell.exe -NoProfile -STA -ExecutionPolicy Bypass -File "%~dp0tools\run-w0-owner.ps1"
set "EXIT_CODE=%ERRORLEVEL%"

echo.
if "%EXIT_CODE%"=="0" (
  echo W0.2 zakonczony.
) else (
  echo W0.2 zakonczyl sie bledem.
  echo Zrob screenshot tego okna i wyslij mi go.
)
echo.
pause
exit /b %EXIT_CODE%
