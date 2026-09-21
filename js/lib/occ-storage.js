/**
 * js/lib/occ-storage.js — OCCODEX 统一用户学习进度与数据存储管理
 * 
 * 特性：
 * 1. Schema 版本化（当前版本 v1，Key: 'occ_progress_v1'）
 * 2. 自动向前兼容旧版 'ziping_v1' 存储，零损耗平滑迁移
 * 3. 容错处理：localStorage 异常、隐私模式或禁用时自动回退为内存字典
 * 4. 零外部依赖，同时兼容浏览器全局命名空间 (window.OccStorage) 与 Node.js (CommonJS)
 */
(function(global) {
  'use strict';

  const STORAGE_KEY = 'occ_progress_v1';
  const LEGACY_ZIPING_KEY = 'ziping_v1';
  const CURRENT_VERSION = 1;

  // 内存备用（防隐私模式抛错）
  let memoryStore = null;

  function defaultStore() {
    return {
      version: CURRENT_VERSION,
      updatedAt: Date.now(),
      ziping: {
        read: {},
        best: null,
        daily: { streak: 0, lastDate: '' },
        wrongIds: {}
      },
      xlr: {
        completed: false,
        lastDivined: null
      },
      liuren: {
        read: {}
      },
      liuyao: {
        read: {}
      }
    };
  }

  function getRaw(key) {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
    } catch (e) {}
    return null;
  }

  function setRaw(key, val) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, val);
        return true;
      }
    } catch (e) {}
    return false;
  }

  function migrateLegacy() {
    const legacyStr = getRaw(LEGACY_ZIPING_KEY);
    if (!legacyStr) return null;
    try {
      const p = JSON.parse(legacyStr);
      if (p && typeof p === 'object') {
        return {
          read: p.read || {},
          best: p.best ?? null,
          daily: p.daily || { streak: 0, lastDate: '' },
          wrongIds: p.wrongIds || {}
        };
      }
    } catch (e) {}
    return null;
  }

  function loadStore() {
    if (memoryStore) return memoryStore;
    const raw = getRaw(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === CURRENT_VERSION) {
          memoryStore = Object.assign(defaultStore(), parsed);
          return memoryStore;
        }
      } catch (e) {}
    }

    // 尝试从 legacy ziping_v1 迁移
    const store = defaultStore();
    const legacyZiping = migrateLegacy();
    if (legacyZiping) {
      store.ziping = Object.assign(store.ziping, legacyZiping);
      saveStore(store);
    }
    memoryStore = store;
    return memoryStore;
  }

  function saveStore(store) {
    if (!store) return;
    store.updatedAt = Date.now();
    memoryStore = store;
    try {
      setRaw(STORAGE_KEY, JSON.stringify(store));
    } catch (e) {}
  }

  const OccStorage = {
    SCHEMA_VERSION: CURRENT_VERSION,
    STORAGE_KEY: STORAGE_KEY,

    /** 获取指定课程的学习进度对象（如 'ziping' | 'xlr' | 'liuren' | 'liuyao'） */
    getCourse(courseId) {
      const s = loadStore();
      if (!s[courseId]) {
        s[courseId] = { read: {} };
      }
      return s[courseId];
    },

    /** 更新指定课程的学习进度 */
    setCourse(courseId, data) {
      const s = loadStore();
      s[courseId] = Object.assign(s[courseId] || {}, data);
      saveStore(s);
      return s[courseId];
    },

    /** 获取全量数据字典快照 */
    getAll() {
      return JSON.parse(JSON.stringify(loadStore()));
    },

    /** 手动触发一次迁移检查（幂等） */
    migrate() {
      return loadStore();
    }
  };

  // 自动触发一次初始化/迁移
  try {
    loadStore();
  } catch (e) {}

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = OccStorage;
  }
  if (typeof global !== 'undefined') {
    global.OccStorage = OccStorage;
  }
})(typeof window !== 'undefined' ? window : globalThis);
