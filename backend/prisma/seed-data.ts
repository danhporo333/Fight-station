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
  /** `bestSeller`: món có huy hiệu "Best seller" trên tờ menu */
  items: { name: string; desc: string; price: number; bestSeller?: boolean }[];
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
  /** Số phòng PC; chỉ chi nhánh có phòng PC mới khai báo */
  pcRoom?: number;
  area: number;
  mapUrl: string;
  facebook: string;
  zalo: string;
}

export const seedShop: SeedShop = {
  name: 'FIGHT STATION Gaming',
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

// Menu thật của quán (tờ menu "Ăn vặt phủ phê", 2026-10-07). Giá đơn vị đồng; phần trong ngoặc của
// tờ menu (vị, số lượng) đưa vào `desc`.
export const seedMenu: SeedMenuCategory[] = [
  {
    id: 'drink',
    label: 'Nước uống',
    items: [
      { name: 'Nước ép trái cây', desc: 'Theo mùa', price: 32000 },
      { name: 'Nước suối', desc: '', price: 15000 },
      { name: 'Nước ngọt', desc: '', price: 20000 },
      { name: 'Redbull', desc: '', price: 25000 },
      { name: 'Cafe đá', desc: '', price: 20000 },
      { name: 'Cafe sữa', desc: '', price: 23000 },
      { name: 'Bạc xỉu', desc: '', price: 25000 },
      { name: 'Latte Cafe', desc: '', price: 30000 },
      { name: 'Sâm dứa sữa', desc: '', price: 30000 },
      { name: 'Sữa sốt dưa gang', desc: '', price: 30000 },
      { name: 'Strongbow', desc: '', price: 35000 },
    ],
  },
  {
    id: 'tea',
    label: 'Trà',
    items: [
      { name: 'Trà đá', desc: '', price: 10000 },
      { name: 'Trà đào', desc: '', price: 30000 },
      { name: 'Trà xoài', desc: '', price: 30000 },
      { name: 'Trà dưa lưới', desc: '', price: 30000 },
      { name: 'Trà ổi hồng', desc: '', price: 30000 },
      { name: 'Trà chanh liptong', desc: '', price: 30000 },
      { name: 'Trà tắc/Tắc thái xanh', desc: '', price: 30000 },
    ],
  },
  {
    id: 'yogurt',
    label: 'Sữa chua & Soda',
    items: [
      {
        name: 'Sữa chua',
        desc: 'Việt quất / Chanh dây / Dâu / Xoài / Dưa lưới / Đào',
        price: 30000,
      },
      { name: 'Sữa chua tắc', desc: '', price: 30000 },
      {
        name: 'Soda',
        desc: 'Việt quất / Chanh dây / Dâu / Xoài / Dưa lưới / Đào / Ổi hồng',
        price: 30000,
      },
    ],
  },
  {
    id: 'fried-rice',
    label: 'Cơm chiên',
    items: [
      { name: 'Cơm chiên trứng', desc: '', price: 35000 },
      { name: 'Cơm chiên xúc xích', desc: '', price: 40000 },
      { name: 'Cơm chiên trứng, xúc xích', desc: '', price: 45000 },
      { name: 'Cơm chiên thịt bò', desc: '', price: 45000 },
      { name: 'Cơm chiên thịt bò, trứng', desc: '', price: 48000 },
    ],
  },
  {
    id: 'noodle',
    label: 'Mì',
    items: [
      { name: 'Mì trộn best seller', desc: '', price: 45000, bestSeller: true },
      { name: 'Mì trộn trứng', desc: '', price: 30000 },
      { name: 'Mì trộn xúc xích', desc: '', price: 35000 },
      { name: 'Mì trộn thịt bò', desc: '', price: 45000 },
      { name: 'Mì trộn trứng, xúc xích', desc: '', price: 40000 },
      { name: 'Mì modern xúc xích', desc: '', price: 25000 },
      { name: 'Mì nước trứng', desc: '', price: 30000 },
      { name: 'Mì nước xúc xích', desc: '', price: 35000 },
      { name: 'Mì nước trứng, xúc xích', desc: '', price: 40000 },
      { name: 'Mì nước bò', desc: '', price: 45000 },
      { name: 'Mì nước bò, trứng', desc: '', price: 48000 },
    ],
  },
  {
    id: 'macaroni',
    label: 'Nui',
    items: [
      { name: 'Nui xào trứng', desc: '', price: 35000 },
      { name: 'Nui xào thịt bò', desc: '', price: 45000 },
      { name: 'Nui xào bò, trứng', desc: '', price: 48000 },
    ],
  },
  {
    id: 'street-food',
    label: 'Đồ ăn vặt',
    items: [
      { name: 'Khoai tây chiên', desc: '', price: 35000 },
      { name: 'Xúc xích chiên', desc: '', price: 35000 },
      { name: 'Bò viên – cá viên', desc: '', price: 35000 },
      { name: 'Đậu hũ phô mai', desc: '', price: 35000 },
      { name: 'Phô mai que', desc: '3 cây', price: 35000 },
      { name: 'Chả mực', desc: '', price: 35000 },
      { name: 'Gà viên', desc: '', price: 48000 },
      { name: 'Combo bé nhỏ', desc: '', price: 48000, bestSeller: true },
      { name: 'Combo bé bự', desc: '', price: 58000 },
    ],
  },
  {
    id: 'snack',
    label: 'Snack',
    items: [
      { name: 'Oishi', desc: '', price: 10000 },
      { name: "Swings/O'Star/Lays", desc: '', price: 15000 },
      { name: 'Que cay cay', desc: '', price: 10000 },
      { name: 'Mì enaak', desc: '', price: 10000 },
      { name: 'Thịt bò khô', desc: '', price: 35000 },
    ],
  },
  {
    id: 'topping',
    label: 'Topping thêm',
    items: [
      { name: 'Mì/Nui/Cơm', desc: '', price: 8000 },
      { name: 'Trứng', desc: '', price: 8000 },
      { name: 'Thịt bò', desc: '', price: 25000 },
      { name: 'Bò viên/Cá viên/Xúc xích', desc: '', price: 12000 },
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
    pcRoom: 1,
    area: 85,
    mapUrl: '',
    facebook: '',
    zalo: '',
  },
];
