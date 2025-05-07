// main.js - ゲームのコア機能

// グローバル変数
let cookieCount = 0;
let cookiesPerClick = 1;
let cps = 0; // Cookies Per Second
let cpsMultiplier = 1.0; // CPS全体にかかる倍率
let allProductionMultiplier = 1.0; // 全ての生産にかかる倍率
let cookiesFromClicks = 0; // クリックで稼いだクッキーの数
let cookiesFromUnits = 0; // ユニットで稼いだクッキーの数

// DOM要素の参照
const cookieCountDisplay = document.getElementById('cookie-count');
const bigCookieButton = document.getElementById('big-cookie-btn');
const cpsDisplay = document.getElementById('cps-count');
const statusMessages = document.getElementById('status-messages');
const cookieParticles = document.getElementById('cookie-particles');

// 初期化
function initGame() {
    // セーブデータのロード
    loadGame();
    
    // プレイヤーシステムの初期化
    player.init();
    
    // 統計情報システムの初期化
    if (typeof cookieStats !== 'undefined') {
        cookieStats.init();
    }
    
    // 画面の更新
    updateCookieDisplay();
    updateCpsDisplay();
    renderUnits();
    renderUpgrades();
    updateIngredientDisplay();
    updateRecipeDisplay();
    
    // イベントリスナーの設定
    setupEventListeners();
    
    // ゲームループの開始
    startGameLoop();
    
    // チュートリアルの表示（初回プレイ時）
    if (!localStorage.getItem('cookieClickerSave')) {
        setTimeout(() => {
            document.getElementById('tutorial-modal').style.display = 'block';
        }, 1000);
    }
}

// イベントリスナーの設定
function setupEventListeners() {
    // クッキークリックイベント
    if (bigCookieButton) {
        bigCookieButton.addEventListener('click', handleCookieClick);
    }
    
    // セーブボタン
    const saveButton = document.getElementById('save-game');
    if (saveButton) {
        saveButton.addEventListener('click', saveGame);
    }
    
    // リセットボタン
    const resetButton = document.getElementById('reset-game');
    if (resetButton) {
        resetButton.addEventListener('click', resetGame);
    }
    
    // プレイヤー名変更ボタン
    const changeNameButton = document.getElementById('change-name-btn');
    if (changeNameButton) {
        changeNameButton.addEventListener('click', changePlayerName);
    }
    
    // ヘルプボタンとチュートリアル関連
    setupTutorialListeners();
}

// チュートリアル関連のイベントリスナー
function setupTutorialListeners() {
    const helpButton = document.getElementById('help-button');
    const tutorialModal = document.getElementById('tutorial-modal');
    const closeSpan = document.querySelector('.close');
    const closeTutorialButton = document.getElementById('close-tutorial');
    
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
}

// ゲームループの開始
function startGameLoop() {
    // 毎秒10回の更新（0.1秒ごと）
    setInterval(gameLoop, 100);
    
    // 自動保存（1分ごと）
    setInterval(saveGame, 60000);
}

// ゲームループ
function gameLoop() {
    // CPSによるクッキー自動生産
    const cookiesProduced = (cps * cpsMultiplier * allProductionMultiplier) / 10;
    cookieCount += cookiesProduced;
    cookiesFromUnits += cookiesProduced;
    updateCookieDisplay();
    
    // ユニット購入ボタンの有効/無効状態を更新
    updateUnitButtons();
    
    // アップグレード購入ボタンの有効/無効状態を更新
    updateUpgradeButtons();
    
    // 新しいアップグレードの条件をチェック
    checkNewUpgrades();
    
    // 新しいレシピと材料の解禁チェック
    checkRecipeUnlocks();
    checkIngredients();
    
    // 調理中の進行状況更新（100ミリ秒ごと）
    if (activeCooking && activeCooking.recipeId) {
        updateCookingProgress();
    }
}

// クッキーのクリックハンドラ
function handleCookieClick(event) {
    const clickValue = cookiesPerClick * allProductionMultiplier;
    cookieCount += clickValue;
    cookiesFromClicks += clickValue;
    updateCookieDisplay();
    
    // クリック位置に粒子を表示
    createClickParticles(event);
    
    // 材料のドロップチャンス（低確率）
    if (Math.random() < 0.01) { // 1%の確率
        const availableIngredients = Object.values(ingredients).filter(i => i.unlocked);
        if (availableIngredients.length > 0) {
            const randomIngredient = availableIngredients[Math.floor(Math.random() * availableIngredients.length)];
            randomIngredient.amount += 1;
            addStatusMessage(`ラッキー！クリックして${randomIngredient.name}を1個見つけました！`, 'special');
            updateIngredientDisplay();
        }
    }
    
    // ステータスメッセージの表示（確率で）
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

// クリック時の粒子エフェクト
function createClickParticles(event) {
    const rect = bigCookieButton.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // 複数の粒子を生成
    for (let i = 0; i < 5; i++) {
        createParticle(x, y);
    }
}

// 個々の粒子を作成
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

// 画面表示の更新関数
function updateCookieDisplay() {
    cookieCountDisplay.textContent = formatNumber(cookieCount);
}

function updateCpsDisplay() {
    cpsDisplay.textContent = formatNumber(cps * 10) / 10; // CPSは小数点以下1桁まで表示
}

// 数値のフォーマット（大きな数値を読みやすく）
function formatNumber(num) {
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

// ステータスメッセージを追加
function addStatusMessage(message, type = 'info', autoFade = false) {
    // 同種のメッセージを検索して削除（例：材料購入のエラーなど）
    if (type === 'error') {
        // 砂糖や小麦粉などの材料購入エラーメッセージを検索
        for (let i = 0; i < statusMessages.children.length; i++) {
            const child = statusMessages.children[i];
            if (child.classList.contains('error') && 
                (child.textContent.includes('購入するのに必要なクッキーが足りません') ||
                 message.includes('購入するのに必要なクッキーが足りません'))) {
                statusMessages.removeChild(child);
                break;
            }
        }
        
        // エラーメッセージは自動的に消去
        autoFade = true;
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = `status-message ${type}`;
    if (autoFade) {
        messageElement.classList.add('auto-fade');
    }
    messageElement.textContent = message;
    
    statusMessages.prepend(messageElement);
    
    // 自動消去する場合
    if (autoFade) {
        setTimeout(() => {
            if (messageElement.parentNode === statusMessages) {
                messageElement.style.opacity = '0';
                setTimeout(() => {
                    if (messageElement.parentNode === statusMessages) {
                        statusMessages.removeChild(messageElement);
                    }
                }, 500);
            }
        }, 5000);
    }
    
    // 最大10件のメッセージを保持
    if (statusMessages.children.length > 10) {
        statusMessages.removeChild(statusMessages.lastChild);
    }
}

// 初期化処理（DOMContentLoaded時に実行）
document.addEventListener('DOMContentLoaded', initGame);
