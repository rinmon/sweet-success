// player.js - プレイヤーデータと継続ログイン管理

// プレイヤーデータ管理
const player = {
    // プレイヤー基本情報
    name: "プレイヤー",
    level: 1,
    experience: 0,
    experienceToNextLevel: 100,
    
    // ログイン情報
    firstLogin: null,
    lastLogin: null,
    loginStreak: 0,
    totalLogins: 0,
    
    // 実績情報
    achievements: {},
    
    // ゲーム内日時
    gameTime: {
        day: 1,
        week: 1,
        month: 1,
        year: 1,
        dayOfWeek: 1, // 1=月曜日, 7=日曜日
        hourOfDay: 8, // ゲーム内時間 (8時スタート)
    },
    
    // ゲーム内時間の進行速度(実時間1秒で何分進むか)
    timeScale: 10, // 1秒で10分進む（1時間は6秒）
    
    // 初期化
    init() {
        this.loadData();
        this.checkLogin();
        this.startGameClock();
        
        // UIの初期更新
        this.updatePlayerDisplay();
    },
    
    // ログイン状態の確認と報酬処理
    checkLogin() {
        const now = new Date();
        const today = now.toISOString().split('T')[0]; // YYYY-MM-DD形式
        
        // 初回ログインの場合
        if (!this.firstLogin) {
            this.firstLogin = today;
            this.lastLogin = today;
            this.loginStreak = 1;
            this.totalLogins = 1;
            
            // 初回ボーナス
            cookieCount += 500;
            addStatusMessage("🎉 初めてのログインです！ボーナスとして500クッキーを獲得しました！", "success", true);
        } 
        // 前回と同じ日のログインの場合
        else if (this.lastLogin === today) {
            // 既にログイン済みなので何もしない
            return;
        } 
        // 前回が昨日のログインの場合（連続ログイン）
        else {
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            
            if (this.lastLogin === yesterdayStr) {
                // 連続ログイン達成
                this.loginStreak++;
                
                // 連続ログイン報酬（累積型）
                const streakBonus = 50 * this.loginStreak;
                cookieCount += streakBonus;
                
                // 特別ボーナス（7日ごと）
                if (this.loginStreak % 7 === 0) {
                    const weeklyBonus = 1000 * (this.loginStreak / 7);
                    cookieCount += weeklyBonus;
                    addStatusMessage(`🎊 ${this.loginStreak}日連続ログイン達成！特別ボーナス ${formatNumber(weeklyBonus)} クッキー獲得！`, "success", true);
                } else {
                    addStatusMessage(`✨ ${this.loginStreak}日連続ログイン！ボーナス ${formatNumber(streakBonus)} クッキー獲得！`, "success", true);
                }
            } else {
                // 連続ログインが途切れた
                if (this.loginStreak > 1) {
                    addStatusMessage(`連続ログインが途切れました。${this.loginStreak}日間お疲れ様でした！`, "info", true);
                }
                
                // 連続ログインリセット、通常ログインボーナス
                this.loginStreak = 1;
                cookieCount += 100;
                addStatusMessage("ログインボーナス 100クッキー獲得！", "success", true);
            }
            
            this.lastLogin = today;
            this.totalLogins++;
        }
        
        // データ保存
        this.saveData();
    },
    
    // ゲーム内時間の進行処理
    startGameClock() {
        setInterval(() => {
            // ゲーム内分を進める
            this.advanceGameTime(this.timeScale);
            
            // 時刻変更時のイベント発火チェック
            this.checkTimeEvents();
        }, 1000); // 実時間1秒ごとに更新
    },
    
    // ゲーム内時間を進める
    advanceGameTime(minutes) {
        // 時間を進める
        this.gameTime.hourOfDay += minutes / 60;
        
        // 日付の変更処理
        if (this.gameTime.hourOfDay >= 24) {
            this.gameTime.hourOfDay %= 24; // 24時間で一周
            this.gameTime.day++;
            this.gameTime.dayOfWeek = (this.gameTime.dayOfWeek % 7) + 1;
            
            // 週の変更処理
            if (this.gameTime.dayOfWeek === 1) {
                this.gameTime.week++;
            }
            
            // 月の変更処理（簡易的に30日で一月）
            if (this.gameTime.day > 30) {
                this.gameTime.day = 1;
                this.gameTime.month++;
                
                // 年の変更処理
                if (this.gameTime.month > 12) {
                    this.gameTime.month = 1;
                    this.gameTime.year++;
                }
            }
            
            // 日付変更時のイベント
            this.onNewDay();
        }
        
        // 時刻表示の更新
        this.updateTimeDisplay();
    },
    
    // 時刻に応じたイベントをチェック
    checkTimeEvents() {
        const hour = Math.floor(this.gameTime.hourOfDay);
        const dayOfWeek = this.gameTime.dayOfWeek;
        
        // 特定の時間帯での特別イベント
        if (hour === 12 && Math.floor(this.gameTime.hourOfDay * 60) % 60 === 0) {
            // 正午のイベント
            this.triggerNoonEvent();
        }
        
        // 週末特別セール（土日）
        if ((dayOfWeek === 6 || dayOfWeek === 7) && hour === 10 && Math.floor(this.gameTime.hourOfDay * 60) % 60 === 0) {
            this.triggerWeekendSale();
        }
    },
    
    // 正午のイベント
    triggerNoonEvent() {
        // お昼時に注文増加など
        addStatusMessage("🕛 お昼時です！クッキーの需要が増加中...", "info", true);
        // ここに後で実装する注文システムと連携する処理を追加
    },
    
    // 週末セール
    triggerWeekendSale() {
        addStatusMessage("🛍️ 週末セール開催中！材料が10%オフになりました！", "success", true);
        // ここに後で実装する材料割引処理を追加
    },
    
    // 新しい日の始まり処理
    onNewDay() {
        addStatusMessage(`📅 ${this.gameTime.year}年 ${this.gameTime.month}月 ${this.gameTime.day}日になりました`, "info", true);
        
        // 新しい日にちが始まったときのボーナスや処理
        if (this.gameTime.day === 1 && this.gameTime.month === 1) {
            // 新年のボーナス
            cookieCount += 10000;
            addStatusMessage("🎆 新年おめでとう！特別ボーナス 10,000クッキー獲得！", "success", true);
        }
    },
    
    // 時間表示の更新
    updateTimeDisplay() {
        const timeElement = document.getElementById('game-time');
        if (!timeElement) return;
        
        const hour = Math.floor(this.gameTime.hourOfDay);
        const minute = Math.floor((this.gameTime.hourOfDay * 60) % 60);
        
        const weekDayNames = ["月", "火", "水", "木", "金", "土", "日"];
        const weekDayName = weekDayNames[this.gameTime.dayOfWeek - 1];
        
        timeElement.textContent = `${this.gameTime.year}年 ${this.gameTime.month}月 ${this.gameTime.day}日(${weekDayName}) ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    },
    
    // プレイヤー情報表示の更新
    updatePlayerDisplay() {
        const playerNameElement = document.getElementById('player-name');
        const playerLevelElement = document.getElementById('player-level');
        const loginStreakElement = document.getElementById('login-streak');
        
        if (playerNameElement) {
            playerNameElement.textContent = this.name;
        }
        
        if (playerLevelElement) {
            playerLevelElement.textContent = `レベル: ${this.level}`;
        }
        
        if (loginStreakElement) {
            loginStreakElement.textContent = `${this.loginStreak}日連続ログイン`;
        }
    },
    
    // 経験値の追加とレベルアップ処理
    addExperience(amount) {
        this.experience += amount;
        
        // レベルアップチェック
        while (this.experience >= this.experienceToNextLevel) {
            this.experience -= this.experienceToNextLevel;
            this.level++;
            
            // 次のレベルの必要経験値を計算
            this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5);
            
            // レベルアップ時の報酬
            const levelBonus = this.level * 1000;
            cookieCount += levelBonus;
            
            addStatusMessage(`🎖️ レベル${this.level}にアップしました！ボーナス ${formatNumber(levelBonus)} クッキー獲得！`, "success", true);
        }
        
        this.updatePlayerDisplay();
        this.saveData();
    },
    
    // データの保存
    saveData() {
        const saveData = {
            name: this.name,
            level: this.level,
            experience: this.experience,
            experienceToNextLevel: this.experienceToNextLevel,
            firstLogin: this.firstLogin,
            lastLogin: this.lastLogin,
            loginStreak: this.loginStreak,
            totalLogins: this.totalLogins,
            achievements: this.achievements,
            gameTime: this.gameTime
        };
        
        localStorage.setItem('playerData', JSON.stringify(saveData));
    },
    
    // データの読み込み
    loadData() {
        const savedData = localStorage.getItem('playerData');
        if (savedData) {
            const data = JSON.parse(savedData);
            
            // 各プロパティを読み込み
            this.name = data.name || this.name;
            this.level = data.level || this.level;
            this.experience = data.experience || this.experience;
            this.experienceToNextLevel = data.experienceToNextLevel || this.experienceToNextLevel;
            this.firstLogin = data.firstLogin || null;
            this.lastLogin = data.lastLogin || null;
            this.loginStreak = data.loginStreak || 0;
            this.totalLogins = data.totalLogins || 0;
            this.achievements = data.achievements || {};
            
            // ゲーム内時間の復元
            if (data.gameTime) {
                this.gameTime = data.gameTime;
            }
        }
    }
};

// プレイヤー名変更機能
function changePlayerName() {
    const newName = prompt("新しいプレイヤー名を入力してください", player.name);
    if (newName && newName.trim() !== "") {
        player.name = newName.trim();
        player.updatePlayerDisplay();
        player.saveData();
        addStatusMessage(`プレイヤー名を「${player.name}」に変更しました`, "info", true);
    }
}
