#!/bin/bash

echo "========================================"
echo "  MIRTUBE - Локальный сервер"
echo "========================================"
echo ""
echo "Запускаю сервер на http://localhost:8000"
echo ""
echo "Открой в браузере: http://localhost:8000"
echo ""
echo "Для остановки нажми Ctrl+C"
echo "========================================"
echo ""

# Проверяем Python
if command -v python3 &> /dev/null; then
    echo "[OK] Python найден!"
    echo "Запускаю Python сервер..."
    echo ""
    
    # Открываем браузер (работает на Mac/Linux)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open http://localhost:8000
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open http://localhost:8000 2>/dev/null || echo "Открой вручную: http://localhost:8000"
    fi
    
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "[OK] Python найден!"
    echo "Запускаю Python сервер..."
    echo ""
    python -m http.server 8000
else
    echo "[ОШИБКА] Python не найден!"
    echo ""
    echo "Установи Python или используй Node.js:"
    echo "  npx http-server -p 8000"
fi
