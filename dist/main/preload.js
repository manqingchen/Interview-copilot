"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
console.log('preload.js 开始加载');
// 添加一个简单的测试函数
const testAPI = () => {
    console.log('测试 API 调用');
    return 'API 测试成功';
};
// 使用 contextBridge 暴露 API 给渲染进程
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    ping: () => {
        console.log('ping 被调用');
        return 'pong';
    },
    test: testAPI,
    startRecording: () => {
        console.log('preload: 调用 startRecording');
        return electron_1.ipcRenderer.invoke('start-recording');
    },
    stopRecording: () => {
        console.log('preload: 调用 stopRecording');
        return electron_1.ipcRenderer.invoke('stop-recording');
    },
    saveAudioFile: (data) => {
        console.log('preload: 调用 saveAudioFile', data.fileName);
        return electron_1.ipcRenderer.invoke('save-audio-file', data);
    },
    saveInterview: (data) => {
        console.log('preload: 调用 saveInterview', data);
        return electron_1.ipcRenderer.invoke('save-interview', data);
    },
    getInterviews: () => {
        console.log('preload: 调用 getInterviews');
        return electron_1.ipcRenderer.invoke('get-interviews');
    },
    transcribeAudio: (data) => {
        console.log('preload: 调用 transcribeAudio');
        return electron_1.ipcRenderer.invoke('transcribe-audio', data);
    },
});
console.log('preload.js 已加载完成');
