/**
 * Sweet Success - ゲームバランス調整
 * 
 * このファイルでは、ゲームバランスに関する定数や設定を管理します。
 * バランス調整が必要な場合は、このファイルを編集してください。
 */

// ゲームバランス設定
const gameBalance = {
    // 経済関連
    economy: {
        // 初期値
        initialCookies: 0,
        initialCookiesPerClick: 1,
        
        // 成長係数
        unitCostIncreaseFactor: 1.15,      // ユニット価格の増加係数
        upgradeCostIncreaseFactor: 1.5,    // アップグレード価格の増加係数
        
        // 報酬と難易度
        orderBaseReward: 100,              // 注文の基本報酬
        orderDifficultyScaling: 1.25,      // 注文の難易度スケーリング
        stockCapacityBaseCost: 50,         // 在庫容量アップグレードの基本コスト
        stockCapacityScaleFactor: 1.6      // 在庫容量アップグレードのコスト増加係数
    },
    
    // 生産調整
    production: {
        // 生産量調整
        baseMultiplier: 1.0,               // 基本生産量の倍率
        clickRewardMultiplier: 1.0,        // クリック報酬の倍率
        cookieProductionMultiplier: 0.8,   // クッキー生産の全体倍率（大きすぎる場合は下げる）
        
        // マイルストーンボーナス調整
        milestoneScaling: [
            { count: 10, bonus: 1.5 },     // レベル1: 1.5倍 (以前: 2倍)
            { count: 25, bonus: 2.0 },     // レベル2: 2倍 (以前: 2.5倍)
            { count: 50, bonus: 2.5 },     // レベル3: 2.5倍 (以前: 3倍)
            { count: 100, bonus: 3.0 },    // レベル4: 3倍 (以前: 5倍)
            { count: 200, bonus: 5.0 },    // レベル5: 5倍 (以前: 10倍)
            { count: 500, bonus: 10.0 }    // レベル6: 10倍 (以前: 20倍)
        ]
    },
    
    // 在庫管理
    inventory: {
        initialCapacity: 10,               // 初期在庫容量
        capacityUpgradeIncrement: 5        // 容量アップグレードごとの増加量
    },
    
    // ゲームバランスをリセット
    resetBalance: function() {
        // 単位テストや開発用
        console.log("ゲームバランスをリセットしました");
    },
    
    // ゲームバランスを適用
    applyBalance: function() {
        // マイルストーンボーナスの適用
        if (typeof milestones !== 'undefined') {
            for (let i = 0; i < milestones.length && i < this.production.milestoneScaling.length; i++) {
                milestones[i].bonus = this.production.milestoneScaling[i].bonus;
            }
        }
        
        // 生産倍率の適用
        if (typeof cpsMultiplier !== 'undefined') {
            cpsMultiplier = this.production.baseMultiplier;
        }
        
        if (typeof allProductionMultiplier !== 'undefined') {
            allProductionMultiplier = this.production.cookieProductionMultiplier;
        }
        
        console.log("ゲームバランスを適用しました");
    }
};

// ページ読み込み時にバランス設定を適用
document.addEventListener('DOMContentLoaded', function() {
    gameBalance.applyBalance();
});
