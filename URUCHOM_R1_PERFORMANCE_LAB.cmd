@echo off
setlocal
cd /d "%~dp0"
echo ============================================================
echo Jozz Splat Game Lab - R1 Performance
echo ============================================================
echo.
echo Otworzy sie zwykle okno wyboru pliku Windows.
echo Wybierz oryginalny ZIP z Luma albo gs_GG_Szko_a.ply.
echo Potem LAB otworzy sie automatycznie w przegladarce.
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\run-r1-owner.ps1"
set "code=%ERRORLEVEL%"
echo.
if not "%code%"=="0" echo R1 zakonczyl sie bledem. Wyslij mi screenshot komunikatu.
pause
exit /b %code%
