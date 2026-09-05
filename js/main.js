/**
 * MIZUKI NISHI PORTFOLIO
 * ハンバーガーメニューの開閉トグル
 * ※ メニューの中身（ナビゲーションリンク等）はデザインデータに
 *    含まれていなかったため、ボタンの開閉状態の切り替えのみ実装しています。
 *    実際のメニューパネルを追加する際は、ここに表示処理を追加してください。
 */
document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('jsMenuBtn');
  const header = document.getElementById('jsHeader');

  if (menuBtn && header) {
    menuBtn.addEventListener('click', () => {
      const isOpen = header.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', String(isOpen));
    });
  }

  initWorkSliders();
  initGalleries();
});

/**
 * Work（Web〜Musabi）セクションのスライダー制御。
 * 各セクションは以下の構成を想定:
 *   .p-work__head 内に [data-slider-prev] / [data-slider-next] ボタン
 *   .c-slider 内の .c-slider__track がスクロール領域
 * data-slider="任意のキー" で見出し側のボタンとスライダー本体を紐付ける。
 */
function initWorkSliders() {
  const sliders = document.querySelectorAll('[data-slider]');

  sliders.forEach((slider) => {
    const key = slider.getAttribute('data-slider');
    const track = slider.querySelector('.c-slider__track');
    const nav = document.querySelector(`[data-slider-nav="${key}"]`);

    if (!track || !nav) return;

    const prevBtn = nav.querySelector('[data-slider-prev]');
    const nextBtn = nav.querySelector('[data-slider-next]');

    const getStep = () => {
      const item = track.querySelector('.c-slider__item');
      if (!item) return track.clientWidth;
      const gap = parseFloat(getComputedStyle(track).columnGap || '20');
      return item.getBoundingClientRect().width + gap;
    };

    const updateButtons = () => {
      const maxScroll = track.scrollWidth - track.clientWidth - 1;
      if (prevBtn) prevBtn.disabled = track.scrollLeft <= 0;
      if (nextBtn) nextBtn.disabled = track.scrollLeft >= maxScroll;
    };

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        track.scrollBy({ left: -getStep(), behavior: 'smooth' });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        track.scrollBy({ left: getStep(), behavior: 'smooth' });
      });
    }

    track.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', updateButtons);
    updateButtons();
  });
}

/**
 * 中面ギャラリー（メイン画像 + サムネイル一覧）の制御。
 * 構成:
 *   .c-gallery（ルート）
 *     .c-gallery__main-img（現在表示中のメイン画像）
 *     [data-gallery-prev] / [data-gallery-next]（矢印ボタン）
 *     [data-gallery-thumb][data-src]（サムネイル。クリックでメイン画像を切り替え）
 */
function initGalleries() {
  const galleries = document.querySelectorAll('.c-gallery');

  galleries.forEach((gallery) => {
    const mainImg = gallery.querySelector('.c-gallery__main-img');
    const thumbs = Array.from(gallery.querySelectorAll('[data-gallery-thumb]'));
    const prevBtn = gallery.querySelector('[data-gallery-prev]');
    const nextBtn = gallery.querySelector('[data-gallery-next]');

    if (!mainImg || thumbs.length === 0) return;

    let current = 0;

    const show = (index) => {
      current = (index + thumbs.length) % thumbs.length;
      const thumb = thumbs[current];
      mainImg.src = thumb.dataset.src;
      mainImg.alt = thumb.querySelector('img')?.alt || '';
      thumbs.forEach((t, i) => t.classList.toggle('is-active', i === current));
    };

    thumbs.forEach((thumb, i) => {
      thumb.addEventListener('click', () => show(i));
    });

    if (prevBtn) prevBtn.addEventListener('click', () => show(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => show(current + 1));

    show(0);
  });
}
