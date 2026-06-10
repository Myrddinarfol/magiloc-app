#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour créer une icône Windows .ico pour MagiApps
"""
import sys
import os

# Configurer l'encodage UTF-8
os.environ['PYTHONIOENCODING'] = 'utf-8'
sys.stdout.reconfigure(encoding='utf-8')

try:
    from PIL import Image, ImageDraw

    # Créer une image 256x256 avec dégradé vert
    img = Image.new('RGBA', (256, 256), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Dégradé vert
    color_light = (16, 185, 129)  # #10b981
    color_dark = (5, 150, 105)    # #059669

    # Remplir avec dégradé
    for y in range(256):
        ratio = y / 256
        r = int(color_light[0] * (1 - ratio) + color_dark[0] * ratio)
        g = int(color_light[1] * (1 - ratio) + color_dark[1] * ratio)
        b = int(color_light[2] * (1 - ratio) + color_dark[2] * ratio)
        draw.line([(0, y), (256, y)], fill=(r, g, b, 255))

    # Boîte blanche au centre
    draw.rounded_rectangle([40, 60, 216, 200], radius=16, fill=(255, 255, 255, 240), outline=(5, 150, 105, 255), width=3)

    # Cercle de location
    draw.ellipse([110, 110, 146, 146], fill=(16, 185, 129, 255))

    # Sauvegarder en PNG
    img.save('magiapps-icon.png')

    # Créer les différentes tailles pour l'ICO
    sizes = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)]
    icons = []

    for size in sizes:
        icon = img.resize(size, Image.Resampling.LANCZOS)
        icons.append(icon)

    # Sauvegarder en ICO
    icons[0].save('magiapps-icon.ico', sizes=sizes)

    print("[OK] Icon created successfully!")
    print("   - magiapps-icon.png (256x256)")
    print("   - magiapps-icon.ico (multi-resolution)")

except Exception as e:
    print(f"[ERROR] {str(e)}")
