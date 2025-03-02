import { ipcMain, IpcMainInvokeEvent } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

interface InterviewData {
  id?: number;
  title: string;
  date?: string;
  duration?: number;
  transcription?: Array<{ speaker: string; text: string }>;
  [key: string]: any;
}

class StorageService {
  private storagePath: string;
  
  constructor() {
    // 创建存储目录
    this.storagePath = path.join(os.homedir(), '.interview-copilot');
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
    
    this.setupIpcHandlers();
  }
  
  private setupIpcHandlers() {
    ipcMain.handle('save-interview', this.saveInterview.bind(this));
    ipcMain.handle('get-interviews', this.getInterviews.bind(this));
  }
  
  async saveInterview(_: IpcMainInvokeEvent, data: InterviewData) {
    try {
      const id = Date.now();
      const filePath = path.join(this.storagePath, `interview_${id}.json`);
      
      // 添加ID和时间戳
      const interviewData = {
        ...data,
        id,
        createdAt: new Date().toISOString()
      };
      
      // 保存到文件
      fs.writeFileSync(filePath, JSON.stringify(interviewData, null, 2));
      
      console.log('面试记录已保存:', filePath);
      return { success: true, id };
    } catch (error) {
      console.error('保存面试记录失败:', error);
      return { success: false, error };
    }
  }
  
  async getInterviews(_: IpcMainInvokeEvent) {
    try {
      const files = fs.readdirSync(this.storagePath)
        .filter(file => file.startsWith('interview_') && file.endsWith('.json'));
      
      const interviews = files.map(file => {
        const filePath = path.join(this.storagePath, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        return data;
      });
      
      console.log('获取到面试记录数量:', interviews.length);
      return { success: true, interviews };
    } catch (error) {
      console.error('获取面试记录失败:', error);
      return { success: false, error, interviews: [] };
    }
  }
}

export default new StorageService(); 