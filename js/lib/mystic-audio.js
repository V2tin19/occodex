/**
 * js/lib/mystic-audio.js — 神秘学微质感合成音效引擎 (Web Audio API)
 * 零外部音频文件依赖，纯原生物理/数学合成，极轻量、零延迟、跨平台。
 */
(function(global) {
  'use strict';

  let ctx = null;
  let muted = localStorage.getItem('occ_muted') === 'true';

  function getCtx() {
    if (!ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        ctx = new AudioContext();
      }
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }

  const MysticAudio = {
    isMuted: function() {
      return muted;
    },
    toggleMute: function() {
      muted = !muted;
      localStorage.setItem('occ_muted', muted ? 'true' : 'false');
      return muted;
    },
    setMuted: function(val) {
      muted = !!val;
      localStorage.setItem('occ_muted', muted ? 'true' : 'false');
    },

    // 机械齿轮 / 刻度微滴答 (Astrolabe Tick)
    tick: function(freq = 1200) {
      if (muted) return;
      const ac = getCtx();
      if (!ac) return;
      try {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ac.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.3, ac.currentTime + 0.035);
        gain.gain.setValueAtTime(0.04, ac.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.035);
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start();
        osc.stop(ac.currentTime + 0.04);
      } catch (e) {}
    },

    // 细致按键微敲击 (Subtle Button Click)
    click: function() {
      if (muted) return;
      const ac = getCtx();
      if (!ac) return;
      try {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ac.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ac.currentTime + 0.04);
        gain.gain.setValueAtTime(0.06, ac.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start();
        osc.stop(ac.currentTime + 0.045);
      } catch (e) {}
    },

    // 铜钟 / 空灵音叉鸣响 (Celestial Bell / Gilded Chime)
    bell: function(freq = 587.33) { // D5
      if (muted) return;
      const ac = getCtx();
      if (!ac) return;
      try {
        const now = ac.currentTime;
        const osc1 = ac.createOscillator();
        const osc2 = ac.createOscillator();
        const gain = ac.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, now);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2.76, now); // Metallic overtone

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ac.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.25);
        osc2.stop(now + 1.25);
      } catch (e) {}
    },

    // 宣纸翻动微摩擦 (Parchment Rustle)
    paper: function() {
      if (muted) return;
      const ac = getCtx();
      if (!ac) return;
      try {
        const bufferSize = ac.sampleRate * 0.08;
        const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }
        const noise = ac.createBufferSource();
        noise.buffer = buffer;

        const filter = ac.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, ac.currentTime);
        filter.Q.setValueAtTime(1.5, ac.currentTime);

        const gain = ac.createGain();
        gain.gain.setValueAtTime(0.045, ac.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.08);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ac.destination);
        noise.start();
      } catch (e) {}
    },

    // 朱砂印章落印沉闷重击 (Cinnabar Seal Stamp)
    stamp: function() {
      if (muted) return;
      const ac = getCtx();
      if (!ac) return;
      try {
        const now = ac.currentTime;
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.14);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start(now);
        osc.stop(now + 0.17);

        // Subtly add paper rustle behind stamp
        setTimeout(() => MysticAudio.paper(), 30);
      } catch (e) {}
    },

    // 铜钱掷地清脆碰撞 (Copper Coin Clink)
    coin: function(pitch = 1) {
      if (muted) return;
      const ac = getCtx();
      if (!ac) return;
      try {
        const now = ac.currentTime;
        const baseFreq = 2200 * pitch;
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, now + 0.12);

        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start(now);
        osc.stop(now + 0.16);
      } catch (e) {}
    }
  };

  // 全局交互音效绑定
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
      // 预先监听用户首次交互以解锁 AudioContext
      const unlock = function() {
        getCtx();
        document.removeEventListener('click', unlock);
        document.removeEventListener('keydown', unlock);
      };
      document.addEventListener('click', unlock);
      document.addEventListener('keydown', unlock);
    });
  }

  global.MysticAudio = MysticAudio;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MysticAudio;
  }
})(typeof window !== 'undefined' ? window : globalThis);
