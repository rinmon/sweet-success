/**
 * orders-enhancer.js - 注文システム拡張モジュール
 * 既存の注文システムを拡張し、UIやインベントリ連携機能を強化
 */

// 注文システム拡張オブジェクト
const orderEnhancer = {
    // 初期化済みフラグ
    initialized: false,
    
    // 初期化
    init: function() {
        if (this.initialized) return;
        
        // インベントリ監視の設定
        this.setupInventoryWatcher();
        
        // 注文タブへのリンク機能を強化
        this.enhanceOrderLinks();
        
        // 注文ボタンの視覚的フィードバック用CSSを追加
        this.addButtonStyles();
        
        // 定期的に注文ボタンの状態を更新
        this.startButtonUpdateTimer();
        
        this.initialized = true;
        console.log('注文システム拡張モジュールが初期化されました');
    },
    
    // インベントリ変更監視の設定
    setupInventoryWatcher: function() {
        // インベントリオブジェクトの存在確認
        if (typeof inventory !== 'undefined' && inventory && inventory.onCookieChange) {
            inventory.onCookieChange(() => {
                // 在庫が変わったら全ての注文ボタンの状態を更新
                this.updateAllOrderButtons();
            });
            this._cookieChangeHandlerSet = true;
            console.log('インベントリ監視が設定されました');
        } else {
            // インベントリシステムがまだロードされていない場合は後で再試行
            console.log('インベントリシステムがまだロードされていません。再試行します...');
            setTimeout(() => this.setupInventoryWatcher(), 1000);
        }
    },
    
    // 注文タブへのリンク機能強化
    enhanceOrderLinks: function() {
        // ステータスメッセージエリアでの注文タブリンククリックを処理
        const statusArea = document.getElementById('status-message-area');
        if (statusArea) {
            statusArea.addEventListener('click', (e) => {
                if (e.target.classList.contains('goto-orders') || 
                    e.target.parentElement.classList.contains('goto-orders')) {
                    e.preventDefault();
                    ui.switchTab('orders-tab');
                }
            });
            console.log('注文タブリンク機能が強化されました');
        }
    },
    
    // 注文完了ボタンのスタイルを追加
    addButtonStyles: function() {
        // すでに同じIDのスタイル要素がある場合は作成しない
        if (document.getElementById('order-button-styles')) return;
        
        const styleElement = document.createElement('style');
        styleElement.id = 'order-button-styles';
        styleElement.textContent = `
            .complete-order:not([disabled]) {
                background-color: #4caf50;
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
                animation: pulse 2s infinite;
            }
            
            .complete-order:not([disabled]):hover {
                background-color: #45a049;
                transform: scale(1.05);
            }
            
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); }
                70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
                100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
            }
            
            .btn-ready-animation {
                animation: readyPulse 1s;
            }
            
            @keyframes readyPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(styleElement);
        console.log('注文ボタンスタイルが追加されました');
    },
    
    // ボタン更新タイマーを開始
    startButtonUpdateTimer: function() {
        // 3秒ごとに全ての注文ボタンの状態を更新
        setInterval(() => this.updateAllOrderButtons(), 3000);
    },
    
    // 全ての注文完了ボタンの状態を更新（在庫があれば有効化）
    updateAllOrderButtons: function() {
        if (!orderSystem || !orderSystem.activeOrders) return;
        
        orderSystem.activeOrders.forEach(order => {
            const completeBtn = document.querySelector(`.complete-order[data-order-id="${order.id}"]`);
            if (completeBtn) {
                const canComplete = this.checkCookieInventory(order.items);
                
                // 以前が無効で今回有効になった場合は視覚的フィードバックを提供
                const wasDisabled = completeBtn.disabled;
                
                completeBtn.disabled = !canComplete;
                
                // 在庫が揃った時に視覚的フィードバックを提供
                if (canComplete && wasDisabled) {
                    completeBtn.classList.add('btn-ready-animation');
                    setTimeout(() => {
                        completeBtn.classList.remove('btn-ready-animation');
                    }, 1000);
                    
                    // 通知を表示
                    if (typeof addStatusMessage === 'function') {
                        const orderCard = completeBtn.closest('.order-card');
                        if (orderCard) {
                            const customerName = orderCard.querySelector('.customer-name');
                            if (customerName) {
                                addStatusMessage(`${customerName.textContent}の注文に必要なクッキーが揃いました！<a href="javascript:void(0)" class="goto-orders">注文タブを開く</a>`, "success", true);
                            }
                        }
                    }
                }
            }
        });
    },
    
    // 注文に必要なクッキーが在庫にあるかチェック
    checkCookieInventory: function(orderItems) {
        // インベントリシステムからクッキーが揃っているかチェック
        if (!inventory || !inventory.cookies) {
            return false;
        }
        
        for (const [recipeId, quantity] of Object.entries(orderItems)) {
            const cookieInStock = inventory.cookies.find(item => item.id === recipeId);
            if (!cookieInStock || cookieInStock.amount < quantity) {
                return false;
            }
        }
        
        return true;
    }
};

// ページロード時に初期化
window.addEventListener('DOMContentLoaded', function() {
    // 少し遅らせて実行（他のスクリプトがロードされた後）
    setTimeout(() => {
        orderEnhancer.init();
    }, 1000);
});
