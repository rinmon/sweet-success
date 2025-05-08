// inventory.js - クッキーインベントリ管理システム

// クッキーインベントリ管理オブジェクト
const cookieInventory = {
    // クッキー種類ごとの在庫
    stock: {},
    
    // 最大保管容量（各クッキー種類ごと）
    maxStockPerType: 50,
    
    // 総保管容量（すべてのクッキー合計）
    maxTotalStock: 200,
    
    // 保管容量のアップグレードレベル
    storageLevel: 1,
    
    // 初期化
    init: function() {
        this.loadInventory();
        this.setupEventListeners();
        this.updateInventoryDisplay();
    },
    
    // クッキーを追加
    addCookies: function(recipeId, amount) {
        if (!recipes[recipeId]) return false;
        
        // 在庫がなければ初期化
        if (!this.stock[recipeId]) {
            this.stock[recipeId] = 0;
        }
        
        // 最大保管容量チェック
        const currentTotal = this.getTotalStock();
        const newTotal = currentTotal + amount;
        
        if (newTotal > this.getMaxTotalStorage()) {
            addStatusMessage('倉庫が一杯です！アップグレードするか在庫を整理してください。', 'error', true);
            return false;
        }
        
        // 種類ごとの最大容量チェック
        if (this.stock[recipeId] + amount > this.getMaxStoragePerType()) {
            addStatusMessage(`${recipes[recipeId].name}の在庫がいっぱいです！`, 'error', true);
            return false;
        }
        
        // 在庫に追加
        this.stock[recipeId] += amount;
        
        // 保存とUI更新
        this.saveInventory();
        this.updateInventoryDisplay();
        
        return true;
    },
    
    // クッキーを消費
    removeCookies: function(recipeId, amount) {
        if (!this.stock[recipeId] || this.stock[recipeId] < amount) {
            return false;
        }
        
        this.stock[recipeId] -= amount;
        
        // 0になったら削除
        if (this.stock[recipeId] <= 0) {
            delete this.stock[recipeId];
        }
        
        // 保存とUI更新
        this.saveInventory();
        this.updateInventoryDisplay();
        
        return true;
    },
    
    // 複数種類のクッキーが十分にあるかチェック
    checkStock: function(items) {
        for (const [recipeId, amount] of Object.entries(items)) {
            if (!this.stock[recipeId] || this.stock[recipeId] < amount) {
                return false;
            }
        }
        return true;
    },
    
    // 複数種類のクッキーを一括消費
    consumeBatch: function(items) {
        // まず在庫チェック
        if (!this.checkStock(items)) {
            return false;
        }
        
        // すべて消費
        for (const [recipeId, amount] of Object.entries(items)) {
            this.removeCookies(recipeId, amount);
        }
        
        return true;
    },
    
    // 在庫総数を取得
    getTotalStock: function() {
        return Object.values(this.stock).reduce((total, amount) => total + amount, 0);
    },
    
    // 現在の最大総保管容量を取得
    getMaxTotalStorage: function() {
        return this.maxTotalStock * this.storageLevel;
    },
    
    // 現在の種類ごとの最大保管容量を取得
    getMaxStoragePerType: function() {
        return this.maxStockPerType * this.storageLevel;
    },
    
    // 保管容量をアップグレード
    upgradeStorage: function() {
        const upgradeCost = this.getStorageUpgradeCost();
        
        if (cookieCount < upgradeCost) {
            addStatusMessage(`保管容量のアップグレードには${formatNumber(upgradeCost)}クッキーが必要です。`, 'error', true);
            return false;
        }
        
        cookieCount -= upgradeCost;
        this.storageLevel++;
        
        addStatusMessage(`保管容量がアップグレードされました！新しい容量: ${formatNumber(this.getMaxTotalStorage())}`, 'success', true);
        
        // 保存とUI更新
        this.saveInventory();
        this.updateInventoryDisplay();
        updateCookieDisplay();
        
        return true;
    },
    
    // 保管容量アップグレードのコスト計算
    getStorageUpgradeCost: function() {
        return 1000 * Math.pow(3, this.storageLevel - 1);
    },
    
    // 在庫情報をLocalStorageに保存
    saveInventory: function() {
        const saveData = {
            stock: this.stock,
            storageLevel: this.storageLevel
        };
        
        localStorage.setItem('cookieInventoryData', JSON.stringify(saveData));
    },
    
    // 在庫情報をLocalStorageから読み込み
    loadInventory: function() {
        const savedData = localStorage.getItem('cookieInventoryData');
        
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                
                if (data.stock) this.stock = data.stock;
                if (data.storageLevel) this.storageLevel = data.storageLevel;
            } catch (e) {
                console.error('インベントリデータの読み込みエラー:', e);
            }
        }
    },
    
    // 在庫表示を更新
    updateInventoryDisplay: function() {
        const container = document.getElementById('cookie-inventory');
        if (!container) return;
        
        // 在庫表示をクリア
        container.innerHTML = '';
        
        // 在庫総数と最大容量を表示
        const totalStockEl = document.createElement('div');
        totalStockEl.className = 'inventory-total';
        
        const totalStock = this.getTotalStock();
        const maxStorage = this.getMaxTotalStorage();
        const percentFull = Math.floor((totalStock / maxStorage) * 100);
        
        totalStockEl.innerHTML = `
            <span>在庫状況: ${totalStock}/${maxStorage} (${percentFull}%)</span>
            <div class="storage-bar">
                <div class="storage-fill" style="width: ${percentFull}%"></div>
            </div>
            <button id="upgrade-storage" class="upgrade-btn">保管容量アップグレード (${formatNumber(this.getStorageUpgradeCost())})</button>
        `;
        
        container.appendChild(totalStockEl);
        
        // 在庫がない場合
        if (Object.keys(this.stock).length === 0) {
            const emptyEl = document.createElement('div');
            emptyEl.className = 'empty-inventory';
            emptyEl.textContent = 'クッキーの在庫がありません。調理してクッキーを作りましょう！';
            container.appendChild(emptyEl);
            return;
        }
        
        // クッキー種類ごとの在庫を表示
        const stockListEl = document.createElement('div');
        stockListEl.className = 'inventory-items';
        
        for (const [recipeId, amount] of Object.entries(this.stock)) {
            const recipe = recipes[recipeId];
            if (!recipe) continue;
            
            const stockItemEl = document.createElement('div');
            stockItemEl.className = 'inventory-item';
            // SVGファイルか絵文字か判断して適切に表示
            const iconContent = recipe.icon.includes('.svg') 
                ? `<img src="${recipe.icon}" alt="${recipe.name}" class="cookie-icon" width="24" height="24">` 
                : recipe.icon || '🍪';
                
            stockItemEl.innerHTML = `
                <div class="item-icon">${iconContent}</div>
                <div class="item-details">
                    <div class="item-name">${recipe.name}</div>
                    <div class="item-amount">${amount}個</div>
                </div>
            `;
            
            stockListEl.appendChild(stockItemEl);
        }
        
        container.appendChild(stockListEl);
        
        // イベントリスナーを設定
        this.setupInventoryListeners();
    },
    
    // 在庫関連のイベントリスナーを設定
    setupInventoryListeners: function() {
        const upgradeBtn = document.getElementById('upgrade-storage');
        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => {
                this.upgradeStorage();
            });
        }
    },
    
    // 初期イベントリスナーを設定
    setupEventListeners: function() {
        // 新しいインベントリタブを表示するために必要な設定があればここで行う
    }
};

// recipes.jsのfinishCooking関数を拡張して在庫に追加する処理
const originalFinishCooking = window.finishCooking;
window.finishCooking = function() {
    const recipe = recipes[activeCooking.recipeId];
    const recipeId = activeCooking.recipeId;
    
    // 元の関数を呼び出す
    originalFinishCooking();
    
    // クッキーを在庫に追加
    if (typeof cookieInventory !== 'undefined') {
        const multiplier = calculateBakingMultiplier();
        const producedCookies = Math.floor(recipe.baseCookies * multiplier);
        
        const added = cookieInventory.addCookies(recipeId, producedCookies);
        
        if (!added) {
            // 在庫に追加できなかった場合は警告
            addStatusMessage('在庫がいっぱいで保存できませんでした！', 'warning', true);
        }
    }
};

// orderSystem.jsとの統合用の関数
if (typeof orderSystem !== 'undefined') {
    // 注文に必要なクッキーが在庫にあるかチェック
    orderSystem.checkCookieInventory = function(orderItems) {
        return cookieInventory.checkStock(orderItems);
    };
    
    // 注文に必要なクッキーを消費
    orderSystem.consumeCookies = function(orderItems) {
        return cookieInventory.consumeBatch(orderItems);
    };
}

// ゲームロード時にインベントリシステムを初期化
window.addEventListener('DOMContentLoaded', function() {
    // 遅延初期化（他のシステムがロードされた後に実行）
    setTimeout(() => {
        if (typeof cookieInventory !== 'undefined') {
            cookieInventory.init();
        }
    }, 1500);
});
