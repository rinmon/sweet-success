/**
 * Sweet Success - バージョン管理
 * 
 * バージョン形式: メジャー.マイナー.パッチ
 * - メジャー: 大きな機能追加や互換性のない変更
 * - マイナー: 後方互換性のある機能追加
 * - パッチ: バグ修正
 */

// ページ読み込み時にバージョン表示を更新する
document.addEventListener('DOMContentLoaded', function() {
    updateVersionDisplay();
});

// バージョン表示を更新する関数
function updateVersionDisplay() {
    const versionElement = document.getElementById('game-version');
    if (versionElement) {
        versionElement.textContent = gameVersion.toString();
        
        // クリックで変更履歴を表示
        versionElement.addEventListener('click', function() {
            gameVersion.showChangelog();
        });
    }
}

const gameVersion = {
    major: 1,
    minor: 4,
    patch: 3,
    date: '2025-05-08',
    
    // バージョン文字列を取得
    toString: function() {
        return `v${this.major}.${this.minor}.${this.patch}`;
    },
    
    // 完全なバージョン情報を取得
    getFullVersion: function() {
        return `${this.toString()} (${this.date})`;
    },
    
    // バージョン履歴表示
    showChangelog: function() {
        let message = '更新履歴\n\n';
        this.changelog.forEach(entry => {
            message += `${entry.version} (${entry.date})\n`;
            entry.changes.forEach(change => {
                message += `- ${change}\n`;
            });
            message += '\n';
        });
        
        // モーダル表示または通知として表示
        alert(message);
    },
    
    // 変更履歴
    changelog: [
        {
            version: "1.4.3",
            date: "2025-05-08",
            changes: [
                "[FIX] レシピデータの保存・読み込み問題を修正",
                "[FIX] 材料があっても注文購入ができない問題を修正",
                "[ENHANCE] 材料から自動調理する機能を追加",
                "在庫管理と注文処理の連携を強化"
            ]
        },
        {
            version: "1.4.2",
            date: "2025-05-08",
            changes: [
                "[FIX] 注文システムのテンプレートリテラル構文エラーを修正",
                "インベントリ連携による注文ボタン処理の安定性向上",
                "残っていたデータ保存関数参照の修正"
            ]
        },
        {
            version: "1.4.1",
            date: "2025-05-08",
            changes: [
                "[FIX] データ保存機能の修正と強化", 
                "[FEATURE] 注文システムの機能分割と改善",
                "材料業者契約の保存問題を修正",
                "在庫確認時の注文ボタン自動有効化機能追加",
                "ステータスメッセージからのタブリンク機能実装"
            ]
        },
        {
            version: "1.4.0",
            date: "2025-05-08",
            changes: [
                "[FEATURE] 材料業者契約システムの実装",
                "小麦粉、砂糖、バターの自動生産機能",
                "日次・週次・月次契約システム",
                "プレイヤーレベルに応じた業者の解放"
            ]
        },
        {
            version: "1.3.4",
            date: "2025-05-08",
            changes: [
                "[CHANGE] バーガーメニューの最終調整・細部のバグ修正",
                "仕様書・バージョン管理の整理",
                "モバイル対応の強化（タッチ操作最適化、レスポンシブデザイン改善）"
            ]
        },
        {
            version: "1.3.4",
            date: "2025-05-08",
            changes: [
                "[CHANGE] バーガーメニューの最終調整・細部のバグ修正",
                "仕様書・バージョン管理の整理"
            ]
        },
        {
            version: "1.3.3",
            date: "2025-05-08",
            changes: [
                "バーガーメニューの表示問題を完全に修正",
                "モバイルメニューのCSSとJavaScriptを再設計",
                "表示・非表示の切り替えを改善"
            ]
        },
        {
            version: "1.3.2",
            date: "2025-05-08",
            changes: [
                "バーガーメニューの表示問題を修正",
                "メニューアイテムが選択できない問題を解決"
            ]
        },
        {
            version: "1.3.1",
            date: "2025-05-07",
            changes: [
                "バーガーメニューと管理ボタンの重なり問題を修正"
            ]
        },
        {
            version: "1.3.0",
            date: "2025-05-07",
            changes: [
                "モバイル対応の強化",
                "バーガーメニューの実装によるスマートフォン向けナビゲーション改善",
                "UI/UXの調整",
                "仕様書の更新"
            ]
        },
        {
            version: "1.2.0",
            date: "2025-04-25",
            changes: [
                "統計機能の強化",
                "在庫管理システムの改善",
                "パフォーマンス最適化"
            ]
        },
        {
            version: "1.1.0",
            date: "2025-04-10",
            changes: [
                "注文システムの追加",
                "レシピ機能の拡張",
                "ゲーム内時間システムの実装"
            ]
        },
        {
            version: "1.0.2",
            date: "2025-03-30",
            changes: [
                "管理者パネル機能の追加",
                "ゲームバランスの調整機能追加",
                "年マークと金額表示の改善",
                "game_spec.mdの整合性を改善",
                "READMEのタイトルを修正"
            ]
        },
        {
            version: "1.0.1",
            date: "2025-05-07",
            changes: [
                "材料購入機能のバグを修正",
                "バージョン表示機能を追加"
            ]
        },
        {
            version: "1.0.0",
            date: "2025-05-07",
            changes: [
                "初期リリース",
                "基本クリック機能",
                "レシピシステム",
                "注文システム",
                "在庫管理システム",
                "ショップとアップグレード"
            ]
        }
    ],
    
    // 変更履歴を表示
    showChangelog: function() {
        let html = '<div class="changelog-container">';
        html += '<h2>更新履歴</h2>';
        
        this.changelog.forEach(entry => {
            html += `<div class="changelog-entry">
                <h3>${entry.version} <span class="changelog-date">${entry.date}</span></h3>
                <ul>`;
            
            entry.changes.forEach(change => {
                html += `<li>${change}</li>`;
            });
            
            html += `</ul></div>`;
        });
        
        html += '</div>';
        
        // モーダルを表示
        showModal(html, "更新履歴");
    }
};

// バージョン情報を表示する関数
function displayVersionInfo() {
    const versionElement = document.getElementById('game-version');
    if (versionElement) {
        versionElement.textContent = gameVersion.toString();
        versionElement.title = `Sweet Success ${gameVersion.getFullVersion()}`;
        
        // クリックで変更履歴を表示
        versionElement.addEventListener('click', () => {
            gameVersion.showChangelog();
        });
    }
}

// ページ読み込み時にバージョン情報を表示
document.addEventListener('DOMContentLoaded', displayVersionInfo);
