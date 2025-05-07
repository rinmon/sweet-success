// units.js - 生産ユニット関連の機能

// ユニットマイルストーン
// 特定数量のユニットを達成した際の特典
// 例：10個のカーソルで、全カーソルのCPSが2倍になるなど
// 単位は10個、25個、50個、100個、200個、500個
// レッベル1: 10個、レベル2: 25個、レベル3: 50個、レベル4: 100個、レベル5: 200個、レベル6: 500個
const milestones = [
    { count: 10, bonus: 2.0 },      // レベル1: 2倍
    { count: 25, bonus: 2.5 },      // レベル2: 2.5倍
    { count: 50, bonus: 3.0 },      // レベル3: 3倍
    { count: 100, bonus: 5.0 },     // レベル4: 5倍
    { count: 200, bonus: 10.0 },    // レベル5: 10倍
    { count: 500, bonus: 20.0 }     // レベル6: 20倍
];

// 生産ユニットのデータ
const units = {
    cursor: {
        name: "クリックヘルパー",
        id: "cursor",
        cost: 10,
        baseCost: 10,
        cps: 0.1,
        baseCps: 0.1,  // 基本生産量（ボーナス計算用）
        count: 0,
        costIncreaseFactor: 1.15,
        description: "自動でクッキーをクリックする小さな手です",
        // シナジー効果：何にボーナスを与えるか
        synergy: {
            cursor: 0.1,    // カーソルごとにクリック報酬に+0.1ボーナス
        },
        unlocked: true,     // 初期状態で解禁済み
        milestoneLevel: 0   // 達成済みのマイルストーンレベル
    },
    grandma: {
        name: "おばあちゃん",
        id: "grandma",
        cost: 100,
        baseCost: 100,
        cps: 1,
        baseCps: 1,   // 基本生産量
        count: 0,
        costIncreaseFactor: 1.15,
        description: "おいしいクッキーを焼きます",
        // シナジー効果：おばあちゃんはカーソルをサポート
        synergy: {
            cursor: 0.2,    // おばあちゃんユニットごとに、各カーソルのCPSに+0.2ボーナス
            grandma: 0.1   // おばあちゃんも互いにサポート
        },
        unlocked: true,     // 初期状態で解禁済み
        milestoneLevel: 0   // 達成済みのマイルストーンレベル
    },
    factory: {
        name: "工場",
        id: "factory",
        cost: 1000,
        baseCost: 1000,
        cps: 10,
        baseCps: 10,  // 基本生産量
        count: 0,
        costIncreaseFactor: 1.15,
        description: "大量のクッキーを生産します",
        // シナジー効果：工場はすべての下位ユニットをサポート
        synergy: {
            cursor: 0.5,     // 各工場は、各カーソルのCPSに+0.5ボーナス
            grandma: 2.0,    // 各工場は、各おばあちゃんのCPSに+2.0ボーナス
            factory: 1.0     // 工場同士もサポートし合う
        },
        unlocked: true,     // 初期状態で解禁済み
        milestoneLevel: 0   // 達成済みのマイルストーンレベル
    }
};

// DOM要素
const unitsContainer = document.getElementById('units-container');

// 自動生産ユニットを購入する
function buyUnit(unitId) {
    const unit = units[unitId];
    if (cookieCount >= unit.cost) {
        cookieCount -= unit.cost;
        const prevCount = unit.count; // 現在の所持数を保存
        unit.count++;
        
        // マイルストーンチェック
        checkUnitMilestones(unit, prevCount);
        
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
        cps = calculateTotalCps(); // シナジー効果も考慮される
        updateCookieDisplay();
        updateCpsDisplay();
        renderUnits(); // 購入情報を更新
        renderUpgrades(); // 条件を満たす新しいアップグレードが表示される可能性がある
    } else {
        addStatusMessage("クッキーが足りません！", 'info');
    }
}

// ユニットマイルストーンの達成をチェック
function checkUnitMilestones(unit, prevCount) {
    // 各マイルストーンをチェック
    for (let i = 0; i < milestones.length; i++) {
        const milestone = milestones[i];
        // 新しいマイルストーンを達成した場合
        if (prevCount < milestone.count && unit.count >= milestone.count) {
            // マイルストーンレベルを更新
            unit.milestoneLevel = i + 1;
            
            // 達成通知
            addStatusMessage(
                `すごい！ ${unit.name}が${milestone.count}個を達成しました！
                 みんなの生産力が${milestone.bonus}x倍に向上します！`,
                'milestone',
                true
            );
            
            // 特別エフェクト
            showAnimation('milestone', milestone.bonus);
            
            // マイルストーン到達時のスペシャルアニメーションやエフェクトを函数で処理
            playMilestoneAnimation(unit, milestone);
        }
    }
}

// マイルストーン達成時のアニメーション
function playMilestoneAnimation(unit, milestone) {
    // マイルストーン達成をプレイヤーに視覚的に知らせる特別な表示
    const milestoneDiv = document.createElement('div');
    milestoneDiv.className = 'milestone-achievement';
    milestoneDiv.innerHTML = `
        <h3>${unit.name} ${milestone.count}!</h3>
        <p>${milestone.bonus}xボーナス！</p>
    `;
    document.body.appendChild(milestoneDiv);
    
    // 3秒後に表示を消去
    setTimeout(() => {
        milestoneDiv.style.opacity = '0';
        setTimeout(() => {
            if (milestoneDiv.parentNode) {
                document.body.removeChild(milestoneDiv);
            }
        }, 1000);
    }, 3000);
}

// ユニットキャラクターのHTMLを生成
function getUnitCharacterHTML(unitId, count) {
    // SVG画像を使用したキャラクター表示
    
    // カーソルキャラクター
    if (unitId === 'cursor') {
        const upgradeClass = count >= 10 ? 'unit-upgraded' : '';
        return `
            <div class="unit-character cursor-character ${upgradeClass}">
                <img src="assets/images/cursor.svg" alt="クリックヘルパー" width="60" height="60">
                ${count >= 25 ? '<span class="unit-level">★</span>' : ''}
                ${count >= 50 ? '<span class="unit-level">★★</span>' : ''}
                ${count >= 100 ? '<span class="unit-level">★★★</span>' : ''}
            </div>
        `;
    }
    
    // おばあちゃんキャラクター
    else if (unitId === 'grandma') {
        const upgradeClass = count >= 10 ? 'unit-upgraded' : '';
        return `
            <div class="unit-character grandma-character ${upgradeClass}">
                <img src="assets/images/grandma.svg" alt="おばあちゃん" width="60" height="60">
                ${count >= 25 ? '<span class="unit-level">★</span>' : ''}
                ${count >= 50 ? '<span class="unit-level">★★</span>' : ''}
                ${count >= 100 ? '<span class="unit-level">★★★</span>' : ''}
            </div>
        `;
    }
    
    // 工場キャラクター
    else if (unitId === 'factory') {
        const upgradeClass = count >= 10 ? 'unit-upgraded' : '';
        return `
            <div class="unit-character factory-character ${upgradeClass}">
                <img src="assets/images/factory.svg" alt="工場" width="60" height="60">
                ${count >= 25 ? '<span class="unit-level">★</span>' : ''}
                ${count >= 50 ? '<span class="unit-level">★★</span>' : ''}
                ${count >= 100 ? '<span class="unit-level">★★★</span>' : ''}
            </div>
        `;
    }
    
    // 不明なユニットの場合はデフォルトのプレースホルダーを返す
    return `<div class="unit-character unknown-character">?</div>`;
}

// 自動生産ユニットの表示を更新
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
        
        // キャラクターの生成
        const characterHTML = getUnitCharacterHTML(unit.id, unit.count);
        
        // CPSの卒硬を計算
        const baseMultiplier = unit.cps / unit.baseCps;
        let synergyInfo = '';
        if (baseMultiplier > 1.1) {
            synergyInfo = `<span class="synergy-bonus">[シナジーボーナス: ${baseMultiplier.toFixed(1)}x]</span>`;
        }
        
        // マイルストーン情報
        let milestoneInfo = '';
        if (unit.milestoneLevel > 0) {
            const milestone = milestones[unit.milestoneLevel - 1];
            milestoneInfo = `<span class="milestone-badge">レベル ${unit.milestoneLevel} (${milestone.bonus}x)</span>`;
        }
        
        // 次のマイルストーン情報
        let nextMilestoneInfo = '';
        for (let i = unit.milestoneLevel; i < milestones.length; i++) {
            const nextMilestone = milestones[i];
            if (unit.count < nextMilestone.count) {
                nextMilestoneInfo = `<span class="next-milestone">次のマイルストーン: ${nextMilestone.count}個 (あと${nextMilestone.count - unit.count}個)</span>`;
                break;
            }
        }

        button.innerHTML = `
            ${characterHTML}
            <strong>${unit.name}</strong> (所持: ${unit.count}) ${milestoneInfo}<br>
            価格: ${formatNumber(unit.cost)} クッキー<br>
            <span class="details">${unit.description}<br>毎秒 +${unit.cps.toFixed(1)} クッキー ${synergyInfo}</span>
            ${nextMilestoneInfo}
        `;

        if (cookieCount < unit.cost) {
            button.disabled = true;
        }

        unitDiv.appendChild(button);
        unitsContainer.appendChild(unitDiv);
    }
}

// 自動生産ユニットの購入ボタン状態を更新
function updateUnitButtons() {
    for (const unitId in units) {
        const unit = units[unitId];
        const button = document.getElementById(`buy-${unit.id}`);
        if (button) {
            button.disabled = cookieCount < unit.cost;
        }
    }
}

// 総CPS（毎秒のクッキー生産量）を計算
function calculateTotalCps() {
    let totalCps = 0;
    
    // 先に各ユニットの実際CPSを更新
    updateUnitCpsWithSynergies();
    
    // 各ユニットのCPSを計算
    for (const unitId in units) {
        const unit = units[unitId];
        totalCps += unit.cps * unit.count;
    }
    
    return totalCps * cpsMultiplier * allProductionMultiplier;
}

// シナジーとマイルストーンを考慮して各ユニットのCPSを更新
function updateUnitCpsWithSynergies() {
    // まず各ユニットを基本生産量にリセット
    for (const unitId in units) {
        const unit = units[unitId];
        unit.cps = unit.baseCps;
    }
    
    // マイルストーンボーナスを適用
    for (const unitId in units) {
        const unit = units[unitId];
        if (unit.milestoneLevel > 0) {
            const milestone = milestones[unit.milestoneLevel - 1];
            unit.cps *= milestone.bonus;
        }
    }
    
    // シナジー効果を適用
    for (const sourceUnitId in units) {
        const sourceUnit = units[sourceUnitId];
        // ソースユニットが存在しない場合はスキップ
        if (sourceUnit.count === 0) continue;
        
        // このユニットが影響を与えるターゲットを処理
        if (sourceUnit.synergy) {
            for (const targetUnitId in sourceUnit.synergy) {
                const targetUnit = units[targetUnitId];
                // ターゲットユニットが存在しない場合はスキップ
                if (!targetUnit || targetUnit.count === 0) continue;
                
                // 各ソースユニットは、各ターゲットユニットのCPSにボーナスを追加
                const synergyBonus = sourceUnit.synergy[targetUnitId] * sourceUnit.count;
                targetUnit.cps += targetUnit.baseCps * synergyBonus;
            }
        }
    }
    
    // クリック報酬に対するシナジーボーナスを計算
    updateClickPowerFromSynergies();
}

// シナジー効果からクリック報酬へのボーナスを計算
function updateClickPowerFromSynergies() {
    // クリック報酬をベースにリセット
    cookiesPerClick = 1;
    
    // カーソルのシナジー効果をクリック報酬に適用
    if (units.cursor && units.cursor.count > 0) {
        cookiesPerClick += units.cursor.synergy.cursor * units.cursor.count;
    }
    
    // 他のユニットからのクリック報酬ボーナスも追加可能
}
