import { ipcMain, IpcMainInvokeEvent } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

class FileService {
  private audioDir: string;
  
  constructor() {
    // 创建音频目录
    this.audioDir = path.join(os.homedir(), '.interview-copilot', 'audio');
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }
    
    this.setupIpcHandlers();
  }
  
  private setupIpcHandlers() {
    ipcMain.handle('save-audio-file', this.saveAudioFile.bind(this));
  }
  
  async saveAudioFile(_: IpcMainInvokeEvent, data: { base64Data: string, fileName: string, mimeType: string }) {
    try {
      const filePath = path.join(this.audioDir, data.fileName);
      
      // 将 base64 转换为 Buffer
      const buffer = Buffer.from(data.base64Data, 'base64');
      
      // 写入文件
      fs.writeFileSync(filePath, buffer);
      
      console.log('音频文件已保存:', filePath);
      return { success: true, filePath };
    } catch (error) {
      console.error('保存音频文件失败:', error);
      return { success: false, error };
    }
  }
}

console.log('创建 FileService 实例');
export default new FileService(); 