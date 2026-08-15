@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Jozz Splat Game Lab - sprawdzenie F0

echo ============================================================
echo Jozz Splat Game Lab - sprawdzenie F0
echo ============================================================
echo.
echo Za chwile otworzy sie zwykle okno wyboru pliku Windows.
echo Wybierz oryginalny ZIP z Luma albo plik PLY.
echo Nie musisz nic wpisywac ani przeciagac do terminala.
echo.

powershell.exe -NoProfile -STA -ExecutionPolicy Bypass -File "%~dp0tools\run-f0-owner.ps1"
set "EXIT_CODE=%ERRORLEVEL%"

echo.
if "%EXIT_CODE%"=="0" (
  echo Gotowe. Mozesz zamknac to okno.
) else if "%EXIT_CODE%"=="3" (
  echo Lokalny test zostal pominiety z powodu srodowiska.
  echo Nie musisz nic instalowac ani naprawiac.
) else (
  echo Test zakonczyl sie bledem.
  echo Zrob screenshot tego okna i wyslij mi go.
)
echo.
pause
exit /b %EXIT_CODE%
