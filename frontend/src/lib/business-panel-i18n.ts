/** Restaurant / business staff panel — Uzbek UI */
export const businessPanelI18n = {
  defaultTitle: 'Restoran',
  loading: 'Yuklanmoqda...',
  loadingDashboard: 'Boshqaruv paneli yuklanmoqda...',
  loadingSchedule: 'Jadval yuklanmoqda...',
  noRestaurantLinked: "Hisobingizga restoran bog'lanmagan.",

  nav: {
    dashboard: 'Boshqaruv paneli',
    orders: 'Buyurtmalar',
    schedule: 'Ish vaqti va bayramlar',
    telegram: 'Telegram buyurtmalar',
  },

  stats: {
    orders: 'Buyurtmalar',
    revenue: 'Tushum',
    revenueToday: 'Bugungi tushum',
    revenueWeek: 'Haftalik tushum',
    revenueMonth: 'Oylik tushum',
    ordersToday: 'Bugungi buyurtmalar',
    ordersWeek: 'Haftalik buyurtmalar',
    avgOrder: "O'rtacha buyurtma",
  },

  charts: {
    revenueTrend: 'Tushum dinamikasi (30 kun)',
    ordersTrend: 'Buyurtmalar dinamikasi (30 kun)',
    commissionTrend: 'Platforma komissiyasi (30 kun)',
  },

  commission: {
    title: 'Platforma komissiyasi',
    rate: 'Komissiya foizi',
    today: 'Bugungi komissiya',
    week: 'Haftalik komissiya',
    month: 'Oylik komissiya',
    netToday: 'Bugungi sof tushum',
    netWeek: 'Haftalik sof tushum',
    netMonth: 'Oylik sof tushum',
    netShort: 'Sof tushum',
  },

  topProducts: 'Eng ko‘p sotilgan mahsulotlar',
  noSalesYet: "Hali sotuvlar yo'q",
  manageOrders: 'Buyurtmalarni boshqarish →',

  period: {
    today: 'Bugun',
    week: '7 kun',
    month: 'Oy',
  },

  ordersPage: {
    title: 'Buyurtmalar',
    filterAll: 'Barchasi',
    filterActive: 'Faol',
    filterNew: 'Yangi',
    filterDone: 'Yakunlangan',
    filterCancelled: 'Bekor',
    accept: 'Qabul qilish',
    requestCourier: 'Kuryerni chaqirish',
    courierCalled: 'Kuryer chaqirildi',
    callCustomer: "Qo'ng'iroq",
    expand: 'Batafsil',
    collapse: 'Yopish',
    summaryOrders: 'Buyurtmalar',
    summaryRevenue: 'Tushum',
    summaryAvg: "O'rtacha",
    viewStats: "To'liq statistika",
  },

  ordersTable: {
    empty: "Buyurtmalar yo'q",
    phone: 'Telefon',
    items: 'Mahsulotlar',
    status: 'Holat',
    total: 'Jami',
    action: 'Amal',
  },

  schedule: {
    nonWorkingHours: 'Ishlamaydigan soatlar',
    nonWorkingHoursHint:
      'Har kuni restoran qachon yopiq ekanini belgilang. Qolgan vaqtda ochiq bo‘ladi (masalan, 01:00–09:00 yopiq). Butun kun yopiq bo‘lsa, «Yopiq» ni belgilang.',
    closed: 'Yopiq',
    closedFrom: 'Yopiq:',
    to: 'gacha',
    saveHours: 'Saqlash',
    holidays: 'Dam olish kunlari',
    reasonPlaceholder: 'Sabab (ixtiyoriy)',
    addClosure: "Yopilish qo'shish",
    remove: "O'chirish",
    savedHours: 'Ish vaqti saqlandi',
    holidayAdded: "Dam olish kuni qo'shildi",
  },

  telegram: {
    title: 'Telegram buyurtmalar',
    hint: 'Yangi buyurtmalar shu Telegram chatga yuboriladi.',
    chatId: 'Telegram chat ID',
    chatIdPlaceholder: 'Masalan: 123456789',
    botLink: 'Botni ochish',
    saved: 'Telegram sozlamalari saqlandi',
    cleared: 'Telegram bildirishnomalari o‘chirildi',
    save: 'Saqlash',
    disable: 'O‘chirish',
    howTo:
      "1) Botni oching va Start bosing\n2) «🔔 Push sozlash» tugmasini bosing\n3) Restoraningizni ro'yxatdan tanlang\n4) Shu sahifadagi 6 xonali kodni botga yuboring",
    pairingCode: 'Bot uchun kod',
    codeExpires: 'Amal qilish vaqti',
    linked: '✅ Push ulangan',
    waitingForBot: 'Botda restoranni tanlang — kod shu yerda paydo bo‘ladi.',
    manualTitle: 'Qo‘lda chat ID (ixtiyoriy)',
  },

  dayNames: [
    'Yakshanba',
    'Dushanba',
    'Seshanba',
    'Chorshanba',
    'Payshanba',
    'Juma',
    'Shanba',
  ],

  pwa: {
    appName: 'Restoran paneli',
    installAria: 'Restoran panelini o‘rnatish',
    installTitle: 'Restoran panelini o‘rnatish',
    installSubtitle: 'Buyurtmalarni bosh ekrandan boshqaring',
    installDescription:
      'Ilovani o‘rnating — kirgandan keyin buyurtmalar va statistika bir bosishda ochiladi.',
    iosTitle: 'Restoran panelini o‘rnatish',
    iosSubtitle: 'Bosh ekranga qo‘shing — tezroq kirish uchun',
  },
} as const;
