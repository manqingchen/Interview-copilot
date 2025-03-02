class RecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private isRecording = false;

  async startRecording(): Promise<{ success: boolean; error?: string }> {
    if (this.isRecording) {
      return { success: false, error: '已经在录音中' };
    }

    try {
      console.log('开始获取麦克风权限...');
      // 请求麦克风权限
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('麦克风权限获取成功');

      // 尝试不同的音频格式，优先使用 MP3
      const mimeTypes = [
        'audio/mp3',
        'audio/mpeg',
        'audio/wav',
        'audio/webm;codecs=opus'
      ];
      
      let options = {};
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          console.log(`使用支持的音频格式: ${mimeType}`);
          options = { mimeType };
          break;
        }
      }

      // 创建 MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream, options);
      this.audioChunks = [];

      // 设置数据处理
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          console.log('录音数据片段已收集，大小:', event.data.size, '类型:', event.data.type);
        }
      };

      // 开始录音，每秒收集一次数据
      this.mediaRecorder.start(1000);
      this.isRecording = true;
      console.log('录音已开始，使用格式:', this.mediaRecorder.mimeType);

      return { success: true };
    } catch (error) {
      console.error('启动录音失败:', error);
      return { success: false, error: String(error) };
    }
  }

  async stopRecording(): Promise<{ success: boolean; audioBlob?: Blob; audioUrl?: string; error?: string }> {
    if (!this.isRecording || !this.mediaRecorder) {
      return { success: false, error: '没有正在进行的录音' };
    }

    return new Promise((resolve) => {
      if (this.mediaRecorder) {
        // 录音停止时的处理
        this.mediaRecorder.onstop = () => {
          console.log('录音已停止');
          
          // 获取录音使用的 MIME 类型
          const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
          console.log('录音 MIME 类型:', mimeType);
          
          // 创建音频 Blob
          const audioBlob = new Blob(this.audioChunks, { type: mimeType });
          console.log('创建的 Blob 类型:', audioBlob.type, '大小:', audioBlob.size);
          
          // 创建可播放的 URL
          const audioUrl = URL.createObjectURL(audioBlob);

          // 停止所有音频轨道
          if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
          }

          this.isRecording = false;
          resolve({ success: true, audioBlob, audioUrl });
        };

        // 停止录音
        this.mediaRecorder.stop();
      } else {
        resolve({ success: false, error: '录音器未初始化' });
      }
    });
  }

  // 获取录音状态
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  // 将录音保存到服务器或本地
  async saveRecording(audioBlob: Blob, fileName: string): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      // 在浏览器环境中，我们不能直接使用 Buffer
      // 所以我们需要通过 IPC 发送 Blob 对象
      
      // 将 Blob 转换为 base64 字符串
      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            // reader.result 是一个 base64 字符串
            const base64Data = reader.result as string;
            
            // 调用主进程保存文件
            const result = await window.electronAPI.saveAudioFile({
              base64Data: base64Data.split(',')[1], // 移除 data:audio/xxx;base64, 前缀
              fileName: fileName,
              mimeType: audioBlob.type
            });
            
            resolve(result);
          } catch (error) {
            reject(error);
          }
        };
        
        reader.onerror = () => {
          reject(new Error('读取音频数据失败'));
        };
        
        // 开始读取 Blob 为 base64
        reader.readAsDataURL(audioBlob);
      });
    } catch (error) {
      console.error('保存录音失败:', error);
      return { success: false, error: String(error) };
    }
  }
}

export default new RecordingService(); 