/**
 * occ-theme.js — 跨页面统一昼夜双主题与 HUD 控制台
 * 支持极夜秘卷（夜间）与素绢水墨（昼间）全局二元切换
 * 支持 Web Audio 微音效一键静音/开启动态指示
 */
(function(global) {
  'use strict';

  const STORAGE_KEY = 'occ_theme';
  const THEMES = ['night', 'day'];
  const THEME_NAMES = {
    night: '极夜秘卷 (夜间)',
    day: '素绢水墨 (昼间)'
  };

  function getTheme() {
    const t = localStorage.getItem(STORAGE_KEY);
    return (t === 'day') ? 'day' : 'night';
  }

  function applyTheme(theme) {
    if (theme !== 'day') theme = 'night';
    const body = document.body;
    if (!body) return;

    body.classList.remove('tactical'); // 清理历史遗留样式
    if (theme === 'day') {
      body.classList.add('daylight');
    } else {
      body.classList.remove('daylight');
    }

    localStorage.setItem(STORAGE_KEY, theme);
    updateHudUI(theme);

    // 触发全局主题变化事件供图表等重绘
    window.dispatchEvent(new CustomEvent('occ-theme-change', { detail: { theme } }));
  }

  function cycleTheme() {
    const cur = getTheme();
    const next = (cur === 'day') ? 'night' : 'day';
    applyTheme(next);
    if (window.MysticAudio) {
      window.MysticAudio.click();
    }
    return next;
  }

  function updateHudUI(curTheme) {
    const themeBtn = document.getElementById('occThemeBtn');
    if (themeBtn) {
      const isDay = (curTheme === 'day');
      themeBtn.title = isDay ? '当前：素绢水墨 (点击切换为夜间模式)' : '当前：极夜秘卷 (点击切换为昼间模式)';
      themeBtn.innerHTML = isDay ? '☀' : '☽';
    }

    const soundBtn = document.getElementById('occSoundBtn');
    if (soundBtn && window.MysticAudio) {
      const isMuted = window.MysticAudio.isMuted();
      soundBtn.title = isMuted ? '音效已静音 (点击开启)' : '微质感音效开启中 (点击静音)';
      soundBtn.innerHTML = isMuted ? '🔇' : '🔔';
      soundBtn.classList.toggle('active', !isMuted);
    }
  }

  function initHudBar() {
    if (document.querySelector('.occ-hud-bar')) return;

    const bar = document.createElement('div');
    bar.className = 'occ-hud-bar';
    bar.innerHTML = `
      <button class="occ-hud-btn" id="occThemeBtn" title="切换视觉主题">☽</button>
      <div class="occ-hud-sep"></div>
      <button class="occ-hud-btn active" id="occSoundBtn" title="音效开关">🔔</button>
    `;
    document.body.appendChild(bar);

    document.getElementById('occThemeBtn').addEventListener('click', function(e) {
      e.stopPropagation();
      cycleTheme();
    });

    document.getElementById('occSoundBtn').addEventListener('click', function(e) {
      e.stopPropagation();
      if (window.MysticAudio) {
        const muted = window.MysticAudio.toggleMute();
        if (!muted) {
          window.MysticAudio.bell();
        }
        updateHudUI(getTheme());
      }
    });

    updateHudUI(getTheme());
  }

  // 初始化
  function init() {
    const cur = getTheme();
    applyTheme(cur);
    initHudBar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  global.OccTheme = {
    getTheme,
    applyTheme,
    cycleTheme,
    THEMES,
    THEME_NAMES
  };
})(typeof window !== 'undefined' ? window : globalThis);
