@echo off
title Aidex Event - 開発サーバー起動中
cd /d "%~dp0"
echo.
echo  =============================================
echo   Aidex Event  開発サーバーを起動しています...
echo  =============================================
echo.
echo  起動後に http://localhost:3000 が開きます
echo  サーバーを止めるにはこのウィンドウを閉じてください
echo.
start "" cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3000"
npm run dev
pause
