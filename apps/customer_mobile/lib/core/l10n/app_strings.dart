/// Uzbek UI strings — aligned with web customer app.
abstract final class AppStrings {
  static const appName = 'Foodapp';

  static const navHome = 'Bosh sahifa';
  static const navRestaurants = 'Restoranlar';
  static const navStores = "Do'konlar";
  static const storesSubtitle = "Shahardagi barcha do'konlar va xizmatlar";
  static const storesEmpty = "Do'konlar topilmadi";
  static const navCart = 'Savat';
  static const navProfile = 'Profil';
  static const profileAccount = 'Hisob';
  static const profileGuestName = 'Mehmon';
  static const profileLoginSubtitle = 'akkauntga kiring';
  static const profileRegisterSubtitle = "yangi hisob oching";
  static const profileTelegramSubtitle = 'tez kirish';
  static const profilePromotionsSubtitle = "maxsus takliflar";
  static const profileNotificationsSubtitle = "yangi xabarlar";
  static const profileHelpSubtitle = 'savollar va yordam';
  static const profilePartnershipSubtitle = 'biznes takliflari va hamkorlik';
  static const profileSocialTitle =
      "Bizni ijtimoiy tarmoqlarda kuzatib boring";
  static const profileSocialFollow = "obuna bo'ling";
  static const profileSocialLinkMissing =
      "Havola hali sozlanmagan. Admin panelda saqlang.";
  static const profileTermsSubtitle = "qoidalar va maxfiylik";
  static const profileLanguageSubtitle = "o'zbek / русский";

  static const searchRestaurants = 'Restoran qidirish';
  static const searchStores = "Do'kon qidirish";
  static const categories = 'Kategoriyalar';
  static const dishCategories = 'Taom kategoriyalari';
  static const allRestaurants = 'Barcha restoranlar';
  static const popular = 'Mashhur';
  static const seeAll = 'Barchasi';

  static const cartEmpty = "Savat bo'sh";
  static const cartTitle = 'Savat';
  static const browseRestaurants = "Restoranlarni ko'rish";
  static const remove = "O'chirish";
  static const subtotal = 'Jami';
  static const clear = 'Tozalash';
  static const checkout = 'Buyurtma berish';
  static const checkoutStepDetails = 'Ma\'lumotlar';
  static const checkoutStepDelivery = 'Yetkazish';
  static const checkoutTitle = 'Buyurtmani rasmiylashtirish';
  static const noAccountRequired = "Ro'yxatdan o'tish shart emas";
  static const checkoutPromoLabel = '🎁 Promo kod';
  static const promoCode = 'Promo kod';
  static const apply = "Qo'llash";
  static const invalidPromo = "Promo kod noto'g'ri";
  static const promoValidateFailed = 'Promo tekshirilmadi';
  static String promoDiscount(String amount) => 'Chegirma: $amount';
  static const phonePlaceholder = '90 123 45 67';
  static const commentOptional = 'Izoh (ixtiyoriy)';
  static const placingOrder = 'Buyurtma yuborilmoqda...';
  static const deliveryFee = 'yetkazish';
  static const deliveryLabel = 'Yetkazish';
  static const productsSubtotal = 'Mahsulotlar';
  static const orderTotal = 'Jami';
  static const locationRequiredShort = 'Joylashuv kerak';
  static const sendLocation = 'Joylashuvni yuborish';
  static const deliveryAddressOptional =
      'Manzil (ixtiyoriy — yetkazishni aniqlashtirish uchun)';
  static const calculateDeliveryPrice = 'Yetkazish narxini hisoblash';
  static const recalculateDeliveryPrice = 'Yetkazish narxini qayta hisoblash';
  static const deliveryPriceHint =
      'Yetkazish narxini bilish uchun tugmani bosing. Manzil ixtiyoriy.';
  static const deliveryCalculating = 'Yetkazish narxi hisoblanmoqda...';
  static const deliveryPriceCalculated = 'Yetkazish narxi hisoblandi';
  static const deliveryPriceRequired =
      'Buyurtma berishdan oldin yetkazish narxini hisoblang (joylashuvni yuboring).';
  static String distanceKm(num km) => 'Masofa: $km km';
  static const assignedCourier = 'Kuryer';
  static const courierPhone = 'Kuryer telefoni';
  static const orderStatusLabel = 'Holat';
  static const locationSent = 'Joylashuv qabul qilindi — narx hisoblanmoqda';
  static const detectingLocation = 'Aniqlanmoqda...';
  static const deliveryAddressRequired = 'Yetkazish manzilini kiriting.';
  static const locationRequired =
      'Yetkazish uchun «Joylashuvni yuborish» tugmasini bosing.';
  static const locationSendFailed =
      "Joylashuvni yuborib bo'lmadi. Ruxsat bering yoki qayta urinib ko'ring.";
  static const orderFailed = 'Buyurtma amalga oshmadi';
  static const total = 'Jami';
  static const quantity = 'Miqdor';

  static const login = 'Kirish';
  static const register = "Ro'yxatdan o'tish";
  static const loginSocialSubtitle =
      'Google yoki Telegram orqali tez va xavfsiz kiring';
  static const registerSocialSubtitle =
      "Bir necha soniyada hisob oching — telefon va parol hozircha shart emas";
  static const noAccountRegister = "Hisobingiz yo'qmi? Ro'yxatdan o'ting";
  static const haveAccountLogin = 'Akkauntingiz bormi? Kirish';
  static const logout = 'Chiqish';
  static const deleteAccount = 'Hisobni o\'chirish';
  static const deleteAccountTitle = 'Hisobni o\'chirish';
  static const deleteAccountWarning =
      'Bu amal qaytarib bo\'lmaydi. Profilingiz, telefon raqamingiz, saqlangan manzillar, '
      'joylashuv ma\'lumotlari, bildirishnoma tokenlari, autentifikatsiya ma\'lumotlari va '
      'shaxsiy ma\'lumotlaringiz o\'chiriladi va tiklab bo\'lmaydi.';
  static const deleteAccountConfirm = 'Hisobni o\'chirish';
  static const deleteAccountCancel = 'Bekor qilish';
  static const deleteAccountPhoneRequired =
      'Hisobni o\'chirish uchun avval telefon raqamini qo\'shing.';
  static const deleteAccountSuccess = 'Hisobingiz o\'chirildi';
  static const guestBrowse = 'Mehmon sifatida davom etish';
  static const phone = 'Telefon';
  static const password = 'Parol';
  static const fullName = 'Ism';
  static const telegramLogin = 'Telegram orqali kirish';
  static const continueWithGoogle = 'Google orqali davom etish';
  static const googleSignInCancelled = 'Google kirish bekor qilindi';
  static const googleSignInFailed = 'Google orqali kirish amalga oshmadi';
  static const googleSignInConfigError =
      'Google kirish sozlanmagan. Firebase Console ga APK SHA-1 sertifikatini qo\'shing va google-services.json ni yangilang.';
  static const googleSignInFirebaseNotReady =
      'Firebase ishga tushmagan. Ilovani qayta o\'rnating.';
  static const or = 'yoki';
  static const language = 'Til';
  static const help = 'Yordam';
  static const partnership = 'Hamkorlik';
  static const contactViaTelegram = "Telegram orqali bog'laning";
  static const contactViaPhone = "Telefon orqali bog'laning";
  static const openTelegram = 'Telegramga yozish';
  static const contactNotConfigured =
      "Hozircha bog'lanish ma'lumotlari sozlanmagan.";
  static const instagram = 'Instagram';
  static const telegram = 'Telegram';
  static const youtube = 'YouTube';
  static const terms = 'Foydalanish shartlari';

  static const deliveryAddress = 'Yetkazish manzili';
  static const deliveryMethod = 'Yetkazish usuli';
  static const paymentMethod = "To'lov usuli";
  static const placeOrder = 'Buyurtmani tasdiqlash';
  static String checkoutPlaceOrderWithTotal(String total) => '🛵 ${total}ga buyurtma berish';
  static const checkoutEnterPhone = 'Telefon raqamini kiriting';
  static const checkoutPhoneEntered = 'Raqam kiritildi';
  static const checkoutPlaceOrder = 'Buyurtmani rasmiylashtirish';
  static const phoneRequiredForOrders = 'Buyurtma uchun telefon raqam kerak';

  static const loading = 'Yuklanmoqda...';
  static const retry = 'Qayta urinish';
  static const back = 'Orqaga';
  static const errorGeneric = 'Xatolik yuz berdi';

  static const addToCart = "Savatga qo'shish";
  static const open = 'Ochiq';
  static const closed = 'Yopiq';
  static String closesAt(String time) => '$time da yopiladi';
  static const openNowHint = 'Hozir buyurtma bera olasiz';
  static const closingSoonTitle = 'Tez orada yopiladi';
  static const closedHint =
      'Menyuni ko\'rishingiz mumkin, buyurtma berib bo\'lmaydi.';
  static const restaurantClosed =
      'Restoran hozir yopiq. Menyuni ko\'rishingiz mumkin, buyurtma berib bo\'lmaydi.';
  static const menuEmpty = 'Menyu hozircha bo\'sh';

  static const completeProfile = "Profilni to'ldirish";
  static const completeProfileHint =
      'Buyurtma berish uchun telefon raqamingizni kiriting.';
  static const save = 'Saqlash';

  static const deliveryLocation = 'Yetkazish joylashuvi';
  static const detectLocation = 'Joylashuvni aniqlash';
  static const locationUnavailable =
      'Joylashuv aniqlanmadi. GPS yoqing yoki qayta urinib ko‘ring.';
  static const locationPermissionDenied =
      'Joylashuv ruxsati kerak. Sozlamalardan ruxsat bering.';
  static const locationPermissionSettings =
      'Joylashuv ruxsati o‘chirilgan. Sozlamalarni oching.';
  static const locationServiceDisabled =
      'GPS o‘chirilgan. Qurilmada joylashuvni yoqing.';
  static const locationTimeout = 'Joylashuv vaqti tugadi. Qayta urinib ko‘ring.';
  static const openSettings = 'Sozlamalar';

  static const networkOffline =
      'Internet ulanishi yo‘q. Qayta urinib ko‘ring.';
  static const networkTimeout = 'So‘rov vaqti tugadi. Qayta urinib ko‘ring.';
  static const networkError = 'Tarmoq xatosi. Qayta urinib ko‘ring.';
  static const orderTrackingStale =
      'Yangilanish vaqtincha mavjud emas. Oxirgi ma’lumot ko‘rsatilmoqda.';
  static const locationGps = 'Joriy joylashuv (GPS)';
  static const locationCached = 'Saqlangan joylashuv';
  static const locationProfile = 'Profil manzili';
  static const locationManual = 'Qo‘lda saqlangan';

  static const orderTracking = 'Buyurtma holati';
  static const activeOrderTitle = 'Joriy buyurtma';
  static const activeOrderTrack = 'Batafsil kuzatish';
  static const orderNumber = 'Buyurtma';
  static const orderCancelled = 'Buyurtma bekor qilindi';
  static const liveUpdatesHint = 'Holat avtomatik yangilanadi';
  static const backToRestaurants = 'Restoranlarga qaytish';

  static const notificationsTitle = 'Bildirishnomalar';
  static const notificationsLoginRequired =
      'Tarixni ko\'rish uchun avval profilingizga kiring. Push xabarlar esa login qilmasdan ham keladi.';
  static const notificationsEmpty = "Hozircha yangi bildirishnomalar yo'q.";
  static const notificationsMarkAll = "Hammasini o'qilgan";

  static const promotionsTitle = 'Aksiyalar';
  static const promotionsHint =
      "Maxsus takliflar va promo kodlar tez orada shu yerda ko'rinadi.";

  static const bookingBadge = 'Stol bron';
  static const bookingTitle = 'Stol va zal bron qiling';
  static const bookingSubtitle =
      "Sevimli restoranlarda stol yoki bayram zalini oldindan band qiling";
  static const bookingFeatureTables = 'Stollar';
  static const bookingFeatureTablesHint = 'Romantik kechalar va uchrashuvlar';
  static const bookingFeatureHalls = 'Bayram zallari';
  static const bookingFeatureHallsHint = "Tug'ilgan kun, to'y va korporativ";
  static const bookingVenuesTitle = 'Joylar';
  static const bookingEmpty = "Hozircha joylar qo'shilmagan";
  static const bookingViewVenue = "Batafsil ko'rish";
  static const bookingCallToReserve = "Bron uchun qo'ng'iroq";
  static const bookingNoPhone = "Telefon raqami qo'shilmagan";
  static const bookingVenueNotFound = 'Joy topilmadi';
  static const bookingTypeTable = 'Stol';
  static const bookingTypeHall = 'Zal';
  static const bookingTypeBoth = 'Stol va zal';
  static const bookingLoadError = 'Joylar yuklanmadi';
}
