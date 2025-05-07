// stats.js - クッキー生産統計とグラフ表示

// 統計データ管理オブジェクト
const cookieStats = {
    // データ構造
    data: {
        // 日別データ
        daily: {},
        // 週別データ
        weekly: {},
        // 月別データ
        monthly: {}
    },
    
    // クッキーの生産データ記録
    recordProduction: function(recipeId, quantity) {
        const today = this.getDateKey();
        const week = this.getWeekKey();
        const month = this.getMonthKey();
        
        // 日別データを記録
        if (!this.data.daily[today]) {
            this.data.daily[today] = {
                production: {},
                sales: {},
                inventory: {}
            };
        }
        
        if (!this.data.daily[today].production[recipeId]) {
            this.data.daily[today].production[recipeId] = 0;
        }
        
        this.data.daily[today].production[recipeId] += quantity;
        
        // 週別データを集計
        if (!this.data.weekly[week]) {
            this.data.weekly[week] = {
                production: {},
                sales: {},
                inventory: {}
            };
        }
        
        if (!this.data.weekly[week].production[recipeId]) {
            this.data.weekly[week].production[recipeId] = 0;
        }
        
        this.data.weekly[week].production[recipeId] += quantity;
        
        // 月別データを集計
        if (!this.data.monthly[month]) {
            this.data.monthly[month] = {
                production: {},
                sales: {},
                inventory: {}
            };
        }
        
        if (!this.data.monthly[month].production[recipeId]) {
            this.data.monthly[month].production[recipeId] = 0;
        }
        
        this.data.monthly[month].production[recipeId] += quantity;
        
        // 在庫の更新
        this.updateInventory(recipeId, quantity, 'add');
        
        // データの保存
        this.saveData();
        
        // グラフの更新（表示中の場合）
        if (document.getElementById('stats-tab').classList.contains('active')) {
            this.updateCharts();
        }
    },
    
    // セールスデータの記録
    recordSale: function(recipeId, quantity, revenue) {
        const today = this.getDateKey();
        const week = this.getWeekKey();
        const month = this.getMonthKey();
        
        // 日別データ
        if (!this.data.daily[today]) {
            this.data.daily[today] = {
                production: {},
                sales: {},
                inventory: {},
                revenue: 0
            };
        }
        
        if (!this.data.daily[today].sales[recipeId]) {
            this.data.daily[today].sales[recipeId] = 0;
        }
        
        this.data.daily[today].sales[recipeId] += quantity;
        this.data.daily[today].revenue = (this.data.daily[today].revenue || 0) + revenue;
        
        // 週別データ
        if (!this.data.weekly[week]) {
            this.data.weekly[week] = {
                production: {},
                sales: {},
                inventory: {},
                revenue: 0
            };
        }
        
        if (!this.data.weekly[week].sales[recipeId]) {
            this.data.weekly[week].sales[recipeId] = 0;
        }
        
        this.data.weekly[week].sales[recipeId] += quantity;
        this.data.weekly[week].revenue = (this.data.weekly[week].revenue || 0) + revenue;
        
        // 月別データ
        if (!this.data.monthly[month]) {
            this.data.monthly[month] = {
                production: {},
                sales: {},
                inventory: {},
                revenue: 0
            };
        }
        
        if (!this.data.monthly[month].sales[recipeId]) {
            this.data.monthly[month].sales[recipeId] = 0;
        }
        
        this.data.monthly[month].sales[recipeId] += quantity;
        this.data.monthly[month].revenue = (this.data.monthly[month].revenue || 0) + revenue;
        
        // 在庫の更新
        this.updateInventory(recipeId, quantity, 'subtract');
        
        // データの保存
        this.saveData();
        
        // グラフの更新（表示中の場合）
        if (document.getElementById('stats-tab').classList.contains('active')) {
            this.updateCharts();
        }
    },
    
    // 在庫データの更新
    updateInventory: function(recipeId, quantity, action) {
        const today = this.getDateKey();
        
        if (!this.data.daily[today]) {
            this.data.daily[today] = {
                production: {},
                sales: {},
                inventory: {}
            };
        }
        
        if (!this.data.daily[today].inventory[recipeId]) {
            this.data.daily[today].inventory[recipeId] = 0;
        }
        
        if (action === 'add') {
            this.data.daily[today].inventory[recipeId] += quantity;
        } else if (action === 'subtract') {
            this.data.daily[today].inventory[recipeId] -= quantity;
            if (this.data.daily[today].inventory[recipeId] < 0) {
                this.data.daily[today].inventory[recipeId] = 0;
            }
        }
    },
    
    // 日付キーの取得 (YYYY-MM-DD形式)
    getDateKey: function() {
        // ゲーム内時間を使用
        const gameDate = new Date();
        return `${gameDate.getFullYear()}-${String(gameDate.getMonth() + 1).padStart(2, '0')}-${String(gameDate.getDate()).padStart(2, '0')}`;
    },
    
    // 週キーの取得 (YYYY-WW形式)
    getWeekKey: function() {
        const gameDate = new Date();
        const onejan = new Date(gameDate.getFullYear(), 0, 1);
        const weekNumber = Math.ceil((((gameDate - onejan) / 86400000) + onejan.getDay() + 1) / 7);
        return `${gameDate.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
    },
    
    // 月キーの取得 (YYYY-MM形式)
    getMonthKey: function() {
        const gameDate = new Date();
        return `${gameDate.getFullYear()}-${String(gameDate.getMonth() + 1).padStart(2, '0')}`;
    },
    
    // 統計データの保存
    saveData: function() {
        localStorage.setItem('cookieStats', JSON.stringify(this.data));
    },
    
    // 統計データの読み込み
    loadData: function() {
        const savedData = localStorage.getItem('cookieStats');
        if (savedData) {
            try {
                this.data = JSON.parse(savedData);
            } catch (e) {
                console.error('統計データの読み込みエラー:', e);
                // エラー時は新しいデータで初期化
                this.data = {
                    daily: {},
                    weekly: {},
                    monthly: {}
                };
            }
        }
    },
    
    // 選択された期間のデータを取得
    getSelectedPeriodData: function(period = 'daily') {
        return this.data[period];
    },
    
    // メインチャートの初期化
    initMainChart: function() {
        const ctx = document.getElementById('main-stats-chart').getContext('2d');
        
        // 既存のチャートがあれば破棄
        if (this.mainChart) {
            this.mainChart.destroy();
        }
        
        // 日別データを初期値として利用
        const dailyData = this.getSelectedPeriodData('daily');
        const labels = Object.keys(dailyData).sort();
        
        // レシピ名と生産数のデータ整形
        const datasets = [];
        const recipes = Object.keys(recipes || {});
        
        recipes.forEach(recipeId => {
            if (recipes[recipeId] && recipes[recipeId].unlocked) {
                const data = labels.map(date => {
                    return dailyData[date] && dailyData[date].production[recipeId] 
                        ? dailyData[date].production[recipeId] 
                        : 0;
                });
                
                // レシピごとの色を決定
                const color = this.getColorForRecipe(recipeId);
                
                datasets.push({
                    label: recipes[recipeId].name,
                    data: data,
                    backgroundColor: color,
                    borderColor: color,
                    borderWidth: 1
                });
            }
        });
        
        // チャートの作成
        this.mainChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'クッキー生産数の推移',
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(255, 248, 220, 0.9)',
                        titleColor: '#654321',
                        bodyColor: '#654321',
                        borderColor: '#d2b48c',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${formatNumber(context.raw)} 個`;
                            }
                        }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 15,
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '生産数'
                        },
                        ticks: {
                            callback: function(value) {
                                return formatNumber(value);
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '日付'
                        }
                    }
                }
            }
        });
    },
    
    // 生産割合チャートの初期化
    initProductionRatioChart: function() {
        const ctx = document.getElementById('production-ratio-chart').getContext('2d');
        
        // 既存のチャートがあれば破棄
        if (this.productionRatioChart) {
            this.productionRatioChart.destroy();
        }
        
        // 日別データの合計を計算
        const dailyData = this.getSelectedPeriodData('daily');
        const productionTotals = {};
        
        // 全レシピの合計生産数を集計
        Object.values(dailyData).forEach(day => {
            Object.entries(day.production || {}).forEach(([recipeId, count]) => {
                productionTotals[recipeId] = (productionTotals[recipeId] || 0) + count;
            });
        });
        
        // データとラベルの準備
        const data = [];
        const labels = [];
        const colors = [];
        
        Object.entries(productionTotals)
            .sort((a, b) => b[1] - a[1]) // 生産数の多い順にソート
            .forEach(([recipeId, count]) => {
                const recipe = recipes[recipeId];
                if (recipe && recipe.unlocked) {
                    labels.push(recipe.name);
                    data.push(count);
                    colors.push(this.getColorForRecipe(recipeId));
                }
            });
        
        // チャートの作成
        this.productionRatioChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderColor: 'white',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${context.label}: ${formatNumber(value)}個 (${percentage}%)`;
                            }
                        }
                    },
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 12,
                            padding: 10,
                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        });
    },
    
    // レシピ人気度チャートの初期化
    initRecipePopularityChart: function() {
        const ctx = document.getElementById('recipe-popularity-chart').getContext('2d');
        
        // 既存のチャートがあれば破棄
        if (this.recipePopularityChart) {
            this.recipePopularityChart.destroy();
        }
        
        // 販売データの集計
        const dailyData = this.getSelectedPeriodData('daily');
        const salesTotals = {};
        
        // 全レシピの合計販売数を集計
        Object.values(dailyData).forEach(day => {
            Object.entries(day.sales || {}).forEach(([recipeId, count]) => {
                salesTotals[recipeId] = (salesTotals[recipeId] || 0) + count;
            });
        });
        
        // データ準備
        const labels = [];
        const data = [];
        const backgroundColors = [];
        
        // 販売数が多い順にソート
        Object.entries(salesTotals)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5) // 上位5つのみ表示
            .forEach(([recipeId, count]) => {
                const recipe = recipes[recipeId];
                if (recipe && recipe.unlocked) {
                    labels.push(recipe.name);
                    data.push(count);
                    backgroundColors.push(this.getColorForRecipe(recipeId));
                }
            });
        
        // チャートの作成
        this.recipePopularityChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '販売数',
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: 'white',
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y', // 横バーチャート
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `販売数: ${formatNumber(context.raw)}個`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatNumber(value);
                            }
                        }
                    }
                }
            }
        });
    },
    
    // すべてのチャートを更新
    updateCharts: function(period = 'daily', chartType = 'production') {
        this.initMainChart();
        this.initProductionRatioChart();
        this.initRecipePopularityChart();
        this.updateStatsSummary();
    },
    
    // 統計サマリー情報の更新
    updateStatsSummary: function() {
        // 統計要約の計算
        const totalProducedElement = document.getElementById('total-cookies-produced');
        const totalSoldElement = document.getElementById('total-cookies-sold');
        const totalRevenueElement = document.getElementById('total-revenue');
        const topProducedRecipeElement = document.getElementById('top-produced-recipe');
        
        // 各種集計
        let totalProduced = 0;
        let totalSold = 0;
        let totalRevenue = 0;
        const productionByRecipe = {};
        
        // すべての日次データを集計
        Object.values(this.data.daily).forEach(day => {
            // 生産数の集計
            Object.values(day.production || {}).forEach(count => {
                totalProduced += count;
            });
            
            // レシピごとの生産数集計
            Object.entries(day.production || {}).forEach(([recipeId, count]) => {
                productionByRecipe[recipeId] = (productionByRecipe[recipeId] || 0) + count;
            });
            
            // 販売数の集計
            Object.values(day.sales || {}).forEach(count => {
                totalSold += count;
            });
            
            // 収益の集計
            totalRevenue += (day.revenue || 0);
        });
        
        // 最も生産数の多いレシピを特定
        let topRecipeId = null;
        let topRecipeCount = 0;
        
        Object.entries(productionByRecipe).forEach(([recipeId, count]) => {
            if (count > topRecipeCount) {
                topRecipeId = recipeId;
                topRecipeCount = count;
            }
        });
        
        // UI更新
        if (totalProducedElement) {
            totalProducedElement.textContent = formatNumber(totalProduced);
        }
        
        if (totalSoldElement) {
            totalSoldElement.textContent = formatNumber(totalSold);
        }
        
        if (totalRevenueElement) {
            totalRevenueElement.textContent = formatNumber(totalRevenue);
        }
        
        if (topProducedRecipeElement && topRecipeId && recipes[topRecipeId]) {
            topProducedRecipeElement.textContent = recipes[topRecipeId].name;
        }
    },
    
    // レシピごとの色を取得
    getColorForRecipe: function(recipeId) {
        // レシピIDに基づく色分け
        const colorMap = {
            plainCookie: 'rgb(210, 180, 140)', // プレーンクッキー
            chocolateChip: 'rgb(139, 69, 19)',  // チョコチップクッキー
            matchaCookie: 'rgb(106, 153, 78)',  // 抹茶クッキー
            doubleCocoa: 'rgb(101, 67, 33)',   // ダブルチョコレートクッキー
            royalCookie: 'rgb(218, 165, 32)',   // ロイヤルクッキー
            // 他のレシピ用の色もここに追加
        };
        
        return colorMap[recipeId] || `hsl(${(this.hashCode(recipeId) % 360)}, 70%, 60%)`;
    },
    
    // シンプルなハッシュコード生成（色分け用）
    hashCode: function(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    },
    
    // 初期化処理
    init: function() {
        this.loadData();
        
        // タブスイッチング時のイベントリスナー設定
        const statsTabs = document.querySelectorAll('.tab-button[data-tab="stats-tab"]');
        statsTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                setTimeout(() => this.updateCharts(), 100); // タブが表示されてからチャート描画
            });
        });
        
        // 期間切り替えボタンのイベント設定
        document.getElementById('daily-stats').addEventListener('click', function() {
            document.querySelectorAll('.time-range-selector .stats-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            cookieStats.updateCharts('daily');
        });
        
        document.getElementById('weekly-stats').addEventListener('click', function() {
            document.querySelectorAll('.time-range-selector .stats-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            cookieStats.updateCharts('weekly');
        });
        
        document.getElementById('monthly-stats').addEventListener('click', function() {
            document.querySelectorAll('.time-range-selector .stats-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            cookieStats.updateCharts('monthly');
        });
        
        // チャートタイプ切り替えボタンのイベント設定
        document.getElementById('production-chart-btn').addEventListener('click', function() {
            document.querySelectorAll('.chart-type-selector .stats-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            cookieStats.updateCharts(undefined, 'production');
        });
        
        document.getElementById('sales-chart-btn').addEventListener('click', function() {
            document.querySelectorAll('.chart-type-selector .stats-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            cookieStats.updateCharts(undefined, 'sales');
        });
        
        document.getElementById('inventory-chart-btn').addEventListener('click', function() {
            document.querySelectorAll('.chart-type-selector .stats-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            cookieStats.updateCharts(undefined, 'inventory');
        });
    }
};

// クッキー生産の記録フック（レシピ.jsのfinishCooking関数に組み込む）
function recordCookieProduction(recipeId, quantity) {
    cookieStats.recordProduction(recipeId, quantity);
}

// 販売記録フック（後ほど実装する注文システムで使用）
function recordCookieSale(recipeId, quantity, revenue) {
    cookieStats.recordSale(recipeId, quantity, revenue);
}
