abstract final class AppStrings {
  static const appName = 'FoodApp Control';
  static const appTagline = 'Platforma boshqaruvi';

  static const loginTitle = 'Super admin kirishi';
  static const loginSubtitle = 'Faqat SUPER_ADMIN hisoblari uchun';
  static const loginIdHint = 'Email yoki telefon';
  static const password = 'Parol';
  static const login = 'Kirish';
  static const logout = 'Chiqish';
  static const wrongRole =
      'Bu ilova faqat SUPER_ADMIN uchun. FoodApp Business yoki veb-panelni ishlating.';
  static const loginFailed = 'Kirish amalga oshmadi';

  static const splashLoading = 'Yuklanmoqda…';

  static const navDashboard = 'Boshqaruv';
  static const navEmployees = 'Xodimlar';
  static const navBusinesses = 'Bizneslar';
  static const navOrders = 'Buyurtmalar';
  static const navCatalog = 'Kategoriyalar';
  static const navPromotions = 'Bannerlar';
  static const navSettings = 'Sozlamalar';
  static const navAudit = 'Audit';

  static const dashboardTitle = 'Boshqaruv paneli';
  static const dashboardWelcome = 'Xush kelibsiz';
  static const recentOrders = 'So‘nggi buyurtmalar';
  static const pullToRefresh = 'Yangilash uchun pastga torting';

  static const employeesTitle = 'Xodimlar';
  static const businessesTitle = 'Restoran va do‘konlar';
  static const ordersTitle = 'Buyurtmalar';
  static const catalogTitle = 'Kategoriyalar va mahsulotlar';
  static const promotionsTitle = 'Bannerlar va promo';
  static const settingsTitle = 'Ilova sozlamalari';
  static const mediaSection = 'Rasmlar va bannerlar';
  static const mediaSectionHint =
      'Banner va kategoriya rasmlarini yuklash, o‘lcham va joylashuvini sozlash';
  static const categoriesSection = 'Kategoriyalar';
  static const productsSection = 'Mahsulotlar';
  static const addCategory = 'Kategoriya + rasm';
  static const editCategory = 'Kategoriyani tahrirlash';
  static const categoryName = 'Kategoriya nomi';
  static const categoryImageHint =
      'Kategoriyani bosing — rasm yuklash, masshtab va joylashuv';
  static const categoryEmptyHint =
      'Hali kategoriya yo‘q. Yuqoridagi tugma orqali qo‘shing va rasm yuklang.';
  static const confirmDeleteCategory =
      'Kategoriyani o‘chirishni tasdiqlaysizmi?';
  static const bannerEmptyHint =
      'Hali banner yo‘q. «Banner qo‘shish» → «Galereyadan tanlash».';
  static const auditTitle = 'Audit jurnali';

  static const emptyList = 'Hali ma’lumot yo‘q';
  static const retry = 'Qayta urinish';
  static const save = 'Saqlash';
  static const saved = 'Saqlandi';
  static const loading = 'Yuklanmoqda…';
  static const cancel = 'Bekor qilish';
  static const confirm = 'Tasdiqlash';
  static const create = 'Yaratish';
  static const edit = 'Tahrirlash';
  static const delete = 'O‘chirish';
  static const actionDone = 'Bajarildi';
  static const active = 'Faol';
  static const inactive = 'Nofaol';
  static const details = 'Tafsilotlar';

  // Orders manage
  static const orderStatus = 'Status';
  static const changeStatus = 'Statusni o‘zgartirish';
  static const assignCourier = 'Kuryer biriktirish';
  static const reassignCourier = 'Kuryerni almashtirish';
  static const removeCourier = 'Kuryerni olib tashlash';
  static const requestCourier = 'Kuryer so‘rash';
  static const selectCourier = 'Kuryerni tanlang';
  static const cancelOrder = 'Buyurtmani bekor qilish';
  static const cancelReason = 'Bekor qilish sababi';
  static const confirmRemoveCourier =
      'Buyurtmadan kuryerni olib tashlamoqchimisiz?';

  // Businesses manage
  static const approve = 'Tasdiqlash';
  static const reject = 'Rad etish';
  static const suspend = 'To‘xtatish';
  static const setActive = 'Faollashtirish';
  static const setInactive = 'O‘chirish (nofaol)';
  static const ownerAccount = 'Egasi hisobi';
  static const ownerLogin = 'Login';
  static const ownerPassword = 'Parol';
  static const ownerFullName = 'To‘liq ism';
  static const createOwnerAccount = 'Egasi hisobini yaratish';
  static const approvalStatus = 'Tasdiq holati';
  static const confirmRejectBusiness =
      'Biznesni rad etmoqchimisiz?';
  static const phoneLabel = 'Telefon';
  static const nameLabel = 'Nomi';
  static const addressLabel = 'Manzil';

  // Employees manage
  static const addEmployee = 'Xodim qo‘shish';
  static const deactivate = 'Faolsizlantirish';
  static const activate = 'Faollashtirish';
  static const resetPassword = 'Parolni yangilash';
  static const newPassword = 'Yangi parol';
  static const roleLabel = 'Rol';
  static const emailLabel = 'Email';
  static const fullNameLabel = 'To‘liq ism';
  static const confirmDeactivate = 'Xodimni faolsizlantirmoqchimisiz?';

  // Catalog / promotions
  static const toggleAvailability = 'Mavjudlikni almashtirish';
  static const softDeleteProduct = 'Mahsulotni o‘chirish';
  static const confirmDeleteProduct = 'Mahsulotni o‘chirishni tasdiqlaysizmi?';
  static const addPromo = 'Promo qo‘shish';
  static const addBanner = 'Banner qo‘shish';
  static const promoCode = 'Promo kod';
  static const promoType = 'Turi';
  static const promoValue = 'Qiymat';
  static const bannerTitle = 'Banner sarlavhasi';
  static const bannerDescription = 'Tavsif';
  static const bannerImageUrl = 'Rasm URL';
  static const bannerPickImage = 'Galereyadan tanlash';
  static const bannerChangeImage = 'Rasmni almashtirish';
  static const bannerRemoveImage = 'Rasmni olib tashlash';
  static const bannerUploading = 'Yuklanmoqda…';
  static const bannerImageRequired = 'Rasm majburiy — yuklang yoki URL kiriting';
  static const bannerImageFraming = 'Rasm joylashuvi';
  static const bannerImagePreviewHint = 'Rasm yuklang — oldindan ko‘rish';
  static const bannerImageScale = 'Masshtab';
  static const bannerImagePosX = 'Gorizontal';
  static const bannerImagePosY = 'Vertikal';
  static const bannerLink = 'Havola';
  static const bannerPlacement = 'Joylashuv';
  static const bannerSortOrder = 'Tartib';
  static const confirmDeletePromo = 'Promo kodni o‘chirishni tasdiqlaysizmi?';
  static const confirmDeleteBanner = 'Bannerni o‘chirishni tasdiqlaysizmi?';

  // Push
  static const navPush = 'Push';
  static const pushTitle = 'Push xabar';
  static const pushSend = 'Yuborish';
  static const pushAudience = 'Auditoriya';
  static const pushMessageTitle = 'Sarlavha';
  static const pushMessageBody = 'Matn';
  static const pushSent = 'Push yuborildi';

  // Platform
  static const navMore = 'Platforma';
  static const navCities = 'Shaharlar';
  static const filterByCity = 'Shahar bo‘yicha';
  static const allCities = 'Barcha shaharlar';
  static const navBusinessTypes = 'Biznes turlari';
  static const navCouriers = 'Kuryerlar';
  static const navCustomers = 'Mijozlar';
  static const navBooking = 'Bron';
  static const platformSection = 'Platforma boshqaruvi';
  static const deliveryPricing = 'Yetkazib berish narxlari';
  static const baseDeliveryFee = 'Asosiy narx';
  static const perKmFee = 'Km uchun';
  static const maxDeliveryDistance = 'Maks. masofa (km)';
  static const courierPricePerKm = 'Kuryer / km';
  static const courierMinFee = 'Kuryer min.';
  static const addCity = 'Shahar qo‘shish';
  static const addBusinessType = 'Tur qo‘shish';
  static const addCourier = 'Kuryer qo‘shish';
  static const vehicleType = 'Transport';
  static const online = 'Onlayn';
  static const offline = 'Oflayn';
  static const venuesSection = 'Joylar';
  static const slidesSection = 'Slaydlar';
  static const systemHealth = 'Tizim holati';

  static const cardTodayOrders = 'Bugungi buyurtmalar';
  static const cardPending = 'Kutilayotgan';
  static const cardRevenueToday = 'Bugungi tushum';
  static const cardRevenueMonth = 'Oylik tushum';
  static const cardActiveRestaurants = 'Faol restoranlar';
  static const cardActiveStores = 'Faol do‘konlar';
  static const cardCouriers = 'Onlayn kuryerlar';
  static const cardDelivered = 'Yetkazilgan';

  static const cardEmployees = 'Xodimlar';
  static const cardBusinesses = 'Bizneslar';
  static const cardOrders = 'Buyurtmalar';
  static const cardOpenIssues = 'Diqqat talab';

  static const bannersSection = 'Bannerlar';
  static const promosSection = 'Promo kodlar';

  static const settingsAppName = 'Ilova nomi';
  static const settingsSupportPhone = 'Qo‘llab-quvvatlash telefoni';
  static const settingsSupportEmail = 'Qo‘llab-quvvatlash email';
  static const settingsMinOrder = 'Minimal buyurtma (so‘m)';
  static const settingsDeliveryFee = 'Yetkazib berish narxi';
  static const settingsCommission = 'Komissiya (%)';

  static const requiredBackendClient =
      'Kirish so‘rovida client=control yuboriladi. Faqat SUPER_ADMIN qabul qilinadi.';

  static const diagOpen = 'Diagnostika / Loglar';
  static const diagTitle = 'Diagnostika';
  static const diagDisclaimer =
      'Loglarda parol, token yoki so‘rov/javob body yo‘q. Health tekshiruvi login emas.';
  static const diagSearch = 'Qidiruv';
  static const diagRefresh = 'Loglarni yangilash';
  static const diagCopy = 'Loglarni nusxalash';
  static const diagShare = 'Loglarni ulashish';
  static const diagClear = 'Loglarni tozalash';
  static const diagHealth = 'Serverni tekshirish';
  static const diagProbeDio = 'Dio orqali tekshirish';
  static const diagProbeHttpClient = 'HttpClient orqali tekshirish';
  static const diagProbeDnsTls = 'DNS va TLS tekshiruvi';
  static const diagRetryLogin = 'Loginni qayta sinash';
  static const diagEmpty = 'Hali log yo‘q. Login yoki Serverni tekshirishni bosing.';
  static const diagCopied = 'Loglar buferga nusxalandi.';
  static const diagCleared = 'Loglar tozalandi.';
  static const diagHealthDone = 'Health so‘rovi yakunlandi — logni ko‘ring.';
  static const diagProbeDone = 'Tekshiruv yakunlandi — taqqoslash qatorini ko‘ring.';
  static const diagCompareTitle = 'Taqqoslash (oxirgi natijalar)';
  static const diagLoginOk = 'Login muvaffaqiyatli.';
  static const diagNeedCredentials =
      'Avval login ekranida email/parol kiriting, keyin qayta sinang.';
}
