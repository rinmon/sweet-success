// animations.js - アニメーション関連の機能

// DOM要素
const animationArea = document.getElementById('animation-area');
const bakerSprite = document.getElementById('baker');
const cashRegisterSprite = document.getElementById('cash-register');

// アニメーションを表示する
function showAnimation(type, amount) {
    // アニメーション要素の選択
    let sprite;
    if (type === 'baker') {
        sprite = bakerSprite;
    } else if (type === 'cash-register') {
        sprite = cashRegisterSprite;
    } else {
        return;
    }
    
    // ランダムな位置を設定
    const x = Math.random() * (window.innerWidth - 100);
    const y = Math.random() * (window.innerHeight - 100);
    
    // 要素を配置
    sprite.style.left = x + 'px';
    sprite.style.top = y + 'px';
    sprite.classList.remove('hidden');
    
    // アニメーション表示
    sprite.style.animation = 'float 2s ease-in-out';
    
    // 金額表示（購入時）
    if (type === 'cash-register' && amount) {
        const costLabel = document.createElement('div');
        costLabel.textContent = `-${formatNumber(amount)}`;
        costLabel.style.position = 'absolute';
        costLabel.style.top = '-20px';
        costLabel.style.left = '15px';
        costLabel.style.color = '#c62828';
        costLabel.style.fontWeight = 'bold';
        costLabel.style.fontSize = '1.2em';
        costLabel.style.textShadow = '0 0 3px white';
        
        sprite.appendChild(costLabel);
        
        // アニメーション終了時にラベルを削除
        setTimeout(() => {
            if (costLabel.parentNode === sprite) {
                sprite.removeChild(costLabel);
            }
        }, 2000);
    }
    
    // アニメーション終了後に非表示
    setTimeout(() => {
        sprite.classList.add('hidden');
        sprite.style.animation = '';
    }, 2000);
}

// キャラクターアニメーションの初期化（将来的な拡張のため）
function initCharacterAnimations() {
    // キャラクターやスプライトの初期化コードをここに追加
}

// キャラクターアニメーションを表示する機能
function showCharacterAnimation(characterType, animationType, x, y) {
    // 今後の実装のためのプレースホルダー
    const characterId = `${characterType}-character`;
    const character = document.getElementById(characterId);
    
    if (!character) return;
    
    // ランダムな位置を設定（指定がない場合）
    const posX = x || Math.random() * (window.innerWidth - 100);
    const posY = y || Math.random() * (window.innerHeight - 100);
    
    // 要素を配置
    character.style.left = posX + 'px';
    character.style.top = posY + 'px';
    character.classList.remove('hidden');
    
    // アニメーションクラスを適用
    const animationClass = `${characterType}-${animationType}`;
    character.classList.add(animationClass);
    
    // アニメーション終了後に非表示
    setTimeout(() => {
        character.classList.add('hidden');
        character.classList.remove(animationClass);
    }, 3000);
}
