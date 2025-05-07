/**
 * Sweet Success - 管理パネル
 * 
 * このファイルは管理者向け設定パネルの機能を提供します。
 * 通常のゲームプレイには影響しません。
 */

const adminPanel = {
    // パネルの状態
    isActive: false,
    isPasswordProtected: true,
    password: "admin123", // 簡易的なパスワード (実際の運用ではより強固な認証を推奨)
    
    // 初期化
    init: function() {
        this.createAdminPanel();
        this.setupEventListeners();
        
        // Ctrl+Shift+A で管理パネルにアクセス
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                adminPanel.togglePanel();
            }
        });
    },
    
    // 管理パネルのHTML作成
    createAdminPanel: function() {
        // トグルボタンを作成
        const adminToggle = document.createElement('button');
        adminToggle.className = 'admin-toggle';
        adminToggle.innerHTML = '⚙️';
        adminToggle.title = '管理パネル (Ctrl+Shift+A)';
        document.body.appendChild(adminToggle);
        
        // 管理パネルを作成
        const adminPanelEl = document.createElement('div');
        adminPanelEl.className = 'admin-panel';
        
        // パネル内容
        adminPanelEl.innerHTML = `
            <div class="admin-header">
                <h2>Sweet Success 管理パネル</h2>
            </div>
            <div class="admin-content">
                <div id="admin-login" style="display: block;">
                    <div class="admin-section">
                        <h3>管理者ログイン</h3>
                        <div class="admin-input-group">
                            <label for="admin-password">パスワード</label>
                            <input type="password" id="admin-password">
                        </div>
                        <button id="admin-login-btn" class="admin-button">ログイン</button>
                        <div id="admin-login-error" class="admin-status error" style="display: none;">
                            パスワードが正しくありません
                        </div>
                    </div>
                </div>
                
                <div id="admin-controls" style="display: none;">
                    <div class="admin-section">
                        <h3>ゲーム状態</h3>
                        <div class="admin-group">
                            <button id="save-game-admin" class="admin-button">ゲーム保存</button>
                            <button id="reset-game-admin" class="admin-button danger">ゲームリセット</button>
                        </div>
                        <div class="admin-input-group">
                            <label for="cookie-count-admin">クッキー数</label>
                            <input type="number" id="cookie-count-admin" min="0">
                        </div>
                        <div class="admin-input-group">
                            <label for="cookies-per-click-admin">クリックあたりの生産量</label>
                            <input type="number" id="cookies-per-click-admin" min="1" step="0.1">
                        </div>
                    </div>
                    
                    <div class="admin-section">
                        <h3>バランス設定</h3>
                        <div class="admin-input-group">
                            <label for="base-multiplier">基本生産量倍率</label>
                            <input type="number" id="base-multiplier" min="0.1" step="0.1">
                        </div>
                        <div class="admin-input-group">
                            <label for="click-reward-multiplier">クリック報酬倍率</label>
                            <input type="number" id="click-reward-multiplier" min="0.1" step="0.1">
                        </div>
                        <div class="admin-input-group">
                            <label for="production-multiplier">生産全体倍率</label>
                            <input type="number" id="production-multiplier" min="0.1" step="0.1">
                        </div>
                    </div>
                    
                    <div class="admin-section">
                        <h3>在庫設定</h3>
                        <div class="admin-input-group">
                            <label for="inventory-capacity">在庫容量</label>
                            <input type="number" id="inventory-capacity" min="1">
                        </div>
                    </div>
                    
                    <div class="admin-section">
                        <h3>マイルストーン設定</h3>
                        <div id="milestone-settings">
                            <!-- マイルストーン設定は動的に生成 -->
                        </div>
                    </div>
                    
                    <div class="admin-section">
                        <h3>アクション</h3>
                        <div class="admin-group">
                            <button id="apply-settings" class="admin-button">設定を適用</button>
                            <button id="reset-settings" class="admin-button">設定をリセット</button>
                        </div>
                        <div id="admin-status" class="admin-status" style="display: none;"></div>
                    </div>
                </div>
            </div>
            <div class="admin-footer">
                <button id="close-admin" class="admin-button">閉じる</button>
            </div>
        `;
        
        document.body.appendChild(adminPanelEl);
    },
    
    // イベントリスナーの設定
    setupEventListeners: function() {
        // トグルボタンのイベント
        document.querySelector('.admin-toggle').addEventListener('click', this.togglePanel.bind(this));
        
        // 閉じるボタンのイベント
        document.getElementById('close-admin').addEventListener('click', this.closePanel.bind(this));
        
        // ログインボタンのイベント
        document.getElementById('admin-login-btn').addEventListener('click', this.login.bind(this));
        
        // パスワード入力フィールドでEnterキー
        document.getElementById('admin-password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.login();
            }
        });
        
        // ゲーム保存
        document.getElementById('save-game-admin').addEventListener('click', () => {
            saveGameData();
            this.showStatus('ゲームを保存しました', 'success');
        });
        
        // ゲームリセット
        document.getElementById('reset-game-admin').addEventListener('click', () => {
            if (confirm('本当にゲームをリセットしますか？すべての進捗が失われます。')) {
                localStorage.removeItem('cookieClickerSave');
                location.reload();
            }
        });
        
        // 設定適用
        document.getElementById('apply-settings').addEventListener('click', this.applySettings.bind(this));
        
        // 設定リセット
        document.getElementById('reset-settings').addEventListener('click', this.resetSettings.bind(this));
    },
    
    // パネルの表示切替
    togglePanel: function() {
        const panel = document.querySelector('.admin-panel');
        this.isActive = !this.isActive;
        
        if (this.isActive) {
            panel.classList.add('active');
            this.loadCurrentSettings();
        } else {
            panel.classList.remove('active');
        }
    },
    
    // パネルを閉じる
    closePanel: function() {
        this.isActive = false;
        document.querySelector('.admin-panel').classList.remove('active');
    },
    
    // 認証
    login: function() {
        const password = document.getElementById('admin-password').value;
        const loginError = document.getElementById('admin-login-error');
        
        if (password === this.password || !this.isPasswordProtected) {
            document.getElementById('admin-login').style.display = 'none';
            document.getElementById('admin-controls').style.display = 'block';
            this.loadCurrentSettings();
            loginError.style.display = 'none';
        } else {
            loginError.style.display = 'block';
        }
    },
    
    // 現在のゲーム設定を読み込み
    loadCurrentSettings: function() {
        // クッキー数とクリック報酬
        document.getElementById('cookie-count-admin').value = cookieCount || 0;
        document.getElementById('cookies-per-click-admin').value = cookiesPerClick || 1;
        
        // バランス設定
        if (typeof gameBalance !== 'undefined') {
            document.getElementById('base-multiplier').value = gameBalance.production.baseMultiplier;
            document.getElementById('click-reward-multiplier').value = gameBalance.production.clickRewardMultiplier;
            document.getElementById('production-multiplier').value = gameBalance.production.cookieProductionMultiplier;
            
            // 在庫設定
            if (typeof cookieInventory !== 'undefined' && cookieInventory.maxCapacity) {
                document.getElementById('inventory-capacity').value = cookieInventory.maxCapacity;
            }
            
            // マイルストーン設定を動的に生成
            this.generateMilestoneSettings();
        }
    },
    
    // マイルストーン設定UI生成
    generateMilestoneSettings: function() {
        if (typeof gameBalance === 'undefined' || !gameBalance.production.milestoneScaling) return;
        
        const container = document.getElementById('milestone-settings');
        let html = '';
        
        gameBalance.production.milestoneScaling.forEach((milestone, index) => {
            html += `
                <div class="admin-input-group">
                    <label for="milestone-${index}">${milestone.count}個マイルストーン倍率</label>
                    <input type="number" id="milestone-${index}" value="${milestone.bonus}" min="1" step="0.1">
                </div>
            `;
        });
        
        container.innerHTML = html;
    },
    
    // 設定を適用
    applySettings: function() {
        // クッキー数とクリック報酬
        cookieCount = parseFloat(document.getElementById('cookie-count-admin').value) || cookieCount;
        cookiesPerClick = parseFloat(document.getElementById('cookies-per-click-admin').value) || cookiesPerClick;
        
        // バランス設定
        if (typeof gameBalance !== 'undefined') {
            // 生産倍率
            gameBalance.production.baseMultiplier = parseFloat(document.getElementById('base-multiplier').value) || 1.0;
            gameBalance.production.clickRewardMultiplier = parseFloat(document.getElementById('click-reward-multiplier').value) || 1.0;
            gameBalance.production.cookieProductionMultiplier = parseFloat(document.getElementById('production-multiplier').value) || 0.8;
            
            // 在庫設定
            if (typeof cookieInventory !== 'undefined') {
                cookieInventory.maxCapacity = parseInt(document.getElementById('inventory-capacity').value) || cookieInventory.maxCapacity;
            }
            
            // マイルストーン設定
            this.updateMilestoneSettings();
            
            // バランス設定を適用
            gameBalance.applyBalance();
        }
        
        // 画面更新
        updateCookieDisplay();
        updateCpsDisplay();
        if (typeof updateIngredientDisplay === 'function') updateIngredientDisplay();
        if (typeof updateRecipeDisplay === 'function') updateRecipeDisplay();
        if (typeof cookieInventory !== 'undefined' && typeof cookieInventory.updateDisplay === 'function') cookieInventory.updateDisplay();
        
        this.showStatus('設定を適用しました', 'success');
    },
    
    // マイルストーン設定を更新
    updateMilestoneSettings: function() {
        if (typeof gameBalance === 'undefined' || !gameBalance.production.milestoneScaling) return;
        
        gameBalance.production.milestoneScaling.forEach((milestone, index) => {
            const value = parseFloat(document.getElementById(`milestone-${index}`).value) || milestone.bonus;
            gameBalance.production.milestoneScaling[index].bonus = value;
        });
    },
    
    // 設定をリセット
    resetSettings: function() {
        if (confirm('設定をデフォルトに戻しますか？')) {
            if (typeof gameBalance !== 'undefined') {
                // デフォルト値に戻す
                gameBalance.production.baseMultiplier = 1.0;
                gameBalance.production.clickRewardMultiplier = 1.0;
                gameBalance.production.cookieProductionMultiplier = 0.8;
                
                gameBalance.production.milestoneScaling = [
                    { count: 10, bonus: 1.5 },
                    { count: 25, bonus: 2.0 },
                    { count: 50, bonus: 2.5 },
                    { count: 100, bonus: 3.0 },
                    { count: 200, bonus: 5.0 },
                    { count: 500, bonus: 10.0 }
                ];
                
                // 画面に反映
                this.loadCurrentSettings();
                
                // 設定適用
                gameBalance.applyBalance();
                
                this.showStatus('設定をリセットしました', 'success');
            }
        }
    },
    
    // ステータスメッセージ表示
    showStatus: function(message, type = 'success') {
        const statusEl = document.getElementById('admin-status');
        statusEl.textContent = message;
        statusEl.className = `admin-status ${type}`;
        statusEl.style.display = 'block';
        
        setTimeout(() => {
            statusEl.style.display = 'none';
        }, 3000);
    }
};

// ページロード時に初期化
document.addEventListener('DOMContentLoaded', function() {
    adminPanel.init();
});
