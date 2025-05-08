/**
 * orders-inventory.js - 注文と在庫システムの連携機能
 * 注文に必要なクッキーの在庫確認と消費処理を提供
 */

const ordersInventory = {
    // クッキー在庫変更監視フラグ
    _cookieChangeHandlerSet: false,
    
    // 初期化
    init: function() {
        // インベントリシステムの監視設定
        this.setupInventoryWatcher();
    },
    
    // インベントリ変更の監視を設定
    setupInventoryWatcher: function() {
        if (inventory && inventory.onCookieChange && !this._cookieChangeHandlerSet) {
            inventory.onCookieChange(() => {
                // 在庫が変わったら注文ボタンの状態を更新
                if (typeof ordersUI !== 'undefined' && ordersUI.updateOrderButtons) {
                    ordersUI.updateOrderButtons();
                }
            });
            this._cookieChangeHandlerSet = true;
        }
    },
    
    // 注文に必要なクッキーが在庫にあるかチェック
    checkCookieInventory: function(orderItems) {
        // インベントリからクッキーが揃っているかチェック
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
    },
    
    // 注文に必要なクッキーを消費
    consumeCookies: function(orderItems) {
        // 実際のインベントリシステムからクッキーを消費
        if (inventory && inventory.cookies) {
            for (const [recipeId, quantity] of Object.entries(orderItems)) {
                inventory.removeCookie(recipeId, quantity);
            }
        }
    }
};
