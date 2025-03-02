import { ipcMain } from 'electron';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as child_process from 'child_process';

// 尝试查找系统中的 ffmpeg
function findFfmpegPath(): string | null {
  try {
    // 在 macOS 和 Linux 上尝试使用 which 命令
    if (process.platform !== 'win32') {
      const result = child_process.execSync('which ffmpeg', { encoding: 'utf8' }).trim();
      if (result && fs.existsSync(result)) {
        console.log('在系统中找到 ffmpeg:', result);
        return result;
      }
    } else {
      // 在 Windows 上尝试使用 where 命令
      const result = child_process.execSync('where ffmpeg', { encoding: 'utf8' }).trim();
      if (result && fs.existsSync(result.split('\n')[0])) {
        console.log('在系统中找到 ffmpeg:', result.split('\n')[0]);
        return result.split('\n')[0];
      }
    }
  } catch (error) {
    console.error('查找系统 ffmpeg 失败:', error);
  }
  return null;
}

// 获取 ffmpeg 路径
const ffmpegPath = findFfmpegPath();
if (ffmpegPath) {
  console.log('已找到 ffmpeg 路径:', ffmpegPath);
} else {
  console.warn('未找到 ffmpeg，音频转换功能可能不可用');
}

class TranscriptionService {
  private apiUrl = 'https://api.siliconflow.cn/v1/audio/transcriptions';
  
  constructor() {
    this.setupIpcHandlers();
  }
  
  private setupIpcHandlers() {
    ipcMain.handle('transcribe-audio', this.transcribeAudio.bind(this));
  }
  
  // 使用子进程直接调用 ffmpeg 命令行
  private async convertAudioToWav(inputFile: string, outputFile: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!ffmpegPath) {
        reject(new Error('ffmpeg 不可用，无法转换音频格式'));
        return;
      }
      
      const command = `"${ffmpegPath}" -i "${inputFile}" -acodec pcm_s16le -ar 16000 "${outputFile}"`;
      console.log('执行 ffmpeg 命令:', command);
      
      child_process.exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('ffmpeg 执行失败:', error);
          console.error('ffmpeg stderr:', stderr);
          reject(error);
          return;
        }
        
        console.log('ffmpeg stdout:', stdout);
        if (stderr) {
          console.log('ffmpeg stderr (信息):', stderr);
        }
        
        console.log('音频转换完成');
        resolve();
      });
    });
  }
  
  async transcribeAudio(_: any, data: { base64Data: string, apiKey: string, model: string }) {
    try {
      console.log('主进程: 开始转录音频...');
      
      // 检查 ffmpeg 是否可用
      if (!ffmpegPath) {
        throw new Error('ffmpeg 不可用，无法转换音频格式');
      }
      
      // 将 base64 转换为临时文件
      const tempDir = path.join(os.tmpdir(), 'interview-copilot');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // 保存原始音频文件
      const timestamp = Date.now();
      const tempInputFile = path.join(tempDir, `temp_input_${timestamp}.webm`);
      fs.writeFileSync(tempInputFile, Buffer.from(data.base64Data, 'base64'));
      console.log('原始音频文件已保存:', tempInputFile);
      
      // 转换为 WAV 格式
      const tempWavFile = path.join(tempDir, `temp_output_${timestamp}.wav`);
      
      console.log('开始转换音频格式为 WAV...');
      console.log('输入文件:', tempInputFile);
      console.log('输出文件:', tempWavFile);
      
      // 使用子进程直接调用 ffmpeg
      await this.convertAudioToWav(tempInputFile, tempWavFile);
      
      // 检查转换后的文件是否存在
      if (!fs.existsSync(tempWavFile)) {
        throw new Error('转换后的 WAV 文件不存在');
      }
      
      const fileStats = fs.statSync(tempWavFile);
      console.log('转换后的 WAV 文件大小:', fileStats.size, '字节');
      
      if (fileStats.size === 0) {
        throw new Error('转换后的 WAV 文件大小为 0');
      }
      
      // 创建 FormData
      const FormData = require('form-data');
      const formData = new FormData();
      
      // 读取文件内容并添加到 FormData
      const fileBuffer = fs.readFileSync(tempWavFile);
      console.log('读取的文件大小:', fileBuffer.length, '字节');
      
      formData.append('file', fileBuffer, {
        filename: `audio_${timestamp}.wav`,
        contentType: 'audio/wav'
      });
      formData.append('model', data.model);
      
      console.log('发送请求到 API...');
      console.log('请求 URL:', this.apiUrl);
      console.log('请求模型:', data.model);
      
      // 发送请求到 SiliconFlow API
      const response = await axios.post(this.apiUrl, formData, {
        headers: {
          'Authorization': `Bearer ${data.apiKey}`,
          'Content-Type': 'multipart/form-data'
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      
      // 删除临时文件
      try {
        fs.unlinkSync(tempInputFile);
        fs.unlinkSync(tempWavFile);
        console.log('临时文件已删除');
      } catch (err) {
        console.error('删除临时文件失败:', err);
      }
      
      console.log('主进程: 转录结果:', response.data);
      
      if (response.data && response.data.text) {
        return { success: true, text: response.data.text };
      } else {
        return { success: false, error: '转录结果为空' };
      }
    } catch (error) {
      console.error('主进程: 转录失败:', error);
      let errorMessage = '转录失败';
      
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = `转录失败: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
      } else if (error instanceof Error) {
        errorMessage = `转录失败: ${error.message}`;
      }
      
      return { success: false, error: errorMessage };
    }
  }
}

console.log('创建 TranscriptionService 实例');
export default new TranscriptionService(); 