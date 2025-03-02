"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
// 导入录音服务
require("./services/recordingService");
require("./services/storageService");
require("./services/fileService");
require("./services/transcriptionService");
// 开发环境下启用自动重载
if (process.env.NODE_ENV === 'development') {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, '..', '..', 'node_modules', '.bin', 'electron'),
        hardResetMethod: 'exit'
    });
}
console.log('main.ts 开始加载');
let mainWindow = null;
function createWindow() {
    console.log('创建主窗口');
    // 创建浏览器窗口
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });
    // 加载应用
    if (process.env.NODE_ENV === 'development') {
        console.log('开发模式：加载 http://localhost:5173');
        mainWindow.loadURL('http://localhost:5173');
        // 打开开发者工具
        mainWindow.webContents.openDevTools();
    }
    else {
        console.log('生产模式：加载本地文件');
        mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }
    // 当窗口关闭时触发
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
electron_1.app.whenReady().then(() => {
    console.log('Electron 应用准备就绪');
    console.log('应用准备就绪，创建窗口');
    createWindow();
    electron_1.app.on('activate', () => {
        // 在 macOS 上，当点击 dock 图标并且没有其他窗口打开时，
        // 通常在应用程序中重新创建一个窗口。
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
// 当所有窗口关闭时退出应用
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
console.log('main.ts 已加载');
// 移除这些处理程序，因为它们已经在 storageService.ts 中注册了
// ipcMain.handle('save-interview', async (_, data) => { ... });
// ipcMain.handle('get-interviews', async () => { ... }); 
