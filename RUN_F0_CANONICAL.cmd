@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo ============================================================
echo Jozz Splat Game Lab - F0 canonical replay
echo ============================================================
echo.

if "%~1"=="" (
  echo Drag the exact Luma ZIP or gs_GG_Szko_a.ply onto this file.
  echo No source file will be modified.
  echo.
  pause
  exit /b 2
)

set "INPUT=%~f1"
set "SOURCE="
set "EXTRACT="

if /I "%~x1"==".zip" (
  set "EXTRACT=%TEMP%\JozzSplatGameLab_F0_extract_%RANDOM%_%RANDOM%"
  mkdir "%EXTRACT%" >nul 2>nul
  echo Extracting source ZIP to temporary workspace...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -LiteralPath $env:INPUT -DestinationPath $env:EXTRACT -Force"
  if errorlevel 1 goto :fail
  for /r "%EXTRACT%" %%F in (*.ply) do if not defined SOURCE set "SOURCE=%%~fF"
) else (
  set "SOURCE=%INPUT%"
)

if not defined SOURCE (
  echo FAIL: no PLY file found.
  goto :fail
)
if not exist "%SOURCE%" (
  echo FAIL: source does not exist: %SOURCE%
  goto :fail
)

set "NODE_VERSION="
set "NPM_VERSION="
for /f "delims=" %%V in ('node --version 2^>nul') do set "NODE_VERSION=%%V"
for /f "delims=" %%V in ('npm --version 2^>nul') do set "NPM_VERSION=%%V"

echo Node: %NODE_VERSION%
echo npm : %NPM_VERSION%

if not "%NODE_VERSION%"=="v24.16.0" (
  echo FAIL: canonical Node v24.16.0 is required.
  goto :fail
)
if not "%NPM_VERSION%"=="11.13.0" (
  echo FAIL: canonical npm 11.13.0 is required.
  goto :fail
)

echo.
echo [1/4] Checking committed foundation and F0 evidence...
call npm run check
if errorlevel 1 goto :fail

set "RUN=%TEMP%\JozzSplatGameLab_F0_run_%RANDOM%_%RANDOM%"
set "SPLIT=%RUN%\split"
mkdir "%RUN%" >nul 2>nul

echo.
echo [2/4] Inspecting exact immutable source...
call npm run f0:inspect -- "%SOURCE%" > "%RUN%\inspect.json"
if errorlevel 1 goto :fail

echo.
echo [3/4] Reproducing deterministic foreground/environment split...
call npm run f0:split -- "%SOURCE%" "%SPLIT%" > "%RUN%\split.json"
if errorlevel 1 goto :fail

echo.
echo [4/4] Independently verifying raw payload identity...
call npm run f0:verify-split -- "%SOURCE%" "%SPLIT%\scene.foreground.ply" "%SPLIT%\scene.environment.ply" > "%RUN%\verify.json"
if errorlevel 1 goto :fail

echo.
echo ============================================================
echo F0 CANONICAL REPLAY: PASS
echo ============================================================
echo Evidence folder:
echo %RUN%
echo.
echo Keep that folder until the F0 result has been recorded in Git.
echo The original ZIP/PLY was not modified.
echo.
pause
exit /b 0

:fail
echo.
echo ============================================================
echo F0 CANONICAL REPLAY: FAIL
echo ============================================================
echo Do not continue to R0. Copy the full console output back to ChatGPT.
echo.
pause
exit /b 1
