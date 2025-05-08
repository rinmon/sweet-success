// recipes.js - レシピシステム

// レシピデータ
const recipes = {
    plain_cookie: {
        id: "plain_cookie",
        name: "プレーンクッキー",
        description: "基本のクッキー。シンプルな味わい。",
        ingredients: {
            flour: 1,
            sugar: 1,
            butter: 1
        },
        baseValue: 3, // 基本クッキー価値（材料コストより少し高い）
        baseCookies: 3, // 一度に作れるクッキー数
        cookingTime: 5, // 調理時間（秒）
        unlocked: true, // 最初から解禁済み
        icon: "assets/images/plain_cookie.svg"
    },
    chocolate_chip: {
        id: "chocolate_chip",
        name: "チョコチップクッキー",
        description: "チョコの風味が広がる定番クッキー。",
        ingredients: {
            flour: 2,
            sugar: 1,
            butter: 1,
            chocolate: 2
        },
        baseValue: 8,
        baseCookies: 4,
        cookingTime: 8,
        unlocked: false,
        unlockAt: 50, // 50クッキー生産で解禁
        icon: "assets/images/chocolate_chip.svg"
    },
    almond_cookie: {
        id: "almond_cookie",
        name: "アーモンドクッキー",
        description: "香ばしいアーモンドの香りが特徴。",
        ingredients: {
            flour: 2,
            sugar: 2,
            butter: 1,
            almond: 3
        },
        baseValue: 15,
        baseCookies: 5,
        cookingTime: 10,
        unlocked: false,
        unlockAt: 200,
        icon: "assets/images/almond_cookie.svg"
    },
    coconut_cookie: {
        id: "coconut_cookie",
        name: "ココナッツクッキー",
        description: "南国の香りが広がるエキゾチックなクッキー。",
        ingredients: {
            flour: 2,
            sugar: 2,
            butter: 1,
            coconut: 3
        },
        baseValue: 20,
        baseCookies: 6,
        cookingTime: 12,
        unlocked: false,
        unlockAt: 500,
        icon: "assets/images/coconut_cookie.svg"
    },
    matcha_cookie: {
        id: "matcha_cookie",
        name: "抹茶クッキー",
        description: "抹茶の香りと上品な苦みが特徴の和風クッキー。",
        ingredients: {
            flour: 2,
            sugar: 1,
            butter: 1,
            matcha: 2
        },
        baseValue: 25,
        baseCookies: 5,
        cookingTime: 15,
        unlocked: false,
        unlockAt: 1000,
        specialEffect: {
            type: "production",
            multiplier: 1.1,
            duration: 60 // 1分間
        },
        icon: "assets/images/matcha_cookie.svg"
    },
    strawberry_cookie: {
        id: "strawberry_cookie",
        name: "イチゴクッキー",
        description: "甘酸っぱいイチゴの風味が魅力。",
        ingredients: {
            flour: 2,
            sugar: 3,
            butter: 1,
            strawberry: 3
        },
        baseValue: 30,
        baseCookies: 7,
        cookingTime: 18,
        unlocked: false,
        unlockAt: 2000,
        specialEffect: {
            type: "click",
            multiplier: 1.2,
            duration: 90 // 1分30秒
        },
        icon: "assets/images/strawberry_cookie.svg"
    },
    double_chocolate: {
        id: "double_chocolate",
        name: "ダブルチョコレートクッキー",
        description: "チョコ好きにはたまらない贅沢な一品。",
        ingredients: {
            flour: 1,
            sugar: 2,
            butter: 1,
            chocolate: 4
        },
        baseValue: 35,
        baseCookies: 6,
        cookingTime: 20,
        unlocked: false,
        unlockAt: 3000,
        specialEffect: {
            type: "cps",
            multiplier: 1.15,
            duration: 120 // 2分間
        },
        icon: "assets/images/double_chocolate.svg"
    },
    royal_cookie: {
        id: "royal_cookie",
        name: "ロイヤルクッキー",
        description: "全ての材料を使った究極のクッキー。",
        ingredients: {
            flour: 3,
            sugar: 3,
            butter: 2,
            chocolate: 2,
            almond: 2,
            coconut: 2,
            matcha: 1,
            strawberry: 1
        },
        baseValue: 100,
        baseCookies: 10,
        cookingTime: 30,
        unlocked: false,
        unlockAt: 10000,
        specialEffect: {
            type: "all",
            multiplier: 1.5,
            duration: 300 // 5分間
        },
        icon: "assets/images/royal_cookie.svg"
    }
};

// 現在進行中の調理プロセス
let activeCooking = {
    recipeId: null,
    startTime: null,
    endTime: null,
    interval: null
};

// レシピの解禁チェック
function checkRecipeUnlocks() {
    Object.values(recipes).forEach(recipe => {
        if (!recipe.unlocked && recipe.unlockAt && cookieCount >= recipe.unlockAt) {
            recipe.unlocked = true;
            addStatusMessage(`新しいレシピ「${recipe.name}」を発見しました！`, 'discovery');
            updateRecipeDisplay();
        }
    });
}

// レシピで調理を開始
// グローバルスコープに公開するためwindowオブジェクトに追加
window.startCooking = function(recipeId) {
    // 既に調理中の場合は処理しない
    if (activeCooking.recipeId) {
        addStatusMessage("既に調理中です！", 'info');
        return false;
    }
    
    const recipe = recipes[recipeId];
    if (!recipe || !recipe.unlocked) {
        addStatusMessage(`${recipe ? recipe.name : 'レシピ'}はまだ解禁されていません！`, 'error');
        return false;
    }
    
    // 材料チェック
    for (const [ingredientId, amount] of Object.entries(recipe.ingredients)) {
        if (!ingredients[ingredientId] || ingredients[ingredientId].amount < amount) {
            addStatusMessage(`${recipe.name}を作るための${ingredients[ingredientId] ? ingredients[ingredientId].name : '材料'}が足りません！`, 'error');
            updateRecipeDisplay();
            return false;
        }
    }
    
    // 材料を消費
    for (const [ingredientId, amount] of Object.entries(recipe.ingredients)) {
        ingredients[ingredientId].amount -= amount;
    }
    
    updateIngredientDisplay();
    updateRecipeDisplay();
    
    // 調理開始
    const now = Date.now();
    activeCooking.recipeId = recipeId;
    activeCooking.startTime = now;
    activeCooking.endTime = now + (recipe.cookingTime * 1000);
    
    // プログレスバーの更新を開始
    startCookingAnimation(recipe);
    
    // 調理タイマーを設定
    activeCooking.interval = setInterval(updateCookingProgress, 100);
    
    updateRecipeDisplay();
    addStatusMessage(`${recipe.name}の調理を開始しました！`, 'info');
    
    return true;
}

// 調理の進行状況を更新
window.updateCookingProgress = function() {
    if (!activeCooking.recipeId) return;
    
    const recipe = recipes[activeCooking.recipeId];
    const now = Date.now();
    const totalTime = activeCooking.endTime - activeCooking.startTime;
    const elapsedTime = now - activeCooking.startTime;
    const progress = Math.min(elapsedTime / totalTime, 1);
    
    // プログレスバーを更新
    updateCookingProgressBar(progress);
    
    // 調理完了
    if (now >= activeCooking.endTime) {
        clearInterval(activeCooking.interval);
        finishCooking();
    }
}

// 調理完了時の処理
window.finishCooking = function() {
    const recipe = recipes[activeCooking.recipeId];
    const recipeId = activeCooking.recipeId;
    
    // 基本のクッキー生産
    const multiplier = calculateBakingMultiplier(); // スキルやアップグレードによる倍率
    const producedCookies = Math.floor(recipe.baseCookies * multiplier);
    
    cookieCount += producedCookies;
    
    // 特殊効果があれば適用
    if (recipe.specialEffect) {
        applyRecipeEffect(recipe);
    }
    
    // 統計情報に生産記録を追加
    if (typeof recordCookieProduction === 'function') {
        recordCookieProduction(recipeId, producedCookies);
    }
    
    // プレイヤー経験値を追加
    if (typeof player !== 'undefined' && player.addExperience) {
        // 生産数に応じた経験値を追加
        const expGain = Math.ceil(producedCookies / 10); // 10クッキーにつき1EXP
        player.addExperience(expGain);
    }
    
    addStatusMessage(`${recipe.name}が完成しました！${producedCookies}個のクッキーを獲得！`, 'success');
    
    // 調理アニメーション終了
    endCookingAnimation();
    
    // 調理状態をリセット
    activeCooking = {
        recipeId: null,
        startTime: null,
        endTime: null,
        interval: null
    };
    
    updateCookieDisplay();
    updateRecipeDisplay();
    updateIngredientDisplay();
}

// 焼成倍率の計算
function calculateBakingMultiplier() {
    // 基本倍率は1.0
    let multiplier = 1.0;
    
    // アップグレードによる効果を追加
    if (upgrades["better_oven"] && upgrades["better_oven"].purchased) {
        multiplier *= 1.5;
    }
    
    // スキルレベルによる効果（将来的に実装）
    
    return multiplier;
}

// レシピの特殊効果を適用
function applyRecipeEffect(recipe) {
    if (!recipe.specialEffect) return;
    
    const effect = recipe.specialEffect;
    let effectMessage = "";
    
    switch (effect.type) {
        case "click":
            // クリック報酬を一時的に増加
            const originalClickPower = cookiesPerClick;
            cookiesPerClick *= effect.multiplier;
            setTimeout(() => {
                cookiesPerClick = originalClickPower;
                addStatusMessage(`${recipe.name}の効果が切れました。`, 'info');
            }, effect.duration * 1000);
            effectMessage = `クリック報酬が${Math.round((effect.multiplier - 1) * 100)}%増加！`;
            break;
            
        case "production":
            // 自動生産を一時的に増加
            const originalMultipliers = {};
            for (const unitId in units) {
                originalMultipliers[unitId] = units[unitId].productionMultiplier || 1;
                units[unitId].productionMultiplier = (units[unitId].productionMultiplier || 1) * effect.multiplier;
            }
            
            setTimeout(() => {
                for (const unitId in units) {
                    units[unitId].productionMultiplier = originalMultipliers[unitId];
                }
                calculateTotalCps();
                updateCPSDisplay();
                addStatusMessage(`${recipe.name}の効果が切れました。`, 'info');
            }, effect.duration * 1000);
            effectMessage = `生産量が${Math.round((effect.multiplier - 1) * 100)}%増加！`;
            break;
            
        case "cps":
            // CPS全体を一時的に増加
            const originalCpsMultiplier = cpsMultiplier || 1;
            cpsMultiplier = (cpsMultiplier || 1) * effect.multiplier;
            calculateTotalCps();
            updateCPSDisplay();
            
            setTimeout(() => {
                cpsMultiplier = originalCpsMultiplier;
                calculateTotalCps();
                updateCPSDisplay();
                addStatusMessage(`${recipe.name}の効果が切れました。`, 'info');
            }, effect.duration * 1000);
            effectMessage = `CPS全体が${Math.round((effect.multiplier - 1) * 100)}%増加！`;
            break;
            
        case "all":
            // すべての生産を一時的に増加
            const originalAllMultiplier = allProductionMultiplier || 1;
            allProductionMultiplier = (allProductionMultiplier || 1) * effect.multiplier;
            cookiesPerClick *= effect.multiplier;
            calculateTotalCps();
            updateCPSDisplay();
            
            setTimeout(() => {
                allProductionMultiplier = originalAllMultiplier;
                cookiesPerClick /= effect.multiplier;
                calculateTotalCps();
                updateCPSDisplay();
                addStatusMessage(`${recipe.name}の効果が切れました。`, 'info');
            }, effect.duration * 1000);
            effectMessage = `すべての生産が${Math.round((effect.multiplier - 1) * 100)}%増加！`;
            break;
    }
    
    if (effectMessage) {
        addStatusMessage(`${recipe.name}の特殊効果発動！${effectMessage}（${effect.duration}秒間）`, 'special');
    }
}

// 調理アニメーションの開始
function startCookingAnimation(recipe) {
    const cookingContainer = document.getElementById('cooking-container');
    if (!cookingContainer) return;
    
    cookingContainer.innerHTML = `
        <div class="cooking-progress">
            <h3>${recipe.name}を調理中...</h3>
            <div class="progress-bar-container">
                <div class="progress-bar" id="cooking-progress-bar"></div>
            </div>
            <p>残り時間: <span id="cooking-time-left">${recipe.cookingTime}</span>秒</p>
        </div>
    `;
    
    cookingContainer.classList.remove('hidden');
    
    // ベイキングアニメーション表示
    const baker = document.getElementById('baker');
    if (baker) {
        baker.classList.remove('hidden');
        baker.classList.add('baking');
    }
}

// 調理プログレスバーの更新
function updateCookingProgressBar(progress) {
    const progressBar = document.getElementById('cooking-progress-bar');
    const timeLeft = document.getElementById('cooking-time-left');
    
    if (progressBar) {
        progressBar.style.width = `${progress * 100}%`;
    }
    
    if (timeLeft && activeCooking.endTime) {
        const secondsLeft = Math.ceil((activeCooking.endTime - Date.now()) / 1000);
        timeLeft.textContent = secondsLeft;
    }
}

// 調理アニメーションの終了
function endCookingAnimation() {
    const cookingContainer = document.getElementById('cooking-container');
    if (cookingContainer) {
        cookingContainer.classList.add('hidden');
    }
    
    // ベイキングアニメーション終了
    const baker = document.getElementById('baker');
    if (baker) {
        baker.classList.remove('baking');
        baker.classList.add('hidden');
    }
}

// レシピ表示の更新
function updateRecipeDisplay() {
    const container = document.getElementById('recipes-container');
    if (!container) return;

    let html = '';

    // 調理中の状態チェック
    const isCooking = activeCooking.recipeId !== null;

    // 解禁済みのレシピのみ表示
    Object.values(recipes).forEach(recipe => {
        if (recipe.unlocked) {
            // 材料リストを生成
            let ingredientsHtml = '';
            let allIngredientsAvailable = true;

            for (const [ingredientId, amount] of Object.entries(recipe.ingredients)) {
                const ingredient = ingredients[ingredientId];

                // 追加: 材料が存在しない場合のフォールバック
                const hasIngredient = ingredient && ingredient.unlocked;
                const currentAmount = hasIngredient ? ingredient.amount : 0;
                const isEnough = currentAmount >= amount;

                if (!isEnough) {
                    allIngredientsAvailable = false;
                }

                // 未解禁材料の場合、ヒントを表示
                let iconDisplay = hasIngredient ? ingredient.icon : (ingredientHints[ingredientId] ? ingredientHints[ingredientId].icon : '❓');
                let nameDisplay = hasIngredient ? ingredient.name : (ingredientHints[ingredientId] ? ingredientHints[ingredientId].hint : '謎の材料...');
                
                // 色の適用をやめてCSSで一元管理することで可読性を確保
                let colorStyle = ''; // 色はCSSでスタイル付けする
                
                // 未解禁材料はキラキラエフェクト付き
                let mysteryClass = hasIngredient ? '' : 'mystery-ingredient';
                
                // 謎の材料のアイコンにデータ属性を追加(スタイルカスタマイズ用)
                let dataAttr = hasIngredient ? '' : (ingredientHints[ingredientId] ? `data-ingredient="${ingredientId}"` : '');
                
                ingredientsHtml += `
                    <div class="recipe-ingredient ${isEnough ? '' : 'missing'} ${mysteryClass}" ${dataAttr}>
                        <span class="ingredient-icon">${iconDisplay}</span>
                        <span class="ingredient-name">${nameDisplay}</span>
                        <span class="ingredient-amount">${currentAmount}/${amount}</span>
                    </div>
                `;
            }

            // 特殊効果の説明を生成
            let effectHtml = '';
            if (recipe.specialEffect) {
                let effectDesc = '';

                switch (recipe.specialEffect.type) {
                    case 'clickMultiplier':
                        effectDesc = `クリック報酬 ${recipe.specialEffect.value}x 倍増`;
                        break;
                    case 'cpsMultiplier':
                        effectDesc = `CPS ${recipe.specialEffect.value}x 倍増`;
                        break;
                    case 'discountIngredients':
                        effectDesc = `材料価格 ${recipe.specialEffect.value * 100}% 割引`;
                        break;
                    case 'discountUpgrades':
                        effectDesc = `アップグレード価格 ${recipe.specialEffect.value * 100}% 割引`;
                        break;
                }

                if (effectDesc) {
                    effectHtml = `
                        <div class="recipe-special-effect">
                            <p>特殊効果: ${effectDesc}</p>
                            <p>特殊効果: ${effectDesc} (${recipe.specialEffect.duration}秒間)</p>
                        </div>
                    `;
                }
            }
            
            // 調理可能かどうかチェック
            // 既に調理中なら別のレシピは調理不可
            let canCook = allIngredientsAvailable && !isCooking;
            
            // レシピカードを生成
            html += `
                <div class="recipe-card" data-id="${recipe.id}">
                    <div class="recipe-icon">
                        ${recipe.icon.includes('.svg') 
                        ? `<img src="${recipe.icon}" alt="${recipe.name}" class="cookie-icon" width="40" height="40">` 
                        : recipe.icon}
                    </div>
                    <div class="recipe-info">
                        <h3>${recipe.name}</h3>
                        <p>${recipe.description}</p>
                        <div class="recipe-ingredients">
                            ${ingredientsHtml}
                        </div>
                        ${effectHtml}
                        <p>調理時間: ${recipe.cookingTime}秒</p>
                        <p>生産: ${recipe.baseCookies}クッキー</p>
                    </div>
                    <button class="cook-recipe-btn ${canCook ? '' : 'disabled'}" 
                            onclick="startCooking('${recipe.id}')" 
                            ${canCook ? '' : 'disabled'}>
                        ${isCooking ? '調理中...' : '調理する'}
                    </button>
                </div>
            `;
        } else if (recipe.unlockAt && cookieCount >= recipe.unlockAt * 0.3) {
            // ロックされているが、解禁条件の30%を達成している場合はヒントを表示
            html += `
                <div class="recipe-card locked" data-id="${recipe.id}">
                    <div class="recipe-icon">?</div>
                    <div class="recipe-info">
                        <h3>未知のレシピ</h3>
                        <p>もっとクッキーを作ると発見できそう...</p>
                        <p>解禁まであと: ${recipe.unlockAt - cookieCount}クッキー</p>
                    </div>
                </div>
            `;
        }
    });
    
    container.innerHTML = html;
}
