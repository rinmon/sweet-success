// ingredients.js - 材料システム

// 謎めいたヒントデータ - 未解禁材料の表示用
const ingredientHints = {
    flour: {
        hint: "白い粉状の何か...",
        icon: "❓",
        color: "#f5f5dc"
    },
    sugar: {
        hint: "甘い結晶のようなもの...",
        icon: "✨",
        color: "#ffffff"
    },
    butter: {
        hint: "滑らかで黄色い材料...",
        icon: "🔥",
        color: "#ffec8b"
    },
    chocolate: {
        hint: "茶色で甜く溶ける何か...",
        icon: "🍫",
        color: "#8b4513"
    },
    almond: {
        hint: "パリッとした食感のナッツ系...",
        icon: "🌰",
        color: "#d2b48c"
    },
    coconut: {
        hint: "南国の香りがする白い花形...",
        icon: "🌴",
        color: "#fffaf0"
    },
    matcha: {
        hint: "鮮やかな緑色の粉末...",
        icon: "🍵",
        color: "#90ee90"
    },
    cinnamon: {
        hint: "スパイシーな茶色の粉...",
        icon: "🌶️",
        color: "#d2691e"
    },
    maple: {
        hint: "樹液から取れる甘い液体...",
        icon: "🍁",
        color: "#cd853f"
    },
    lemon: {
        hint: "酸っぱい黄色い実...",
        icon: "🍋",
        color: "#ffff00"
    }
};

// 材料のデータ
const ingredients = {
    flour: {
        id: "flour",
        name: "小麦粉",
        description: "クッキーの基本材料",
        basePrice: 10,
        amount: 0,
        unlocked: true,
        icon: "🌾"
    },
    sugar: {
        id: "sugar",
        name: "砂糖",
        description: "甘さの源",
        basePrice: 15,
        amount: 0,
        unlocked: true,
        icon: "🧂"
    },
    butter: {
        id: "butter",
        name: "バター",
        description: "コクと風味をアップ",
        basePrice: 25,
        amount: 0,
        unlocked: true,
        icon: "🧈"
    },
    chocolate: {
        id: "chocolate",
        name: "チョコレート",
        description: "みんな大好きチョコチップに",
        basePrice: 30,
        amount: 0,
        unlocked: true,
        icon: "🍫"
    },
    almond: {
        id: "almond",
        name: "アーモンド",
        description: "香ばしさが特徴",
        basePrice: 40,
        amount: 0,
        unlocked: false, // 最初はロック
        unlockPrice: 500, // 解除に必要なクッキー数
        icon: "🥜"
    },
    coconut: {
        id: "coconut",
        name: "ココナッツ",
        description: "南国の風味",
        basePrice: 50,
        amount: 0,
        unlocked: false,
        unlockPrice: 1000,
        icon: "🥥"
    },
    matcha: {
        id: "matcha",
        name: "抹茶",
        description: "和風の味わい",
        basePrice: 60,
        amount: 0,
        unlocked: false,
        unlockPrice: 2000,
        icon: "🍵"
    },
    strawberry: {
        id: "strawberry",
        name: "イチゴ",
        description: "フルーティーな甘さ",
        basePrice: 70,
        amount: 0,
        unlocked: false,
        unlockPrice: 3000,
        icon: "🍓"
    }
};

// 材料の購入
window.buyIngredient = function(ingredientId, amount = 1) {
    const ingredient = ingredients[ingredientId];
    
    if (!ingredient || !ingredient.unlocked) {
        addStatusMessage(`${ingredient ? ingredient.name : '材料'}はまだ解禁されていません！`, 'error', true);
        return false;
    }
    
    const totalCost = ingredient.basePrice * amount;
    
    if (cookieCount < totalCost) {
        addStatusMessage(`${ingredient.name}を購入するのに必要なクッキーが足りません！`, 'error', true);
        return false;
    }
    
    cookieCount -= totalCost;
    ingredient.amount += amount;
    
    addStatusMessage(`${ingredient.name}を${amount}個購入しました！`, 'success', true);
    updateIngredientDisplay();
    updateCookieDisplay();
    updateRecipeDisplay(); // 材料取得後にレシピ表示も更新
    
    // 変更をセーブ
    saveGameData();
    return true;
}

// 材料のロック解除
function unlockIngredient(ingredientId) {
    const ingredient = ingredients[ingredientId];
    
    if (!ingredient || ingredient.unlocked) {
        return false;
    }
    
    if (cookieCount < ingredient.unlockPrice) {
        addStatusMessage(`${ingredient.name}を解禁するのに必要なクッキーが足りません！`, 'error', true);
        return false;
    }
    
    cookieCount -= ingredient.unlockPrice;
    ingredient.unlocked = true;
    
    addStatusMessage(`新しい材料「${ingredient.name}」を解禁しました！`, 'unlock');
    updateIngredientDisplay();
    updateCookieDisplay();
    
    // 変更をセーブ
    saveGameData();
    return true;
}

// 材料リストの表示を更新
function updateIngredientDisplay() {
    const container = document.getElementById('ingredients-container');
    if (!container) return;
    
    let html = '';
    
    // 解禁済みの材料のみ表示
    Object.values(ingredients).forEach(ingredient => {
        if (ingredient.unlocked) {
            html += `
                <div class="ingredient-item" data-id="${ingredient.id}">
                    <div class="ingredient-icon">${ingredient.icon}</div>
                    <div class="ingredient-info">
                        <h3>${ingredient.name}</h3>
                        <p>${ingredient.description}</p>
                        <p>所持: <span class="ingredient-amount">${ingredient.amount}</span>個</p>
                    </div>
                    <button class="buy-ingredient-btn" onclick="buyIngredient('${ingredient.id}')">
                        購入 (${ingredient.basePrice} クッキー)
                    </button>
                </div>
            `;
        } else if (ingredient.unlockPrice && cookieCount >= ingredient.unlockPrice * 0.5) {
            // ロックされているが、解禁条件の半分を達成している場合はヒントを表示
            html += `
                <div class="ingredient-item locked" data-id="${ingredient.id}">
                    <div class="ingredient-icon">?</div>
                    <div class="ingredient-info">
                        <h3>未知の材料</h3>
                        <p>解禁するには ${ingredient.unlockPrice} クッキーが必要です。</p>
                    </div>
                    <button class="unlock-ingredient-btn" onclick="unlockIngredient('${ingredient.id}')">
                        解禁する (${ingredient.unlockPrice} クッキー)
                    </button>
                </div>
            `;
        }
    });
    
    container.innerHTML = html;
    
    // 購入ボタンにイベントリスナーを動的に追加
    setTimeout(() => {
        const buyButtons = document.querySelectorAll('.buy-ingredient-btn');
        buyButtons.forEach(button => {
            const ingredientId = button.closest('.ingredient-item').dataset.id;
            button.onclick = () => buyIngredient(ingredientId);
        });
        
        const unlockButtons = document.querySelectorAll('.unlock-ingredient-btn');
        unlockButtons.forEach(button => {
            const ingredientId = button.closest('.ingredient-item').dataset.id;
            button.onclick = () => unlockIngredient(ingredientId);
        });
    }, 100);
}

// 材料の確認
function checkIngredients() {
    // クッキー総数に応じて材料の解禁状況をチェック
    Object.values(ingredients).forEach(ingredient => {
        if (!ingredient.unlocked && ingredient.unlockPrice && cookieCount >= ingredient.unlockPrice * 0.5) {
            // 解禁条件の半分を達成した場合は表示を更新
            updateIngredientDisplay();
        }
    });
}
