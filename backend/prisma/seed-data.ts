// Dữ liệu mẫu cho prisma/seed.ts, chép từ data.js của bản prototype (giữ nguyên tên trường gốc).
// Chỉ dùng cho dev/demo. Mỗi feature khi làm bằng /be-crud tự đổi sang tên cột trong DATABASE.md
// (vd `price` → `priceVnd`); thứ tự trong mảng là `sortOrder`.

export type SeedAccentColor = 'orange' | 'red' | 'amber' | 'gold';

export interface SeedShop {
  name: string;
  tagline: string;
  hoursLabel: string;
  hotline: string;
  email: string;
  facebook: string;
  zalo: string;
  tiktok: string;
  instagram: string;
  youtube: string;
}

export interface SeedGameCategory {
  /** Khóa riêng của data.js để nối với game; bảng game_category không có cột này. */
  id: string;
  label: string;
}

export interface SeedGame {
  name: string;
  /** Trỏ tới SeedGameCategory.id */
  category: string;
  players: string;
  color: SeedAccentColor;
  image: string;
}

export interface SeedPricePlan {
  name: string;
  price: number;
  unit: string;
  period: string;
  hot: boolean;
  features: string[];
}

export interface SeedMenuCategory {
  /** Khóa riêng của data.js; bảng menu_category không có cột này. */
  id: string;
  label: string;
  items: { name: string; desc: string; price: number }[];
}

export interface SeedPromotion {
  tag: string;
  title: string;
  featured: boolean;
  color: SeedAccentColor;
  desc: string;
  meta: string;
}

export interface SeedBranch {
  name: string;
  address: string;
  phone: string;
  hours: string;
  ps5: number;
  vip: number;
  area: number;
  mapUrl: string;
  facebook: string;
  zalo: string;
}

export const seedShop: SeedShop = {
  name: 'FIGHT STATION',
  tagline:
    'Đấu trường PS5 hàng đầu — nơi anh em hội tụ, chinh chiến và bùng cháy. Game bản quyền, ghế gaming cao cấp, đồ ăn nước uống đầy đủ.',
  hoursLabel: '24/7',
  hotline: '0901 234 567',
  email: 'hello@fightstation.vn',
  facebook: 'https://www.facebook.com/',
  zalo: '',
  tiktok: '',
  instagram: '',
  youtube: '',
};

export const seedGameCategories: SeedGameCategory[] = [
  { id: 'fighting', label: 'Đối Kháng' },
  { id: 'sports', label: 'Thể Thao' },
  { id: 'racing', label: 'Đua Xe' },
  { id: 'action', label: 'Hành Động' },
  { id: 'coop', label: 'Co-op' },
];

export const seedGames: SeedGame[] = [
  { name: 'Tekken 8', category: 'fighting', players: '1-2P', color: 'red', image: '' },
  { name: 'Street Fighter 6', category: 'fighting', players: '1-2P', color: 'orange', image: '' },
  { name: 'Mortal Kombat 1', category: 'fighting', players: '1-2P', color: 'amber', image: '' },
  { name: 'EA FC 26', category: 'sports', players: '1-4P', color: 'orange', image: '' },
  { name: 'NBA 2K26', category: 'sports', players: '1-4P', color: 'gold', image: '' },
  { name: 'Gran Turismo 7', category: 'racing', players: '1-2P', color: 'red', image: '' },
  { name: 'God of War: Ragnarok', category: 'action', players: '1P', color: 'amber', image: '' },
  { name: 'Spider-Man 2', category: 'action', players: '1P', color: 'orange', image: '' },
  { name: 'It Takes Two', category: 'coop', players: '2P', color: 'gold', image: '' },
  { name: 'A Way Out', category: 'coop', players: '2P', color: 'red', image: '' },
  { name: 'Elden Ring', category: 'action', players: '1P', color: 'red', image: '' },
  { name: 'Resident Evil 4', category: 'action', players: '1P', color: 'orange', image: '' },
];

export const seedPricePlans: SeedPricePlan[] = [
  {
    name: 'Quick Match',
    price: 15000,
    unit: '/giờ',
    period: 'Giờ thường — Thứ 2 đến Thứ 6',
    hot: false,
    features: [
      'Máy PS5 chuẩn',
      'Tay cầm DualSense',
      'Wifi tốc độ cao',
      'Tính tiền theo giờ linh hoạt',
    ],
  },
  {
    name: 'Pro Combo',
    price: 50000,
    unit: '/4 giờ',
    period: 'Tiết kiệm 10K — Hot nhất',
    hot: true,
    features: [
      'Máy PS5 Pro 4K HDR',
      'Ghế gaming cao cấp',
      'Tặng 1 nước + 1 snack',
      'Free đổi máy',
      'Ưu tiên giờ vàng',
    ],
  },
  {
    name: 'All Night',
    price: 120000,
    unit: '/đêm',
    period: '22h - 8h sáng — Cày trắng đêm',
    hot: false,
    features: [
      'Trọn đêm không giới hạn',
      'PS5 Pro + ghế gaming',
      'Tặng mì ly + nước',
      'Phòng riêng nếu có sẵn',
    ],
  },
  {
    name: 'VIP Room',
    price: 80000,
    unit: '/giờ',
    period: 'Phòng riêng — 4-6 người',
    hot: false,
    features: [
      'TV 65" 4K + sound bar',
      '4 tay cầm DualSense',
      'Điều hòa + sofa',
      'Free wifi + nước lọc',
    ],
  },
];

export const seedMenu: SeedMenuCategory[] = [
  {
    id: 'combo',
    label: 'Combo',
    items: [
      { name: 'Combo Game Thủ #1', desc: 'Mì cay + Coca + Snack', price: 55000 },
      { name: 'Combo Game Thủ #2', desc: 'Bánh mì trứng + Trà đào', price: 45000 },
      { name: 'Combo Đêm Khuya', desc: 'Mì ly + Red Bull + Bánh quy', price: 40000 },
      { name: 'Combo Đối Kháng', desc: '2 ly trà sữa + Khoai chiên', price: 70000 },
      { name: 'Combo VIP', desc: 'Pizza mini + 2 nước + Snack', price: 120000 },
      { name: 'Combo Sinh Viên', desc: 'Cơm gà + Nước ngọt', price: 50000 },
    ],
  },
  {
    id: 'food',
    label: 'Đồ Ăn',
    items: [
      { name: 'Mì Cay Hàn Quốc', desc: 'Cay xé lưỡi, full topping', price: 35000 },
      { name: 'Bánh Mì Trứng', desc: 'Bánh mì giòn, trứng ốp la', price: 20000 },
      { name: 'Cơm Gà Xối Mỡ', desc: 'Gà giòn rụm, cơm tấm', price: 40000 },
      { name: 'Pizza Mini', desc: 'Pizza phô mai 4 vị', price: 60000 },
      { name: 'Hot Dog', desc: 'Xúc xích Đức + bánh mì', price: 30000 },
      { name: 'Mì Ly Trộn', desc: 'Mì ly cao cấp, đủ vị', price: 15000 },
    ],
  },
  {
    id: 'snack',
    label: 'Snack',
    items: [
      { name: 'Khoai Tây Chiên', desc: 'Giòn rụm, sốt phô mai', price: 25000 },
      { name: 'Gà Rán Popcorn', desc: '6 miếng giòn cay', price: 35000 },
      { name: 'Bánh Quy Hộp', desc: 'Bánh quy bơ thơm lừng', price: 15000 },
      { name: 'Snack Hỗn Hợp', desc: 'Combo 3 loại snack', price: 20000 },
      { name: 'Phô Mai Que', desc: '5 que phô mai chiên', price: 30000 },
      { name: 'Đậu Phộng Rang', desc: 'Đậu rang muối tỏi', price: 10000 },
    ],
  },
  {
    id: 'drink',
    label: 'Nước',
    items: [
      { name: 'Coca / Pepsi', desc: 'Lon 330ml ướp lạnh', price: 15000 },
      { name: 'Red Bull', desc: 'Tỉnh táo cày đêm', price: 20000 },
      { name: 'Trà Đào', desc: 'Trà đào cam sả mát lạnh', price: 25000 },
      { name: 'Trà Sữa', desc: 'Trà sữa trân châu', price: 30000 },
      { name: 'Nước Suối', desc: 'Lavie 500ml', price: 8000 },
      { name: 'Sting Dâu', desc: 'Tăng lực vị dâu', price: 15000 },
    ],
  },
  {
    id: 'coffee',
    label: 'Cafe',
    items: [
      { name: 'Cafe Đen', desc: 'Cafe phin đậm đà', price: 20000 },
      { name: 'Cafe Sữa', desc: 'Cafe sữa đá truyền thống', price: 22000 },
      { name: 'Bạc Xỉu', desc: 'Sữa nhiều cafe ít', price: 25000 },
      { name: 'Cafe Muối', desc: 'Trend mới, đáng thử', price: 28000 },
      { name: 'Americano', desc: 'Cafe đen Espresso', price: 30000 },
      { name: 'Cappuccino', desc: 'Cafe sữa nóng béo ngậy', price: 35000 },
    ],
  },
];

export const seedPromotions: SeedPromotion[] = [
  {
    tag: 'Giải đấu',
    title: 'Tekken 8 Championship',
    featured: true,
    color: 'orange',
    desc: 'Giải đấu hàng tháng, giải thưởng tiền mặt + voucher chơi free. Đăng ký ngay, slot có hạn.',
    meta: 'Cuối mỗi tháng — 19h — Chi nhánh Quận 10',
  },
  {
    tag: 'Khuyến mãi',
    title: 'Happy Hour',
    featured: false,
    color: 'orange',
    desc: '14h - 17h hằng ngày, giảm 30% mọi gói chơi.',
    meta: 'Áp dụng mọi ngày',
  },
  {
    tag: 'Sinh viên',
    title: 'Ưu đãi HSSV',
    featured: false,
    color: 'gold',
    desc: 'Mang theo thẻ HSSV, giảm thêm 10% cho mọi gói chơi.',
    meta: 'Áp dụng mọi ngày',
  },
];

export const seedBranches: SeedBranch[] = [
  {
    name: 'Quận 10 — Flagship',
    address: '123 Sư Vạn Hạnh, P.12, Quận 10, TP.HCM',
    phone: '0901 234 567',
    hours: 'Mở cửa 24/7',
    ps5: 20,
    vip: 3,
    area: 120,
    mapUrl: '',
    facebook: '',
    zalo: '',
  },
  {
    name: 'Bình Thạnh',
    address: '456 Xô Viết Nghệ Tĩnh, P.21, Bình Thạnh, TP.HCM',
    phone: '0901 234 568',
    hours: '09:00 — 02:00',
    ps5: 15,
    vip: 2,
    area: 90,
    mapUrl: '',
    facebook: '',
    zalo: '',
  },
  {
    name: 'Thủ Đức',
    address: '789 Võ Văn Ngân, P.Linh Chiểu, Thủ Đức, TP.HCM',
    phone: '0901 234 569',
    hours: '10:00 — 24:00',
    ps5: 10,
    vip: 1,
    area: 70,
    mapUrl: '',
    facebook: '',
    zalo: '',
  },
  {
    name: 'Tân Bình',
    address: '321 Cộng Hòa, P.13, Tân Bình, TP.HCM',
    phone: '0901 234 570',
    hours: '09:00 — 24:00',
    ps5: 12,
    vip: 2,
    area: 85,
    mapUrl: '',
    facebook: '',
    zalo: '',
  },
];
