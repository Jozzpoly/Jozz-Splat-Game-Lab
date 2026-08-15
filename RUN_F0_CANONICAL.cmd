@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
title Jozz Splat Game Lab - sprawdzenie F0

echo ============================================================
echo Jozz Splat Game Lab - sprawdzenie F0
echo ============================================================
echo.
echo Nie musisz nic wpisywac ani przeciagac do terminala.
echo Za chwile otworzy sie zwykle okno wyboru pliku Windows.
echo Wybierz oryginalny ZIP z Luma albo plik gs_GG_Szko_a.ply.
echo Oryginalny plik NIE zostanie zmodyfikowany.
echo.

set "INPUT=%~1"

if not defined INPUT (
  echo Otwieram okno wyboru pliku...
  for /f "usebackq delims=" %%I in (`powershell.exe -NoProfile -STA -Command "$ErrorActionPreference='Stop'; Add-Type -AssemblyName System.Windows.Forms; $d=New-Object System.Windows.Forms.OpenFileDialog; $d.Title='Wybierz oryginalny plik Luma ZIP albo PLY'; $d.Filter='Luma ZIP lub PLY (*.zip;*.ply)|*.zip;*.ply|ZIP (*.zip)|*.zip|PLY (*.ply)|*.ply'; $d.Multiselect=$false; if($d.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK){[Console]::Write($d.FileName)}"`) do set "INPUT=%%I"
)

if not defined INPUT (
  echo.
  echo Nic nie wybrano. To nie jest blad - sprawdzenie zostalo anulowane.
  echo Mozesz po prostu zamknac to okno.
  echo.
  pause
  exit /b 0
)

for %%I in ("!INPUT!") do (
  set "INPUT=%%~fI"
  set "EXT=%%~xI"
)

if not exist "!INPUT!" (
  echo.
  echo BLAD: wybrany plik nie istnieje:
  echo !INPUT!
  goto :fail
)

if /I not "!EXT!"==".zip" if /I not "!EXT!"==".ply" (
  echo.
  echo BLAD: wybierz plik .zip albo .ply.
  goto :fail
)

set "SOURCE="
set "EXTRACT="

if /I "!EXT!"==".zip" (
  set "EXTRACT=%TEMP%\JozzSplatGameLab_F0_extract_!RANDOM!_!RANDOM!"
  mkdir "!EXTRACT!" >nul 2>nul
  echo.
  echo Rozpakowuje ZIP do katalogu tymczasowego...
  powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -LiteralPath $env:INPUT -DestinationPath $env:EXTRACT -Force"
  if errorlevel 1 goto :fail
  for /r "!EXTRACT!" %%F in (*.ply) do if not defined SOURCE set "SOURCE=%%~fF"
) else (
  set "SOURCE=!INPUT!"
)

if not defined SOURCE (
  echo.
  echo BLAD: w wybranym pliku nie znaleziono PLY.
  goto :fail
)

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo Nie znaleziono Node.js na tym komputerze.
  echo To NIE oznacza problemu ze splatem ani F0.
  echo Nie instaluj nic specjalnie dla tego testu - wyslij mi screenshot tego okna.
  goto :environment
)

set "NODE_VERSION="
for /f "delims=" %%V in ('node --version 2^>nul') do set "NODE_VERSION=%%V"
echo.
echo Znaleziony Node: !NODE_VERSION!
node -e "const v=process.versions.node.split('.').map(Number); process.exit(v[0]>22 || (v[0]===22 && v[1]>=16) ? 0 : 1)"
if errorlevel 1 (
  echo Ten Node jest starszy niz wspierane minimum 22.16.0.
  echo To NIE oznacza problemu ze splatem ani F0.
  echo Nie aktualizuj nic na sile - wyslij mi screenshot tego okna.
  goto :environment
)

echo.
echo [1/4] Sprawdzam fundament i zapisane dowody...
node tools/check-foundation.mjs
if errorlevel 1 goto :fail
node tools/check-f0-records.mjs
if errorlevel 1 goto :fail

set "RUN=%TEMP%\JozzSplatGameLab_F0_run_!RANDOM!_!RANDOM!"
set "SPLIT=!RUN!\split"
mkdir "!RUN!" >nul 2>nul

echo.
echo [2/4] Sprawdzam oryginalny splat...
node tools/f0-luma-source.mjs inspect "!SOURCE!" > "!RUN!\inspect.json"
if errorlevel 1 goto :fail

echo.
echo [3/4] Odtwarzam foreground i environment w katalogu tymczasowym...
node tools/f0-luma-source.mjs split "!SOURCE!" "!SPLIT!" > "!RUN!\split.json"
if errorlevel 1 goto :fail

echo.
echo [4/4] Niezaleznie porownuje dane bajt po bajcie...
node tools/f0-verify-split.mjs "!SOURCE!" "!SPLIT!\scene.foreground.ply" "!SPLIT!\scene.environment.ply" > "!RUN!\verify.json"
if errorlevel 1 goto :fail

echo.
echo ============================================================
echo F0: PASS
echo ============================================================
echo Wszystko sie zgadza. Oryginalny ZIP/PLY nie zostal zmieniony.
echo.
echo Nie musisz nic robic z plikami wynikowymi.
echo Jesli chcesz, wyslij mi po prostu screenshot z napisem F0: PASS.
echo.
pause
exit /b 0

:environment
echo.
echo ============================================================
echo F0 LOCAL CHECK: NIE URUCHOMIONO - ograniczenie srodowiska
echo ============================================================
echo Sam projekt F0 ma juz niezalezne dowody i ten lokalny test nie jest blockerem.
echo.
pause
exit /b 3

:fail
echo.
echo ============================================================
echo F0: FAIL
echo ============================================================
echo Nie probuj tego sam naprawiac.
echo Zrob screenshot albo skopiuj tekst z tego okna i wyslij mi go.
echo.
pause
exit /b 1
