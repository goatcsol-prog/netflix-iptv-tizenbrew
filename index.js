module.exports = {
    init: function() {
        this.channels = [];
        this.categories = {};
        this.currentCategory = 'all';
        this.favorites = JSON.parse(localStorage.getItem('iptv_favorites') || '[]');
        this.recentChannels = JSON.parse(localStorage.getItem('iptv_recent') || '[]');
    },
    
    run: function() {
        this.createUI();
        this.loadSavedPlaylist();
    },
    
    createUI: function() {
        document.body.innerHTML = `
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    background: #141414;
                    color: #fff;
                    font-family: Arial, sans-serif;
                    overflow-x: hidden;
                }
                
                /* Header Styles */
                .header {
                    background: rgba(20,20,20,0.9);
                    padding: 15px 40px;
                    position: fixed;
                    width: 100%;
                    top: 0;
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    gap: 40px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.5);
                }
                
                .logo {
                    font-size: 24px;
                    color: #e50914;
                    font-weight: bold;
                }
                
                .nav-menu {
                    display: flex;
                    gap: 25px;
                }
                
                .nav-item {
                    cursor: pointer;
                    padding: 5px 10px;
                    border-radius: 4px;
                    transition: all 0.3s;
                }
                
                .nav-item:hover {
                    background: rgba(255,255,255,0.1);
                }
                
                .nav-item.active {
                    color: #e50914;
                    background: rgba(229,9,20,0.1);
                }
                
                /* Main Content */
                .main-content {
                    margin-top: 70px;
                    padding: 20px 40px;
                }
                
                /* Upload Section */
                .upload-section {
                    background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
                    padding: 60px;
                    border-radius: 10px;
                    text-align: center;
                    margin-bottom: 40px;
                    border: 2px dashed #444;
                }
                
                .upload-section h2 {
                    font-size: 32px;
                    margin-bottom: 15px;
                }
                
                .upload-section p {
                    font-size: 18px;
                    color: #aaa;
                    margin-bottom: 30px;
                }
                
                .upload-btn {
                    background: #e50914;
                    color: white;
                    padding: 15px 40px;
                    border: none;
                    border-radius: 5px;
                    font-size: 18px;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                
                .upload-btn:hover {
                    background: #f40612;
                    transform: scale(1.05);
                }
                
                /* Channel Grid */
                .section-title {
                    font-size: 24px;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .channel-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                    gap: 20px;
                    margin-bottom: 40px;
                }
                
                .channel-card {
                    background: #1a1a1a;
                    border-radius: 8px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.3s;
                    position: relative;
                }
                
                .channel-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                }
                
                .channel-thumb {
                    width: 100%;
                    height: 130px;
                    background: linear-gradient(45deg, #333, #555);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 48px;
                    position: relative;
                    overflow: hidden;
                }
                
                .channel-thumb::before {
                    content: '📺';
                    opacity: 0.3;
                }
                
                .live-badge {
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    background: #e50914;
                    color: white;
                    padding: 3px 10px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: bold;
                }
                
                .channel-info {
                    padding: 12px;
                }
                
                .channel-name {
                    font-size: 16px;
                    font-weight: 500;
                    margin-bottom: 5px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .channel-category {
                    font-size: 13px;
                    color: #888;
                    text-transform: capitalize;
                }
                
                .favorite-btn {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(0,0,0,0.7);
                    border: none;
                    color: white;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 18px;
                    transition: all 0.3s;
                }
                
                .favorite-btn:hover {
                    background: rgba(0,0,0,0.9);
                    transform: scale(1.1);
                }
                
                .favorite-btn.active {
                    color: #e50914;
                }
                
                /* Player */
                .player-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: #000;
                    z-index: 2000;
                    display: none;
                }
                
                .player-header {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent);
                    padding: 20px 40px;
                    z-index: 10;
                }
                
                .back-btn {
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.2);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                    transition: all 0.3s;
                }
                
                .back-btn:hover {
                    background: rgba(255,255,255,0.2);
                }
                
                .player-title {
                    font-size: 24px;
                    margin-top: 10px;
                }
                
                /* Empty State */
                .empty-state {
                    text-align: center;
                    padding: 80px 20px;
                    color: #666;
                }
                
                .empty-state-icon {
                    font-size: 80px;
                    margin-bottom: 20px;
                    opacity: 0.5;
                }
                
                /* Loading */
                .loading {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                    display: none;
                }
                
                .loading-spinner {
                    width: 50px;
                    height: 50px;
                    border: 4px solid #333;
                    border-top: 4px solid #e50914;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                /* File Input Hidden */
                .file-input {
                    display: none;
                }
            </style>
            
            <div class="header">
                <div class="logo">🎬 NETFLIX IPTV</div>
                <div class="nav-menu">
                    <div class="nav-item active" onclick="app.showCategory('all')">Tümü</div>
                    <div class="nav-item" onclick="app.showCategory('recent')">Son İzlenenler</div>
                    <div class="nav-item" onclick="app.showCategory('favorites')">Favoriler</div>
                    <div class="nav-item" onclick="app.showCategory('sports')">Spor</div>
                    <div class="nav-item" onclick="app.showCategory('movies')">Film</div>
                    <div class="nav-item" onclick="app.showCategory('news')">Haber</div>
                </div>
            </div>
            
            <div class="main-content">
                <div id="uploadSection" class="upload-section">
                    <h2>📺 IPTV Playlist'inizi Yükleyin</h2>
                    <p>USB bellekteki M3U/M3U8 dosyanızı seçin ve izlemeye başlayın</p>
                    <button class="upload-btn" onclick="app.selectFile()">
                        📁 M3U Dosyası Seç
                    </button>
                    <input type="file" id="fileInput" class="file-input" accept=".m3u,.m3u8">
                </div>
                
                <div id="channelContainer"></div>
            </div>
            
            <div id="playerOverlay" class="player-overlay">
                <div class="player-header">
                    <button class="back-btn" onclick="app.closePlayer()">← Geri Dön</button>
                    <div class="player-title" id="playerTitle"></div>
                </div>
                <video id="videoPlayer" style="width: 100%; height: 100%;" controls autoplay></video>
            </div>
            
            <div id="loading" class="loading">
                <div class="loading-spinner"></div>
                <div>Yükleniyor...</div>
            </div>
        `;
        
        // Global erişim için
        window.app = this;
        
        // Event listener
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileSelect(e);
        });
    },
    
    selectFile: function() {
        document.getElementById('fileInput').click();
    },
    
    handleFileSelect: function(event) {
        const file = event.target.files[0];
        if (file && (file.name.endsWith('.m3u') || file.name.endsWith('.m3u8'))) {
            this.showLoading(true);
            const reader = new FileReader();
            reader.onload = (e) => {
                this.parseM3U(e.target.result);
                localStorage.setItem('iptv_playlist', e.target.result);
                this.showLoading(false);
            };
            reader.readAsText(file);
        }
    },
    
    parseM3U: function(content) {
        const lines = content.split('\n');
        this.channels = [];
        this.categories = {
            all: [],
            recent: [],
            favorites: [],
            sports: [],
            movies: [],
            news: [],
            other: []
        };
        
        let currentChannel = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.startsWith('#EXTINF:')) {
                const nameMatch = line.match(/,(.+)$/);
                if (nameMatch) {
                    currentChannel = {
                        name: nameMatch[1].trim(),
                        category: this.detectCategory(nameMatch[1]),
                        favorite: this.favorites.includes(nameMatch[1].trim())
                    };
                }
            } else if (line && !line.startsWith('#') && currentChannel) {
                currentChannel.url = line;
                currentChannel.id = this.generateId(currentChannel.name);
                this.channels.push(currentChannel);
                currentChannel = null;
            }
        }
        
        this.organizeChannels();
        document.getElementById('uploadSection').style.display = 'none';
        this.showCategory('all');
    },
    
    detectCategory: function(name) {
        const lowerName = name.toLowerCase();
        if (lowerName.match(/spor|sport|sports/)) return 'sports';
        if (lowerName.match(/film|movie|sinema|cinema/)) return 'movies';
        if (lowerName.match(/haber|news/)) return 'news';
        return 'other';
    },
    
    organizeChannels: function() {
        this.categories.all = [...this.channels];
        this.categories.favorites = this.channels.filter(ch => ch.favorite);
        this.categories.recent = this.channels.filter(ch => 
            this.recentChannels.includes(ch.id)
        );
        
        this.channels.forEach(channel => {
            const cat = this.categories[channel.category];
            if (cat) cat.push(channel);
        });
    },
    
    showCategory: function(category) {
        this.currentCategory = category;
        
        // Update active nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.textContent.toLowerCase().includes(category) || 
                (category === 'all' && item.textContent === 'Tümü') ||
                (category === 'recent' && item.textContent === 'Son İzlenenler')) {
                item.classList.add('active');
            }
        });
        
        this.displayChannels();
    },
    
    displayChannels: function() {
        const container = document.getElementById('channelContainer');
        const channels = this.categories[this.currentCategory] || [];
        
                if (channels.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📺</div>
                    <h2>Kanal Bulunamadı</h2>
                    <p>${this.currentCategory === 'favorites' ? 'Henüz favori kanal eklemediniz' : 
                         this.currentCategory === 'recent' ? 'Henüz kanal izlemediniz' : 
                         'Bu kategoride kanal yok'}</p>
                </div>
            `;
            return;
        }
        
        let html = `<div class="section-title">
            ${this.getCategoryIcon(this.currentCategory)} 
            ${this.getCategoryTitle(this.currentCategory)} 
            (${channels.length} kanal)
        </div>`;
        
        html += '<div class="channel-grid">';
        
        channels.forEach(channel => {
            html += `
                <div class="channel-card" onclick="app.playChannel('${channel.id}')">
                    <div class="channel-thumb">
                        <div class="live-badge">CANLI</div>
                        <button class="favorite-btn ${channel.favorite ? 'active' : ''}" 
                                onclick="event.stopPropagation(); app.toggleFavorite('${channel.id}')">
                            ${channel.favorite ? '❤️' : '🤍'}
                        </button>
                    </div>
                    <div class="channel-info">
                        <div class="channel-name">${channel.name}</div>
                        <div class="channel-category">${this.getCategoryName(channel.category)}</div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    },
    
    playChannel: function(channelId) {
        const channel = this.channels.find(ch => ch.id === channelId);
        if (!channel) return;
        
        // Add to recent
        this.addToRecent(channelId);
        
        // Show player
        const player = document.getElementById('videoPlayer');
        const overlay = document.getElementById('playerOverlay');
        const title = document.getElementById('playerTitle');
        
        player.src = channel.url;
        title.textContent = channel.name;
        overlay.style.display = 'block';
        
        // Play video
        player.play().catch(error => {
            console.error('Oynatma hatası:', error);
            alert('Kanal oynatılamadı. Lütfen başka bir kanal deneyin.');
            this.closePlayer();
        });
    },
    
    closePlayer: function() {
        const player = document.getElementById('videoPlayer');
        const overlay = document.getElementById('playerOverlay');
        
        player.pause();
        player.src = '';
        overlay.style.display = 'none';
    },
    
    toggleFavorite: function(channelId) {
        const channel = this.channels.find(ch => ch.id === channelId);
        if (!channel) return;
        
        channel.favorite = !channel.favorite;
        
        if (channel.favorite) {
            this.favorites.push(channel.name);
        } else {
            this.favorites = this.favorites.filter(name => name !== channel.name);
        }
        
        localStorage.setItem('iptv_favorites', JSON.stringify(this.favorites));
        this.organizeChannels();
        this.displayChannels();
    },
    
    addToRecent: function(channelId) {
        if (!this.recentChannels.includes(channelId)) {
            this.recentChannels.unshift(channelId);
            if (this.recentChannels.length > 20) {
                this.recentChannels.pop();
            }
            localStorage.setItem('iptv_recent', JSON.stringify(this.recentChannels));
        }
    },
    
    generateId: function(name) {
        return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    },
    
    getCategoryIcon: function(category) {
        const icons = {
            all: '📺',
            recent: '🕐',
            favorites: '❤️',
            sports: '⚽',
            movies: '🎬',
            news: '📰',
            other: '📡'
        };
        return icons[category] || '📺';
    },
    
    getCategoryTitle: function(category) {
        const titles = {
            all: 'Tüm Kanallar',
            recent: 'Son İzlenenler',
            favorites: 'Favoriler',
            sports: 'Spor Kanalları',
            movies: 'Film Kanalları',
            news: 'Haber Kanalları',
            other: 'Diğer Kanallar'
        };
        return titles[category] || 'Kanallar';
    },
    
    getCategoryName: function(category) {
        const names = {
            sports: 'Spor',
            movies: 'Film',
            news: 'Haber',
            other: 'Diğer'
        };
        return names[category] || 'Diğer';
    },
    
    showLoading: function(show) {
        document.getElementById('loading').style.display = show ? 'block' : 'none';
    },
    
    loadSavedPlaylist: function() {
        const savedPlaylist = localStorage.getItem('iptv_playlist');
        if (savedPlaylist) {
            this.parseM3U(savedPlaylist);
            document.getElementById('uploadSection').style.display = 'none';
        }
    },
    
    // Keyboard navigation for TV remote
    setupKeyboardNavigation: function() {
        let focusedIndex = 0;
        const cards = document.querySelectorAll('.channel-card');
        
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('playerOverlay').style.display === 'block') {
                if (e.key === 'Escape' || e.key === 'Back') {
                    this.closePlayer();
                }
                return;
            }
            
            switch(e.key) {
                case 'ArrowUp':
                    focusedIndex = Math.max(0, focusedIndex - 4);
                    break;
                case 'ArrowDown':
                    focusedIndex = Math.min(cards.length - 1, focusedIndex + 4);
                    break;
                case 'ArrowLeft':
                    focusedIndex = Math.max(0, focusedIndex - 1);
                    break;
                case 'ArrowRight':
                    focusedIndex = Math.min(cards.length - 1, focusedIndex + 1);
                    break;
                case 'Enter':
                case 'OK':
                    if (cards[focusedIndex]) {
                        cards[focusedIndex].click();
                    }
                    break;
            }
            
            // Update focus
            cards.forEach((card, index) => {
                if (index === focusedIndex) {
                    card.style.border = '2px solid #e50914';
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    card.style.border = 'none';
                }
            });
        });
    }
};