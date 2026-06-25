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
  },

  topProducts: 'Eng ko‘p sotilgan mahsulotlar',
  noSalesYet: "Hali sotuvlar yo'q",
  manageOrders: 'Buyurtmalarni boshqarish →',

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
