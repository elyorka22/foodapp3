# Android 15 Edge-to-Edge Audit — `customer_mobile`

Date: 2026-06-29  
App: `apps/customer_mobile` (Play Store customer APK)

## 1. Android configuration (repository state)

| Item | Status |
|------|--------|
| `android/app/build.gradle(.kts)` | **Not committed** — generated in CI via `flutter create` |
| `compileSdkVersion` / `targetSdkVersion` | **Patched at build time** to **35** by `scripts/patch_android_edge_to_edge.sh` |
| `minSdkVersion` | **Not in repo** — comes from Flutter template (typically 21+) |
| `AndroidManifest.xml` | **Not committed** — patched for permissions + display cutout |
| `MainActivity.kt` | **Not committed** — patched with `enableEdgeToEdge()` |

CI: `.github/workflows/customer-mobile-apk.yml` runs `flutter create` then all patch scripts.

## 2. Edge-to-edge fixes (native)

**Script:** `scripts/patch_android_edge_to_edge.sh`

| Fix | Detail |
|-----|--------|
| `MainActivity.onCreate` | Calls `androidx.activity.enableEdgeToEdge()` before `super.onCreate()` |
| `styles.xml` | Transparent `statusBarColor` / `navigationBarColor`, contrast enforcement off |
| `build.gradle` | Forces `compileSdk` / `targetSdk` **35** when numeric literals present |
| `AndroidManifest` | `android:windowLayoutInDisplayCutoutMode="shortEdges"` on activity |

## 3. Edge-to-edge fixes (Flutter)

| File | Fix |
|------|-----|
| `lib/core/system/edge_to_edge.dart` | `SystemUiMode.edgeToEdge` + transparent overlay style |
| `lib/main.dart` | `configureEdgeToEdge()` at startup |
| `lib/app.dart` | Global `AnnotatedRegion<SystemUiOverlayStyle>` |
| `lib/core/theme/app_theme.dart` | AppBar uses `edgeToEdgeOverlay` |
| `lib/core/utils/safe_area_padding.dart` | Bottom inset helper for scroll views |

## 4. Screen audit & layout fixes

### Already safe (no change)

| Screen | Mechanism |
|--------|-----------|
| Home / restaurants | `SafeArea` on `RestaurantsScreen` body |
| Profile | `SafeArea` on `ProfileScreen` |
| Cart / checkout | `CustomerPage` → `SafeArea` + bottom inset padding |
| Auth (login/register) | `AuthSocialLayout` → `SafeArea` |
| Restaurant / store detail | `SafeArea` on body |
| Bottom nav | `FoodAppBottomNav` → `SafeArea(top: false)` |
| Booking | `SafeArea` |

### Fixed in this pass

| Screen | Fix |
|--------|-----|
| Splash | `SafeArea` around splash content |
| Order tracking | `scrollSafePadding` on `ListView` (bottom gesture area) |
| Notifications | `scrollSafePadding` on list |
| All restaurants | `scrollSafePadding` on list |
| Category products | `scrollSafePadding` on grid |
| Stores | `scrollSafePadding` on list |
| Promotions | `scrollSafePadding` on body |
| Complete profile | `scrollSafePadding` on body |

### Remaining risks (low)

| Area | Risk | Mitigation |
|------|------|------------|
| `debug/network_health_screen.dart` | No bottom inset on long content | Debug-only screen |
| `telegram_login_screen` | WebView fullscreen | Already uses partial `SafeArea` |
| Dialogs / `showModalBottomSheet` | Default Flutter safe handling | Use `useSafeArea: true` when adding new sheets |
| iOS | Edge-to-edge config is Android-focused | iOS uses same `SafeArea` helpers; no regression expected |
| `business_mobile` / `courier_mobile` | Separate apps, not patched | Copy `patch_android_edge_to_edge.sh` if published to Play |

## 5. System UI overlay

- **Before:** `SystemUiOverlayStyle.dark` on AppBar only; no global edge-to-edge mode.
- **After:** Transparent bars + dark icons globally via `edgeToEdgeOverlay`; no scattered `SystemChrome` calls elsewhere (none existed).

## 6. Verification checklist

```bash
cd apps/customer_mobile
./scripts/bootstrap.sh          # flutter create + patches
flutter analyze
flutter test
flutter build apk --release \
  --dart-define=API_BASE_URL=... \
  --dart-define=WS_BASE_URL=...
```

On device (Android 15):

1. Status bar icons visible on light backgrounds (home, profile).
2. Bottom nav not clipped by gesture bar.
3. Order tracking / notifications — last button above nav gesture area.
4. Play Console pre-launch report — edge-to-edge warning should clear after upload.

## 7. Files changed

- `lib/core/system/edge_to_edge.dart` (new)
- `lib/core/utils/safe_area_padding.dart` (new)
- `lib/main.dart`
- `lib/app.dart`
- `lib/core/theme/app_theme.dart`
- `lib/features/splash/presentation/splash_page.dart`
- `lib/features/orders/presentation/order_tracking_screen.dart`
- `lib/features/notifications/presentation/notifications_screen.dart`
- `lib/features/restaurants/presentation/all_restaurants_screen.dart`
- `lib/features/restaurants/presentation/category_products_screen.dart`
- `lib/features/stores/presentation/stores_screen.dart`
- `lib/features/promotions/presentation/promotions_screen.dart`
- `lib/features/auth/presentation/complete_profile_screen.dart`
- `scripts/patch_android_edge_to_edge.sh` (new)
- `scripts/bootstrap.sh`
- `.github/workflows/customer-mobile-apk.yml`
- `docs/ANDROID_EDGE_TO_EDGE_AUDIT.md` (this file)
