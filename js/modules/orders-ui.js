/**
 * orders-ui.js - 注文システムのUIコンポーネント
 * 注文の表示、更新、イベント処理を提供
 */

const ordersUI = {
    // 初期化
    init: function() {
        // イベントリスナーのセットアップ
        this.setupEventListeners();
        
        // 初期表示
        this.renderOrders();
    },
    
    // 初期イベントリスナーを設定
    setupEventListeners: function() {
        // 注文の有効期限をチェックする定期タイマー
        setInterval(() => {
            if (typeof ordersCore !== 'undefined') {
                ordersCore.checkOrderTimeouts();
            }
        }, 1000);
        
        // ステータスメッセージエリアでの注文タブリンククリックを処理
        const statusArea = document.getElementById('status-message-area');
        if (statusArea) {
            statusArea.addEventListener('click', (e) => {
                if (e.target.classList.contains('goto-orders') || 
                    e.target.parentElement.classList.contains('goto-orders')) {
                    e.preventDefault();
                    ui.switchTab('orders');
                }
            });
        }
    },
    
    // 注文UI（HTML）の再描画
    renderOrders: function() {
        if (!ordersCore) return;
        
        const ordersContainer = document.getElementById('orders-container');
        
        if (!ordersContainer) {
            return;
        }
        
        // 現在の注文リストをクリア
        ordersContainer.innerHTML = '';
        
        // アクティブな注文がない場合のメッセージ
        if (ordersCore.activeOrders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="no-orders-message">
                    <p>現在アクティブな注文はありません</p>
                    <p>新しい注文を待っています...</p>
                </div>
            `;
            return;
        }
        
        // アクティブな注文を表示
        ordersCore.activeOrders.forEach(order => {
            // 残り時間を計算
            const now = Date.now();
            const remainingTime = Math.max(0, (order.endTime - now) / 1000);
            const minutes = Math.floor(remainingTime / 60);
            const seconds = Math.floor(remainingTime % 60);
            const timeDisplay = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
            
            // 残り時間が少ない場合の警告クラス
            let timeClass = '';
            if (remainingTime < 15) {
                timeClass = 'critical-time';
            } else if (remainingTime < 30) {
                timeClass = 'warning-time';
            }
            
            // 注文アイテムのHTML生成
            let itemsHTML = '';
            for (const [recipeId, quantity] of Object.entries(order.items)) {
                const recipe = recipes[recipeId];
                
                if (recipe) {
                    itemsHTML += `
                        <div class="order-item">
                            <span class="order-item-icon">${recipe.icon || '🍪'}</span>
                            <span class="order-item-name">${recipe.name}</span>
                            <span class="order-item-quantity">×${quantity}</span>
                        </div>
                    `;
                }
            }
            
            // 特別注文用のクラス
            const specialClass = order.special ? 'special-order' : '';
            
            // 完了ボタンの状態を在庫に基づいて設定
            const canComplete = ordersInventory.checkCookieInventory(order.items);
            const buttonClass = canComplete ? 'btn-ready' : '';
            const buttonDisabled = canComplete ? '' : 'disabled';
            
            // 注文カードのHTML
            const orderHTML = `
                <div class="order-card ${specialClass}" data-order-id="${order.id}">
                    <div class="order-header">
                        <div class="customer-name">${order.customerName}</div>
                        <div class="order-time ${timeClass}">${timeDisplay}</div>
                    </div>
                    <div class="order-items">
                        ${itemsHTML}
                    </div>
                    <div class="order-footer">
                        <div class="order-reward">${formatNumber(order.reward)} クッキー</div>
                        <div class="order-actions">
                            <button class="complete-order ${buttonClass}" data-order-id="${order.id}" ${buttonDisabled}>完了</button>
                            <button class="reject-order" data-order-id="${order.id}">キャンセル</button>
                        </div>
                    </div>
                </div>
            `;
            
            // コンテナに注文を追加
            ordersContainer.innerHTML += orderHTML;
        });
        
        // 注文に対するイベントリスナーを設定
        this.setupOrderListeners();
    },
    
    // 注文完了ボタンの状態を更新（在庫があれば有効化）
    updateOrderButtons: function() {
        if (!ordersCore) return;
        
        ordersCore.activeOrders.forEach(order => {
            const completeBtn = document.querySelector(`.complete-order[data-order-id="${order.id}"]`);
            if (completeBtn) {
                const canComplete = ordersInventory.checkCookieInventory(order.items);
                
                // 以前が無効で今回有効になった場合は視覚的フィードバックを提供
                const wasDisabled = completeBtn.disabled;
                
                completeBtn.disabled = !canComplete;
                completeBtn.classList.toggle('btn-ready', canComplete);
                
                // 在庫が揃った時に視覚的フィードバックを提供
                if (canComplete && wasDisabled) {
                    completeBtn.classList.add('btn-ready-animation');
                    setTimeout(() => {
                        completeBtn.classList.remove('btn-ready-animation');
                    }, 1000);
                }
            }
        });
    },
    
    // 注文UI要素のイベントリスナーを設定
    setupOrderListeners: function() {
        if (!ordersCore) return;
        
        // 完了ボタン
        const completeButtons = document.querySelectorAll('.complete-order');
        completeButtons.forEach(button => {
            button.addEventListener('click', event => {
                const orderId = parseInt(event.target.getAttribute('data-order-id'));
                ordersCore.processOrder(orderId, 'complete');
                
                // UIを更新
                this.renderOrders();
            });
        });
        
        // キャンセルボタン
        const rejectButtons = document.querySelectorAll('.reject-order');
        rejectButtons.forEach(button => {
            button.addEventListener('click', event => {
                const orderId = parseInt(event.target.getAttribute('data-order-id'));
                ordersCore.processOrder(orderId, 'reject');
                
                // UIを更新
                this.renderOrders();
            });
        });
    },
    
    // 袋詰めアニメーションを再生
    playPackagingAnimation: function(order) {
        // 既存のアニメーション領域を取得
        const animationArea = document.getElementById('animation-area');
        if (!animationArea) return;
        
        // レジのアニメーションを表示
        const cashRegister = document.getElementById('cash-register');
        if (cashRegister) {
            cashRegister.classList.remove('hidden');
            
            // 2秒後に非表示に戻す
            setTimeout(() => {
                cashRegister.classList.add('hidden');
            }, 2000);
        }
        
        // 袋詰めアニメーション用の要素を作成
        const packageAnim = document.createElement('div');
        packageAnim.className = 'packaging-animation';
        
        // 注文内容に応じた視覚効果
        let packageHTML = '<div class="package-box">';
        
        for (const [recipeId, quantity] of Object.entries(order.items)) {
            const recipe = recipes[recipeId];
            if (recipe) {
                packageHTML += `<div class="package-item" data-recipe="${recipeId}">
                    <span class="package-icon">${recipe.icon || '🍪'}</span>
                    <span class="package-quantity">×${quantity}</span>
                </div>`;
            }
        }
        
        packageHTML += '</div>';
        packageHTML += '<div class="package-complete">✓</div>';
        
        packageAnim.innerHTML = packageHTML;
        animationArea.appendChild(packageAnim);
        
        // アニメーション完了後に要素を削除
        setTimeout(() => {
            animationArea.removeChild(packageAnim);
        }, 3000);
    }
};
