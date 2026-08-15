@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Jozz Splat Game Lab - R0 LAB

echo ============================================================
echo Jozz Splat Game Lab - R0 LAB
echo ============================================================
echo.
echo Otworzy sie zwykle okno wyboru pliku Windows.
echo Wybierz oryginalny ZIP z Luma albo plik PLY.
echo Potem LAB otworzy sie automatycznie w przegladarce.
echo.

powershell.exe -NoProfile -STA -ExecutionPolicy Bypass -File "%~dp0tools\run-r0-owner.ps1"
set "EXIT_CODE=%ERRORLEVEL%"

echo.
if "%EXIT_CODE%"=="0" (
  echo R0 LAB zakonczony.
) else (
  echo R0 LAB zakonczyl sie bledem.
  echo Zrob screenshot tego okna i wyslij mi go.
)
echo.
pause
exit /b %EXIT_CODE%
