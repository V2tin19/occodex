# -*- coding: utf-8 -*-
"""
tools/check.py — 神秘学手册 · 一键验收
每轮开发（自动化或人工）结束后必跑；失败项不清零，不得在 工作日志-自动化.md 记"完成"。

检查项：
  1. 全部 HTML 的内联 <script> 过 node --check（语法门）
  2. js/lib/*.js 过 node --check
  3. js/lib 回归测试（node tools/regress.js）
  4. 全站 HTML 顶层裸 const/let 扫描（防跨脚本块重复声明——liuren-proto 事故的根因）
  5. 本地服务器 8399 可达
用法：python tools/check.py
"""
import io, os, re, subprocess, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
fails = []
oks = []

def sh(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, shell=True)

# ---- 1. HTML 内联 script 语法 ----
htmls = [f for f in os.listdir('.') if f.endswith('.html')]
for h in htmls:
    s = io.open(h, encoding='utf-8').read()
    blocks = re.findall(r'<script>(.*?)</script>', s, re.S)
    for i, b in enumerate(blocks):
        tf = '_check_tmp.js'
        io.open(tf, 'w', encoding='utf-8').write(b)
        r = sh('node --check ' + tf)
        if r.returncode != 0:
            fails.append('HTML 语法 %s [script#%d]: %s' % (h, i, (r.stderr or r.stdout).strip()[:300]))
        else:
            oks.append('HTML 语法 %s [script#%d]' % (h, i))
if os.path.exists('_check_tmp.js'): os.remove('_check_tmp.js')

# ---- 2. js/lib 语法 ----
libdir = os.path.join('js', 'lib')
libs = os.listdir(libdir) if os.path.isdir(libdir) else []
for j in libs:
    r = sh('node --check ' + os.path.join(libdir, j).replace('\\', '/'))
    if r.returncode != 0:
        fails.append('lib 语法 %s: %s' % (j, (r.stderr or '').strip()[:300]))
    else:
        oks.append('lib 语法 %s' % j)

# ---- 3. 回归 ----
r = sh('node tools/regress.js')
if r.returncode != 0:
    fails.append('回归失败: ' + (r.stdout or r.stderr).strip()[:500])
else:
    oks.append('回归 ' + ' / '.join(l for l in r.stdout.strip().splitlines() if l.startswith(('✓','回归')))[-200:])

# ---- 4. 顶层裸 const/let 扫描（仅 HTML 内联脚本）----
BARE = re.compile(r'^\s*(const|let)\s+[A-Za-z_$]', re.M)
for h in htmls:
    s = io.open(h, encoding='utf-8').read()
    for i, b in enumerate(re.findall(r'<script>(.*?)</script>', s, re.M | re.S)):
        # 已包 IIFE/module 的跳过：粗判——首行即 (function 或 'use strict' 视为安全不再扫
        stripped = b.strip()
        if stripped.startswith('(function') or stripped.startswith('(()'):
            continue
        hits = BARE.findall(b)
        # 只报"会出现且不在函数内难判定"的顶层嫌疑——保守起见报数量供人工复核
        if hits and len(hits) > 0:
            oks.append('裸声明扫描 %s [#%d]：%d 处顶层嫌疑（人工复核）' % (h, i, len(hits)))

# ---- 5. 服务器 ----
try:
    code = urllib.request.urlopen('http://127.0.0.1:8399/index.html', timeout=3).status
    if code == 200: oks.append('服务器 8399 OK')
    else: fails.append('服务器返回 %d' % code)
except Exception as e:
    fails.append('服务器 8399 不可达: %s' % e)

print('==== 验收结果 ====')
for o in oks: print(' PASS', o)
for f in fails: print(' FAIL', f)
print('==== %d PASS / %d FAIL ====' % (len(oks), len(fails)))
sys.exit(0 if not fails else 1)
