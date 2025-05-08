// orders-processing.js - 注文処理・在庫・売上・統計
// このファイルには注文の完了・拒否、在庫チェック・消費、売上統計などのロジックをまとめます。

const ordersProcessing = {
    // 注文に必要なクッキーが在庫にあるか、または材料から作成可能かチェック
    checkCookieInventory: function(orderItems, inventory) {
        if (!inventory) {
            return false;
        }

        // クッキーの在庫と材料の在庫両方を考慮する
        for (const [recipeId, quantity] of Object.entries(orderItems)) {
            // クッキー在庫のチェック
            if (inventory.cookies) {
                const cookieInStock = inventory.cookies.find(item => item.id === recipeId);
                if (cookieInStock && cookieInStock.amount >= quantity) {
                    // 在庫が十分にあればOK
                    continue;
                }
            }
            
            // クッキー在庫が不足している場合、材料から作成可能かチェック
            const recipe = recipes[recipeId];
            if (!recipe) {
                return false; // 存在しないレシピ
            }
            
            // 必要な材料があるかチェック
            for (const [ingredientId, ingredientAmount] of Object.entries(recipe.ingredients)) {
                const totalNeeded = ingredientAmount * quantity;
                const available = inventory.ingredients && inventory.ingredients[ingredientId] ? inventory.ingredients[ingredientId].amount : 0;
                
                if (available < totalNeeded) {
                    return false; // 材料不足
                }
            }
        }
        
        return true; // 全ての注文アイテムが利用可能
    },

    // 注文に必要なクッキーを消費（在庫不足の場合は材料から調理）
    consumeCookies: function(orderItems, inventory) {
        for (const [recipeId, quantity] of Object.entries(orderItems)) {
            let remainingNeeded = quantity;
            
            // まず既存の在庫を消費
            if (inventory.cookies) {
                const cookieInStock = inventory.cookies.find(item => item.id === recipeId);
                if (cookieInStock && cookieInStock.amount > 0) {
                    const amountToUse = Math.min(cookieInStock.amount, remainingNeeded);
                    cookieInStock.amount = Math.max(0, cookieInStock.amount - amountToUse);
                    remainingNeeded -= amountToUse;
                }
            }
            
            // 残りが必要な場合は材料から調理
            if (remainingNeeded > 0) {
                const recipe = recipes[recipeId];
                if (!recipe) continue; // レシピが存在しない場合はスキップ
                
                // 材料を消費
                for (const [ingredientId, amountPerUnit] of Object.entries(recipe.ingredients)) {
                    const totalNeeded = amountPerUnit * remainingNeeded;
                    if (ingredients[ingredientId]) {
                        ingredients[ingredientId].amount = Math.max(0, ingredients[ingredientId].amount - totalNeeded);
                    }
                }
                
                // 材料から調理したことをメッセージで通知
                if (typeof addStatusMessage === 'function') {
                    addStatusMessage(`${recipe.name}を${remainingNeeded}個、材料から即席調理しました！`, 'info', true);
                }
            }
        }
        
        // 在庫と材料の変更を通知
        if (inventory.onCookieChange) {
            inventory.onCookieChange();
        }
        
        // 材料表示も更新
        if (typeof updateIngredientDisplay === 'function') {
            updateIngredientDisplay();
        }
    },

    // 注文を処理（完了または拒否）
    processOrder: function(orderSystem, orderId, action, inventory, ui, playSound, addStatusMessage) {
        // 対象の注文を探す
        const orderIndex = orderSystem.activeOrders.findIndex(order => order.id === orderId);
        if (orderIndex === -1) {
            return false;
        }
        const order = orderSystem.activeOrders[orderIndex];

        if (action === 'complete') {
            // 在庫チェック（材料から調理も考慮）
            if (!this.checkCookieInventory(order.items, {
                cookies: inventory.cookies,
                ingredients: ingredients // グローバルの材料データを使用
            })) {
                addStatusMessage('在庫と材料が不足しています。注文を完了できません。', 'error', true);
                orderSystem.updateOrderButtons();
                return false;
            }
            
            // 消費処理（在庫から消費、不足分は材料から調理）
            this.consumeCookies(order.items, {
                cookies: inventory.cookies,
                ingredients: ingredients
            });
            
            // 完了処理
            orderSystem.stats.completed++;
            orderSystem.stats.totalRevenue += order.reward;
            this.updateBestSeller(orderSystem, order.items);
            this.recordSales(order, orderSystem.stats, order.reward);
            orderSystem.activeOrders.splice(orderIndex, 1);
            orderSystem.saveData();
            
            // UI更新
            orderSystem.updateOrderButtons();
            orderSystem.renderOrders();
            addStatusMessage(`${order.customerName}の注文を完了しました！ ${order.reward}クッキー獲得！`, 'success', true);
            playSound('orderComplete');
            
            // アニメーションを再生（実装されていれば）
            if (typeof orderSystem.playPackagingAnimation === 'function') {
                orderSystem.playPackagingAnimation(order);
            }
        } else if (action === 'reject') {
            orderSystem.stats.rejected++;
            addStatusMessage(`${order.customerName}の注文をキャンセルしました。`, "info", true);
            playSound('orderCancel');
            orderSystem.activeOrders.splice(orderIndex, 1);
            orderSystem.saveData();
        }
        return true;
    },

    // ベストセラーレシピの更新
    updateBestSeller: function(orderSystem, orderItems) {
        for (const [recipeId, quantity] of Object.entries(orderItems)) {
            if (!orderSystem.stats.recipeSales) {
                orderSystem.stats.recipeSales = {};
            }
            if (!orderSystem.stats.recipeSales[recipeId]) {
                orderSystem.stats.recipeSales[recipeId] = 0;
            }
            orderSystem.stats.recipeSales[recipeId] += quantity;
            if (orderSystem.stats.recipeSales[recipeId] > orderSystem.stats.bestSellingCount) {
                orderSystem.stats.bestSellingRecipe = recipeId;
                orderSystem.stats.bestSellingCount = orderSystem.stats.recipeSales[recipeId];
            }
        }
    },

    // 売上データを統計システムに記録
    recordSales: function(order, stats, reward) {
        if (typeof cookieStats !== 'undefined' && cookieStats.recordSale) {
            for (const [recipeId, quantity] of Object.entries(order.items)) {
                const recipeRevenue = Math.floor(reward * (quantity / Object.values(order.items).reduce((a, b) => a + b, 0)));
                cookieStats.recordSale(recipeId, quantity, recipeRevenue);
            }
        }
    }
};

export default ordersProcessing;
