@echo off
setlocal
cd /d "%~dp0"

echo.
echo  ========================================
echo   Fortress — build phone + laptop apps
echo  ========================================
echo.
echo  [1] Windows laptop app  (.exe Setup + Portable)
echo  [2] Android phone APK   (needs Android Studio + JDK)
echo  [3] Both
echo  [4] Exit
echo.
choice /C 1234 /N /M "Choose 1-4: "
set OPT=%ERRORLEVEL%

if "%OPT%"=="4" goto :eof
if "%OPT%"=="1" goto :win
if "%OPT%"=="2" goto :android
if "%OPT%"=="3" goto :both
goto :eof

:both
call :win
call :android
goto :done

:win
echo.
echo  --- Installing Electron binary if needed ---
call npm run electron:install
if errorlevel 1 (
  echo Electron install failed. Trying npm install electron...
  call npm install electron@37.2.0 --save-dev --no-fund --no-audit
)
echo.
echo  --- Building Windows app (this can take several minutes) ---
call npm run electron:build
if errorlevel 1 (
  echo.
  echo  Windows build FAILED. Check the errors above.
) else (
  echo.
  echo  DONE — share these files from the release\ folder:
  dir /b release\*.exe 2>nul
)
goto :eof

:android
echo.
echo  --- Building Android APK ---
where java >nul 2>&1
if errorlevel 1 (
  echo  Java / JDK not found. Install Android Studio first, then re-run option 2.
  echo  https://developer.android.com/studio
  goto :eof
)
call npm run android:apk
if errorlevel 1 (
  echo.
  echo  Android build FAILED. Open Android Studio: npm run cap:android
) else (
  echo.
  echo  DONE — APK path:
  echo  android\app\build\outputs\apk\debug\app-debug.apk
  echo  Rename to Fortress.apk and send on WhatsApp.
)
goto :eof

:done
echo.
echo  ========================================
echo   Finished. See SETUP-FRIENDS.txt for how to share.
echo  ========================================
pause
