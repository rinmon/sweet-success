// storage.js - セーブデータの保存と読み込み

// ゲームデータを保存
function saveGame() {
    const gameData = {
        cookieCount: cookieCount,
        cookiesPerClick: cookiesPerClick,
        cps: cps,
        units: units,
        upgrades: Object.keys(upgrades).reduce((acc, key) => {
            acc[key] = {
                purchased: upgrades[key].purchased
            };
            return acc;
        }, {}),
        ingredients: ingredients,
        // レシピデータを保存（解禁状態と現在のレシピ内容）
        recipesSave: Object.keys(recipes).reduce((acc, key) => {
            acc[key] = {
                unlocked: recipes[key].unlocked,
                content: recipes[key].content
            };
            return acc;
        }, {}),
        // 材料業者データを保存
        suppliers: typeof saveSupplierData === 'function' ? saveSupplierData() : {}
    };
    localStorage.setItem('cookieClickerSave', JSON.stringify(gameData));
    addStatusMessage('ゲームをセーブしました！', 'success');
}

// ゲームデータを読み込み
function loadGame() {
    const savedData = localStorage.getItem('cookieClickerSave');
    if (savedData) {
        const gameData = JSON.parse(savedData);
        cookieCount = gameData.cookieCount || 0;
        cookiesPerClick = gameData.cookiesPerClick || 1;
        
        // ユニットのデータを復元
        for (const unitId in gameData.units) {
            if (units[unitId]) {
                units[unitId].count = gameData.units[unitId].count || 0;
                units[unitId].cost = gameData.units[unitId].cost || units[unitId].baseCost;
            }
        }
        
        // アップグレードの購入状態を復元
        for (const upgradeId in gameData.upgrades) {
            if (upgrades[upgradeId]) {
                upgrades[upgradeId].purchased = gameData.upgrades[upgradeId].purchased || false;
                if (upgrades[upgradeId].purchased) {
                    upgrades[upgradeId].effect(); // 効果を再適用
                }
            }
        }
        
        // 材料データの復元
        if (gameData.ingredients) {
            for (const ingredientId in gameData.ingredients) {
                if (ingredients[ingredientId]) {
                    ingredients[ingredientId].amount = gameData.ingredients[ingredientId].amount || 0;
                    ingredients[ingredientId].unlocked = gameData.ingredients[ingredientId].unlocked || ingredients[ingredientId].unlocked;
                }
            }
        }
        
        // レシピの状態を復元（解禁状態のみ、材料数は元の定義を維持）
        if (gameData.recipesSave) {
            for (const recipeId in gameData.recipesSave) {
                if (recipes[recipeId]) {
                    recipes[recipeId].unlocked = gameData.recipesSave[recipeId].unlocked || recipes[recipeId].unlocked;
                    // 注意: 材料数は元の定義通りに維持する（累積的に増やさない）
                }
            }
        }
        
        // 材料業者データの復元
        if (gameData.suppliers && typeof loadSupplierData === 'function') {
            loadSupplierData(gameData.suppliers);
        }
        
        cps = calculateTotalCps();
        addStatusMessage('セーブデータを読み込みました', 'info');
        return true;
    }
    return false;
}

// ゲームをリセット
function resetGame() {
    if (confirm('本当にゲームをリセットしますか？進行状況がすべて失われます。')) {
        localStorage.removeItem('cookieClickerSave');
        location.reload(); // ページをリロード
    }
}
