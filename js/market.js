// market.js - マーケットシステム

// マーケットのグローバル変数
let marketCurrency = 0; // 市場コイン
let marketPriceHistory = []; // 価格履歴
const MAX_PRICE_HISTORY = 20; // 履歴の最大数

// 市場の状態
const market = {
    currentPrice: 1.0, // 基本価格（1クッキー = 1コイン）
    trend: 0, // 市場のトレンド (-10 to +10)
    volatility: 0.2, // 価格の変動性
    lastUpdate: Date.now(), // 最後の更新時間
    
    // 市場価格を更新（一定間隔で呼び出し）
    updateMarket() {
        const now = Date.now();
        // 前回の更新から5秒経っていなければスキップ
        if (now - this.lastUpdate < 5000) return;
        
        this.lastUpdate = now;
        
        // トレンドの更新（ランダムウォーク）
        this.trend += (Math.random() - 0.5) * 2; // -1 to +1の変動
        this.trend = Math.max(-10, Math.min(10, this.trend)); // -10〜+10に制限
        
        // 価格変動計算
        const trendFactor = 1 + (this.trend / 50); // トレンドによる要素
        const randomFactor = 1 + ((Math.random() - 0.5) * this.volatility); // ランダム要素
        this.currentPrice *= trendFactor * randomFactor;
        
        // 価格の範囲制限（暴騰・暴落を防止）
        this.currentPrice = Math.max(0.5, Math.min(5.0, this.currentPrice));
        
        // 価格履歴に追加
        addPriceToHistory(this.currentPrice);
        
        // 市場情報の表示更新
        this.updateMarketDisplay();
        
        // トレンドメッセージ
        if (Math.abs(this.trend) > 8) { // 極端なトレンドの場合のみ
            if (this.trend > 8) {
                addStatusMessage("市場が活況です！クッキーの価値が急上昇中！", "market");
            } else if (this.trend < -8) {
                addStatusMessage("市場が急落しています。クッキーの価値が暴落中...", "market");
            }
        }
    },
    
    // 市場表示の更新
    updateMarketDisplay() {
        // 現在価格表示
        const priceDisplay = document.getElementById('cookie-price');
        if (priceDisplay) {
            priceDisplay.textContent = this.currentPrice.toFixed(2);
        }
        
        // トレンド表示
        const trendIndicator = document.getElementById('market-trend');
        if (trendIndicator) {
            if (this.trend > 3) {
                trendIndicator.className = 'trend-up';
                trendIndicator.textContent = '↑↑';
            } else if (this.trend > 0) {
                trendIndicator.className = 'trend-slight-up';
                trendIndicator.textContent = '↑';
            } else if (this.trend < -3) {
                trendIndicator.className = 'trend-down';
                trendIndicator.textContent = '↓↓';
            } else if (this.trend < 0) {
                trendIndicator.className = 'trend-slight-down';
                trendIndicator.textContent = '↓';
            } else {
                trendIndicator.className = 'trend-neutral';
                trendIndicator.textContent = '→';
            }
        }
        
        // 所持コイン表示
        const coinDisplay = document.getElementById('market-coins');
        if (coinDisplay) {
            coinDisplay.textContent = formatNumber(marketCurrency);
        }
        
        // 価格チャートの更新
        updatePriceChart();
        
        // 市場アイテム購入ボタンの更新
        updateMarketItemButtons();
    }
};

// 価格履歴に追加
function addPriceToHistory(price) {
    marketPriceHistory.push({
        price: price,
        time: Date.now()
    });
    
    // 履歴が長すぎる場合は古いものを削除
    if (marketPriceHistory.length > MAX_PRICE_HISTORY) {
        marketPriceHistory.shift();
    }
}

// 価格チャートの更新
function updatePriceChart() {
    const chartContainer = document.getElementById('price-chart');
    if (!chartContainer || marketPriceHistory.length < 2) return;
    
    // チャートの描画領域
    const width = chartContainer.clientWidth;
    const height = chartContainer.clientHeight;
    const padding = 10;
    
    // SVG要素の作成
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    
    // 価格の最大・最小値を取得
    const prices = marketPriceHistory.map(p => p.price);
    const minPrice = Math.min(...prices) * 0.9; // 10%マージン
    const maxPrice = Math.max(...prices) * 1.1; // 10%マージン
    
    // 時間の最小・最大値を取得
    const times = marketPriceHistory.map(p => p.time);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    // ポイントをSVG座標に変換
    const points = marketPriceHistory.map((p, i) => {
        const x = padding + (width - 2 * padding) * (p.time - minTime) / (maxTime - minTime);
        const y = height - padding - (height - 2 * padding) * (p.price - minPrice) / (maxPrice - minPrice);
        return `${x},${y}`;
    }).join(" ");
    
    // 折れ線グラフを描画
    const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    polyline.setAttribute("points", points);
    polyline.setAttribute("fill", "none");
    polyline.setAttribute("stroke", "#8B4513");
    polyline.setAttribute("stroke-width", "2");
    
    svg.appendChild(polyline);
    
    // 既存のチャートを削除してから新しいものを追加
    chartContainer.innerHTML = '';
    chartContainer.appendChild(svg);
}

// 市場アイテム
const marketItems = [
    {
        id: "baker_hat",
        name: "一流シェフの帽子",
        description: "クリック報酬が2倍になります",
        price: 500,
        purchased: false,
        image: "👨‍🍳",
        onPurchase: function() {
            cookiesPerClick *= 2;
            this.purchased = true;
            addStatusMessage("一流シェフの帽子を着用しました！クリックパワーが2倍になります！", "market");
        }
    },
    {
        id: "premium_oven",
        name: "高級オーブン",
        description: "自動生産速度が50%上昇します",
        price: 1000,
        purchased: false,
        image: "🔥",
        onPurchase: function() {
            cpsMultiplier *= 1.5;
            calculateTotalCps();
            updateCpsDisplay();
            this.purchased = true;
            addStatusMessage("高級オーブンを設置しました！自動生産が50%増加します！", "market");
        }
    },
    {
        id: "recipe_book",
        name: "古代のレシピ本",
        description: "新しいレシピをひとつ即座に解禁します",
        price: 300,
        purchased: false,
        image: "📚",
        onPurchase: function() {
            // まだ解禁されていないレシピをひとつ選ぶ
            const lockedRecipes = Object.values(recipes).filter(r => !r.unlocked);
            if (lockedRecipes.length > 0) {
                const randomRecipe = lockedRecipes[Math.floor(Math.random() * lockedRecipes.length)];
                randomRecipe.unlocked = true;
                addStatusMessage(`古代のレシピ本から「${randomRecipe.name}」のレシピを発見しました！`, "discovery");
                updateRecipeDisplay();
            } else {
                addStatusMessage("すべてのレシピを既に発見しています！", "info");
                marketCurrency += this.price; // 購入した金額を返金
            }
            
            // 一度限りの購入なのでリセット
            this.purchased = false;
        }
    },
    {
        id: "ingredient_package",
        name: "材料パッケージ",
        description: "ランダムな材料を10個獲得します",
        price: 200,
        purchased: false,
        image: "📦",
        onPurchase: function() {
            // 解禁済みの材料からランダムに選ぶ
            const availableIngredients = Object.values(ingredients).filter(i => i.unlocked);
            if (availableIngredients.length > 0) {
                const randomIngredient = availableIngredients[Math.floor(Math.random() * availableIngredients.length)];
                randomIngredient.amount += 10;
                addStatusMessage(`材料パッケージから${randomIngredient.name}を10個獲得しました！`, "market");
                updateIngredientDisplay();
            } else {
                addStatusMessage("利用可能な材料がありません！", "error");
                marketCurrency += this.price; // 購入した金額を返金
            }
            
            // 再購入可能
            this.purchased = false;
        }
    },
    {
        id: "golden_spatula",
        name: "金のヘラ",
        description: "調理時間が半分になります",
        price: 2000,
        purchased: false,
        image: "🥄",
        onPurchase: function() {
            // すべてのレシピの調理時間を半分に
            Object.values(recipes).forEach(recipe => {
                recipe.cookingTime = Math.ceil(recipe.cookingTime / 2);
            });
            this.purchased = true;
            addStatusMessage("金のヘラを使うようになりました！調理時間が半分になります！", "market");
        }
    }
];

// クッキーを市場価格で売却
function sellCookies(amount) {
    if (cookieCount < amount) {
        addStatusMessage("売却するクッキーが足りません！", "error");
        return false;
    }
    
    const price = market.currentPrice;
    const revenue = Math.floor(amount * price);
    
    cookieCount -= amount;
    marketCurrency += revenue;
    
    addStatusMessage(`${amount}個のクッキーを売却して${revenue}コインを獲得しました！`, "market");
    
    // 売却は価格に影響する（少し下がる）
    market.trend -= amount / 1000; // 大量売却ほど価格が下がる
    market.updateMarket();
    updateCookieDisplay();
    
    return true;
}

// 市場でアイテムを購入
function buyMarketItem(itemId) {
    const item = marketItems.find(item => item.id === itemId);
    if (!item) return false;
    
    if (item.purchased && !item.id.includes("package") && !item.id.includes("book")) {
        addStatusMessage(`${item.name}は既に購入済みです！`, "error");
        return false;
    }
    
    if (marketCurrency < item.price) {
        addStatusMessage(`${item.name}を購入するコインが足りません！`, "error");
        return false;
    }
    
    marketCurrency -= item.price;
    item.onPurchase(); // 購入効果の発動
    
    market.updateMarketDisplay(); // 表示更新
    
    return true;
}

// 市場アイテム購入ボタンの更新
function updateMarketItemButtons() {
    const itemsContainer = document.getElementById('market-items');
    if (!itemsContainer) return;
    
    // 各アイテムの購入ボタン状態を更新
    marketItems.forEach(item => {
        const button = itemsContainer.querySelector(`[data-item-id="${item.id}"]`);
        if (button) {
            if (item.purchased && !item.id.includes("package") && !item.id.includes("book")) {
                button.disabled = true;
                button.classList.add('purchased');
                button.textContent = '購入済み';
            } else if (marketCurrency < item.price) {
                button.disabled = true;
                button.classList.add('disabled');
                button.classList.remove('purchased');
                button.textContent = `購入 (${item.price} コイン)`;
            } else {
                button.disabled = false;
                button.classList.remove('disabled');
                button.classList.remove('purchased');
                button.textContent = `購入 (${item.price} コイン)`;
            }
        }
    });
}

// 市場アイテムの表示更新
function renderMarketItems() {
    const container = document.getElementById('market-items');
    if (!container) return;
    
    let html = '';
    
    marketItems.forEach(item => {
        const isDisabled = (item.purchased && !item.id.includes("package") && !item.id.includes("book")) || marketCurrency < item.price;
        const buttonClass = item.purchased && !item.id.includes("package") && !item.id.includes("book") ? 'purchased' : 
                            marketCurrency < item.price ? 'disabled' : '';
        const buttonText = item.purchased && !item.id.includes("package") && !item.id.includes("book") ? '購入済み' : `購入 (${item.price} コイン)`;
        
        html += `
            <div class="market-item">
                <div class="market-item-icon">${item.image}</div>
                <div class="market-item-info">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                </div>
                <button class="buy-item-btn ${buttonClass}" 
                        data-item-id="${item.id}" 
                        onclick="buyMarketItem('${item.id}')" 
                        ${isDisabled ? 'disabled' : ''}>
                    ${buttonText}
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}
