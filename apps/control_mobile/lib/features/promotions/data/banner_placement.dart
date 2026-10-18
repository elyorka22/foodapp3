/// Banner placements aligned with the **new** customer web home.
///
/// Live home (`frontend` `/`) shows one strip: «Maxsus takliflar»
/// ([HomePromoBanners]). Old grid slots (HOME_MAIN / SIDE_*) are no longer
/// separate UI surfaces — new banners always save as [canonicalHome].
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
        return 'Maxsus takliflar';
      case 'HOME_SIDE_BOTTOM':
        return 'Eski — do‘kon qatori';
      default:
        return p.isEmpty ? 'Maxsus takliflar' : p;
    }
  }

  /// Map any stored value to what we write for the new home.
  static String normalizeForSave(String? raw) {
    final p = (raw ?? '').trim().toUpperCase();
    if (p == legacyStoreStrip) return legacyStoreStrip;
    return canonicalHome;
  }
}
