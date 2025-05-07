/**
 * Sweet Success - バージョン管理
 * 
 * バージョン形式: メジャー.マイナー.パッチ
 * - メジャー: 大きな機能追加や互換性のない変更
 * - マイナー: 後方互換性のある機能追加
 * - パッチ: バグ修正
 */

const gameVersion = {
    major: 1,
    minor: 3,
    patch: 0,
    date: '2025-05-07',
    
    // バージョン文字列を取得
    toString: function() {
        return `v${this.major}.${this.minor}.${this.patch}`;
    },
    
    // 完全なバージョン情報を取得
    getFullVersion: function() {
        return `${this.toString()} (${this.date})`;
    },
    
    // 変更履歴
    changelog: [
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
