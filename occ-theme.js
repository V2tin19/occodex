/**
 * occ-theme.js — 跨页面统一多主题与 HUD 控制台
 * 支持三套主题循环切换：'night' (秘卷玄奥) / 'day' (素绢水墨朱砂) / 'tactical' (司岁战术终端)
 * 支持 Web Audio 微音效一键静音/开启动态指示
 */
(function(global) {
  'use strict';

  const STORAGE_KEY = 'occ_theme';
  const THEMES = ['night', 'day', 'tactical'];
  const THEME_NAMES = {
    night: '极夜秘卷低长调',
    day: '素绢水墨朱砂',
    tactical: '司岁战术终端'
  };

  function getTheme() {
    return localStorage.getItem(STORAGE_KEY) || 'night';
  }

  function applyTheme(theme) {
    if (!THEMES.includes(theme)) theme = 'night';
    const body = document.body;
    if (!body) return;

    body.classList.remove('daylight', 'tactical');
    if (theme === 'day') {
      body.classList.add('daylight');
    } else if (theme === 'tactical') {
      body.classList.add('tactical');
    }

    localStorage.setItem(STORAGE_KEY, theme);
    updateHudUI(theme);

    // 触发全局主题变化事件供图表等重绘
    window.dispatchEvent(new CustomEvent('occ-theme-change', { detail: { theme } }));
  }

  function cycleTheme() {
    const cur = getTheme();
    const idx = THEMES.indexOf(cur);
    const next = THEMES[(idx + 1) % THEMES.length];
    applyTheme(next);
    if (window.MysticAudio) {
      window.MysticAudio.click();
    }
    return next;
  }

  function updateHudUI(curTheme) {
    const themeBtn = document.getElementById('occThemeBtn');
    if (themeBtn) {
      themeBtn.title = '当前主题：' + THEME_NAMES[curTheme] + ' (点击切换)';
      if (curTheme === 'day') {
        themeBtn.innerHTML = '☀';
      } else if (curTheme === 'tactical') {
        themeBtn.innerHTML = '⬡';
      } else {
        themeBtn.innerHTML = '☽';
      }
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
