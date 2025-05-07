// ui.js - UIの挙動を管理

// バーガーメニューの状態
let burgerMenuActive = false;

// デバイスタイプ認識
// ユーザーのデバイスタイプを検出し、適切なUIを提供する
const deviceDetector = {
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isTouchDevice: false,
    
    // デバイスタイプ検出
    detect() {
        // タッチデバイスのチェック
        this.isTouchDevice = ('ontouchstart' in window) || 
                           (navigator.maxTouchPoints > 0) || 
                           (navigator.msMaxTouchPoints > 0);
        
        // 画面幅からデバイスタイプを判定
        const width = window.innerWidth;
        
        this.isMobile = width <= 600;
        this.isTablet = width > 600 && width <= 1024;
        this.isDesktop = width > 1024;
        
        // User Agentからの補足判定
        const ua = navigator.userAgent.toLowerCase();
        const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
        
        // タブレットや大型スマホの追加判定
        if (isMobileUA && !this.isMobile && !this.isTablet) {
            this.isTablet = true;
            this.isDesktop = false;
        }
        
        return {
            isMobile: this.isMobile,
            isTablet: this.isTablet,
            isDesktop: this.isDesktop,
            isTouchDevice: this.isTouchDevice
        };
    },
    
    // デバイスに応じた最適化
    optimize() {
        const body = document.body;
        const device = this.detect();
        
        // デバイスタイプに応じたクラスを追加
        body.classList.remove('mobile-device', 'tablet-device', 'desktop-device', 'touch-device');
        
        if (device.isMobile) {
            body.classList.add('mobile-device');
            addStatusMessage('スマートフォンモードで表示しています', 'info');
        } else if (device.isTablet) {
            body.classList.add('tablet-device');
            addStatusMessage('タブレットモードで表示しています', 'info');
        } else {
            body.classList.add('desktop-device');
        }
        
        if (device.isTouchDevice) {
            body.classList.add('touch-device');
            
            // タッチデバイスの場合のUI最適化
            this.optimizeForTouch();
        }
        
        return device;
    },
    
    // タッチデバイス向け最適化
    optimizeForTouch() {
        // タッチターゲットのサイズを大きく
        document.querySelectorAll('button, .status-control-btn, .tab-button').forEach(el => {
            el.style.minHeight = '36px';
        });
        
        // クリックイベントをタッチイベントに最適化
        this.optimizeTouchEvents();
    },
    
    // タッチイベントの最適化
    optimizeTouchEvents() {
        // クッキークリックのタッチイベントを改善
        const cookieButton = document.getElementById('big-cookie-btn');
        if (cookieButton) {
            // タッチイベントにおける反応速度を改善
            cookieButton.addEventListener('touchstart', function(e) {
                this.classList.add('touch-active');
            });
            
            cookieButton.addEventListener('touchend', function(e) {
                this.classList.remove('touch-active');
            });
        }
    },
    
    // ウィンドウサイズ変更時の再最適化
    handleResize() {
        // デバイスタイプが変わったか確認
        const previousDevice = {
            isMobile: this.isMobile,
            isTablet: this.isTablet,
            isDesktop: this.isDesktop
        };
        
        const currentDevice = this.detect();
        
        // デバイスタイプが変わった場合のみ再最適化
        if (previousDevice.isMobile !== currentDevice.isMobile ||
            previousDevice.isTablet !== currentDevice.isTablet ||
            previousDevice.isDesktop !== currentDevice.isDesktop) {
            this.optimize();
        }
    }
};

// タブ機能
function setupTabSystem() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // 現在のタブを非アクティブに
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // 選択したタブをアクティブに
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// ステータスログの機能強化
function setupStatusLogEnhancements() {
    const statusLog = document.getElementById('status-log');
    const statusMessages = document.getElementById('status-messages');
    const toggleAutoscrollBtn = document.getElementById('toggle-autoscroll');
    const expandStatusBtn = document.getElementById('expand-status');
    const clearStatusBtn = document.getElementById('clear-status');
    
    let autoScroll = true;
    
    // 自動スクロール切替
    if (toggleAutoscrollBtn) {
        toggleAutoscrollBtn.addEventListener('click', () => {
            autoScroll = !autoScroll;
            if (autoScroll) {
                toggleAutoscrollBtn.textContent = '▶';
                statusLog.classList.remove('auto-scroll-disabled');
                scrollToLatestMessage();
            } else {
                toggleAutoscrollBtn.textContent = '❚❚';
                statusLog.classList.add('auto-scroll-disabled');
            }
        });
    }
    
    // 拡大/縮小切替
    if (expandStatusBtn) {
        expandStatusBtn.addEventListener('click', () => {
            statusLog.classList.toggle('expanded');
            if (statusLog.classList.contains('expanded')) {
                expandStatusBtn.textContent = '▭';
            } else {
                expandStatusBtn.textContent = '□';
            }
            if (autoScroll) scrollToLatestMessage();
        });
    }
    
    // クリアボタン
    if (clearStatusBtn) {
        clearStatusBtn.addEventListener('click', () => {
            if (statusMessages) {
                statusMessages.innerHTML = '';
                addStatusMessage('ステータスログをクリアしました', 'info');
            }
        });
    }
    
    // ステータスメッセージを追加する関数の拡張
    window.originalAddStatusMessage = window.addStatusMessage;
    window.addStatusMessage = function(message, type = 'info') {
        window.originalAddStatusMessage(message, type);
        
        if (autoScroll) {
            scrollToLatestMessage();
        }
    };
    
    // ユーザーがメッセージエリアを手動でスクロールした場合の処理
    if (statusMessages) {
        statusMessages.addEventListener('scroll', () => {
            // スクロールが一番下ではない場合、自動スクロールを一時的に無効化
            const isScrolledToBottom = statusMessages.scrollHeight - statusMessages.clientHeight <= statusMessages.scrollTop + 5;
            if (!isScrolledToBottom && autoScroll) {
                autoScroll = false;
                toggleAutoscrollBtn.textContent = '❚❚';
                statusLog.classList.add('auto-scroll-disabled');
            }
        });
    }
    
    // 最新メッセージにスクロール
    function scrollToLatestMessage() {
        if (statusMessages) {
            statusMessages.scrollTop = statusMessages.scrollHeight;
        }
    }
}

// 画面サイズに応じたUI調整
function setupResponsiveUI() {
    const resizeHandler = () => {
        const container = document.querySelector('.container');
        const mainElement = document.querySelector('main');
        
        // デバイスタイプを再検出して最適化
        deviceDetector.handleResize();
        
        if (window.innerWidth < 900) {
            // モバイル向けレイアウトの調整
            container.style.height = 'auto';
            container.style.overflow = 'auto';
            mainElement.style.overflow = 'visible';
        } else {
            // デスクトップ向けレイアウトの調整
            container.style.height = '95vh';
            container.style.overflow = 'hidden';
            mainElement.style.overflow = 'hidden';
        }
        
        // タブの最適化
        optimizeTabs();
    };
    
    // 初期ロード時とウィンドウサイズ変更時に実行
    window.addEventListener('resize', resizeHandler);
    resizeHandler();
}

// タブをデバイスに応じて最適化
function optimizeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const device = deviceDetector.detect();
    
    if (device.isMobile) {
        // スマホの場合はタブを少し小さく
        tabButtons.forEach(button => {
            button.style.padding = '8px 10px';
            button.style.fontSize = '13px';
        });
    } else if (device.isTablet) {
        // タブレットの場合は適切なサイズに
        tabButtons.forEach(button => {
            button.style.padding = '10px 15px';
            button.style.fontSize = '14px';
        });
    } else {
        // デスクトップの場合はより大きく
        tabButtons.forEach(button => {
            button.style.padding = '10px 20px';
            button.style.fontSize = '15px';
        });
    }
}

// バーガーメニュー機能の初期化
function setupBurgerMenu() {
    const burgerButton = document.getElementById('burger-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    
    if (!burgerButton || !mobileNav || !mobileNavOverlay) return;
    
    // バーガーメニューボタンのクリックイベント
    burgerButton.addEventListener('click', toggleBurgerMenu);
    
    // オーバーレイクリックでメニューを閉じる
    mobileNavOverlay.addEventListener('click', closeBurgerMenu);
    
    // モバイルナビゲーションアイテムのクリックイベント
    mobileNavItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // クリックされたタブを取得
            const tabId = this.getAttribute('data-tab');
            
            // アクティブクラスの更新
            mobileNavItems.forEach(navItem => {
                navItem.classList.remove('active');
            });
            this.classList.add('active');
            
            // 対応するタブを切り替え
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabId).classList.add('active');
            
            // メニューを閉じる
            closeBurgerMenu();
            
            // 対応するメインのタブボタンも更新（表示されている場合）
            const mainTabButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
            if (mainTabButton) {
                document.querySelectorAll('.tab-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                mainTabButton.classList.add('active');
            }
        });
    });
    
    // 画面サイズ変更時にメニュー状態を更新
    window.addEventListener('resize', () => {
        if (window.innerWidth > 600 && burgerMenuActive) {
            closeBurgerMenu();
        }
    });
}

// バーガーメニュー表示・非表示切り替え
function toggleBurgerMenu() {
    const burgerButton = document.getElementById('burger-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
    
    if (!burgerMenuActive) {
        // メニュー表示
        burgerButton.classList.add('active');
        mobileNav.classList.add('active');
        mobileNavOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // 背景スクロール防止
        burgerMenuActive = true;
    } else {
        closeBurgerMenu();
    }
}

// バーガーメニューを閉じる
function closeBurgerMenu() {
    const burgerButton = document.getElementById('burger-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
    
    burgerButton.classList.remove('active');
    mobileNav.classList.remove('active');
    mobileNavOverlay.classList.remove('active');
    document.body.style.overflow = ''; // 背景スクロール復活
    burgerMenuActive = false;
}

// 初期化
function initUI() {
    // デバイスタイプの検出と最適化
    const device = deviceDetector.optimize();
    
    // デバイスに応じた初期設定の調整
    setupInitialDeviceSettings(device);
    
    // 各種システムの初期化
    setupTabSystem();
    setupStatusLogEnhancements();
    setupResponsiveUI();
    setupBurgerMenu(); // バーガーメニューの初期化
    
    // マーケットアイテムの表示
    renderMarketItems();
    
    // 最初のマーケット更新
    market.updateMarket();
    
    // デバイスに応じて更新間隔を調整
    const marketUpdateInterval = device.isMobile ? 15000 : 10000;
    
    // マーケットの定期更新
    setInterval(() => {
        market.updateMarket();
    }, marketUpdateInterval);
}

// デバイスに応じた初期設定
function setupInitialDeviceSettings(device) {
    // スタイルの動的調整
    const root = document.documentElement;
    
    if (device.isMobile) {
        // スマホ向け設定
        root.style.setProperty('--main-font-size', '14px');
        
        // 最初はユニットタブを表示
        document.querySelector('.tab-button[data-tab="units-tab"]').click();
        
        // ステータスログのサイズ調整
        const statusLog = document.getElementById('status-log');
        if (statusLog) statusLog.style.maxHeight = '150px';
    } else if (device.isTablet) {
        // タブレット向け設定
        root.style.setProperty('--main-font-size', '15px');
        
        // 最初はユニットタブを表示
        document.querySelector('.tab-button[data-tab="units-tab"]').click();
    } else {
        // デスクトップ向け設定
        root.style.setProperty('--main-font-size', '16px');
    }
}

// DOMContentLoaded時に実行
document.addEventListener('DOMContentLoaded', initUI);
