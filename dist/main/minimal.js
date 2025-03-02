"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.app.whenReady().then(() => {
    const win = new electron_1.BrowserWindow({
        width: 800,
        height: 600
    });
    win.loadURL('https://www.baidu.com');
    console.log('最小化测试应用已启动');
});
