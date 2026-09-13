/* ============================================================
   神秘学手册 · 全局昼夜主题驱动（各课程页共用）
   - localStorage 键 occ_theme：'day' | 'night'（缺省跟随系统）
   - 同源页面（含 iframe）通过 storage 事件互相同步
   - index.html 的主题按钮写同一个键；本页无按钮时自动注入一枚
   ============================================================ */
(function(){
  var KEY='occ_theme';
  function cur(){try{return localStorage.getItem(KEY)}catch(e){return null}}
  function sys(){try{return matchMedia('(prefers-color-scheme: light)').matches?'day':'night'}catch(e){return 'night'}}
  function set(t){try{localStorage.setItem(KEY,t)}catch(e){} apply(t);}
  function apply(t){
    document.body.classList.toggle('daylight',t==='day');
    var b=document.getElementById('occThemeBtn');
    if(b){b.textContent=t==='day'?'夜':'昼';
      b.title=t==='day'?'切换到夜间模式':'切换到昼间模式';}
  }
  apply(cur()||sys());
  window.addEventListener('storage',function(e){
    if(e.key===KEY)apply(cur()||sys());
  });
  document.addEventListener('DOMContentLoaded',function(){
    if(document.getElementById('occThemeBtn'))return;
    var b=document.createElement('button');
    b.id='occThemeBtn';b.className='occ-theme-btn';
    b.addEventListener('click',function(){
      set(document.body.classList.contains('daylight')?'night':'day');
    });
    document.body.appendChild(b);
    apply(cur()||sys());
  });
})();
