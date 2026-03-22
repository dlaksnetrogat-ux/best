# 🚀 Как опубликовать Mirtube онлайн

## Вариант 1: GitHub Pages (Рекомендуется) ⭐

### Преимущества:
- ✅ Бесплатно навсегда
- ✅ Быстро (5 минут)
- ✅ Автоматические обновления
- ✅ HTTPS из коробки
- ✅ Свой домен (опционально)

### Шаги:

1. **Создай аккаунт на GitHub** (если нет)
   - Перейди на https://github.com
   - Нажми "Sign up"

2. **Создай новый репозиторий**
   - Нажми "+" → "New repository"
   - Название: `mirtube`
   - Поставь галочку "Public"
   - Нажми "Create repository"

3. **Загрузи файлы**
   - Нажми "uploading an existing file"
   - Перетащи все файлы:
     - index.html
     - style.css
     - script.js
     - README.md
   - Нажми "Commit changes"

4. **Включи GitHub Pages**
   - Перейди в Settings → Pages
   - Source: выбери "main" branch
   - Нажми "Save"

5. **Готово!** 🎉
   - Через 1-2 минуты сайт будет доступен по адресу:
   - `https://твой-username.github.io/mirtube/`

---

## Вариант 2: Netlify (Самый простой) 🚀

### Преимущества:
- ✅ Drag & Drop загрузка
- ✅ Мгновенная публикация
- ✅ Автоматический HTTPS
- ✅ Бесплатный домен .netlify.app

### Шаги:

1. **Перейди на Netlify**
   - https://www.netlify.com
   - Нажми "Sign up" (можно через GitHub)

2. **Создай новый сайт**
   - Нажми "Add new site" → "Deploy manually"
   - Перетащи папку с проектом в окно
   - Или выбери файлы вручную

3. **Готово!** 🎉
   - Сайт сразу доступен по адресу:
   - `https://random-name.netlify.app`
   - Можешь изменить название в настройках

---

## Вариант 3: Vercel (Для профи) ⚡

### Преимущества:
- ✅ Очень быстрый
- ✅ Автодеплой из GitHub
- ✅ Аналитика
- ✅ Бесплатный домен .vercel.app

### Шаги:

1. **Перейди на Vercel**
   - https://vercel.com
   - Нажми "Sign up" (лучше через GitHub)

2. **Импортируй проект**
   - Нажми "Add New" → "Project"
   - Выбери свой GitHub репозиторий
   - Нажми "Deploy"

3. **Готово!** 🎉
   - Сайт доступен по адресу:
   - `https://mirtube.vercel.app`

---

## Вариант 4: Cloudflare Pages 🌐

### Преимущества:
- ✅ Самый быстрый CDN
- ✅ Неограниченный трафик
- ✅ Бесплатно навсегда

### Шаги:

1. **Перейди на Cloudflare Pages**
   - https://pages.cloudflare.com
   - Нажми "Sign up"

2. **Создай проект**
   - Нажми "Create a project"
   - Подключи GitHub
   - Выбери репозиторий
   - Нажми "Begin setup" → "Save and Deploy"

3. **Готово!** 🎉
   - Сайт доступен по адресу:
   - `https://mirtube.pages.dev`

---

## 🔑 Важно: YouTube API ключ

После публикации **обязательно** добавь свой YouTube API ключ:

1. Получи ключ: https://console.cloud.google.com
2. Открой `script.js`
3. Замени строку:
   ```javascript
   const YOUTUBE_API_KEY = 'AIzaSyDemoKeyForTesting123456789';
   ```
   На:
   ```javascript
   const YOUTUBE_API_KEY = 'ТВОЙ_НАСТОЯЩИЙ_КЛЮЧ';
   ```
4. Загрузи обновлённый файл

---

## 📝 Рекомендации

### Для новичков:
1. **GitHub Pages** - самый надёжный
2. **Netlify** - самый простой

### Для опытных:
1. **Vercel** - самый быстрый
2. **Cloudflare Pages** - лучший CDN

---

## 🌐 Свой домен (опционально)

Все платформы поддерживают свои домены:

1. Купи домен на:
   - Namecheap.com
   - GoDaddy.com
   - Reg.ru (для России)

2. Подключи в настройках платформы:
   - GitHub Pages: Settings → Pages → Custom domain
   - Netlify: Domain settings → Add custom domain
   - Vercel: Settings → Domains → Add
   - Cloudflare: Custom domains → Set up

---

## 🎯 Быстрый старт (GitHub Pages)

```bash
# 1. Инициализируй Git (в папке проекта)
git init

# 2. Добавь файлы
git add .

# 3. Сделай коммит
git commit -m "Initial commit"

# 4. Подключи GitHub репозиторий
git remote add origin https://github.com/твой-username/mirtube.git

# 5. Загрузи на GitHub
git push -u origin main
```

Затем включи GitHub Pages в настройках репозитория!

---

## ❓ Проблемы?

### Сайт не открывается
- Подожди 2-3 минуты после публикации
- Проверь, что все файлы загружены
- Очисти кэш браузера (Ctrl+F5)

### YouTube видео не работают
- Проверь API ключ в script.js
- Убедись что сайт открыт через HTTPS (не HTTP)

### Ошибка 404
- Проверь что index.html в корне проекта
- Проверь настройки GitHub Pages

---

## 🎉 Готово!

Теперь твой Mirtube доступен всему миру! 🌍

Поделись ссылкой с друзьями! 🚀
