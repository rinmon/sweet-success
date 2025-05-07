// upgrades.js - アップグレード関連の機能

// アップグレードのデータ
const upgrades = {
    clickUpgrade1: {
        name: "クリック強化 I",
        id: "clickUpgrade1",
        cost: 100,
        purchased: false,
        description: "クリックあたりのクッキーが2倍になります",
        effect: function() {
            cookiesPerClick = 2;
        },
        requirement: function() {
            return cookieCount >= 50; // 50クッキー以上で表示
        }
    },
    clickUpgrade2: {
        name: "クリック強化 II",
        id: "clickUpgrade2",
        cost: 500,
        purchased: false,
        description: "クリックあたりのクッキーが5倍になります",
        effect: function() {
            cookiesPerClick = 5;
        },
        requirement: function() {
            return upgrades.clickUpgrade1.purchased && cookieCount >= 200;
        }
    },
    cursorUpgrade: {
        name: "クリックヘルパー効率化",
        id: "cursorUpgrade",
        cost: 200,
        purchased: false,
        description: "クリックヘルパーの生産量が2倍になります",
        effect: function() {
            units.cursor.cps *= 2;
            cps = calculateTotalCps();
            updateCpsDisplay();
        },
        requirement: function() {
            return units.cursor.count >= 10;
        }
    },
    grandmaUpgrade: {
        name: "おばあちゃんの秘伝レシピ",
        id: "grandmaUpgrade",
        cost: 1000,
        purchased: false,
        description: "おばあちゃんの生産量が2倍になります",
        effect: function() {
            units.grandma.cps *= 2;
            cps = calculateTotalCps();
            updateCpsDisplay();
        },
        requirement: function() {
            return units.grandma.count >= 5;
        }
    },
    globalBoost: {
        name: "グローバル生産効率化",
        id: "globalBoost",
        cost: 5000,
        purchased: false,
        description: "全ユニットの生産量が1.5倍になります",
        effect: function() {
            for (const unitId in units) {
                units[unitId].cps *= 1.5;
            }
            cps = calculateTotalCps();
            updateCpsDisplay();
        },
        requirement: function() {
            return calculateTotalCps() >= 50;
        }
    }
};

// DOM要素
const upgradesContainer = document.getElementById('upgrades-container');

// アップグレードを購入する
function buyUpgrade(upgradeId) {
    const upgrade = upgrades[upgradeId];
    if (!upgrade.purchased && cookieCount >= upgrade.cost) {
        cookieCount -= upgrade.cost;
        upgrade.purchased = true;
        
        // アップグレード購入時のメッセージ
        addStatusMessage(`アップグレード「${upgrade.name}」を購入しました！`, 'purchase');
        
        // レジを表示（購入アニメーション）
        showAnimation('cash-register', upgrade.cost);
        
        upgrade.effect(); // アップグレードの効果を適用
        
        // アップグレードによって異なるメッセージ
        if (upgradeId.includes('click')) {
            setTimeout(() => {
                addStatusMessage("クリックごとのクッキー生産量が増えました！", 'info');
                showAnimation('baker');
            }, 500);
        } else {
            setTimeout(() => {
                addStatusMessage("生産効率が向上しました！", 'info');
                showAnimation('baker');
            }, 500);
        }
        
        updateCookieDisplay();
        renderUpgrades(); // アップグレード表示を更新
    } else if (upgrade.purchased) {
        addStatusMessage("このアップグレードはすでに購入済みです", 'info');
    } else {
        addStatusMessage("クッキーが足りません！", 'info');
    }
}

// アップグレードの表示を更新
function renderUpgrades() {
    upgradesContainer.innerHTML = ''; // 既存のアップグレードをクリア
    for (const upgradeId in upgrades) {
        const upgrade = upgrades[upgradeId];
        
        // 購入済みまたは条件を満たしていないアップグレードはスキップ
        if (upgrade.purchased || !upgrade.requirement()) {
            continue;
        }
        
        const upgradeDiv = document.createElement('div');
        upgradeDiv.classList.add('upgrade-item');

        const button = document.createElement('button');
        button.classList.add('item-button');
        button.id = `upgrade-${upgrade.id}`;
        button.onclick = () => buyUpgrade(upgradeId);

        button.innerHTML = `
            <strong>${upgrade.name}</strong><br>
            価格: ${formatNumber(upgrade.cost)} クッキー<br>
            <span class="details">${upgrade.description}</span>
        `;

        if (cookieCount < upgrade.cost) {
            button.disabled = true;
        }

        upgradeDiv.appendChild(button);
        upgradesContainer.appendChild(upgradeDiv);
    }
}

// アップグレードの購入ボタン状態を更新
function updateUpgradeButtons() {
    for (const upgradeId in upgrades) {
        const upgrade = upgrades[upgradeId];
        const button = document.getElementById(`upgrade-${upgrade.id}`);
        if (button) {
            button.disabled = cookieCount < upgrade.cost;
        }
    }
}

// 新しいアップグレードの表示条件をチェック
function checkNewUpgrades() {
    const visibleUpgrades = document.querySelectorAll('.upgrade-item').length;
    const availableUpgrades = Object.values(upgrades).filter(u => !u.purchased && u.requirement()).length;
    
    if (visibleUpgrades !== availableUpgrades) {
        renderUpgrades();
    }
}
