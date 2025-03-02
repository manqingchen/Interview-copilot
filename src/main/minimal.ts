import { app, BrowserWindow } from 'electron';

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 800,
    height: 600
  });
  
  win.loadURL('https://www.baidu.com');
  console.log('最小化测试应用已启动');
}); 