import { desktopCapturer, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

class RecordingService {
  private isRecording = false;
  private recordingPath = '';
  private recordingStartTime = 0;

  constructor() {
    console.log('RecordingService: 初始化');
    this.setupIpcHandlers();
  }

  private setupIpcHandlers() {
    console.log('RecordingService: 设置 IPC 处理程序');
    ipcMain.handle('start-recording', this.startRecording.bind(this));
    ipcMain.handle('stop-recording', this.stopRecording.bind(this));
  }

  async startRecording() {
    console.log('RecordingService: startRecording 被调用');
    if (this.isRecording) {
      console.log('RecordingService: 已经在录音中');
      return { success: false, error: '已经在录音中' };
    }

    try {
      // 获取系统音频源 - 注意：types 只能是 'window' 或 'screen'
      console.log('RecordingService: 获取音频源');
      const sources = await desktopCapturer.getSources({ 
        types: ['window', 'screen'],  // 不支持 'audio' 类型
        thumbnailSize: { width: 0, height: 0 }
      });
      
      console.log('RecordingService: 可用音频源:', sources.map(s => s.name));
      
      // 在实际应用中，这里需要在渲染进程中实现录音
      // 因为 MediaRecorder API 只在渲染进程中可用
      // 这里只是模拟录音开始
      
      this.isRecording = true;
      this.recordingStartTime = Date.now();
      this.recordingPath = path.join(os.tmpdir(), `interview_${Date.now()}.webm`);
      
      console.log('RecordingService: 开始录音，保存路径:', this.recordingPath);
      
      return { 
        success: true, 
        message: '录音已开始',
        recordingPath: this.recordingPath
      };
    } catch (error) {
      console.error('RecordingService: 启动录音失败:', error);
      return { success: false, error };
    }
  }

  async stopRecording() {
    console.log('RecordingService: stopRecording 被调用');
    if (!this.isRecording) {
      console.log('RecordingService: 没有正在进行的录音');
      return { success: false, error: '没有正在进行的录音' };
    }
    
    try {
      // 模拟录音结束
      this.isRecording = false;
      const duration = (Date.now() - this.recordingStartTime) / 1000; // 秒
      
      console.log('RecordingService: 停止录音，时长:', duration, '秒');
      
      // 在实际应用中，这里会返回录音文件的路径
      return { 
        success: true, 
        recordingPath: this.recordingPath,
        duration
      };
    } catch (error) {
      console.error('RecordingService: 停止录音失败:', error);
      return { success: false, error };
    }
  }
}

console.log('创建 RecordingService 实例');
export default new RecordingService(); 