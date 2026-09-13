/**
 * js/lib/mystic-ui.js — 沉浸式神秘学交互组件库
 * 包含：
 *   1. 逆流时钟与实时干支罗盘 (Chrono & Ganzhi Terminal)
 *   2. 小六壬「掐指一算」逐位步进动画与朱砂落印推演室 (Xiao Liu Ren Palm Oracle)
 *   3. 大六壬「天工浑天仪」天地盘交互旋转与三传流线 (Da Liu Ren Celestial Astrolabe)
 *   4. 六爻「三钱演易」铜钱物理抛掷与逐爻成卦仪式 (Liu Yao 3-Coin Oracle)
 */
(function(global) {
  'use strict';

  const GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const GAN_WX = { '甲':'mu','乙':'mu','丙':'huo','丁':'huo','戊':'tu','己':'tu','庚':'jin','辛':'jin','壬':'shui','癸':'shui' };
  const ZHI_WX = { '子':'shui','丑':'tu','寅':'mu','卯':'mu','辰':'tu','巳':'huo','午':'huo','未':'tu','申':'jin','酉':'jin','戌':'tu','亥':'shui' };
  const WX_NAMES = { mu:'木', huo:'火', tu:'土', jin:'金', shui:'水' };

  /* ============================================================
     1. 逆流时钟与干支终端 (Chrono & Ganzhi Clock)
     ============================================================ */
  function initChronoClock(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    function update() {
      const now = new Date();
      const Y = now.getFullYear();
      const M = now.getMonth() + 1;
      const D = now.getDate();
      const h = now.getHours();
      const m = now.getMinutes();
      const s = now.getSeconds();
      const ms = Math.floor(now.getMilliseconds() / 100);

      // 计算时辰支
      const zhiIdx = Math.floor((h + 1) % 24 / 2);
      const zhiName = ZHI[zhiIdx] + '时';

      const timeStr = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${ms}`;
      const dateStr = `${Y}年${M}月${D}日`;

      el.innerHTML = `
        <div class="chrono-clock-card">
          <div class="chrono-header">
            <span class="tech-chip"><span class="dot"></span>CHRONO // 逆流时标</span>
            <span class="chrono-status">SEC // 1999.ACT</span>
          </div>
          <div class="chrono-display">
            <div class="chrono-time">${timeStr}</div>
            <div class="chrono-date">${dateStr} · <em>${zhiName}</em></div>
          </div>
          <div class="chrono-quote">
            "据说那场雨是向上落的——世界退回一个崭新的旧时代。"
          </div>
        </div>
      `;
    }
    update();
    setInterval(update, 200);
  }

  /* ============================================================
     2. 小六壬「掐指一算」逐位步进动画与朱砂落印推演室
     ============================================================ */
  const XLR_PALACES = [
    { id: 0, name: '大安', wx: '木', beast: '青龙', nature: '吉', pos: '食指根', desc: '身不动时，五行属木，颜色青色，方位东方。谋事在初，贵人可倚。' },
    { id: 1, name: '留连', wx: '水', beast: '玄武', nature: '凶', pos: '食指尖', desc: '人未归时，五行属水，颜色黑色，方位北方。纠缠暗昧，迁延反复。' },
    { id: 2, name: '速喜', wx: '火', beast: '朱雀', nature: '吉', pos: '中指尖', desc: '人便至时，五行属火，颜色红色，方位南方。喜讯速至，立见分晓。' },
    { id: 3, name: '赤口', wx: '金', beast: '白虎', nature: '凶', pos: '无名指尖', desc: '官事凶时，五行属金，颜色白色，方位西方。口舌是非，争斗冲突。' },
    { id: 4, name: '小吉', wx: '水', beast: '六合', nature: '吉', pos: '无名指根', desc: '人来喜时，五行属水，颜色青白，方位西北。和合美满，小有财利。' },
    { id: 5, name: '空亡', wx: '土', beast: '勾陈', nature: '凶', pos: '中指根', desc: '音信稀时，五行属土，颜色黄色，方位中央。落空无果，谋事难成。' }
  ];

  // 掌诀图穴位坐标映射 (SVG viewBox="40 60 300 300")
  const PALM_NODES = [
    { cx: 150, cy: 228 }, // 0 大安 (食指根)
    { cx: 141, cy: 114 }, // 1 留连 (食指尖)
    { cx: 202, cy: 102 }, // 2 速喜 (中指尖)
    { cx: 259, cy: 120 }, // 3 赤口 (无名指尖)
    { cx: 253, cy: 226 }, // 4 小吉 (无名指根)
    { cx: 204, cy: 228 }  // 5 空亡 (中指根)
  ];

  function runXiaoLiuRenAnimation(M, D, H, onStep, onComplete) {
    // 口诀：月初起大安，日从月上起，时从日上起
    const monthTarget = (M - 1) % 6;
    const dayTarget = (monthTarget + D - 1) % 6;
    const hourTarget = (dayTarget + H - 1) % 6;

    const steps = [];
    // 阶段1：数月 (从大安 0 开始数 M 次)
    for (let i = 0; i < M; i++) {
      steps.push({ phase: '月', count: i + 1, total: M, palace: i % 6, label: `数月：第 ${i + 1} 步（${XLR_PALACES[i % 6].name}）` });
    }
    // 阶段2：数日 (从 monthTarget 开始数 D-1 次)
    for (let i = 1; i < D; i++) {
      const p = (monthTarget + i) % 6;
      steps.push({ phase: '日', count: i + 1, total: D, palace: p, label: `数日：初 ${i + 1}（${XLR_PALACES[p].name}）` });
    }
    // 阶段3：数时 (从 dayTarget 开始数 H-1 次)
    for (let i = 1; i < H; i++) {
      const p = (dayTarget + i) % 6;
      steps.push({ phase: '时', count: i + 1, total: H, palace: p, label: `数时：${ZHI[i]}时（${XLR_PALACES[p].name}）` });
    }

    let stepIdx = 0;
    const interval = Math.max(80, Math.min(220, 2400 / steps.length));

    const timer = setInterval(() => {
      if (stepIdx < steps.length) {
        const s = steps[stepIdx];
        if (onStep) onStep(s);
        if (window.MysticAudio) {
          window.MysticAudio.tick(900 + (s.palace * 100));
        }
        stepIdx++;
      } else {
        clearInterval(timer);
        const finalResult = {
          monthPalace: XLR_PALACES[monthTarget],
          dayPalace: XLR_PALACES[dayTarget],
          hourPalace: XLR_PALACES[hourTarget],
          final: XLR_PALACES[hourTarget]
        };
        if (window.MysticAudio) {
          window.MysticAudio.stamp();
        }
        if (onComplete) onComplete(finalResult);
      }
    }, interval);

    return timer;
  }

  /* ============================================================
     3. 大六壬「天工浑天仪」天地盘 360° 交互浑天仪
     ============================================================ */
  function renderLiurenAstrolabe(containerEl, jiang, shi) {
    if (!containerEl) return;
    const jiangIdx = ZHI.indexOf(jiang);
    const shiIdx = ZHI.indexOf(shi);
    const off = ((jiangIdx - shiIdx) % 12 + 12) % 12;

    let itemsHtml = '';
    // 12 地盘固定，天盘旋转
    for (let di = 0; di < 12; di++) {
      const tianZhi = ZHI[(di + off) % 12];
      const diZhi = ZHI[di];
      const angle = (di * 30 - 90) * (Math.PI / 180);
      const rOuter = 135;
      const rInner = 85;
      const xOuter = 160 + rOuter * Math.cos(angle);
      const yOuter = 160 + rOuter * Math.sin(angle);
      const xInner = 160 + rInner * Math.cos(angle);
      const yInner = 160 + rInner * Math.sin(angle);

      itemsHtml += `
        <g class="astrolabe-node" data-di="${di}">
          <circle cx="${xOuter}" cy="${yOuter}" r="17" class="di-circle" />
          <text x="${xOuter}" y="${yOuter + 5}" class="di-text">${diZhi}</text>
          <line x1="${xOuter}" y1="${yOuter}" x2="${xInner}" y2="${yInner}" class="orbit-ray" />
          <circle cx="${xInner}" cy="${yInner}" r="15" class="tian-circle" />
          <text x="${xInner}" y="${yInner + 5}" class="tian-text">${tianZhi}</text>
        </g>
      `;
    }

    containerEl.innerHTML = `
      <svg class="astrolabe-svg" viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
        <circle cx="160" cy="160" r="148" class="astro-ring outer" />
        <circle cx="160" cy="160" r="102" class="astro-ring middle" />
        <circle cx="160" cy="160" r="54" class="astro-ring inner" />
        <text x="160" y="156" class="astro-center-title">璇玑盘</text>
        <text x="160" y="174" class="astro-center-sub">${jiang}将加${shi}</text>
        ${itemsHtml}
      </svg>
    `;
  }

  /* ============================================================
     4. 六爻「三钱演易」铜钱物理抛掷仪式
     ============================================================ */
  function castLiuYaoCoinToss() {
    // 抛 3 枚铜钱：每枚正面=3（阳），反面=2（阴）
    const c1 = Math.random() > 0.5 ? 3 : 2;
    const c2 = Math.random() > 0.5 ? 3 : 2;
    const c3 = Math.random() > 0.5 ? 3 : 2;
    const sum = c1 + c2 + c3;
    // 6=老阴(动), 7=少阳, 8=少阴, 9=老阳(动)
    const typeMap = {
      6: { val: 6, name: '老阴 (⚏ 动)', isYang: false, isDong: true, symbol: '⚋ ✕' },
      7: { val: 7, name: '少阳 (⚊)', isYang: true, isDong: false, symbol: '⚊' },
      8: { val: 8, name: '少阴 (⚋)', isYang: false, isDong: false, symbol: '⚋' },
      9: { val: 9, name: '老阳 (⚊ 动)', isYang: true, isDong: true, symbol: '⚊ 〇' }
    };
    return {
      coins: [c1, c2, c3],
      sum,
      ...typeMap[sum]
    };
  }

  global.MysticUI = {
    initChronoClock,
    runXiaoLiuRenAnimation,
    renderLiurenAstrolabe,
    castLiuYaoCoinToss,
    XLR_PALACES,
    PALM_NODES,
    GAN,
    ZHI,
    GAN_WX,
    ZHI_WX,
    WX_NAMES
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = global.MysticUI;
  }
})(typeof window !== 'undefined' ? window : globalThis);
