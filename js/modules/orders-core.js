/**
 * orders-core.js - 注文システムのコア機能
 * 注文の生成、管理、保存などの基本機能を提供
 */

const ordersCore = {
    // アクティブな注文リスト
    activeOrders: [],
    
    // 完了した注文の統計
    stats: {
        completed: 0,
        rejected: 0,
        totalRevenue: 0,
        bestSellingRecipe: null,
        bestSellingCount: 0
    },
    
    // 注文生成の難易度調整用パラメータ
    difficulty: {
        minItems: 1,           // 最小注文アイテム種類数
        maxItems: 3,           // 最大注文アイテム種類数
        minQuantity: 1,        // 最小注文数量
        maxQuantity: 5,        // 最大注文数量
        baseTimeLimit: 120,    // 基本制限時間(秒) - 製造が間に合うよう延長
        timeLimitVariance: 45, // 制限時間のばらつき(秒) - バリエーションも増加
        baseRewardMultiplier: 1.5, // 基本報酬倍率
    },
    
    // 注文の最大同時表示数
    maxActiveOrders: 3,
    
    // 次の注文生成までの待機時間(秒)
    nextOrderDelay: 30,
    
    // 注文生成タイマー
    orderTimer: null,
    
    // 初期化
    init: function() {
        this.loadData();
        
        // 最初の注文生成を開始
        this.startOrderGeneration();
    },
    
    // 注文生成のスケジュール
    startOrderGeneration: function() {
        // 既存のタイマーをクリア
        if (this.orderTimer) {
            clearTimeout(this.orderTimer);
        }
        
        // アクティブな注文が最大数未満の場合、新しい注文を生成
        if (this.activeOrders.length < this.maxActiveOrders) {
            // プレイヤーレベルに応じて注文の難易度を調整
            this.adjustDifficulty();
            
            // 新しい注文を生成
            this.generateOrder();
        }
        
        // 次の注文生成をスケジュール
        const nextDelay = this.calculateNextOrderDelay();
        this.orderTimer = setTimeout(() => {
            this.startOrderGeneration();
        }, nextDelay * 1000);
    },
    
    // 次の注文生成までの時間を計算（ランダム要素あり）
    calculateNextOrderDelay: function() {
        // ゲーム内時間帯によって調整（昼間は注文が多い）
        let timeMultiplier = 1.0;
        if (typeof player !== 'undefined' && player.gameTime) {
            const hour = player.gameTime.hourOfDay;
            // 昼間(11時〜14時)は注文が多い
            if (hour >= 11 && hour <= 14) {
                timeMultiplier = 0.7; // 注文間隔30%短縮
            }
            // 夜間(22時〜翌6時)は注文が少ない
            else if (hour >= 22 || hour <= 6) {
                timeMultiplier = 1.5; // 注文間隔50%延長
            }
            
            // 週末（土日）は注文が多い
            if (player.gameTime.dayOfWeek === 6 || player.gameTime.dayOfWeek === 7) {
                timeMultiplier *= 0.8; // さらに20%短縮
            }
        }
        
        // 基本間隔にランダム要素と時間帯調整を加える
        return this.nextOrderDelay * timeMultiplier * (0.8 + Math.random() * 0.4);
    },
    
    // プレイヤーレベルに応じた難易度調整
    adjustDifficulty: function() {
        if (typeof player !== 'undefined' && player.level) {
            const level = player.level;
            
            // レベルに応じて徐々に難易度を上げる
            if (level >= 5) {
                this.difficulty.maxItems = Math.min(5, 3 + Math.floor((level - 5) / 5));
                this.difficulty.maxQuantity = Math.min(10, 5 + Math.floor((level - 5) / 3));
            }
            
            // レベルに応じて報酬倍率を増加
            this.difficulty.baseRewardMultiplier = 1.5 + (level * 0.1);
            
            // 高レベルでは制限時間が厳しくなる
            if (level >= 10) {
                this.difficulty.baseTimeLimit = Math.max(45, 60 - ((level - 10) * 1));
            }
        }
    },
    
    // 新しい注文を生成
    generateOrder: function() {
        // 選択可能なレシピを取得（解禁済みのもののみ）
        const availableRecipes = Object.entries(recipes)
            .filter(([id, recipe]) => recipe.unlocked)
            .map(([id, recipe]) => id);
            
        if (availableRecipes.length === 0) {
            return; // 解禁されたレシピがなければ注文生成しない
        }
        
        // 注文に含めるレシピ数を決定
        const orderSize = Math.floor(Math.random() * 
            (this.difficulty.maxItems - this.difficulty.minItems + 1)) + 
            this.difficulty.minItems;
            
        // 注文アイテムを生成
        const orderItems = {};
        const usedRecipes = new Set();
        
        // 注文が少なくとも1つのアイテムを含むようにする
        while (Object.keys(orderItems).length < orderSize && usedRecipes.size < availableRecipes.length) {
            // ランダムにレシピを選択
            const recipeIndex = Math.floor(Math.random() * availableRecipes.length);
            const recipeId = availableRecipes[recipeIndex];
            
            // 同じレシピを重複して注文しないようにする
            if (usedRecipes.has(recipeId)) {
                continue;
            }
            
            // 注文数を決定
            const quantity = Math.floor(Math.random() * 
                (this.difficulty.maxQuantity - this.difficulty.minItems + 1)) + 
                this.difficulty.minItems;
                
            // 注文アイテムに追加
            orderItems[recipeId] = quantity;
            usedRecipes.add(recipeId);
        }
        
        // 注文の制限時間を決定
        const baseTime = this.difficulty.baseTimeLimit;
        const variance = this.difficulty.timeLimitVariance;
        const timeLimit = baseTime + (Math.random() * variance * 2 - variance);
        
        // 注文の報酬を計算
        let baseReward = 0;
        
        for (const [recipeId, quantity] of Object.entries(orderItems)) {
            const recipe = recipes[recipeId];
            // レシピの価値（生産コスト）に基づく報酬計算
            const recipeCost = recipe.baseCookies;
            baseReward += recipeCost * quantity;
        }
        
        // 報酬に倍率をかける
        const reward = Math.floor(baseReward * this.difficulty.baseRewardMultiplier);
        
        // 注文オブジェクトを生成
        const order = {
            id: Date.now(), // ユニークID（現在時刻）
            customerName: this.generateCustomerName(),
            items: orderItems,
            timeLimit: timeLimit,
            startTime: Date.now(),
            endTime: Date.now() + (timeLimit * 1000),
            reward: reward,
            status: 'active',
            special: this.isSpecialOrder()
        };
        
        // 特別注文の場合、報酬と時間制限を調整
        if (order.special) {
            order.reward = Math.floor(order.reward * 2); // 報酬2倍
            order.timeLimit *= 0.8; // 時間20%短縮
            order.endTime = order.startTime + (order.timeLimit * 1000);
        }
        
        // アクティブ注文リストに追加
        this.activeOrders.push(order);
        
        // 注文受付の通知（注文画面へのリンク付き）
        const specialText = order.special ? '【特別注文】' : '';
        addStatusMessage(`${specialText}${order.customerName}から<a href="javascript:void(0)" class="goto-orders">新しい注文</a>が入りました！`, 'info', true);
        
        // イベント発火
        if (typeof ordersEvents !== 'undefined' && ordersEvents.onOrderCreated) {
            ordersEvents.onOrderCreated(order);
        }
        
        // BGM音を再生（特別注文の場合は特別な音）
        if (order.special) {
            playSound('specialOrder');
        } else {
            playSound('newOrder');
        }
    },
    
    // ランダムな顧客名を生成
    generateCustomerName: function() {
        const firstNames = [
            "田中", "佐藤", "鈴木", "高橋", "渡辺", 
            "伊藤", "山本", "中村", "小林", "加藤",
            "吉田", "山田", "佐々木", "山口", "松本"
        ];
        
        const lastNames = [
            "さん", "様", "さん家", "ファミリー", "一家",
            "商店", "カフェ", "レストラン", "ホテル", "学園"
        ];
        
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        return `${firstName}${lastName}`;
    },
    
    // 特別注文かどうかをランダムに決定
    isSpecialOrder: function() {
        // 10%の確率で特別注文
        return Math.random() < 0.1;
    },
    
    // 注文を処理（完了または拒否）
    processOrder: function(orderId, action) {
        // 対象の注文を探す
        const orderIndex = this.activeOrders.findIndex(order => order.id === orderId);
        
        if (orderIndex === -1) {
            return false; // 注文が見つからない
        }
        
        const order = this.activeOrders[orderIndex];
        
        if (action === 'complete') {
            // 注文に必要なクッキーがあるかチェック
            if (!ordersInventory.checkCookieInventory(order.items)) {
                addStatusMessage("注文に必要なクッキーがありません！", "error", true);
                return false;
            }
            
            // クッキーを消費
            ordersInventory.consumeCookies(order.items);
            
            // 報酬を加算
            cookieCount += order.reward;
            
            // 完了統計を更新
            this.stats.completed++;
            this.stats.totalRevenue += order.reward;
            
            // ベストセラーレシピを更新
            this.updateBestSeller(order.items);
            
            // 売上を記録
            this.recordSales(order);
            
            // 完了メッセージ
            const specialText = order.special ? '【特別注文】' : '';
            addStatusMessage(`${specialText}${order.customerName}の注文が完了しました！報酬${formatNumber(order.reward)}クッキーを獲得！`, "success", true);
            
            // アニメーション再生
            if (typeof ordersUI !== 'undefined' && ordersUI.playPackagingAnimation) {
                ordersUI.playPackagingAnimation(order);
            }
            
            // 経験値を追加
            if (typeof player !== 'undefined' && player.addExperience) {
                // 報酬の10%を経験値として加算
                const expGain = Math.ceil(order.reward / 10);
                player.addExperience(expGain);
            }
            
            // 完了音を再生
            playSound('orderComplete');
        } 
        else if (action === 'reject') {
            // 拒否統計を更新
            this.stats.rejected++;
            
            // 拒否メッセージ
            addStatusMessage(`${order.customerName}の注文をキャンセルしました。`, "info", true);
            
            // キャンセル音を再生
            playSound('orderCancel');
        }
        
        // 注文リストから削除
        this.activeOrders.splice(orderIndex, 1);
        
        // イベント発火
        if (typeof ordersEvents !== 'undefined') {
            if (action === 'complete' && ordersEvents.onOrderCompleted) {
                ordersEvents.onOrderCompleted(order);
            } else if (action === 'reject' && ordersEvents.onOrderRejected) {
                ordersEvents.onOrderRejected(order);
            }
        }
        
        // データを保存
        this.saveData();
        
        return true;
    },
    
    // ベストセラーレシピの更新
    updateBestSeller: function(orderItems) {
        for (const [recipeId, quantity] of Object.entries(orderItems)) {
            // レシピごとの販売数を追跡
            if (!this.stats.recipeSales) {
                this.stats.recipeSales = {};
            }
            
            if (!this.stats.recipeSales[recipeId]) {
                this.stats.recipeSales[recipeId] = 0;
            }
            
            this.stats.recipeSales[recipeId] += quantity;
            
            // ベストセラーを更新
            if (this.stats.recipeSales[recipeId] > this.stats.bestSellingCount) {
                this.stats.bestSellingRecipe = recipeId;
                this.stats.bestSellingCount = this.stats.recipeSales[recipeId];
            }
        }
    },
    
    // 売上データを統計システムに記録
    recordSales: function(order) {
        // 統計システムが実装されている場合、売上を記録
        if (typeof cookieStats !== 'undefined' && cookieStats.recordSale) {
            for (const [recipeId, quantity] of Object.entries(order.items)) {
                // レシピごとに売上を記録
                const recipeRevenue = Math.floor(order.reward * (quantity / Object.values(order.items).reduce((a, b) => a + b, 0)));
                cookieStats.recordSale(recipeId, quantity, recipeRevenue);
            }
        }
    },
    
    // 注文の有効期限をチェックして期限切れを処理
    checkOrderTimeouts: function() {
        const now = Date.now();
        const expiredOrders = this.activeOrders.filter(order => order.endTime < now);
        
        // 期限切れの注文を処理
        expiredOrders.forEach(order => {
            // 拒否扱いにする
            this.stats.rejected++;
            
            // 期限切れメッセージ
            addStatusMessage(`${order.customerName}の注文が期限切れになりました！`, "error", true);
            
            // 期限切れ音を再生
            playSound('orderTimeout');
            
            // アクティブ注文リストから削除
            const index = this.activeOrders.findIndex(o => o.id === order.id);
            if (index !== -1) {
                this.activeOrders.splice(index, 1);
            }
            
            // イベント発火
            if (typeof ordersEvents !== 'undefined' && ordersEvents.onOrderExpired) {
                ordersEvents.onOrderExpired(order);
            }
        });
        
        // 期限切れの注文があれば再描画
        if (expiredOrders.length > 0) {
            // データを保存
            this.saveData();
            
            // イベント発火
            if (typeof ordersEvents !== 'undefined' && ordersEvents.onOrdersChanged) {
                ordersEvents.onOrdersChanged();
            }
        }
    },
    
    // データを保存
    saveData: function() {
        const saveData = {
            activeOrders: this.activeOrders,
            stats: this.stats,
            difficulty: this.difficulty
        };
        
        localStorage.setItem('cookieOrdersData', JSON.stringify(saveData));
    },
    
    // データを読み込み
    loadData: function() {
        const savedData = localStorage.getItem('cookieOrdersData');
        
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                
                // 各プロパティを復元
                if (data.activeOrders) this.activeOrders = data.activeOrders;
                if (data.stats) this.stats = data.stats;
                if (data.difficulty) this.difficulty = data.difficulty;
            } catch (e) {
                console.error('注文データの読み込みエラー:', e);
            }
        }
    }
};
