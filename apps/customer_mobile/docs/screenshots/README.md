# Screenshots

Required audit frames (8):

| File | Screen |
|------|--------|
| `01_splash.png` | Splash |
| `02_restaurants.png` | Restaurants list |
| `03_restaurant_detail.png` | Restaurant detail |
| `04_stores.png` | Stores list |
| `05_store_detail.png` | Store detail |
| `06_cart.png` | Cart |
| `07_checkout.png` | Checkout |
| `08_profile.png` | Profile |

## Generate

```bash
cd apps/customer_mobile
./scripts/bootstrap.sh
# Start backend on :4000, then:
flutter run
# Capture manually from simulator, or implement integration_test/screenshot_test.dart
```

**Audit note (2026-06-03):** Current PNGs are **brand-colored placeholders** from `scripts/generate_audit_placeholders.py`, not Flutter runtime captures. Replace with real simulator/device screenshots before release.
