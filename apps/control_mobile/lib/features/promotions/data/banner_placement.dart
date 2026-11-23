/// Banner placements aligned with the **new** customer web home.
///
/// Live home shows one full-width banner strip. Old slots are not separate
/// surfaces — new banners always save as [canonicalHome].
abstract final class BannerPlacement {
  /// Canonical placement for the home offers carousel.
  static const canonicalHome = 'PROMO';

  /// Placements that appear on the new home carousel (incl. legacy).
  static const homeVisible = {
    'PROMO',
    'HERO',
    'HOME_MAIN',
    'HOME_SIDE_TOP',
  };

  /// Old store-strip slot — not used on the new web home.
  static const legacyStoreStrip = 'HOME_SIDE_BOTTOM';

  static bool isHomeVisible(String? raw) {
    final p = (raw ?? '').trim().toUpperCase();
    if (p.isEmpty) return true;
    return homeVisible.contains(p);
  }

  /// Uzbek label for list / form (new design vocabulary).
  static String labelUz(String? raw) {
    final p = (raw ?? '').trim().toUpperCase();
    switch (p) {
      case 'PROMO':
      case 'HERO':
      case 'HOME_MAIN':
      case 'HOME_SIDE_TOP':
      case '':
        return 'Bosh sahifa banneri';
      case 'HOME_SIDE_BOTTOM':
        return 'Eski — endi ko‘rinmaydi';
      default:
        return p.isEmpty ? 'Bosh sahifa banneri' : p;
    }
  }

  /// Map any stored value to what we write for the new home.
  static String normalizeForSave(String? raw) {
    final p = (raw ?? '').trim().toUpperCase();
    if (p == legacyStoreStrip) return legacyStoreStrip;
    return canonicalHome;
  }
}
