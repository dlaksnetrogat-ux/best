@echo off
echo ========================================
echo   MIRTUBE - Локальный сервер
echo ========================================
echo.
echo Запускаю сервер на http://localhost:8000
echo.
echo Открой в браузере: http://localhost:8000
echo.
echo Для остановки нажми Ctrl+C
echo ========================================
echo.

REM Проверяем Python
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Python найден!
    echo Запускаю Python сервер...
    echo.
    start http://localhost:8000
    python -m http.server 8000
) else (
    echo [ОШИБКА] Python не найден!
    echo.
    echo Установи Python с https://www.python.org/downloads/
    echo Или используй Node.js: npx http-server -p 8000
    pause
)
