#!/usr/bin/env python3
"""Brand-colored audit placeholder frames (not app captures). Run: python3 scripts/generate_audit_placeholders.py"""
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    raise SystemExit("pip install Pillow")

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "screenshots"
OUT.mkdir(parents=True, exist_ok=True)

BG = (247, 248, 250)
PRIMARY = (255, 107, 0)
SURFACE = (255, 255, 255)
TEXT = (26, 26, 26)
MUTED = (107, 114, 128)

SCREENS = [
    ("01_splash.png", "Splash", "FoodApp"),
    ("02_restaurants.png", "Restoranlar", "Banner · Qidiruv · Kartalar"),
    ("03_restaurant_detail.png", "Restoran tafsiloti", "Cover · Menyu"),
    ("04_stores.png", "Do'konlar", "Kategoriyalar · Kartalar"),
    ("05_store_detail.png", "Do'kon tafsiloti", "Mahsulotlar"),
    ("06_cart.png", "Savat", "Miqdor · Jami"),
    ("07_checkout.png", "Buyurtma", "Manzil · To'lov"),
    ("08_profile.png", "Profil", "Kirish · Yordam"),
]


def frame(title: str, subtitle: str) -> Image.Image:
    w, h = 390, 844
    img = Image.new("RGB", (w, h), BG)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((16, 60, w - 16, 200), radius=16, fill=PRIMARY)
    d.text((32, 120), "FoodApp", fill=(255, 255, 255))
    d.rounded_rectangle((16, 220, w - 16, h - 100), radius=16, fill=SURFACE, outline=(234, 234, 234))
    d.text((32, 250), title, fill=TEXT)
    d.text((32, 290), subtitle, fill=MUTED)
    # bottom nav mock
    d.rectangle((0, h - 88, w, h), fill=SURFACE)
    d.line((0, h - 88, w, h - 88), fill=(234, 234, 234), width=1)
    tabs = ["Restoranlar", "Do'konlar", "Savat", "Profil"]
    for i, tab in enumerate(tabs):
        x = 20 + i * 95
        color = PRIMARY if i == 0 and "Restoran" in title else MUTED
        if "Do'kon" in title and i == 1:
            color = PRIMARY
        if title == "Savat" and i == 2:
            color = PRIMARY
        if title == "Profil" and i == 3:
            color = PRIMARY
        d.text((x, h - 52), tab[:8], fill=color)
    return img


def main():
    for name, title, sub in SCREENS:
        frame(title, sub).save(OUT / name)
        print("wrote", OUT / name)
    print("Placeholders only — replace with flutter captures before release.")


if __name__ == "__main__":
    main()
