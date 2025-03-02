import { contextBridge, ipcRenderer } from 'electron';

console.log('preload.js 开始加载');

// 添加一个简单的测试函数
const testAPI = () => {
  console.log('测试 API 调用');
  return 'API 测试成功';
};

// 使用 contextBridge 暴露 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  ping: () => {
    console.log('ping 被调用');
    return 'pong';
  },
  test: testAPI,
  startRecording: () => {
    console.log('preload: 调用 startRecording');
    return ipcRenderer.invoke('start-recording');
  },
  stopRecording: () => {
    console.log('preload: 调用 stopRecording');
    return ipcRenderer.invoke('stop-recording');
  },
  saveAudioFile: (data: { base64Data: string, fileName: string, mimeType: string }) => {
    console.log('preload: 调用 saveAudioFile', data.fileName);
    return ipcRenderer.invoke('save-audio-file', data);
  },
  saveInterview: (data: any) => {
    console.log('preload: 调用 saveInterview', data);
    return ipcRenderer.invoke('save-interview', data);
  },
  getInterviews: () => {
    console.log('preload: 调用 getInterviews');
    return ipcRenderer.invoke('get-interviews');
  },
  transcribeAudio: (data: { base64Data: string, apiKey: string, model: string }) => {
    console.log('preload: 调用 transcribeAudio');
    return ipcRenderer.invoke('transcribe-audio', data);
  },
});

console.log('preload.js 已加载完成'); 