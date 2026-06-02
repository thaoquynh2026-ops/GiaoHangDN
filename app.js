// ═══════════════════════════════════════════════════════
//  BƯỚC 1: Tạo project tại https://console.firebase.google.com
//  BƯỚC 2: Project Settings → Web app → copy config vào đây
// ═══════════════════════════════════════════════════════
const FIREBASE_CONFIG = {
  apiKey:            "PASTE_apiKey",           // ← còn thiếu: lấy từ Firebase Console
  authDomain:        "giaohangdn.firebaseapp.com",
  databaseURL:       "https://giaohangdn-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:         "giaohangdn",
  storageBucket:     "giaohangdn.appspot.com",
  messagingSenderId: "PASTE_messagingSenderId", // ← còn thiếu: lấy từ Firebase Console
  appId:             "PASTE_appId",             // ← còn thiếu: lấy từ Firebase Console
};
// ═══════════════════════════════════════════════════════

let _db        = null;
let _useFirebase = false;

function initFirebase() {
  if (typeof firebase === 'undefined') return;
  if (FIREBASE_CONFIG.apiKey === 'PASTE_apiKey') return; // chưa cấu hình
  try {
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    _db = firebase.database();
    _useFirebase = true;
    // Hiện badge "🟢 Online"
    const badge = document.getElementById('onlineBadge');
    if (badge) badge.style.display = 'inline-flex';
  } catch(e) {
    console.warn('Firebase không kết nối được, dùng localStorage:', e.message);
  }
}

// ── Thêm đơn mới ──────────────────────────────────────
function pushOrder(order) {
  if (_useFirebase) return _db.ref('orders').push(order);
  const list = _localGet();
  list.unshift(order);
  _localSet(list);
  return Promise.resolve();
}

// ── Lắng nghe đơn hàng (real-time) ───────────────────
function listenOrders(cb) {
  if (_useFirebase) {
    _db.ref('orders').on('value', snap => {
      const list = [];
      snap.forEach(c => list.push({ ...c.val(), _key: c.key }));
      cb(list.reverse());
    });
  } else {
    cb(_localGet());
    setInterval(() => cb(_localGet()), 3000); // fallback: poll 3s
  }
}

// ── Cập nhật trạng thái đơn ──────────────────────────
function updateOrder(key, updates) {
  if (_useFirebase) return _db.ref('orders/' + key).update(updates);
  const list = _localGet();
  const o = list.find(x => (x._key || x.id) === key);
  if (o) Object.assign(o, updates);
  _localSet(list);
  return Promise.resolve();
}

// ── Xóa 1 đơn ────────────────────────────────────────
function removeOrder(key) {
  if (_useFirebase) return _db.ref('orders/' + key).remove();
  _localSet(_localGet().filter(o => (o._key || o.id) !== key));
  return Promise.resolve();
}

// ── Xóa tất cả ───────────────────────────────────────
function clearAllOrders() {
  if (_useFirebase) return _db.ref('orders').remove();
  localStorage.removeItem('giaohangdn_orders');
  return Promise.resolve();
}

// ── Helpers ───────────────────────────────────────────
function _localGet()      { return JSON.parse(localStorage.getItem('giaohangdn_orders') || '[]'); }
function _localSet(list)  { localStorage.setItem('giaohangdn_orders', JSON.stringify(list)); }
function loadOrders()     { return _localGet(); }
function saveOrders(list) { _localSet(list); }

// ═══════════════════════════════════════════════════════
//  DỮ LIỆU QUÁN ĂN
// ═══════════════════════════════════════════════════════
const RESTAURANTS = [
  { id:1, name:'Bún Bò Huế Mụ Rớt',    emoji:'🍜', cat:'food',   address:'74 Trần Phú, Hải Châu',          lat:16.0678, lng:108.2208, rating:4.8, time:'20-30 phút',
    items:[{id:101,name:'Bún bò đặc biệt',price:55000,emoji:'🍜'},{id:102,name:'Bún bò chả cua',price:65000,emoji:'🦀'},{id:103,name:'Bún giò heo',price:50000,emoji:'🍖'}]},
  { id:2, name:'Mì Quảng Bà Mua',       emoji:'🍝', cat:'food',   address:'23 Lê Lợi, Hải Châu',            lat:16.0540, lng:108.2190, rating:4.7, time:'15-25 phút',
    items:[{id:201,name:'Mì Quảng tôm thịt',price:45000,emoji:'🍝'},{id:202,name:'Mì Quảng gà',price:50000,emoji:'🐔'},{id:203,name:'Mì Quảng chay',price:35000,emoji:'🌿'}]},
  { id:3, name:'Bánh Mì Cô Lan',        emoji:'🥖', cat:'food',   address:'56 Hùng Vương, Thanh Khê',       lat:16.0748, lng:108.1999, rating:4.9, time:'10-20 phút',
    items:[{id:301,name:'Bánh mì đặc biệt',price:25000,emoji:'🥖'},{id:302,name:'Bánh mì pate',price:20000,emoji:'🥖'},{id:303,name:'Bánh mì ốp la',price:22000,emoji:'🍳'}]},
  { id:4, name:'Cơm Gà Bà Buội',        emoji:'🍛', cat:'food',   address:'22 Phan Châu Trinh',              lat:16.0502, lng:108.2230, rating:4.6, time:'20-35 phút',
    items:[{id:401,name:'Cơm gà Hải Nam',price:60000,emoji:'🍛'},{id:402,name:'Cơm gà xé phay',price:55000,emoji:'🍚'},{id:403,name:'Súp gà',price:25000,emoji:'🥣'}]},
  { id:5, name:'Gong Cha Đà Nẵng',      emoji:'🧋', cat:'drink',  address:'18 Nguyễn Văn Linh',             lat:16.0745, lng:108.2240, rating:4.5, time:'15-25 phút',
    items:[{id:501,name:'Trà sữa trân châu',price:45000,emoji:'🧋'},{id:502,name:'Matcha latte',price:50000,emoji:'🍵'},{id:503,name:'Hồng trà kem cheese',price:55000,emoji:'🧁'}]},
  { id:6, name:'Highlands Coffee',      emoji:'☕', cat:'drink',  address:'01 An Thượng 4, Ngũ Hành Sơn',  lat:16.0321, lng:108.2476, rating:4.4, time:'20-30 phút',
    items:[{id:601,name:'Cà phê sữa đá',price:35000,emoji:'☕'},{id:602,name:'Bạc xỉu',price:35000,emoji:'🥛'},{id:603,name:'Americano',price:40000,emoji:'☕'}]},
  { id:7, name:'Siêu thị Mini VinMart', emoji:'🛒', cat:'shop',   address:'45 Điện Biên Phủ, Thanh Khê',   lat:16.0820, lng:108.2050, rating:4.3, time:'25-40 phút',
    items:[{id:701,name:'Nước giặt Comfort 1.5L',price:85000,emoji:'🧴'},{id:702,name:'Mì gói Hảo Hảo (thùng)',price:120000,emoji:'📦'},{id:703,name:'Sữa Vinamilk 1L',price:32000,emoji:'🥛'},{id:704,name:'Nước suối Aquafina',price:8000,emoji:'💧'}]},
  { id:8, name:'Nhà Thuốc An Khang',    emoji:'💊', cat:'pharma', address:'88 Ngô Quyền, Sơn Trà',         lat:16.1076, lng:108.2453, rating:4.7, time:'20-35 phút',
    items:[{id:801,name:'Paracetamol 500mg',price:15000,emoji:'💊'},{id:802,name:'Dầu gió xanh Eagle',price:25000,emoji:'💚'},{id:803,name:'Vitamin C 1000mg',price:55000,emoji:'🍊'},{id:804,name:'Khẩu trang y tế',price:35000,emoji:'😷'}]},
  { id:9,  name:'Bánh Xèo Miền Trung',   emoji:'🥘', cat:'food',   address:'17 Hải Phòng, Hải Châu',           lat:16.0598, lng:108.2125, rating:4.7, time:'20-30 phút',
    items:[{id:901,name:'Bánh xèo đặc biệt',price:65000,emoji:'🥘'},{id:902,name:'Bánh xèo tôm mực',price:75000,emoji:'🦐'},{id:903,name:'Nem lụi nướng',price:55000,emoji:'🍡'},{id:904,name:'Bánh bèo chén',price:35000,emoji:'🍚'}]},
  { id:10, name:'Pizza 4P\'s Đà Nẵng',   emoji:'🍕', cat:'food',   address:'13 Lý Tự Trọng, Hải Châu',        lat:16.0560, lng:108.2175, rating:4.8, time:'30-45 phút',
    items:[{id:1001,name:'Pizza Margherita',price:175000,emoji:'🍕'},{id:1002,name:'Pizza BBQ Chicken',price:195000,emoji:'🍗'},{id:1003,name:'Pizza Salmon',price:215000,emoji:'🐟'},{id:1004,name:'Pasta Carbonara',price:155000,emoji:'🍝'}]},
  { id:11, name:'Phở Cồ Đà Nẵng',        emoji:'🍲', cat:'food',   address:'101 Nguyễn Chí Thanh, Hải Châu',  lat:16.0480, lng:108.2260, rating:4.6, time:'15-25 phút',
    items:[{id:1101,name:'Phở bò tái nạm',price:55000,emoji:'🍲'},{id:1102,name:'Phở bò đặc biệt',price:65000,emoji:'🥩'},{id:1103,name:'Phở gà',price:50000,emoji:'🐔'},{id:1104,name:'Phở chay',price:40000,emoji:'🌱'}]},
  { id:12, name:'KFC Đà Nẵng',            emoji:'🍗', cat:'food',   address:'99 Nguyễn Văn Linh, Hải Châu',    lat:16.0740, lng:108.2230, rating:4.3, time:'20-35 phút',
    items:[{id:1201,name:'Gà rán 2 miếng',price:85000,emoji:'🍗'},{id:1202,name:'Burger Double Down',price:95000,emoji:'🍔'},{id:1203,name:'Combo Twister',price:115000,emoji:'🌯'},{id:1204,name:'Khoai tây chiên L',price:45000,emoji:'🍟'}]},
  { id:13, name:'Trà Chanh Chém Gió',     emoji:'🍹', cat:'drink',  address:'03 Trần Quý Cáp, Hải Châu',       lat:16.0620, lng:108.2180, rating:4.5, time:'10-20 phút',
    items:[{id:1301,name:'Trà chanh sả gừng',price:25000,emoji:'🍋'},{id:1302,name:'Trà đào cam sả',price:30000,emoji:'🍑'},{id:1303,name:'Nước ép cam tươi',price:35000,emoji:'🍊'},{id:1304,name:'Sinh tố bơ',price:40000,emoji:'🥑'}]},
  { id:14, name:'Kem Bơ Đà Nẵng',         emoji:'🍦', cat:'drink',  address:'61 Bạch Đằng, Hải Châu',           lat:16.0680, lng:108.2244, rating:4.8, time:'15-25 phút',
    items:[{id:1401,name:'Kem bơ 1 ly',price:35000,emoji:'🥑'},{id:1402,name:'Sinh tố xoài dừa',price:40000,emoji:'🥭'},{id:1403,name:'Kem dừa nướng',price:45000,emoji:'🥥'},{id:1404,name:'Chè ba màu',price:30000,emoji:'🍨'}]},
];

const BANK_INFO  = { bank:'Vietcombank', account:'0123456789', name:'NGUYEN ANH TUAN', branch:'Chi nhánh Đà Nẵng' };
const MOMO_INFO  = { phone:'0987654321', name:'NGUYEN ANH TUAN' };

// ── Telegram thông báo đơn mới ────────────────────────
const TG_CONFIG = { token: '', chatId: '' }; // điền token và chatId của bot Telegram

function sendTelegramAlert(order) {
  if (!TG_CONFIG.token || !TG_CONFIG.chatId) return;
  const payLabel = { cash:'💵 Tiền mặt', momo:'💜 MoMo', bank:'🏦 Chuyển khoản' };
  const msg = `🔔 ĐƠN MỚI #${order.id}\n` +
    `👤 ${order.customer} – ${order.phone}\n` +
    `📍 ${order.address}\n` +
    `🏪 ${order.restaurantName}\n` +
    `📦 ${order.items.map(i => `${i.name} x${i.qty}`).join(', ')}\n` +
    `💰 ${formatPrice(order.total)}  |  ${payLabel[order.payMethod]||order.payMethod}\n` +
    `🕐 ${order.time}`;
  fetch(`https://api.telegram.org/bot${TG_CONFIG.token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TG_CONFIG.chatId, text: msg })
  }).catch(() => {});
}

function formatPrice(p) { return p.toLocaleString('vi-VN') + 'đ'; }
function genOrderId()   { return 'GH' + Date.now().toString().slice(-6); }
