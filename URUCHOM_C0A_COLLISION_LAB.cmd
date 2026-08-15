@echo off
setlocal
cd /d "%~dp0"
echo ============================================================
echo Jozz Splat Game Lab - C0a Collision Inspector
echo ============================================================
echo.
echo Otworzy sie normalne okno wyboru pliku Luma ZIP/PLY.
echo Nie potrzebujesz terminala ani npm.
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\run-c0a-owner.ps1"
set "EXITCODE=%ERRORLEVEL%"
echo.
if not "%EXITCODE%"=="0" pause
exit /b %EXITCODE%
