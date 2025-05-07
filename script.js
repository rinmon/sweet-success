// Game state variables will go here
let cookieCount = 0;
let cookiesPerClick = 1;
let cps = 0; // Cookies Per Second

const units = {
    cursor: {
        name: "クリックヘルパー",
        id: "cursor",
        cost: 10,
        baseCost: 10,
        cps: 0.1,
        count: 0,
        costIncreaseFactor: 1.15,
        description: "自動でクッキーをクリックする小さな手です"
    },
    grandma: {
        name: "おばあちゃん",
        id: "grandma",
        cost: 100,
        baseCost: 100,
        cps: 1,
        count: 0,
        costIncreaseFactor: 1.15,
        description: "おいしいクッキーを焼きます"
    },
    factory: {
        name: "工場",
        id: "factory",
        cost: 1000,
        baseCost: 1000,
        cps: 10,
        count: 0,
        costIncreaseFactor: 1.15,
        description: "大量のクッキーを生産します"
    }
};

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
        name: "カーソル効率化",
        id: "cursorUpgrade",
        cost: 200,
        purchased: false,
        description: "カーソルの生産量が2倍になります",
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

// DOM element references will go here
const cookieCountDisplay = document.getElementById('cookie-count');
const bigCookieButton = document.getElementById('big-cookie-btn');
const cpsDisplay = document.getElementById('cps-count');
const unitsContainer = document.getElementById('units-container');
const upgradesContainer = document.getElementById('upgrades-container');
const saveButton = document.getElementById('save-game');
const resetButton = document.getElementById('reset-game');
const statusMessages = document.getElementById('status-messages');
const cookieParticles = document.getElementById('cookie-particles');
const animationArea = document.getElementById('animation-area');
const bakerSprite = document.getElementById('baker');
const cashRegisterSprite = document.getElementById('cash-register');

// チュートリアル関連の要素
const helpButton = document.getElementById('help-button');
const tutorialModal = document.getElementById('tutorial-modal');
const closeSpan = document.querySelector('.close');
const closeTutorialButton = document.getElementById('close-tutorial');

// Game logic functions will go here
function formatNumber(num) {
    // 大きな数値を読みやすい形式にフォーマットする
    if (num < 1000) {
        return Math.floor(num);
    } else if (num < 1000000) {
        return (num / 1000).toFixed(1) + 'K';
    } else if (num < 1000000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else {
        return (num / 1000000000).toFixed(1) + 'B';
    }
}

function updateCookieDisplay() {
    cookieCountDisplay.textContent = formatNumber(cookieCount); // フォーマットした数値を表示
}

function updateCpsDisplay() {
    cpsDisplay.textContent = formatNumber(cps * 10) / 10; // CPSは小数点以下1桁まで表示
}

function addStatusMessage(message, type = 'info') {
    const messageElement = document.createElement('div');
    messageElement.className = `status-message ${type}`;
    messageElement.textContent = message;
    
    statusMessages.prepend(messageElement);
    
    // 最大10件のメッセージを保持
    if (statusMessages.children.length > 10) {
        statusMessages.removeChild(statusMessages.lastChild);
    }
}

function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // ランダムな位置オフセット
    const randomOffsetX = Math.random() * 40 - 20;
    const randomOffsetY = Math.random() * 40 - 20;
    
    particle.style.left = (x + randomOffsetX) + 'px';
    particle.style.top = (y + randomOffsetY) + 'px';
    
    // サイズをランダムに
    const size = Math.random() * 8 + 5;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    
    // 色をランダムに（クッキー系の色）
    const colors = ['#d2691e', '#cd853f', '#deb887', '#ffcc80'];
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    // アニメーション
    particle.style.animation = `pop ${Math.random() * 0.5 + 0.5}s forwards`;
    
    cookieParticles.appendChild(particle);
    
    // アニメーション終了後に削除
    setTimeout(() => {
        if (particle.parentNode === cookieParticles) {
            cookieParticles.removeChild(particle);
        }
    }, 1000);
}

function handleCookieClick(event) {
    cookieCount += cookiesPerClick;
    updateCookieDisplay();
    
    // クリック位置に粒子を表示
    const rect = bigCookieButton.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // 複数の粒子を生成
    for (let i = 0; i < 5; i++) {
        createParticle(x, y);
    }
    
    // クリックのたびにステータスメッセージを表示（確率で）
    if (Math.random() < 0.1) { // 10%の確率
        const messages = [
            "おいしいクッキーを焼きました！",
            "さくさくのクッキーができました！",
            "チョコチップがたっぷり！",
            "香ばしい匂いがしてきます",
            "もう一枚焼けました！"
        ];
        addStatusMessage(messages[Math.floor(Math.random() * messages.length)], 'success');
    }
}

function calculateTotalCps() {
    let totalCps = 0;
    for (const unitId in units) {
        totalCps += units[unitId].count * units[unitId].cps;
    }
    return totalCps;
}

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
    alert('ゲームをセーブしました！');
}

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
        updateCookieDisplay();
        updateCpsDisplay();
        renderUnits();
        renderUpgrades();
    }
}

function resetGame() {
    if (confirm('本当にゲームをリセットしますか？進行状況がすべて失われます。')) {
        localStorage.removeItem('cookieClickerSave');
        location.reload(); // ページをリロード
    }
}

function showAnimation(type, amount) {
    // アニメーション要素の選択
    let sprite;
    if (type === 'baker') {
        sprite = bakerSprite;
    } else if (type === 'cash-register') {
        sprite = cashRegisterSprite;
    } else {
        return;
    }
    
    // ランダムな位置を設定
    const x = Math.random() * (window.innerWidth - 100);
    const y = Math.random() * (window.innerHeight - 100);
    
    // 要素を配置
    sprite.style.left = x + 'px';
    sprite.style.top = y + 'px';
    sprite.classList.remove('hidden');
    
    // アニメーション表示
    sprite.style.animation = 'float 2s ease-in-out';
    
    // 金額表示（購入時）
    if (type === 'cash-register' && amount) {
        const costLabel = document.createElement('div');
        costLabel.textContent = `-${formatNumber(amount)}`;
        costLabel.style.position = 'absolute';
        costLabel.style.top = '-20px';
        costLabel.style.left = '15px';
        costLabel.style.color = '#c62828';
        costLabel.style.fontWeight = 'bold';
        costLabel.style.fontSize = '1.2em';
        costLabel.style.textShadow = '0 0 3px white';
        
        sprite.appendChild(costLabel);
        
        // アニメーション終了時にラベルを削除
        setTimeout(() => {
            if (costLabel.parentNode === sprite) {
                sprite.removeChild(costLabel);
            }
        }, 2000);
    }
    
    // アニメーション終了後に非表示
    setTimeout(() => {
        sprite.classList.add('hidden');
        sprite.style.animation = '';
    }, 2000);
}

function buyUnit(unitId) {
    const unit = units[unitId];
    if (cookieCount >= unit.cost) {
        cookieCount -= unit.cost;
        unit.count++;
        
        // 購入時のステータスメッセージ
        addStatusMessage(`${unit.name}を購入しました！現在${unit.count}個所持しています。`, 'purchase');
        
        // レジを表示（購入アニメーション）
        showAnimation('cash-register', unit.cost);
        
        // ユニットによって異なるメッセージ
        if (unit.id === 'cursor') {
            setTimeout(() => {
                addStatusMessage("小さな手がクッキーを自動でクリックし始めました", 'info');
            }, 500);
        } else if (unit.id === 'grandma') {
            setTimeout(() => {
                addStatusMessage("おばあちゃんがクッキーを焼き始めました。良い匂いがします！", 'info');
            }, 500);
        } else if (unit.id === 'factory') {
            setTimeout(() => {
                addStatusMessage("工場が稼働しました。大量生産が始まります！", 'info');
            }, 500);
        }
        
        // 金額などのアップデート
        unit.cost = Math.ceil(unit.baseCost * Math.pow(unit.costIncreaseFactor, unit.count));
        cps = calculateTotalCps();
        updateCookieDisplay();
        updateCpsDisplay();
        renderUnits(); // 購入情報を更新
        renderUpgrades(); // 条件を満たす新しいアップグレードが表示される可能性がある
    } else {
        addStatusMessage("クッキーが足りません！", 'info');
    }
}

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

function renderUnits() {
    unitsContainer.innerHTML = ''; // 既存のユニットをクリア
    for (const unitId in units) {
        const unit = units[unitId];
        const unitDiv = document.createElement('div');
        unitDiv.classList.add('unit-item');

        const button = document.createElement('button');
        button.classList.add('item-button');
        button.id = `buy-${unit.id}`;
        button.onclick = () => buyUnit(unitId);

        button.innerHTML = `
            <strong>${unit.name}</strong> (所持: ${unit.count})<br>
            価格: ${formatNumber(unit.cost)} クッキー<br>
            <span class="details">${unit.description}<br>毎秒 +${unit.cps.toFixed(1)} クッキー</span>
        `;

        if (cookieCount < unit.cost) {
            button.disabled = true;
        }

        unitDiv.appendChild(button);
        unitsContainer.appendChild(unitDiv);
    }
}

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

function gameLoop() {
    cookieCount += cps / 10; // CPSをスムーズに加算（1秒間に10回の更新）
    updateCookieDisplay();
    
    // ユニット購入ボタンの有効/無効状態を更新
    for (const unitId in units) {
        const unit = units[unitId];
        const button = document.getElementById(`buy-${unit.id}`);
        if (button) {
            button.disabled = cookieCount < unit.cost;
        }
    }
    
    // アップグレード購入ボタンの有効/無効状態を更新
    for (const upgradeId in upgrades) {
        const upgrade = upgrades[upgradeId];
        const button = document.getElementById(`upgrade-${upgrade.id}`);
        if (button) {
            button.disabled = cookieCount < upgrade.cost;
        }
    }
    
    // 新しいアップグレードの条件をチェックし、新しいものがあればレンダリング
    const visibleUpgrades = document.querySelectorAll('.upgrade-item').length;
    const availableUpgrades = Object.values(upgrades).filter(u => !u.purchased && u.requirement()).length;
    
    if (visibleUpgrades !== availableUpgrades) {
        renderUpgrades();
    }
}

// Initialization logic will go here
function initializeGame() {
    // セーブデータを読み込み
    loadGame();
    
    updateCookieDisplay();
    updateCpsDisplay();
    renderUnits();
    renderUpgrades();

    // クリックイベント設定
    if (bigCookieButton) {
        bigCookieButton.addEventListener('click', handleCookieClick);
    }
    
    if (saveButton) {
        saveButton.addEventListener('click', saveGame);
    }
    
    if (resetButton) {
        resetButton.addEventListener('click', resetGame);
    }
    
    // チュートリアル関連のイベントリスナー
    if (helpButton) {
        helpButton.addEventListener('click', () => {
            tutorialModal.style.display = 'block';
        });
    }
    
    if (closeSpan) {
        closeSpan.addEventListener('click', () => {
            tutorialModal.style.display = 'none';
        });
    }
    
    if (closeTutorialButton) {
        closeTutorialButton.addEventListener('click', () => {
            tutorialModal.style.display = 'none';
        });
    }
    
    // モーダル外部をクリックした時に閉じる
    window.addEventListener('click', (event) => {
        if (event.target === tutorialModal) {
            tutorialModal.style.display = 'none';
        }
    });

    // 自動保存を設定（1分ごと）
    setInterval(saveGame, 60000);
    
    // ゲームループを開始（1秒に10回更新）
    setInterval(gameLoop, 100);
    
    // 初めてのプレイヤーにはチュートリアルを表示
    if (!localStorage.getItem('cookieClickerSave')) {
        setTimeout(() => {
            tutorialModal.style.display = 'block';
        }, 1000);
    }
}

console.log("script.js loaded");
initializeGame(); // Start the game
