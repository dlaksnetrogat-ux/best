// YouTube API ключ (замени на свой ключ от Google Cloud Console)
const YOUTUBE_API_KEY = 'AIzaSyDi6S6PhPHfHg1DHy_e4hXIffgXvLYuyrM'; // Это демо-ключ, нужен настоящий!

// YouTube Player
let youtubePlayer = null;
let isYouTubeAPIReady = false;

// Инициализация YouTube API
function onYouTubeIframeAPIReady() {
    isYouTubeAPIReady = true;
    console.log('✅ YouTube API готов!');
    console.log('💡 Теперь можно искать видео с YouTube!');
    console.log('⚠️ Не забудь добавить свой API ключ в script.js');
}

// Загрузка популярных видео с YouTube
async function loadTrendingVideos() {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&chart=mostPopular&regionCode=RU&maxResults=24&key=${YOUTUBE_API_KEY}`
        );
        
        if (!response.ok) {
            console.error('Ошибка загрузки трендов:', response.status);
            showNoVideosMessage();
            return;
        }
        
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            videos.length = 0; // Очищаем массив
            
            data.items.forEach(item => {
                videos.push({
                    id: item.id,
                    youtubeId: item.id,
                    title: item.snippet.title,
                    channel: item.snippet.channelTitle,
                    channelThumbnail: item.snippet.thumbnails.default.url,
                    views: formatViews(item.statistics.viewCount),
                    date: formatDate(item.snippet.publishedAt),
                    duration: formatDuration(item.contentDetails.duration),
                    thumbnail: item.snippet.thumbnails.high.url,
                    likes: parseInt(item.statistics.likeCount || 0),
                    subs: item.snippet.channelTitle,
                    description: item.snippet.description || 'Нет описания'
                });
            });
            
            console.log(`✅ Загружено ${videos.length} популярных видео с YouTube`);
            renderVideos();
        } else {
            showNoVideosMessage();
        }
    } catch (error) {
        console.error('Ошибка загрузки видео:', error);
        showNoVideosMessage();
    }
}

// Показать сообщение об отсутствии видео
function showNoVideosMessage() {
    const videoGrid = document.getElementById('videoGrid');
    videoGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #aaa;">
            <div style="font-size: 64px; margin-bottom: 20px;">📺</div>
            <h2 style="margin-bottom: 15px; color: #fff;">Добро пожаловать в Mirtube!</h2>
            <p style="margin-bottom: 20px; font-size: 16px;">Для загрузки видео с YouTube нужен API ключ</p>
            <div style="background: #272727; padding: 20px; border-radius: 12px; max-width: 600px; margin: 0 auto; text-align: left;">
                <p style="color: #3ea6ff; margin-bottom: 10px; font-weight: 600;">💡 Как получить API ключ:</p>
                <ol style="color: #ccc; line-height: 1.8; padding-left: 20px;">
                    <li>Открой <a href="https://console.cloud.google.com" target="_blank" style="color: #3ea6ff;">Google Cloud Console</a></li>
                    <li>Создай проект и включи YouTube Data API v3</li>
                    <li>Создай API ключ в разделе "Учетные данные"</li>
                    <li>Добавь ключ в файл <code style="background: #1a1a1a; padding: 2px 6px; border-radius: 4px;">script.js</code></li>
                </ol>
                <p style="margin-top: 15px; color: #aaa; font-size: 14px;">Подробная инструкция в файле YOUTUBE_API_SETUP.md</p>
            </div>
            <div style="margin-top: 30px;">
                <p style="color: #aaa; margin-bottom: 10px;">Или попробуй поиск:</p>
                <button onclick="document.getElementById('searchInput').focus()" style="background: #3ea6ff; color: #fff; border: none; padding: 12px 24px; border-radius: 20px; font-size: 14px; cursor: pointer; font-weight: 600;">
                    🔍 Искать видео
                </button>
            </div>
        </div>
    `;
}

// Форматирование длительности видео
function formatDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');
    
    if (hours) {
        return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    } else if (minutes) {
        return `${minutes}:${seconds.padStart(2, '0')}`;
    } else {
        return `0:${seconds.padStart(2, '0')}`;
    }
}

// Поиск Shorts на YouTube
async function searchYouTubeShorts(query = 'shorts') {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(query + ' #shorts')}&type=video&videoDuration=short&key=${YOUTUBE_API_KEY}`
        );
        
        if (!response.ok) {
            console.error('Ошибка YouTube Shorts API:', response.status);
            return null;
        }
        
        const data = await response.json();
        return data.items;
    } catch (error) {
        console.error('Ошибка поиска YouTube Shorts:', error);
        return null;
    }
}

// Загрузка популярных Shorts
async function loadPopularShorts() {
    const queries = ['gaming shorts', 'funny shorts', 'music shorts', 'trending shorts'];
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];
    
    const youtubeShorts = await searchYouTubeShorts(randomQuery);
    
    if (youtubeShorts && youtubeShorts.length > 0) {
        const newShorts = [];
        
        for (const item of youtubeShorts.slice(0, 10)) {
            const videoDetails = await getVideoDetails(item.id.videoId);
            
            if (videoDetails) {
                newShorts.push({
                    id: item.id.videoId,
                    youtubeId: item.id.videoId,
                    title: item.snippet.title,
                    channel: item.snippet.channelTitle,
                    views: formatViews(videoDetails.statistics.viewCount),
                    likes: parseInt(videoDetails.statistics.likeCount || 0)
                });
            }
        }
        
        // Добавляем YouTube Shorts к существующим
        shorts.push(...newShorts);
        console.log(`✅ Загружено ${newShorts.length} Shorts с YouTube`);
    }
}

// Поиск видео на YouTube
async function searchYouTube(query) {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${encodeURIComponent(query)}&type=video&key=${YOUTUBE_API_KEY}`
        );
        
        if (!response.ok) {
            console.error('Ошибка YouTube API:', response.status);
            return null;
        }
        
        const data = await response.json();
        return data.items;
    } catch (error) {
        console.error('Ошибка поиска YouTube:', error);
        return null;
    }
}

// Получение деталей видео
async function getVideoDetails(videoId) {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`
        );
        
        if (!response.ok) {
            console.error('Ошибка получения деталей:', response.status);
            return null;
        }
        
        const data = await response.json();
        return data.items[0];
    } catch (error) {
        console.error('Ошибка получения деталей:', error);
        return null;
    }
}

// Получение комментариев видео
async function getVideoComments(videoId) {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=20&order=relevance&key=${YOUTUBE_API_KEY}`
        );
        
        if (!response.ok) {
            console.error('Ошибка получения комментариев:', response.status);
            return [];
        }
        
        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
            return [];
        }
        
        return data.items.map(item => {
            const comment = item.snippet.topLevelComment.snippet;
            return {
                author: comment.authorDisplayName,
                authorAvatar: comment.authorProfileImageUrl,
                date: formatDate(comment.publishedAt),
                text: comment.textDisplay,
                likes: parseInt(comment.likeCount || 0)
            };
        });
    } catch (error) {
        console.error('Ошибка получения комментариев:', error);
        return [];
    }
}

// Форматирование числа просмотров
function formatViews(views) {
    const num = parseInt(views);
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
    } else if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Форматирование даты
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Вчера';
    if (diffDays < 7) return `${diffDays} дней назад`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} недель назад`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} месяцев назад`;
    return `${Math.floor(diffDays / 365)} лет назад`;
}

// Данные Shorts (будут загружены с YouTube)
const shorts = [];

// Данные видео (будут загружены с YouTube)
const videos = [];

// Комментарии текущего видео
let currentVideoComments = [];

// Пользовательские данные
let userHistory = []; // История просмотров
let watchLater = []; // Смотреть позже
let likedVideos = []; // Понравившиеся
let subscribedChannels = []; // Подписки

// Отрисовка видео
function renderVideos(videosToRender = videos) {
    const videoGrid = document.getElementById('videoGrid');
    videoGrid.innerHTML = '';
    
    if (videosToRender.length === 0) {
        videoGrid.innerHTML = '<p style="color: #aaa; text-align: center; padding: 40px; grid-column: 1/-1;">Ничего не найдено</p>';
        return;
    }
    
    videosToRender.forEach(video => {
        const videoCard = document.createElement('div');
        videoCard.className = 'video-card';
        videoCard.onclick = () => openVideo(video);
        
        videoCard.innerHTML = `
            <div class="video-thumbnail">
                <img src="${video.thumbnail}" alt="${video.title}">
                <span class="video-duration">${video.duration}</span>
            </div>
            <div class="video-details">
                <img src="${video.channelThumbnail || 'https://via.placeholder.com/36'}" alt="${video.channel}" class="channel-avatar">
                <div class="video-meta">
                    <div class="video-title">${video.title}</div>
                    <div class="video-channel">${video.channel}</div>
                    <div class="video-stats">${video.views} просмотров • ${video.date}</div>
                </div>
            </div>
        `;
        
        videoGrid.appendChild(videoCard);
    });
}

// Текущая страница
let currentPage = 'home';
let currentShortIndex = 0;
let currentProfileTab = 'videos';
let currentChannel = null; // Текущий просматриваемый канал

// Данные профиля пользователя
let userProfile = {
    name: 'Мой канал',
    handle: '@myChannel',
    avatar: 'https://via.placeholder.com/120',
    banner: {
        color1: '#667eea',
        color2: '#764ba2'
    },
    subscribers: 0,
    videos: 0,
    description: 'Добро пожаловать на мой канал!',
    email: '',
    links: [],
    isLoggedIn: false
};

// Переключение страниц
function switchPage(page) {
    currentPage = page;
    
    const mainContent = document.getElementById('mainContent');
    const shortsContainer = document.getElementById('shortsContainer');
    const profilePage = document.getElementById('profilePage');
    const channelPage = document.getElementById('channelPage');
    const sidebar = document.getElementById('sidebar');
    
    // Обновляем активный пункт меню
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === page) {
            item.classList.add('active');
        }
    });
    
    // Скрываем все страницы
    mainContent.style.display = 'none';
    shortsContainer.style.display = 'none';
    profilePage.style.display = 'none';
    channelPage.style.display = 'none';
    
    if (page === 'shorts') {
        shortsContainer.style.display = 'block';
        sidebar.style.display = 'none';
        
        // Показываем индикатор загрузки
        const shortsWrapper = document.getElementById('shortsWrapper');
        shortsWrapper.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #fff; font-size: 18px;">🔄 Загрузка Shorts...</div>';
        
        // Загружаем YouTube Shorts
        if (shorts.length === 0) {
            loadPopularShorts().then(() => {
                if (shorts.length > 0) {
                    renderShorts();
                } else {
                    shortsWrapper.innerHTML = `
                        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #fff; padding: 40px; text-align: center;">
                            <div style="font-size: 64px; margin-bottom: 20px;">📱</div>
                            <h2 style="margin-bottom: 15px;">Shorts недоступны</h2>
                            <p style="color: #aaa; max-width: 400px;">Для загрузки Shorts нужен YouTube API ключ. См. YOUTUBE_API_SETUP.md</p>
                        </div>
                    `;
                }
            });
        } else {
            renderShorts();
        }
    } else if (page === 'profile') {
        profilePage.style.display = 'block';
        sidebar.style.display = 'block';
        renderProfile();
    } else if (page === 'channel') {
        channelPage.style.display = 'block';
        sidebar.style.display = 'block';
    } else if (page === 'trending' || page === 'subscriptions' || page === 'library' || page === 'history' || page === 'watchlater' || page === 'liked') {
        mainContent.style.display = 'block';
        sidebar.style.display = 'block';
        document.getElementById('categories').style.display = 'none';
        showPageContent(page);
    } else {
        // Главная страница
        mainContent.style.display = 'block';
        sidebar.style.display = 'block';
        document.getElementById('categories').style.display = 'flex';
        if (videos.length === 0) {
            loadTrendingVideos();
        } else {
            renderVideos();
        }
    }
    
    // Останавливаем ВСЕ видео в Shorts
    document.querySelectorAll('.short-video').forEach(video => {
        if (video.tagName === 'VIDEO') {
            video.pause();
            video.currentTime = 0;
        } else if (video.tagName === 'IFRAME') {
            const src = video.src;
            if (src && src.includes('autoplay=1')) {
                video.src = src.replace('autoplay=1', 'autoplay=0');
            }
        }
    });
}

// Показать контент страницы
function showPageContent(page) {
    const videoGrid = document.getElementById('videoGrid');
    
    switch(page) {
        case 'trending':
            videoGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #aaa;"><h2 style="color: #fff; margin-bottom: 16px;">🔥 В тренде</h2><p>🔄 Загрузка популярных видео...</p></div>';
            loadTrendingVideos();
            break;
            
        case 'subscriptions':
            if (subscribedChannels.length === 0) {
                videoGrid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 80px 20px; color: #aaa;">
                        <div style="font-size: 64px; margin-bottom: 20px;">📺</div>
                        <h2 style="color: #fff; margin-bottom: 12px;">Нет подписок</h2>
                        <p>Подпишитесь на каналы, чтобы видеть их видео здесь</p>
                    </div>
                `;
            } else {
                videoGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #aaa;"><h2 style="color: #fff; margin-bottom: 16px;">📺 Подписки</h2></div>`;
            }
            break;
            
        case 'library':
            videoGrid.innerHTML = `
                <div style="grid-column: 1/-1; padding: 40px 0;">
                    <h2 style="margin-bottom: 24px;">📚 Библиотека</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
                        <div onclick="switchPage('history')" style="background: #272727; padding: 24px; border-radius: 12px; cursor: pointer; transition: background 0.2s;">
                            <div style="font-size: 32px; margin-bottom: 12px;">🕐</div>
                            <h3 style="margin-bottom: 8px;">История</h3>
                            <p style="color: #aaa; font-size: 14px;">${userHistory.length} видео</p>
                        </div>
                        <div onclick="switchPage('watchlater')" style="background: #272727; padding: 24px; border-radius: 12px; cursor: pointer; transition: background 0.2s;">
                            <div style="font-size: 32px; margin-bottom: 12px;">⏰</div>
                            <h3 style="margin-bottom: 8px;">Смотреть позже</h3>
                            <p style="color: #aaa; font-size: 14px;">${watchLater.length} видео</p>
                        </div>
                        <div onclick="switchPage('liked')" style="background: #272727; padding: 24px; border-radius: 12px; cursor: pointer; transition: background 0.2s;">
                            <div style="font-size: 32px; margin-bottom: 12px;">👍</div>
                            <h3 style="margin-bottom: 8px;">Понравившиеся</h3>
                            <p style="color: #aaa; font-size: 14px;">${likedVideos.length} видео</p>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'history':
            if (userHistory.length === 0) {
                videoGrid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 80px 20px; color: #aaa;">
                        <div style="font-size: 64px; margin-bottom: 20px;">🕐</div>
                        <h2 style="color: #fff; margin-bottom: 12px;">История пуста</h2>
                        <p>Видео, которые вы смотрите, появятся здесь</p>
                    </div>
                `;
            } else {
                videoGrid.innerHTML = '<div style="grid-column: 1/-1; margin-bottom: 24px;"><h2>🕐 История просмотров</h2></div>';
                renderVideos(userHistory);
            }
            break;
            
        case 'watchlater':
            if (watchLater.length === 0) {
                videoGrid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 80px 20px; color: #aaa;">
                        <div style="font-size: 64px; margin-bottom: 20px;">⏰</div>
                        <h2 style="color: #fff; margin-bottom: 12px;">Список пуст</h2>
                        <p>Добавляйте видео, чтобы посмотреть их позже</p>
                    </div>
                `;
            } else {
                videoGrid.innerHTML = '<div style="grid-column: 1/-1; margin-bottom: 24px;"><h2>⏰ Смотреть позже</h2></div>';
                renderVideos(watchLater);
            }
            break;
            
        case 'liked':
            if (likedVideos.length === 0) {
                videoGrid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 80px 20px; color: #aaa;">
                        <div style="font-size: 64px; margin-bottom: 20px;">👍</div>
                        <h2 style="color: #fff; margin-bottom: 12px;">Нет понравившихся видео</h2>
                        <p>Ставьте лайки видео, чтобы они появились здесь</p>
                    </div>
                `;
            } else {
                videoGrid.innerHTML = '<div style="grid-column: 1/-1; margin-bottom: 24px;"><h2>👍 Понравившиеся видео</h2></div>';
                renderVideos(likedVideos);
            }
            break;
    }
}

// Отрисовка профиля
function renderProfile() {
    document.getElementById('profileName').textContent = userProfile.name;
    document.getElementById('profileHandle').textContent = userProfile.handle;
    document.getElementById('profileStats').textContent = `${userProfile.subscribers} подписчиков • ${userProfile.videos} видео`;
    document.getElementById('profileDescription').textContent = userProfile.description;
    document.getElementById('profileAvatar').src = userProfile.avatar;
    
    // Обновляем баннер
    const banner = document.getElementById('profileBanner');
    banner.style.background = `linear-gradient(135deg, ${userProfile.banner.color1} 0%, ${userProfile.banner.color2} 100%)`;
}

// Открыть редактор профиля
function openProfileEditor() {
    const modal = document.getElementById('profileEditorModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Заполняем форму текущими данными
    document.getElementById('editName').value = userProfile.name;
    document.getElementById('editHandle').value = userProfile.handle;
    document.getElementById('editDescription').value = userProfile.description;
    document.getElementById('editEmail').value = userProfile.email || '';
    document.getElementById('bannerColor1').value = userProfile.banner.color1;
    document.getElementById('bannerColor2').value = userProfile.banner.color2;
    
    // Обновляем счётчики символов
    updateCharCount('editName', 'nameCount', 50);
    updateCharCount('editDescription', 'descCount', 1000);
    
    // Отрисовываем ссылки
    renderLinks();
}

// Закрыть редактор профиля
function closeProfileEditor() {
    const modal = document.getElementById('profileEditorModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Сохранить профиль
function saveProfile() {
    userProfile.name = document.getElementById('editName').value.trim() || 'Мой канал';
    userProfile.handle = document.getElementById('editHandle').value.trim() || '@myChannel';
    userProfile.description = document.getElementById('editDescription').value.trim() || 'Добро пожаловать на мой канал!';
    userProfile.email = document.getElementById('editEmail').value.trim();
    userProfile.banner.color1 = document.getElementById('bannerColor1').value;
    userProfile.banner.color2 = document.getElementById('bannerColor2').value;
    
    // Сохраняем ссылки
    const linkItems = document.querySelectorAll('.link-item');
    userProfile.links = [];
    linkItems.forEach(item => {
        const title = item.querySelector('.link-title').value.trim();
        const url = item.querySelector('.link-url').value.trim();
        if (title && url) {
            userProfile.links.push({ title, url });
        }
    });
    
    // Сохраняем в localStorage
    localStorage.setItem('mirtube_profile', JSON.stringify(userProfile));
    
    renderProfile();
    closeProfileEditor();
    
    // Показываем уведомление
    showNotification('✅ Профиль сохранён!');
}

// Обновление счётчика символов
function updateCharCount(inputId, countId, max) {
    const input = document.getElementById(inputId);
    const counter = document.getElementById(countId);
    
    input.addEventListener('input', function() {
        const count = this.value.length;
        counter.textContent = `${count}/${max}`;
        counter.style.color = count > max * 0.9 ? '#ff4444' : '#aaa';
    });
}

// Изменить аватар
function changeAvatar() {
    const url = prompt('Введите URL изображения для аватара:', userProfile.avatar);
    if (url && url.trim()) {
        userProfile.avatar = url.trim();
        renderProfile();
        localStorage.setItem('mirtube_profile', JSON.stringify(userProfile));
        showNotification('✅ Аватар обновлён!');
    }
}

// Изменить баннер
function changeBanner() {
    const url = prompt('Введите URL изображения для баннера (или оставьте пустым для градиента):');
    if (url !== null) {
        if (url.trim()) {
            const banner = document.getElementById('profileBanner');
            banner.style.background = `url(${url.trim()}) center/cover`;
        }
        showNotification('✅ Баннер обновлён!');
    }
}

// Добавить ссылку
function addLink() {
    const linksList = document.getElementById('linksList');
    const linkItem = document.createElement('div');
    linkItem.className = 'link-item';
    linkItem.innerHTML = `
        <input type="text" placeholder="Название ссылки" class="link-title">
        <input type="url" placeholder="https://..." class="link-url">
        <button onclick="removeLink(this)">🗑️</button>
    `;
    linksList.appendChild(linkItem);
}

// Удалить ссылку
function removeLink(button) {
    button.parentElement.remove();
}

// Отрисовка ссылок
function renderLinks() {
    const linksList = document.getElementById('linksList');
    linksList.innerHTML = '';
    
    if (userProfile.links.length === 0) {
        addLink();
    } else {
        userProfile.links.forEach(link => {
            const linkItem = document.createElement('div');
            linkItem.className = 'link-item';
            linkItem.innerHTML = `
                <input type="text" placeholder="Название ссылки" class="link-title" value="${link.title}">
                <input type="url" placeholder="https://..." class="link-url" value="${link.url}">
                <button onclick="removeLink(this)">🗑️</button>
            `;
            linksList.appendChild(linkItem);
        });
    }
}

// Загрузить видео
function uploadVideo() {
    const title = prompt('Введите название видео:');
    if (!title || !title.trim()) return;
    
    const url = prompt('Введите URL видео (YouTube ID или прямая ссылка):');
    if (!url || !url.trim()) return;
    
    // Создаём новое видео
    const newVideo = {
        id: Date.now(),
        title: title.trim(),
        channel: userProfile.name,
        views: '0',
        date: 'только что',
        duration: '0:00',
        thumbnail: 'https://via.placeholder.com/640x360',
        likes: 0,
        subs: `${userProfile.subscribers} подписчиков`,
        description: 'Моё видео'
    };
    
    // Проверяем, это YouTube ID
    if (url.length === 11 && !url.includes('/') && !url.includes('.')) {
        newVideo.youtubeId = url;
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
        // Извлекаем ID из URL
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
        if (match) {
            newVideo.youtubeId = match[1];
        }
    } else {
        newVideo.videoUrl = url;
    }
    
    videos.unshift(newVideo);
    userProfile.videos++;
    
    localStorage.setItem('mirtube_profile', JSON.stringify(userProfile));
    localStorage.setItem('mirtube_videos', JSON.stringify(videos));
    
    showNotification('✅ Видео загружено!');
    renderProfile();
    switchProfileTab('videos');
}

// Показать уведомление
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #3ea6ff;
        color: #fff;
        padding: 16px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Загрузить профиль из localStorage
function loadProfile() {
    const saved = localStorage.getItem('mirtube_profile');
    if (saved) {
        const savedProfile = JSON.parse(saved);
        userProfile = { ...userProfile, ...savedProfile };
    }
    
    const savedVideos = localStorage.getItem('mirtube_videos');
    if (savedVideos) {
        const parsed = JSON.parse(savedVideos);
        videos.push(...parsed);
    }
    
    // Загружаем пользовательские данные
    const savedHistory = localStorage.getItem('mirtube_history');
    if (savedHistory) {
        userHistory = JSON.parse(savedHistory);
    }
    
    const savedWatchLater = localStorage.getItem('mirtube_watchlater');
    if (savedWatchLater) {
        watchLater = JSON.parse(savedWatchLater);
    }
    
    const savedLiked = localStorage.getItem('mirtube_liked');
    if (savedLiked) {
        likedVideos = JSON.parse(savedLiked);
    }
    
    const savedSubscriptions = localStorage.getItem('mirtube_subscriptions');
    if (savedSubscriptions) {
        subscribedChannels = JSON.parse(savedSubscriptions);
    }
}

// Добавить в историю
function addToHistory(video) {
    // Удаляем если уже есть
    userHistory = userHistory.filter(v => v.id !== video.id);
    // Добавляем в начало
    userHistory.unshift(video);
    // Ограничиваем до 100 видео
    if (userHistory.length > 100) {
        userHistory = userHistory.slice(0, 100);
    }
    localStorage.setItem('mirtube_history', JSON.stringify(userHistory));
}

// Добавить в "Смотреть позже"
function addToWatchLater(video) {
    if (!watchLater.find(v => v.id === video.id)) {
        watchLater.unshift(video);
        localStorage.setItem('mirtube_watchlater', JSON.stringify(watchLater));
        showNotification('✅ Добавлено в "Смотреть позже"');
    } else {
        showNotification('ℹ️ Уже в списке "Смотреть позже"');
    }
}

// Добавить в понравившиеся
function addToLiked(video) {
    if (!likedVideos.find(v => v.id === video.id)) {
        likedVideos.unshift(video);
        localStorage.setItem('mirtube_liked', JSON.stringify(likedVideos));
        showNotification('✅ Добавлено в понравившиеся');
    }
}

// Удалить из понравившихся
function removeFromLiked(video) {
    likedVideos = likedVideos.filter(v => v.id !== video.id);
    localStorage.setItem('mirtube_liked', JSON.stringify(likedVideos));
}

// Открыть страницу канала
async function openChannel(channelName, channelId = null) {
    currentChannel = {
        name: channelName,
        id: channelId,
        handle: '@' + channelName.toLowerCase().replace(/\s+/g, ''),
        avatar: 'https://via.placeholder.com/120',
        banner: {
            color1: '#667eea',
            color2: '#764ba2'
        },
        subscribers: '0',
        videos: [],
        description: 'Канал ' + channelName
    };
    
    // Если есть YouTube channel ID, загружаем данные
    if (channelId && window.location.protocol !== 'file:') {
        try {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`
            );
            
            if (response.ok) {
                const data = await response.json();
                if (data.items && data.items.length > 0) {
                    const channel = data.items[0];
                    currentChannel.avatar = channel.snippet.thumbnails.high.url;
                    currentChannel.description = channel.snippet.description || currentChannel.description;
                    currentChannel.subscribers = formatViews(channel.statistics.subscriberCount);
                    
                    // Загружаем видео канала
                    const videosResponse = await fetch(
                        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=20&order=date&type=video&key=${YOUTUBE_API_KEY}`
                    );
                    
                    if (videosResponse.ok) {
                        const videosData = await videosResponse.json();
                        for (const item of videosData.items) {
                            const videoDetails = await getVideoDetails(item.id.videoId);
                            if (videoDetails) {
                                currentChannel.videos.push({
                                    id: item.id.videoId,
                                    youtubeId: item.id.videoId,
                                    title: item.snippet.title,
                                    channel: channelName,
                                    channelThumbnail: currentChannel.avatar,
                                    views: formatViews(videoDetails.statistics.viewCount),
                                    date: formatDate(item.snippet.publishedAt),
                                    duration: formatDuration(videoDetails.contentDetails.duration),
                                    thumbnail: item.snippet.thumbnails.high.url,
                                    likes: parseInt(videoDetails.statistics.likeCount || 0),
                                    subs: currentChannel.subscribers + ' подписчиков',
                                    description: item.snippet.description || 'Нет описания'
                                });
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки канала:', error);
        }
    } else {
        // Ищем видео этого канала в локальных данных
        currentChannel.videos = videos.filter(v => v.channel === channelName);
    }
    
    switchPage('channel');
    renderChannel();
}

// Отрисовка страницы канала
function renderChannel() {
    document.getElementById('channelName').textContent = currentChannel.name;
    document.getElementById('channelHandle').textContent = currentChannel.handle;
    document.getElementById('channelStats').textContent = `${currentChannel.subscribers} подписчиков • ${currentChannel.videos.length} видео`;
    document.getElementById('channelDescription').textContent = currentChannel.description;
    document.getElementById('channelAvatar').src = currentChannel.avatar;
    
    const banner = document.getElementById('channelBanner');
    banner.style.background = `linear-gradient(135deg, ${currentChannel.banner.color1} 0%, ${currentChannel.banner.color2} 100%)`;
    
    // Проверяем подписку
    const isSubscribed = subscribedChannels.includes(currentChannel.name);
    const subscribeBtn = document.getElementById('channelSubscribeBtn');
    if (isSubscribed) {
        subscribeBtn.textContent = 'Вы подписаны';
        subscribeBtn.style.backgroundColor = '#3d3d3d';
    } else {
        subscribeBtn.textContent = 'Подписаться';
        subscribeBtn.style.backgroundColor = '#cc0000';
    }
    
    // Показываем видео
    switchChannelTab('videos');
}

// Переключение вкладок канала
function switchChannelTab(tab) {
    document.querySelectorAll('.channel-page .profile-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    const content = document.getElementById('channelContent');
    
    switch(tab) {
        case 'videos':
            if (currentChannel.videos.length > 0) {
                content.innerHTML = '<div class="video-grid" style="padding: 0;"></div>';
                const grid = content.querySelector('.video-grid');
                currentChannel.videos.forEach(video => {
                    const videoCard = document.createElement('div');
                    videoCard.className = 'video-card';
                    videoCard.onclick = () => openVideo(video);
                    videoCard.innerHTML = `
                        <div class="video-thumbnail">
                            <img src="${video.thumbnail}" alt="${video.title}">
                            <span class="video-duration">${video.duration}</span>
                        </div>
                        <div class="video-details">
                            <img src="${currentChannel.avatar}" alt="${video.channel}" class="channel-avatar">
                            <div class="video-meta">
                                <div class="video-title">${video.title}</div>
                                <div class="video-channel">${video.channel}</div>
                                <div class="video-stats">${video.views} просмотров • ${video.date}</div>
                            </div>
                        </div>
                    `;
                    grid.appendChild(videoCard);
                });
            } else {
                content.innerHTML = `
                    <div style="text-align: center; padding: 80px 20px; color: #aaa;">
                        <div style="font-size: 64px; margin-bottom: 20px;">📹</div>
                        <h2 style="color: #fff; margin-bottom: 12px;">Нет видео</h2>
                        <p>На этом канале пока нет видео</p>
                    </div>
                `;
            }
            break;
            
        case 'shorts':
            content.innerHTML = `
                <div style="text-align: center; padding: 80px 20px; color: #aaa;">
                    <div style="font-size: 64px; margin-bottom: 20px;">📱</div>
                    <h2 style="color: #fff; margin-bottom: 12px;">Нет Shorts</h2>
                    <p>На этом канале пока нет Shorts</p>
                </div>
            `;
            break;
            
        case 'about':
            content.innerHTML = `
                <div style="max-width: 800px; padding: 40px 0;">
                    <h3 style="margin-bottom: 16px;">Описание</h3>
                    <p style="color: #aaa; line-height: 1.6; margin-bottom: 32px;">${currentChannel.description}</p>
                    
                    <h3 style="margin-bottom: 16px;">Статистика</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                        <div style="background: #272727; padding: 20px; border-radius: 12px;">
                            <div style="font-size: 24px; font-weight: 600; margin-bottom: 4px;">${currentChannel.subscribers}</div>
                            <div style="color: #aaa; font-size: 14px;">Подписчиков</div>
                        </div>
                        <div style="background: #272727; padding: 20px; border-radius: 12px;">
                            <div style="font-size: 24px; font-weight: 600; margin-bottom: 4px;">${currentChannel.videos.length}</div>
                            <div style="color: #aaa; font-size: 14px;">Видео</div>
                        </div>
                    </div>
                </div>
            `;
            break;
    }
}

// Подписка на канал
function toggleChannelSubscribe() {
    if (!currentChannel) return;
    
    const isSubscribed = subscribedChannels.includes(currentChannel.name);
    
    if (isSubscribed) {
        subscribedChannels = subscribedChannels.filter(c => c !== currentChannel.name);
        showNotification('❌ Вы отписались от канала');
    } else {
        subscribedChannels.push(currentChannel.name);
        showNotification('✅ Вы подписались на канал');
    }
    
    localStorage.setItem('mirtube_subscriptions', JSON.stringify(subscribedChannels));
    renderChannel();
}

// Фильтрация по категориям
async function filterByCategory(category) {
    const videoGrid = document.getElementById('videoGrid');
    
    if (category === 'Все') {
        // Показываем все видео
        if (videos.length === 0) {
            loadTrendingVideos();
        } else {
            renderVideos();
        }
        return;
    }
    
    // Показываем индикатор загрузки
    videoGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #aaa;"><h2 style="color: #fff; margin-bottom: 16px;">' + category + '</h2><p>🔄 Загрузка видео...</p></div>';
    
    // Карта категорий на поисковые запросы
    const categoryMap = {
        'Игры': 'gaming gameplay',
        'Музыка': 'music',
        'Новости': 'news',
        'Спорт': 'sports',
        'Обучение': 'tutorial education',
        'Развлечения': 'entertainment funny'
    };
    
    const searchQuery = categoryMap[category] || category;
    
    // Ищем видео по категории
    if (window.location.protocol !== 'file:') {
        try {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=24&q=${encodeURIComponent(searchQuery)}&type=video&key=${YOUTUBE_API_KEY}`
            );
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.items && data.items.length > 0) {
                    const categoryVideos = [];
                    
                    for (const item of data.items) {
                        const videoDetails = await getVideoDetails(item.id.videoId);
                        
                        if (videoDetails) {
                            categoryVideos.push({
                                id: item.id.videoId,
                                youtubeId: item.id.videoId,
                                title: item.snippet.title,
                                channel: item.snippet.channelTitle,
                                channelThumbnail: item.snippet.thumbnails.default.url,
                                views: formatViews(videoDetails.statistics.viewCount),
                                date: formatDate(item.snippet.publishedAt),
                                duration: formatDuration(videoDetails.contentDetails.duration),
                                thumbnail: item.snippet.thumbnails.high.url,
                                likes: parseInt(videoDetails.statistics.likeCount || 0),
                                subs: item.snippet.channelTitle,
                                description: item.snippet.description || 'Нет описания'
                            });
                        }
                    }
                    
                    renderVideos(categoryVideos);
                } else {
                    videoGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #aaa;"><h2 style="color: #fff; margin-bottom: 16px;">Ничего не найдено</h2><p>Попробуйте другую категорию</p></div>';
                }
            } else {
                videoGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #aaa;"><h2 style="color: #fff; margin-bottom: 16px;">Ошибка загрузки</h2><p>Проверьте API ключ</p></div>';
            }
        } catch (error) {
            console.error('Ошибка фильтрации:', error);
            videoGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #aaa;"><h2 style="color: #fff; margin-bottom: 16px;">Ошибка</h2><p>Не удалось загрузить видео</p></div>';
        }
    } else {
        // Локальная фильтрация если нет сервера
        videoGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #aaa;"><h2 style="color: #fff; margin-bottom: 16px;">Категории недоступны</h2><p>Для фильтрации по категориям нужен локальный сервер и YouTube API ключ</p></div>';
    }
}

// Переключение вкладок профиля
function switchProfileTab(tab) {
    currentProfileTab = tab;
    
    document.querySelectorAll('.profile-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    const content = document.getElementById('profileContent');
    
    switch(tab) {
        case 'videos':
            // Показываем загруженные видео
            const myVideos = videos.filter(v => v.channel === userProfile.name);
            if (myVideos.length > 0) {
                content.innerHTML = '<div class="video-grid" style="padding: 0;"></div>';
                const grid = content.querySelector('.video-grid');
                myVideos.forEach(video => {
                    const videoCard = document.createElement('div');
                    videoCard.className = 'video-card';
                    videoCard.onclick = () => openVideo(video);
                    videoCard.innerHTML = `
                        <div class="video-thumbnail">
                            <img src="${video.thumbnail}" alt="${video.title}">
                            <span class="video-duration">${video.duration}</span>
                        </div>
                        <div class="video-details">
                            <img src="${userProfile.avatar}" alt="${video.channel}" class="channel-avatar">
                            <div class="video-meta">
                                <div class="video-title">${video.title}</div>
                                <div class="video-channel">${video.channel}</div>
                                <div class="video-stats">${video.views} просмотров • ${video.date}</div>
                            </div>
                        </div>
                    `;
                    grid.appendChild(videoCard);
                });
            } else {
                content.innerHTML = `
                    <div class="empty-state">
                        <div style="font-size: 64px; margin-bottom: 20px;">📹</div>
                        <h2>Загрузите своё первое видео</h2>
                        <p>Начните делиться своим контентом с миром!</p>
                        <button class="upload-btn" onclick="uploadVideo()">📤 Загрузить видео</button>
                    </div>
                `;
            }
            break;
        case 'shorts':
            content.innerHTML = `
                <div class="empty-state">
                    <div style="font-size: 64px; margin-bottom: 20px;">📱</div>
                    <h2>Создайте свой первый Short</h2>
                    <p>Короткие вертикальные видео для быстрого просмотра</p>
                    <button class="upload-btn" onclick="alert('Функция загрузки Shorts в разработке')">📤 Создать Short</button>
                </div>
            `;
            break;
        case 'playlists':
            content.innerHTML = `
                <div class="empty-state">
                    <div style="font-size: 64px; margin-bottom: 20px;">📚</div>
                    <h2>Создайте свой первый плейлист</h2>
                    <p>Организуйте видео в коллекции</p>
                    <button class="upload-btn" onclick="alert('Функция создания плейлистов в разработке')">➕ Создать плейлист</button>
                </div>
            `;
            break;
        case 'about':
            const linksHtml = userProfile.links.length > 0 
                ? userProfile.links.map(link => `
                    <a href="${link.url}" target="_blank" style="color: #3ea6ff; text-decoration: none; display: block; margin-bottom: 8px;">
                        🔗 ${link.title}
                    </a>
                `).join('')
                : '<p style="color: #aaa;">Нет ссылок</p>';
            
            content.innerHTML = `
                <div style="max-width: 800px;">
                    <h3 style="margin-bottom: 16px;">Описание</h3>
                    <p style="color: #aaa; line-height: 1.6; margin-bottom: 32px;">${userProfile.description}</p>
                    
                    ${userProfile.email ? `
                        <h3 style="margin-bottom: 16px;">Контакты</h3>
                        <p style="color: #aaa; margin-bottom: 32px;">📧 ${userProfile.email}</p>
                    ` : ''}
                    
                    ${userProfile.links.length > 0 ? `
                        <h3 style="margin-bottom: 16px;">Ссылки</h3>
                        <div style="margin-bottom: 32px;">${linksHtml}</div>
                    ` : ''}
                    
                    <h3 style="margin-bottom: 16px;">Статистика</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                        <div style="background: #272727; padding: 20px; border-radius: 12px;">
                            <div style="font-size: 24px; font-weight: 600; margin-bottom: 4px;">${userProfile.subscribers}</div>
                            <div style="color: #aaa; font-size: 14px;">Подписчиков</div>
                        </div>
                        <div style="background: #272727; padding: 20px; border-radius: 12px;">
                            <div style="font-size: 24px; font-weight: 600; margin-bottom: 4px;">${userProfile.videos}</div>
                            <div style="color: #aaa; font-size: 14px;">Видео</div>
                        </div>
                        <div style="background: #272727; padding: 20px; border-radius: 12px;">
                            <div style="font-size: 24px; font-weight: 600; margin-bottom: 4px;">0</div>
                            <div style="color: #aaa; font-size: 14px;">Просмотров</div>
                        </div>
                    </div>
                </div>
            `;
            break;
    }
}

// Редактирование профиля (старая функция - удалена)

// Отрисовка Shorts
function renderShorts() {
    const shortsWrapper = document.getElementById('shortsWrapper');
    shortsWrapper.innerHTML = '';
    
    shorts.forEach((short, index) => {
        const shortItem = document.createElement('div');
        shortItem.className = 'short-item';
        shortItem.setAttribute('data-index', index);
        
        // Проверяем, это YouTube Short или локальное видео
        if (short.youtubeId) {
            // YouTube Short - встраиваем через iframe с мгновенным автозапуском
            // Первые 3 видео загружаем сразу для быстрого старта
            const shouldPreload = index < 3;
            
            shortItem.innerHTML = `
                <iframe 
                    class="short-video short-youtube-iframe" 
                    src="https://www.youtube.com/embed/${short.youtubeId}?autoplay=${index === 0 ? 1 : 0}&mute=0&controls=1&loop=1&playlist=${short.youtubeId}&enablejsapi=1&rel=0&modestbranding=1&playsinline=1"
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowfullscreen
                    loading="${shouldPreload ? 'eager' : 'lazy'}"
                    id="short-iframe-${index}">
                </iframe>
                <div class="short-info">
                    <h3>${short.title}</h3>
                    <p style="cursor: pointer;" onclick="event.stopPropagation(); openChannel('${short.channel.replace(/'/g, "\\'")}', null)">${short.channel}</p>
                    <div class="short-stats">${short.views} просмотров</div>
                </div>
                <div class="short-actions">
                    <button class="short-action-btn" onclick="likeShort(${index})">
                        👍
                        <span id="short-likes-${index}">${formatNumber(short.likes)}</span>
                    </button>
                    <button class="short-action-btn" onclick="alert('Дизлайк')">
                        👎
                        <span>Дизлайк</span>
                    </button>
                    <button class="short-action-btn" onclick="alert('Комментарии')">
                        💬
                        <span>Комменты</span>
                    </button>
                    <button class="short-action-btn" onclick="window.open('https://www.youtube.com/shorts/${short.youtubeId}', '_blank')">
                        ↗️
                        <span>Открыть</span>
                    </button>
                </div>
            `;
        } else {
            // Локальное видео
            shortItem.innerHTML = `
                <video class="short-video short-local-video" loop playsinline preload="auto" id="short-video-${index}">
                    <source src="${short.videoUrl}" type="video/mp4">
                </video>
                <div class="short-info">
                    <h3>${short.title}</h3>
                    <p style="cursor: pointer;" onclick="event.stopPropagation(); openChannel('${short.channel.replace(/'/g, "\\'")}', null)">${short.channel}</p>
                    <div class="short-stats">${short.views} просмотров</div>
                </div>
                <div class="short-actions">
                    <button class="short-action-btn" onclick="likeShort(${index})">
                        👍
                        <span id="short-likes-${index}">${formatNumber(short.likes)}</span>
                    </button>
                    <button class="short-action-btn" onclick="alert('Дизлайк')">
                        👎
                        <span>Дизлайк</span>
                    </button>
                    <button class="short-action-btn" onclick="alert('Комментарии')">
                        💬
                        <span>Комменты</span>
                    </button>
                    <button class="short-action-btn" onclick="alert('Поделиться')">
                        ↗️
                        <span>Поделиться</span>
                    </button>
                </div>
            `;
        }
        
        shortsWrapper.appendChild(shortItem);
    });
    
    // Предзагрузка первых 3 iframe для мгновенного старта
    setTimeout(() => {
        for (let i = 0; i < Math.min(3, shorts.length); i++) {
            const iframe = document.getElementById(`short-iframe-${i}`);
            if (iframe) {
                // Iframe уже загружен с правильными параметрами
                console.log(`✅ Short ${i} предзагружен`);
            }
        }
    }, 100);
    
    // Автовоспроизведение первого видео (только для локальных)
    setTimeout(() => {
        const firstVideo = document.getElementById('short-video-0');
        if (firstVideo) {
            firstVideo.play().catch(e => console.log('Автозапуск заблокирован браузером'));
        }
    }, 100);
    
    // Обработчик скролла для автовоспроизведения
    const existingHandler = shortsWrapper.onscroll;
    if (!existingHandler) {
        shortsWrapper.addEventListener('scroll', handleShortsScroll);
    }
}

// Обработка скролла Shorts (без debounce для мгновенного отклика)
function handleShortsScroll() {
    const shortsWrapper = document.getElementById('shortsWrapper');
    const shortItems = document.querySelectorAll('.short-item');
    
    let activeIndex = -1;
    
    shortItems.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        
        // Если видео в центре экрана (видимо)
        const isVisible = rect.top >= -100 && rect.top < window.innerHeight / 2;
        
        if (isVisible && activeIndex === -1) {
            activeIndex = index;
        }
    });
    
    // Обновляем только если индекс изменился
    if (activeIndex !== -1 && activeIndex !== currentShortIndex) {
        const prevIndex = currentShortIndex;
        currentShortIndex = activeIndex;
        
        // Останавливаем предыдущее видео
        if (prevIndex >= 0) {
            const prevItem = document.querySelector(`.short-item[data-index="${prevIndex}"]`);
            if (prevItem) {
                const prevVideo = prevItem.querySelector('.short-video');
                if (prevVideo) {
                    if (prevVideo.tagName === 'VIDEO') {
                        prevVideo.pause();
                        prevVideo.currentTime = 0;
                    } else if (prevVideo.tagName === 'IFRAME') {
                        const src = prevVideo.src;
                        if (src.includes('autoplay=1')) {
                            prevVideo.src = src.replace('autoplay=1', 'autoplay=0');
                        }
                    }
                }
            }
        }
        
        // Запускаем текущее видео
        const currentItem = document.querySelector(`.short-item[data-index="${activeIndex}"]`);
        if (currentItem) {
            const currentVideo = currentItem.querySelector('.short-video');
            if (currentVideo) {
                if (currentVideo.tagName === 'VIDEO') {
                    currentVideo.play().catch(e => console.log('Автозапуск заблокирован'));
                } else if (currentVideo.tagName === 'IFRAME') {
                    const src = currentVideo.src;
                    if (!src.includes('autoplay=1')) {
                        currentVideo.src = src.replace('autoplay=0', 'autoplay=1');
                    }
                }
            }
        }
        
        // Предзагружаем следующее видео
        if (activeIndex + 1 < shorts.length) {
            const nextIframe = document.getElementById(`short-iframe-${activeIndex + 1}`);
            if (nextIframe && nextIframe.getAttribute('loading') === 'lazy') {
                nextIframe.setAttribute('loading', 'eager');
            }
        }
    }
}

// Навигация по Shorts (оптимизированная)
function scrollShorts(direction) {
    const shortsWrapper = document.getElementById('shortsWrapper');
    const shortHeight = window.innerHeight - 56;
    
    // Останавливаем текущее видео мгновенно
    const currentItem = document.querySelector(`.short-item[data-index="${currentShortIndex}"]`);
    if (currentItem) {
        const currentVideo = currentItem.querySelector('.short-video');
        if (currentVideo) {
            if (currentVideo.tagName === 'VIDEO') {
                currentVideo.pause();
                currentVideo.currentTime = 0;
            } else if (currentVideo.tagName === 'IFRAME') {
                const src = currentVideo.src;
                currentVideo.src = src.replace('autoplay=1', 'autoplay=0');
            }
        }
    }
    
    currentShortIndex += direction;
    
    if (currentShortIndex < 0) {
        currentShortIndex = 0;
    } else if (currentShortIndex >= shorts.length) {
        currentShortIndex = shorts.length - 1;
    }
    
    // Прокручиваем
    shortsWrapper.scrollTo({
        top: currentShortIndex * shortHeight,
        behavior: 'smooth'
    });
    
    // Запускаем новое видео сразу (без задержки)
    const newItem = document.querySelector(`.short-item[data-index="${currentShortIndex}"]`);
    if (newItem) {
        const newVideo = newItem.querySelector('.short-video');
        if (newVideo) {
            if (newVideo.tagName === 'VIDEO') {
                newVideo.play().catch(e => console.log('Автозапуск заблокирован'));
            } else if (newVideo.tagName === 'IFRAME') {
                const src = newVideo.src;
                newVideo.src = src.replace('autoplay=0', 'autoplay=1');
            }
        }
    }
}

// Лайк Short
function likeShort(index) {
    shorts[index].likes++;
    const likesSpan = document.getElementById(`short-likes-${index}`);
    if (likesSpan) {
        likesSpan.textContent = formatNumber(shorts[index].likes);
    }
}

// Текущее видео
let currentVideo = null;
let isLiked = false;
let isSubscribed = false;

// Открытие видео
async function openVideo(video) {
    currentVideo = video;
    isLiked = false;
    
    // Добавляем в историю
    addToHistory(video);
    
    const modal = document.getElementById('videoModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Проверяем, это YouTube видео или локальное
    if (video.youtubeId) {
        // YouTube видео - проверяем, запущен ли локальный сервер
        if (window.location.protocol === 'file:') {
            // Если открыто через file://, показываем кнопку для открытия на YouTube
            const youtubePlayerDiv = document.getElementById('youtubePlayer');
            const videoPlayer = document.getElementById('videoPlayer');
            
            youtubePlayerDiv.style.display = 'block';
            videoPlayer.style.display = 'none';
            
            youtubePlayerDiv.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: #1a1a1a; padding: 40px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                    <h3 style="margin-bottom: 15px; color: #fff;">YouTube видео нельзя встроить локально</h3>
                    <p style="color: #aaa; margin-bottom: 25px; max-width: 500px;">
                        Для встраивания YouTube видео нужен локальный сервер.<br>
                        Или можешь открыть видео прямо на YouTube!
                    </p>
                    <a href="https://www.youtube.com/watch?v=${video.youtubeId}" target="_blank" 
                       style="background: #ff0000; color: #fff; padding: 12px 24px; border-radius: 20px; text-decoration: none; font-weight: 600; display: inline-block; margin-bottom: 15px;">
                        ▶ Открыть на YouTube
                    </a>
                    <div style="margin-top: 20px; padding: 15px; background: #272727; border-radius: 8px; max-width: 500px;">
                        <p style="color: #3ea6ff; font-size: 14px; margin-bottom: 10px;">💡 Как запустить локальный сервер:</p>
                        <code style="display: block; background: #1a1a1a; padding: 8px; border-radius: 4px; color: #4db3ff; font-size: 13px; margin: 5px 0;">
                            python -m http.server 8000
                        </code>
                        <p style="color: #aaa; font-size: 12px; margin-top: 8px;">
                            Затем открой: http://localhost:8000
                        </p>
                    </div>
                </div>
            `;
        } else {
            // Если запущен через сервер, встраиваем видео
            const youtubePlayerDiv = document.getElementById('youtubePlayer');
            const videoPlayer = document.getElementById('videoPlayer');
            
            youtubePlayerDiv.style.display = 'block';
            videoPlayer.style.display = 'none';
            
            // Очищаем контейнер
            youtubePlayerDiv.innerHTML = '';
            
            // Создаем YouTube плеер
            if (youtubePlayer) {
                youtubePlayer.loadVideoById(video.youtubeId);
            } else {
                youtubePlayer = new YT.Player('youtubePlayer', {
                    height: '100%',
                    width: '100%',
                    videoId: video.youtubeId,
                    playerVars: {
                        autoplay: 1,
                        modestbranding: 1,
                        rel: 0
                    }
                });
            }
        }
        
        // Загружаем комментарии с YouTube
        if (window.location.protocol !== 'file:') {
            currentVideoComments = await getVideoComments(video.youtubeId);
        } else {
            currentVideoComments = [];
        }
    } else {
        // Локальное видео
        const youtubePlayerDiv = document.getElementById('youtubePlayer');
        const videoPlayer = document.getElementById('videoPlayer');
        
        youtubePlayerDiv.style.display = 'none';
        videoPlayer.style.display = 'block';
        videoPlayer.src = video.videoUrl;
        videoPlayer.load();
        
        currentVideoComments = [];
    }
    
    document.getElementById('videoTitle').textContent = video.title;
    document.getElementById('videoViews').textContent = `${video.views} просмотров`;
    document.getElementById('videoDate').textContent = video.date;
    document.getElementById('likes').textContent = formatNumber(video.likes);
    document.getElementById('channelName').textContent = video.channel;
    document.getElementById('channelSubs').textContent = video.subs;
    document.getElementById('videoDescription').textContent = video.description;
    
    // Обновляем кнопку подписки
    updateSubscribeButton();
    
    renderComments();
}

// Форматирование чисел
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Закрытие видео
function closeVideo() {
    const modal = document.getElementById('videoModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Останавливаем YouTube плеер
    if (youtubePlayer && youtubePlayer.stopVideo) {
        youtubePlayer.stopVideo();
    }
    
    // Останавливаем локальное видео
    const video = document.getElementById('videoPlayer');
    video.pause();
}

// Отрисовка комментариев
function renderComments() {
    const commentsList = document.getElementById('commentsList');
    
    // Показываем индикатор загрузки
    if (currentVideo && currentVideo.youtubeId && currentVideoComments.length === 0 && window.location.protocol !== 'file:') {
        commentsList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #aaa;">
                <p>🔄 Загрузка комментариев...</p>
            </div>
        `;
        return;
    }
    
    commentsList.innerHTML = '';
    
    // Если есть комментарии с YouTube
    if (currentVideoComments.length > 0) {
        currentVideoComments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment';
            
            commentDiv.innerHTML = `
                <img src="${comment.authorAvatar}" alt="${comment.author}" class="user-avatar" onerror="this.src='https://via.placeholder.com/40'">
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-author">${comment.author}</span>
                        <span class="comment-date">${comment.date}</span>
                    </div>
                    <div class="comment-text">${comment.text}</div>
                    <div class="comment-actions">
                        <button>👍 ${comment.likes > 0 ? formatNumber(comment.likes) : ''}</button>
                        <button>👎</button>
                        <button>Ответить</button>
                    </div>
                </div>
            `;
            
            commentsList.appendChild(commentDiv);
        });
    } else {
        // Показываем сообщение если нет комментариев
        commentsList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #aaa;">
                <p>💬 Комментарии недоступны</p>
                <p style="font-size: 14px; margin-top: 10px;">Для YouTube видео нужен API ключ</p>
            </div>
        `;
    }
}

// Функция поиска
async function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.toLowerCase().trim();
    
    if (query === '') {
        renderVideos();
        return;
    }
    
    const videoGrid = document.getElementById('videoGrid');
    videoGrid.innerHTML = '<p style="color: #aaa; text-align: center; padding: 40px; grid-column: 1/-1;">🔍 Поиск видео...</p>';
    
    // Поиск на YouTube
    const youtubeResults = await searchYouTube(query);
    
    if (youtubeResults && youtubeResults.length > 0) {
        const youtubeVideos = [];
        
        for (const item of youtubeResults) {
            const videoDetails = await getVideoDetails(item.id.videoId);
            
            if (videoDetails) {
                youtubeVideos.push({
                    id: item.id.videoId,
                    youtubeId: item.id.videoId,
                    title: item.snippet.title,
                    channel: item.snippet.channelTitle,
                    channelThumbnail: item.snippet.thumbnails.default.url,
                    views: formatViews(videoDetails.statistics.viewCount),
                    date: formatDate(item.snippet.publishedAt),
                    duration: 'YouTube',
                    thumbnail: item.snippet.thumbnails.high.url,
                    likes: parseInt(videoDetails.statistics.likeCount || 0),
                    subs: videoDetails.snippet.channelTitle,
                    description: item.snippet.description || 'Нет описания'
                });
            }
        }
        
        renderVideos(youtubeVideos);
    } else {
        // Локальный поиск если YouTube не работает
        const filtered = videos.filter(v => 
            v.title.toLowerCase().includes(query) || 
            v.channel.toLowerCase().includes(query)
        );
        
        if (filtered.length === 0) {
            videoGrid.innerHTML = '<p style="color: #aaa; text-align: center; padding: 40px; grid-column: 1/-1;">❌ Ничего не найдено. Попробуйте другой запрос.</p>';
        } else {
            renderVideos(filtered);
        }
    }
}

// Закрытие модального окна по клику вне его
window.addEventListener('DOMContentLoaded', function() {
    const videoModal = document.getElementById('videoModal');
    if (videoModal) {
        videoModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeVideo();
            }
        });
    }
});

// Меню
document.querySelector('.menu-btn').addEventListener('click', function() {
    const sidebar = document.getElementById('sidebar');
    sidebar.style.transform = sidebar.style.transform === 'translateX(0px)' ? 'translateX(-100%)' : 'translateX(0px)';
});

// Лайк видео
function toggleLike() {
    if (!currentVideo) return;
    
    isLiked = !isLiked;
    const likeBtn = document.querySelector('.action-btn');
    const likesSpan = document.getElementById('likes');
    
    if (isLiked) {
        currentVideo.likes++;
        likeBtn.style.backgroundColor = '#3d3d3d';
        likeBtn.style.color = '#3ea6ff';
        addToLiked(currentVideo);
    } else {
        currentVideo.likes--;
        likeBtn.style.backgroundColor = '#272727';
        likeBtn.style.color = '#fff';
        removeFromLiked(currentVideo);
    }
    
    likesSpan.textContent = formatNumber(currentVideo.likes);
}

// Подписка
function toggleSubscribe() {
    isSubscribed = !isSubscribed;
    updateSubscribeButton();
}

function updateSubscribeButton() {
    const subscribeBtn = document.querySelector('.subscribe-btn');
    if (isSubscribed) {
        subscribeBtn.textContent = 'Вы подписаны';
        subscribeBtn.style.backgroundColor = '#3d3d3d';
    } else {
        subscribeBtn.textContent = 'Подписаться';
        subscribeBtn.style.backgroundColor = '#cc0000';
    }
}

// Добавление комментария
function addComment() {
    const input = document.getElementById('commentInput');
    const text = input.value.trim();
    
    if (text === '') return;
    
    const newComment = {
        author: 'Вы',
        authorAvatar: 'https://via.placeholder.com/40',
        date: 'только что',
        text: text,
        likes: 0
    };
    
    currentVideoComments.unshift(newComment);
    renderComments();
    input.value = '';
}

// Дизлайк
function toggleDislike() {
    alert('Дизлайк добавлен!');
}

// Поделиться
function shareVideo() {
    if (currentVideo) {
        alert(`Поделиться видео: ${currentVideo.title}`);
    }
}

// Сохранить
function saveVideo() {
    if (currentVideo) {
        addToWatchLater(currentVideo);
    }
}



// Инициализация
// Загружаем профиль из localStorage
loadProfile();
// Загружаем популярные видео при старте
loadTrendingVideos();




// Инициализация при загрузке страницы
// Загружаем популярные видео при старте
loadTrendingVideos();

// Обработчики после загрузки DOM
window.addEventListener('DOMContentLoaded', function() {
    // Меню
    const menuBtn = document.querySelector('.menu-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', function() {
            const sidebar = document.getElementById('sidebar');
            if (sidebar.style.transform === 'translateX(-100%)') {
                sidebar.style.transform = 'translateX(0px)';
            } else {
                sidebar.style.transform = 'translateX(-100%)';
            }
        });
    }
    
    // Поиск
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            performSearch();
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Показываем подсказку при фокусе
        searchInput.addEventListener('focus', function() {
            const hint = document.getElementById('searchHint');
            if (hint) {
                hint.style.display = 'block';
                setTimeout(() => {
                    hint.style.display = 'none';
                }, 3000);
            }
        });
    }
    
    // Категории
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.textContent.trim();
            filterByCategory(category);
        });
    });
    
    // Навигация в сайдбаре
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            if (page) {
                switchPage(page);
            } else {
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // Кнопки в хедере
    const iconBtns = document.querySelectorAll('.icon-btn');
    iconBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const btnText = this.textContent;
            if (btnText === '📹') {
                alert('Загрузить видео');
            } else if (btnText === '🔔') {
                alert('Уведомления');
            }
        });
    });
    
    const userBtn = document.querySelector('.user-btn');
    if (userBtn) {
        userBtn.addEventListener('click', function() {
            switchPage('profile');
        });
    }
    
    // Комментарии Enter
    const commentInput = document.getElementById('commentInput');
    if (commentInput) {
        commentInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addComment();
            }
        });
    }
    
    console.log('✅ Mirtube загружен успешно!');
    console.log('🔄 Загрузка популярных видео с YouTube...');
    console.log('💡 Для работы нужен YouTube API ключ в script.js');
});
