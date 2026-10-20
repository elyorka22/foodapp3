# Home service card images

Transparent **real PNG** files (not WebP renamed to `.png` — nginx sends
`X-Content-Type-Options: nosniff`, so a WebP body with `image/png` breaks
on many devices and cards fall back to Lucide icons).

| File | Card |
|------|------|
| `restaurants.png` | Restoranlar (row 2, large) |
| `products.png` | Mahsulotlar (row 2, small) |
| `pharmacy.png` | Dorixona (row 1) |
| `cosmetics.png` | Kosmetika (row 1) |
| `flowers.png` | Gullar (row 1) |

Requirements:
- Actual PNG encoding + transparent background
- Soft baked-in shadow preferred
- ~400–600px on the long side
