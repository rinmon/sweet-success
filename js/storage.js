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
        }, {})
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
