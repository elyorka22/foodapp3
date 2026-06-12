abstract final class AppStrings {
  static const appName = 'FoodApp Business';
  static const appTagline = 'Restoran va menejerlar uchun';

  static const phone = 'Telefon';
  static const loginId = 'Telefon yoki email';
  static const loginIdHint = '+998901234567 yoki email@example.com';
  static const password = 'Parol';
  static const login = 'Kirish';
  static const logout = 'Chiqish';
  static const loginFailed = 'Kirish amalga oshmadi';
  static const wrongRole =
      'Faqat restoran yoki menejer hisobi bilan kirish mumkin';

  static const restaurantPanel = 'Restoran';
  static const managerPanel = 'Menejer';
  static const orders = 'Buyurtmalar';
  static const restaurants = 'Restoranlar';
  static const menu = 'Menyu';
  static const statistics = 'Statistika';
  static const couriers = 'Kuryerlar';
  static const profile = 'Profil';
  static const notifications = 'Bildirishnomalar';
  static const noNotifications = 'Bildirishnomalar yo\'q';
  static const markAllRead = 'O\'qildi';
  static const pushPermissionTitle = 'Bildirishnomalar';
  static const pushPermissionBody =
      'Yangi buyurtmalar haqida darhol xabar olish uchun bildirishnomalarni yoqing.';
  static const pushPermissionLater = 'Keyinroq';
  static const pushPermissionEnable = 'Yoqish';

  static const noOrders = 'Buyurtmalar yo\'q';
  static const noRestaurants = 'Restoranlar yo\'q';
  static const noProducts = 'Mahsulotlar yo\'q';
  static const noCouriers = 'Kuryerlar yo\'q';

  static const filterAll = 'Barchasi';
  static const filterActive = 'Faol';
  static const filterCancelled = 'Bekor qilingan';

  static const requestCourier = 'Kuryerni chaqirish';
  static const courierRequested = 'Kuryer chaqirildi';
  static const assignCourier = 'Kuryer biriktirish';
  static const reassignCourier = 'Kuryerni almashtirish';
  static const removeCourier = 'Kuryerni olib tashlash';
  static const nextStatus = 'Keyingi';
  static const cancelOrder = 'Bekor qilish';

  static const dispatchAuto = 'Avto: kuryerlar o\'zlari qabul qiladi';
  static const dispatchManager = 'Menejer kuryer biriktiradi';

  static const ordersCount = 'Buyurtmalar';
  static const revenue = 'Daromad';
  static const revenueToday = 'Bugun';
  static const revenueWeek = 'Hafta';
  static const revenueMonth = 'Oy';
  static const averageOrder = 'O\'rtacha chek';
  static const topProducts = 'Mashhur taomlar';

  static const online = 'Onlayn';
  static const offline = 'Oflayn';
  static const active = 'Faol';
  static const blocked = 'Bloklangan';
  static const selectCourier = 'Kuryerni tanlang';
  static const noOnlineCouriers = 'Onlayn kuryerlar yo\'q';

  static const cancel = 'Bekor qilish';
  static const save = 'Saqlash';
  static const create = 'Yaratish';
  static const edit = 'Tahrirlash';
  static const delete = 'O\'chirish';
  static const add = 'Qo\'shish';
  static const assign = 'Biriktirish';
  static const block = 'Bloklash';
  static const unblock = 'Faollashtirish';

  static const loading = 'Yuklanmoqda...';
  static const retry = 'Qayta urinish';
  static const saved = 'Saqlandi';

  static const restaurantName = 'Restoran nomi';
  static const restaurantPhone = 'Telefon';
  static const restaurantAddress = 'Manzil';
  static const createRestaurant = 'Restoran yaratish';
  static const editRestaurant = 'Restoranni tahrirlash';
  static const manageMenu = 'Menyuni boshqarish';

  static const productName = 'Mahsulot nomi';
  static const productPrice = 'Narx';
  static const addProduct = 'Mahsulot qo\'shish';
  static const editPrice = 'Narxni o\'zgartirish';
  static const available = 'Mavjud';
  static const unavailable = 'Mavjud emas';

  static const createCourier = 'Kuryer yaratish';
  static const courierName = 'Ism familiya';
  static const vehicleType = 'Transport turi';

  static String orderStatusLabel(String status) {
    switch (status) {
      case 'PENDING':
        return 'Yangi';
      case 'ACCEPTED':
        return 'Qabul qilindi';
      case 'PREPARING':
        return 'Tayyorlanmoqda';
      case 'COURIER_ASSIGNED':
        return 'Kuryer biriktirildi';
      case 'ARRIVED_AT_RESTAURANT':
        return 'Restoranda';
      case 'PICKED_UP':
        return 'Olib ketildi';
      case 'DELIVERING':
        return 'Yetkazilmoqda';
      case 'DELIVERED':
        return 'Yetkazildi';
      case 'CANCELLED':
        return 'Bekor qilindi';
      default:
        return status;
    }
  }
}
