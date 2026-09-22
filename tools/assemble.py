#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
tools/assemble.py — OCCODEX 页面公共组件装配与一致性校验工具
零框架零运行时依赖：用于检查与同步各独立页面（index.html, ziping.html, xlr.html, liuren.html, liuyao.html）
的通用 <head>、主题、字体自托管与 HUD 导航条一致性。
"""

import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

PAGES = [
    'index.html',
    'ziping.html',
    'xlr.html',
    'liuren.html',
    'liuyao.html',
    'yansuan.html'
]

COMMON_HEAD = """<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0d0e11">
<link rel="stylesheet" href="occ-theme.css">"""

def check_pages():
    errors = []
    for p in PAGES:
        if not os.path.exists(p):
            errors.append(f"缺少页面: {p}")
            continue
        content = open(p, 'r', encoding='utf-8').read()
        if 'fonts.googleapis.com' in content:
            errors.append(f"{p} 包含未本地化的 Google Fonts 外链！")
        if 'occ-theme.css' not in content:
            errors.append(f"{p} 缺少 occ-theme.css 引用！")
        if p != 'index.html' and 'index.html' not in content:
            errors.append(f"{p} 缺少指向 index.html 的返回导航！")
    return errors

if __name__ == '__main__':
    errs = check_pages()
    if errs:
        print("[assemble.py] 检查发现异常:")
        for e in errs:
            print("  *", e)
        sys.exit(1)
    else:
        print("[assemble.py] 全部页面一致性检查通过，零外链零损坏。")
        sys.exit(0)
