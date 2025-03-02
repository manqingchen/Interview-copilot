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
const os = __importStar(require("os"));
class RecordingService {
    constructor() {
        this.isRecording = false;
        this.recordingPath = '';
        this.recordingStartTime = 0;
        console.log('RecordingService: 初始化');
        this.setupIpcHandlers();
    }
    setupIpcHandlers() {
        console.log('RecordingService: 设置 IPC 处理程序');
        electron_1.ipcMain.handle('start-recording', this.startRecording.bind(this));
        electron_1.ipcMain.handle('stop-recording', this.stopRecording.bind(this));
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
            const sources = await electron_1.desktopCapturer.getSources({
                types: ['window', 'screen'], // 不支持 'audio' 类型
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
        }
        catch (error) {
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
        }
        catch (error) {
            console.error('RecordingService: 停止录音失败:', error);
            return { success: false, error };
        }
    }
}
console.log('创建 RecordingService 实例');
exports.default = new RecordingService();
