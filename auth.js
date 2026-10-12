/*!
 * 仮パスワードゲート(一時的な閲覧制御用)
 * ※ 本格的なセキュリティ対策ではありません。
 *    HTML/画像のURLを直接開く・ソース表示などで回避できます。
 *
 * 使い方: 全HTMLの <head> 内、できるだけ最初に
 *   <script src="auth.js"></script>
 * を追加します(defer / async は付けないこと)。
 */
(function () {
  'use strict';

  // ===== 設定 ==============================================
  // パスワードの SHA-256 ハッシュ(平文はソースに書かない)
  // 現在の仮パスワード: portfolio2026  ← 必ず変更してください
  var PASSWORD_HASH =
    '9881928f60e14fcbd7a28d2166ee4e8ba456daa9df696159dcae35050762895b';

  var STORAGE_KEY = 'portfolio_auth_v1';
  var EXPIRE_HOURS = 12; // 認証の有効時間(時間)。0 なら無期限
  // =========================================================

  function isAuthed() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      var data = JSON.parse(raw);
      if (!data || data.h !== PASSWORD_HASH) return false; // パスワード変更時は無効化
      if (EXPIRE_HOURS > 0 && Date.now() - data.t > EXPIRE_HOURS * 3600 * 1000) {
        localStorage.removeItem(STORAGE_KEY);
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  function saveAuth() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ t: Date.now(), h: PASSWORD_HASH })
      );
    } catch (e) {}
  }

  // 認証済みなら何もしない(ちらつきなし)
  if (isAuthed()) return;

  // 未認証: 本体が一瞬見えないよう、最初に非表示にする
  var hide = document.createElement('style');
  hide.textContent = 'html{visibility:hidden!important}';
  document.documentElement.appendChild(hide);

  function sha256(text) {
    var data = new TextEncoder().encode(text);
    return crypto.subtle.digest('SHA-256', data).then(function (buf) {
      return Array.prototype.map
        .call(new Uint8Array(buf), function (b) {
          return ('0' + b.toString(16)).slice(-2);
        })
        .join('');
    });
  }

  function buildOverlay() {
    var css = document.createElement('style');
    css.textContent =
      '#pf-gate{position:fixed;inset:0;z-index:2147483647;visibility:visible;' +
      'display:flex;align-items:center;justify-content:center;background:#fafafa;' +
      'font-family:"Noto Sans JP","Hiragino Kaku Gothic ProN",sans-serif;color:#222}' +
      '#pf-gate *{box-sizing:border-box}' +
      '#pf-gate .box{width:min(86vw,360px);text-align:center}' +
      '#pf-gate h1{font-size:18px;letter-spacing:.12em;margin:0 0 8px;font-weight:700}' +
      '#pf-gate p{font-size:13px;line-height:1.8;margin:0 0 22px;color:#666}' +
      '#pf-gate input{width:100%;height:46px;padding:0 14px;font-size:16px;' +
      'border:1px solid #ccc;border-radius:6px;background:#fff;outline:none}' +
      '#pf-gate input:focus{border-color:#222}' +
      '#pf-gate button{width:100%;height:46px;margin-top:12px;font-size:14px;' +
      'letter-spacing:.1em;color:#fff;background:#222;border:0;border-radius:6px;cursor:pointer}' +
      '#pf-gate button:hover{opacity:.85}' +
      '#pf-gate .err{height:20px;margin-top:10px;font-size:12px;color:#d33}' +
      '#pf-gate.shake .box{animation:pf-shake .35s}' +
      '@keyframes pf-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}';

    var gate = document.createElement('div');
    gate.id = 'pf-gate';
    gate.innerHTML =
      '<form class="box" autocomplete="off">' +
      '<h1>MIZUKI NISHI PORTFOLIO</h1>' +
      '<p>こちらのページはパスワードで保護されています。<br>パスワードを入力してください。</p>' +
      '<input type="password" name="pw" placeholder="パスワード" autocomplete="current-password" aria-label="パスワード">' +
      '<button type="submit">ENTER</button>' +
      '<div class="err" role="alert"></div>' +
      '</form>';

    document.head.appendChild(css);
    document.body.appendChild(gate);

    var form = gate.querySelector('form');
    var input = gate.querySelector('input');
    var err = gate.querySelector('.err');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      sha256(input.value).then(function (hash) {
        if (hash === PASSWORD_HASH) {
          saveAuth();
          gate.remove();
          css.remove();
          hide.remove();
        } else {
          err.textContent = 'パスワードが違います';
          input.value = '';
          input.focus();
          gate.classList.remove('shake');
          void gate.offsetWidth; // アニメーション再始動
          gate.classList.add('shake');
        }
      });
    });

    input.focus();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildOverlay);
  } else {
    buildOverlay();
  }
})();
