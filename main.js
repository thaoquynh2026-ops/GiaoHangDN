const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 800,
    minWidth: 400,
    minHeight: 600,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    titleBarStyle: 'default',
    title: 'GiaoHangDN',
    show: false,
  });

  win.loadFile('index.html');

  win.once('ready-to-show', () => {
    win.show();
  });

  // Custom menu
  const menu = Menu.buildFromTemplate([
    {
      label: 'GiaoHangDN',
      submenu: [
        { label: '🍽️ Đặt hàng', click: () => win.loadFile('index.html') },
        { label: '🛵 Tài xế', click: () => win.loadFile('driver.html') },
        { label: '⚙️ Quản lý', click: () => win.loadFile('admin.html') },
        { type: 'separator' },
        { label: '🔥 Kết nối Firebase', click: () => win.loadFile('setup-firebase.html') },
        { label: '💰 Kế hoạch kiếm tiền', click: () => win.loadFile('HUONG_DAN_KIEM_TIEN.html') },
        { type: 'separator' },
        { label: 'Thoát', role: 'quit' },
      ]
    },
    {
      label: 'Xem',
      submenu: [
        { role: 'reload', label: 'Tải lại' },
        { role: 'zoomIn', label: 'Phóng to' },
        { role: 'zoomOut', label: 'Thu nhỏ' },
        { role: 'resetZoom', label: 'Mặc định' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Toàn màn hình' },
      ]
    }
  ]);
  Menu.setApplicationMenu(menu);
}

ipcMain.on('open-url', (e, url) => shell.openExternal(url));

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
