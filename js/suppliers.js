// suppliers.js - 材料業者契約システム

// 材料業者のベースデータ
const ingredientSuppliers = {
    // 小麦粉業者
    flour_suppliers: {
        village_mill: {
            id: "village_mill",
            name: "村の製粉所",
            description: "小さな村の製粉所。製造量は少ないですが、コストは安価です。",
            productionRate: 5,  // 1時間あたりの生産量
            unlockLevel: 1,
            contractOptions: {
                daily: {
                    cost: 20,    // 1日あたりのコスト
                    duration: 1  // 日数
                },
                weekly: {
                    cost: 120,   // 週あたりのコスト(日割より少し安い)
                    duration: 7
                },
                monthly: {
                    cost: 450,   // 月あたりのコスト(日割より安い)
                    duration: 30
                }
            },
            icon: "🏠"
        },
        town_mill: {
            id: "town_mill",
            name: "町の製粉工場",
            description: "効率的に小麦粉を生産します。",
            productionRate: 15,
            unlockLevel: 5,
            contractOptions: {
                daily: { cost: 50, duration: 1 },
                weekly: { cost: 300, duration: 7 },
                monthly: { cost: 1200, duration: 30 }
            },
            icon: "🏭"
        },
        automated_mill: {
            id: "automated_mill",
            name: "全自動製粉システム",
            description: "最先端の設備で大量生産します。",
            productionRate: 50,
            unlockLevel: 10,
            contractOptions: {
                daily: { cost: 200, duration: 1 },
                weekly: { cost: 1200, duration: 7 },
                monthly: { cost: 4800, duration: 30 }
            },
            icon: "🤖"
        }
    },
    
    // 砂糖業者
    sugar_suppliers: {
        local_refinery: {
            id: "local_refinery",
            name: "地元の製糖所",
            description: "地元で採れたサトウキビから砂糖を精製します。",
            productionRate: 4,
            unlockLevel: 2,
            contractOptions: {
                daily: { cost: 25, duration: 1 },
                weekly: { cost: 150, duration: 7 },
                monthly: { cost: 600, duration: 30 }
            },
            icon: "🏘️"
        },
        sugar_factory: {
            id: "sugar_factory",
            name: "大型製糖工場",
            description: "大量の砂糖を効率的に精製します。",
            productionRate: 12,
            unlockLevel: 6,
            contractOptions: {
                daily: { cost: 60, duration: 1 },
                weekly: { cost: 360, duration: 7 },
                monthly: { cost: 1440, duration: 30 }
            },
            icon: "🏢"
        },
        modern_refinery: {
            id: "modern_refinery",
            name: "最新鋭精製プラント",
            description: "最先端の技術で高品質の砂糖を大量生産します。",
            productionRate: 40,
            unlockLevel: 12,
            contractOptions: {
                daily: { cost: 180, duration: 1 },
                weekly: { cost: 1080, duration: 7 },
                monthly: { cost: 4320, duration: 30 }
            },
            icon: "🏗️"
        }
    },
    
    // バター業者
    butter_suppliers: {
        dairy_farm: {
            id: "dairy_farm",
            name: "酪農家の手作りバター",
            description: "新鮮な牛乳から作られる品質の高いバター。",
            productionRate: 3,
            unlockLevel: 3,
            contractOptions: {
                daily: { cost: 30, duration: 1 },
                weekly: { cost: 180, duration: 7 },
                monthly: { cost: 720, duration: 30 }
            },
            icon: "🐄"
        },
        butter_factory: {
            id: "butter_factory",
            name: "バター製造工場",
            description: "工場規模でバターを製造しています。",
            productionRate: 10,
            unlockLevel: 7,
            contractOptions: {
                daily: { cost: 70, duration: 1 },
                weekly: { cost: 420, duration: 7 },
                monthly: { cost: 1680, duration: 30 }
            },
            icon: "🧈"
        },
        gourmet_creamery: {
            id: "gourmet_creamery",
            name: "グルメクリーマリー",
            description: "最高級のバターを専門に製造しています。",
            productionRate: 35,
            unlockLevel: 14,
            contractOptions: {
                daily: { cost: 150, duration: 1 },
                weekly: { cost: 900, duration: 7 },
                monthly: { cost: 3600, duration: 30 }
            },
            icon: "✨"
        }
    }
};

// アクティブな契約を保持するプレイヤーデータ
let activeSupplierContracts = [];

// 発注状況
let ingredientOrders = {};

// 最後に生産処理を行った時間
let lastProductionTime = Date.now();
// 最後に契約チェックを行った時間
let lastContractCheck = Date.now();

// 契約締結機能
function signSupplierContract(supplierType, supplierId, contractType) {
    const supplier = ingredientSuppliers[supplierType][supplierId];
    
    if (!supplier) return false;
    
    // レベルチェック
    if (player.level < supplier.unlockLevel) {
        addStatusMessage(`${supplier.name}と契約するには、レベル${supplier.unlockLevel}以上である必要があります。`, 'error');
        return false;
    }
    
    const contract = supplier.contractOptions[contractType];
    const contractCost = contract.cost;
    
    // 支払い能力チェック
    if (cookieCount < contractCost) {
        addStatusMessage(`${supplier.name}との${translateContractType(contractType)}契約には${contractCost}クッキーが必要です。`, 'error');
        return false;
    }
    
    // クッキーの支払い
    cookieCount -= contractCost;
    
    const now = Date.now();
    const durationInDays = contract.duration;
    const durationInMillis = durationInDays * 24 * 60 * 60 * 1000;
    
    // 既存の契約をチェック＆更新
    const existingContractIndex = activeSupplierContracts.findIndex(c => 
        c.supplierType === supplierType && c.supplierId === supplierId);
    
    if (existingContractIndex !== -1) {
        // 既存の契約を更新
        const existingContract = activeSupplierContracts[existingContractIndex];
        existingContract.contractType = contractType;
        existingContract.startDate = now;
        existingContract.endDate = now + durationInMillis;
        existingContract.nextPaymentDate = now + (24 * 60 * 60 * 1000); // 次の日に支払い
    } else {
        // 新規契約を追加
        activeSupplierContracts.push({
            supplierType,
            supplierId,
            contractType,
            startDate: now,
            endDate: now + durationInMillis,
            nextPaymentDate: now + (24 * 60 * 60 * 1000) // 次の日に支払い
        });
    }
    
    // 発注の作成
    createIngredientOrder(supplierType.replace('_suppliers', ''), supplierId);
    
    addStatusMessage(`${supplier.name}と${translateContractType(contractType)}契約を締結しました！`, 'success');
    updateSupplierDisplay();
    updateCookieDisplay();
    
    // 変更をセーブ
    saveGame();
    return true;
}

// 契約の支払いと維持
function processSupplierContracts() {
    const now = Date.now();
    const contractsToRemove = [];
    
    activeSupplierContracts.forEach((contract, index) => {
        // 契約期限切れのチェック
        if (now > contract.endDate) {
            addStatusMessage(`${ingredientSuppliers[contract.supplierType][contract.supplierId].name}との契約が期限切れになりました。`, 'warning');
            contractsToRemove.push(index);
            return;
        }
        
        // 次の支払い日がきているかチェック
        if (now >= contract.nextPaymentDate) {
            const supplier = ingredientSuppliers[contract.supplierType][contract.supplierId];
            const contractOption = supplier.contractOptions[contract.contractType];
            const paymentAmount = contractOption.cost / contractOption.duration; // 1日あたりのコスト
            
            // 支払い能力チェック
            if (cookieCount < paymentAmount) {
                addStatusMessage(`${supplier.name}への支払いに失敗しました。契約が打ち切られます。`, 'error');
                contractsToRemove.push(index);
                return;
            }
            
            // 支払い実行
            cookieCount -= paymentAmount;
            
            // 次の支払い日を設定
            contract.nextPaymentDate = now + (24 * 60 * 60 * 1000); // 1日後
            
            addStatusMessage(`${supplier.name}へ${paymentAmount}クッキーを支払いました。`, 'info');
            updateCookieDisplay();
        }
    });
    
    // 契約削除（逆順で削除）
    for (let i = contractsToRemove.length - 1; i >= 0; i--) {
        activeSupplierContracts.splice(contractsToRemove[i], 1);
    }
    
    if (contractsToRemove.length > 0) {
        updateSupplierDisplay();
        saveGame();
    }
}

// 発注の作成
function createIngredientOrder(ingredientType, supplierId) {
    const orderId = `order_${Date.now()}`;
    const supplier = getSupplierByIdAndType(supplierId, `${ingredientType}_suppliers`);
    
    if (!supplier) return false;
    
    // 注文数量は契約タイプに基づいて変動
    const contract = activeSupplierContracts.find(c => c.supplierId === supplierId);
    let orderAmount = 50; // デフォルト
    
    if (contract) {
        switch (contract.contractType) {
            case 'daily': orderAmount = 20; break;
            case 'weekly': orderAmount = 150; break;
            case 'monthly': orderAmount = 600; break;
        }
    }
    
    ingredientOrders[orderId] = {
        id: orderId,
        ingredientType,
        amount: orderAmount,
        amountDelivered: 0,
        supplierId,
        completed: false,
        createdAt: Date.now()
    };
    
    addStatusMessage(`${supplier.name}から${translateIngredientType(ingredientType)}の発注を${orderAmount}個行いました。`, 'info');
    updateSupplierDisplay();
    
    // 変更をセーブ
    saveGame();
}

// 材料の生産処理
function processIngredientProduction() {
    const now = Date.now();
    
    // 各アクティブな契約を処理
    activeSupplierContracts.forEach(contract => {
        // 契約有効期間内のみ生産
        if (now > contract.endDate) return;
        
        const supplier = ingredientSuppliers[contract.supplierType][contract.supplierId];
        const ingredientType = contract.supplierType.replace('_suppliers', '');
        
        // 生産ロジック（1時間あたりの生産を5分ごとに処理）
        const hourlyProduction = supplier.productionRate;
        const productionPer5Min = Math.max(1, hourlyProduction / 12); // 最低でも1単位は生産
        
        // この製造業者に関連する発注を探す
        const relatedOrders = Object.values(ingredientOrders).filter(
            order => order.supplierId === contract.supplierId && !order.completed
        );
        
        if (relatedOrders.length === 0) return;
        
        // 生産量を発注に割り当て
        relatedOrders.forEach(order => {
            const remaining = order.amount - order.amountDelivered;
            const delivery = Math.min(remaining, productionPer5Min);
            
            if (delivery > 0) {
                order.amountDelivered += delivery;
                
                // 材料の在庫に追加
                if (ingredients[order.ingredientType]) {
                    ingredients[order.ingredientType].amount += delivery;
                }
                
                // 完了チェック
                if (order.amountDelivered >= order.amount) {
                    order.completed = true;
                    addStatusMessage(`${supplier.name}からの${translateIngredientType(order.ingredientType)}発注が完了しました！`, 'success');
                }
            }
        });
        
        // UI更新
        updateIngredientDisplay();
        updateSupplierDisplay();
    });
    
    // 変更を保存
    saveGame();
}

// 業者データを取得
function getSupplierByIdAndType(supplierId, supplierType) {
    if (ingredientSuppliers[supplierType] && ingredientSuppliers[supplierType][supplierId]) {
        return ingredientSuppliers[supplierType][supplierId];
    }
    return null;
}

// 契約タイプの翻訳ヘルパー
function translateContractType(type) {
    const translations = {
        daily: "日次",
        weekly: "週次",
        monthly: "月次"
    };
    return translations[type] || type;
}

// 材料タイプの翻訳
function translateIngredientType(type) {
    const translations = {
        flour: "小麦粉",
        sugar: "砂糖",
        butter: "バター"
    };
    return translations[type] || type;
}

// 業者タブを初期表示
function initializeSupplierTab() {
    // タブ切り替え
    document.querySelectorAll('.supplier-tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.supplier-tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updateSupplierDisplay(this.getAttribute('data-supplier-type'));
        });
    });
    
    // 初期表示
    updateSupplierDisplay('flour_suppliers');
}

// 業者表示の更新
function updateSupplierDisplay(supplierType = 'flour_suppliers') {
    const container = document.getElementById('supplier-content-container');
    if (!container) return;
    
    // 選択された業者タイプのデータを取得
    const suppliers = ingredientSuppliers[supplierType];
    let html = '';
    
    // 業者リストを生成
    Object.values(suppliers).forEach(supplier => {
        const isContracted = activeSupplierContracts.some(
            c => c.supplierType === supplierType && c.supplierId === supplier.id
        );
        
        const isUnlocked = player.level >= supplier.unlockLevel;
        
        html += `
            <div class="supplier-card ${isContracted ? 'contracted' : ''} ${isUnlocked ? '' : 'locked'}">
                <div class="supplier-icon">${supplier.icon}</div>
                <div class="supplier-info">
                    <h3>${supplier.name} ${isUnlocked ? '' : `(レベル${supplier.unlockLevel}で解放)`}</h3>
                    <p>${supplier.description}</p>
                    <p class="production-info">生産能力: ${supplier.productionRate}/時間</p>
                </div>
                <div class="contract-options">
                    <h4>契約オプション:</h4>
                    <div class="contract-buttons">
                        ${isUnlocked ? `
                            <button 
                                class="contract-btn daily-btn" 
                                onclick="signSupplierContract('${supplierType}', '${supplier.id}', 'daily')"
                                ${isContracted ? 'disabled' : ''}
                            >
                                日次契約 (${supplier.contractOptions.daily.cost}クッキー)
                            </button>
                            <button 
                                class="contract-btn weekly-btn" 
                                onclick="signSupplierContract('${supplierType}', '${supplier.id}', 'weekly')"
                                ${isContracted ? 'disabled' : ''}
                            >
                                週次契約 (${supplier.contractOptions.weekly.cost}クッキー)
                            </button>
                            <button 
                                class="contract-btn monthly-btn" 
                                onclick="signSupplierContract('${supplierType}', '${supplier.id}', 'monthly')"
                                ${isContracted ? 'disabled' : ''}
                            >
                                月次契約 (${supplier.contractOptions.monthly.cost}クッキー)
                            </button>
                        ` : `<p class="locked-message">レベル${supplier.unlockLevel}で契約解放</p>`}
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // アクティブな契約表示の更新
    updateActiveContractsDisplay();
    
    // 発注状況の表示更新
    updateOrdersDisplay();
}

// アクティブな契約の表示を更新
function updateActiveContractsDisplay() {
    const container = document.getElementById('active-contracts-container');
    if (!container) return;
    
    if (activeSupplierContracts.length === 0) {
        container.innerHTML = '<p class="no-contracts">アクティブな契約はありません</p>';
        return;
    }
    
    let html = '';
    
    activeSupplierContracts.forEach(contract => {
        const supplier = ingredientSuppliers[contract.supplierType][contract.supplierId];
        const endDate = new Date(contract.endDate);
        const nextPayment = new Date(contract.nextPaymentDate);
        
        html += `
            <div class="contract-item">
                <div class="contract-header">
                    <span class="supplier-icon">${supplier.icon}</span>
                    <h4>${supplier.name}</h4>
                    <span class="contract-type">${translateContractType(contract.contractType)}契約</span>
                </div>
                <div class="contract-details">
                    <p>契約期限: ${endDate.toLocaleDateString()}</p>
                    <p>次回支払日: ${nextPayment.toLocaleDateString()}</p>
                    <p>日次支払い: ${supplier.contractOptions[contract.contractType].cost / supplier.contractOptions[contract.contractType].duration} クッキー</p>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 発注状況の表示を更新
function updateOrdersDisplay() {
    const container = document.getElementById('ingredient-orders-container');
    if (!container) return;
    
    const activeOrders = Object.values(ingredientOrders).filter(order => !order.completed);
    
    if (activeOrders.length === 0) {
        container.innerHTML = '<p class="no-orders">アクティブな発注はありません</p>';
        return;
    }
    
    let html = '';
    
    activeOrders.forEach(order => {
        const supplier = getSupplierByIdAndType(order.supplierId, `${order.ingredientType}_suppliers`);
        if (!supplier) return;
        
        const progressPercent = Math.floor((order.amountDelivered / order.amount) * 100);
        
        html += `
            <div class="order-item">
                <div class="order-header">
                    <span class="ingredient-icon">${ingredients[order.ingredientType] ? ingredients[order.ingredientType].icon : '❓'}</span>
                    <h4>${translateIngredientType(order.ingredientType)} 発注</h4>
                </div>
                <div class="order-details">
                    <p>業者: ${supplier.name}</p>
                    <p>進捗: ${order.amountDelivered}/${order.amount} (${progressPercent}%)</p>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${progressPercent}%"></div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ゲームループへの統合
function updateSuppliers() {
    const now = Date.now();
    
    // 5分ごとに材料生産を処理（デモ用に時間を短縮）
    if (now - lastProductionTime >= 30 * 1000) { // 30秒ごと（デモ用）
        processIngredientProduction();
        lastProductionTime = now;
    }
    
    // 契約の支払いを処理（デモ用に時間を短縮）
    if (now - lastContractCheck >= 60 * 1000) { // 1分ごと（デモ用）
        processSupplierContracts();
        lastContractCheck = now;
    }
}

// セーブデータに統合
function saveSupplierData() {
    let saveData = {
        activeSupplierContracts: activeSupplierContracts,
        ingredientOrders: ingredientOrders,
        lastProductionTime: lastProductionTime,
        lastContractCheck: lastContractCheck
    };
    
    return saveData;
}

// ロードデータから復元
function loadSupplierData(saveData) {
    if (!saveData) return;
    
    if (saveData.activeSupplierContracts) activeSupplierContracts = saveData.activeSupplierContracts;
    if (saveData.ingredientOrders) ingredientOrders = saveData.ingredientOrders;
    if (saveData.lastProductionTime) lastProductionTime = saveData.lastProductionTime;
    if (saveData.lastContractCheck) lastContractCheck = saveData.lastContractCheck;
}

// ゲームループに統合
document.addEventListener('DOMContentLoaded', function() {
    // 既存のタブシステムに統合する
    initializeSupplierTab();
    
    // ゲームループに統合
    setInterval(updateSuppliers, 5000); // 5秒ごとに更新
});
