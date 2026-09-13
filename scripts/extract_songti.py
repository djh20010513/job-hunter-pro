#!/usr/bin/env python3
"""
从 macOS 系统字体 Songti.ttc 提取 STSongti-SC-Regular,
保存为独立 .ttf 文件,供 PDF 脚本使用。

为什么需要这个脚本:
  - macOS 的中文字体(Songti/STHeiti/Hiragino)都是 .ttc 集合体,
    里面包含多个变体(简中/繁中/英数/粗体等)。
  - pdfkit 只能读单字体 .ttf,直接读 .ttc 会抛 createSubset 错误。
  - fontTools 知道如何正确解析 Apple 的 TTC 格式,能把单个变体
    提取为独立 .ttf,保留全部表(包含 cmap,这是上次手动切片失败的原因)。

用法:
  python3 scripts/extract_songti.py
  -> 在 .fonts/songti-sc-regular.ttf 生成独立 TTF(~5-10 MB)
"""
from fontTools.ttLib import TTCollection
import os
import sys

# 脚本在 scripts/ 下,项目根目录是上一级
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(SCRIPT_DIR)
SRC = '/System/Library/Fonts/Supplemental/Songti.ttc'
OUT_DIR = os.path.join(ROOT, '.fonts')
OUT = os.path.join(OUT_DIR, 'songti-sc-regular.ttf')


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    if not os.path.exists(SRC):
        print(f'ERROR: 找不到源字体 {SRC}', file=sys.stderr)
        sys.exit(1)

    print(f'正在读取 {SRC} ...')
    try:
        ttc = TTCollection(SRC)
    except Exception as e:
        print(f'ERROR: 打开 TTC 失败: {e}', file=sys.stderr)
        sys.exit(1)

    print(f'找到 {len(ttc.fonts)} 个字体变体')

    # 优先匹配 STSongti-SC-Regular(简体中文,常规字重)
    target = None
    for font in ttc.fonts:
        ps_name = font['name'].getDebugName(6) or ''
        family = font['name'].getDebugName(1) or ''
        if ps_name == 'STSongti-SC-Regular':
            target = font
            print(f'  ✓ 命中首选: {family} / {ps_name}')
            break

    if not target:
        # 后备:任何 Songti SC 变体
        for font in ttc.fonts:
            ps_name = font['name'].getDebugName(6) or ''
            if 'Songti' in ps_name and 'SC' in ps_name:
                target = font
                print(f'  ⚠ 后备命中: {ps_name}')
                break

    if not target:
        print('ERROR: 没找到任何 Songti SC 变体', file=sys.stderr)
        print('TTC 里所有变体:', file=sys.stderr)
        for font in ttc.fonts:
            ps = font['name'].getDebugName(6) or '(none)'
            print(f'  - {ps}', file=sys.stderr)
        sys.exit(1)

    print(f'正在保存到 {OUT} ...')
    try:
        target.save(OUT)
    except Exception as e:
        print(f'ERROR: 保存失败: {e}', file=sys.stderr)
        sys.exit(1)

    size_mb = os.path.getsize(OUT) / 1024 / 1024
    print(f'✓ 完成,大小 {size_mb:.1f} MB')


if __name__ == '__main__':
    main()