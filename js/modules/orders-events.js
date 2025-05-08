/**
 * orders-events.js - 注文システムのイベント処理
 * 注文関連の各種イベントを定義し、モジュール間の連携を提供
 */

const ordersEvents = {
    // 注文作成イベント
    onOrderCreated: function(order) {
        // 注文UIを更新
        if (typeof ordersUI !== 'undefined' && ordersUI.renderOrders) {
            ordersUI.renderOrders();
        }
    },
    
    // 注文完了イベント
    onOrderCompleted: function(order) {
        // 注文UIを更新
        if (typeof ordersUI !== 'undefined' && ordersUI.renderOrders) {
            ordersUI.renderOrders();
        }
    },
    
    // 注文拒否イベント
    onOrderRejected: function(order) {
        // 注文UIを更新
        if (typeof ordersUI !== 'undefined' && ordersUI.renderOrders) {
            ordersUI.renderOrders();
        }
    },
    
    // 注文期限切れイベント
    onOrderExpired: function(order) {
        // 注文UIを更新
        if (typeof ordersUI !== 'undefined' && ordersUI.renderOrders) {
            ordersUI.renderOrders();
        }
    },
    
    // 注文リスト変更イベント
    onOrdersChanged: function() {
        // 注文UIを更新
        if (typeof ordersUI !== 'undefined' && ordersUI.renderOrders) {
            ordersUI.renderOrders();
        }
    }
};
