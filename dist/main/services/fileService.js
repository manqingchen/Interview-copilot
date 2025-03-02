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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
class FileService {
    constructor() {
        // 创建音频目录
        this.audioDir = path.join(os.homedir(), '.interview-copilot', 'audio');
        if (!fs.existsSync(this.audioDir)) {
            fs.mkdirSync(this.audioDir, { recursive: true });
        }
        this.setupIpcHandlers();
    }
    setupIpcHandlers() {
        electron_1.ipcMain.handle('save-audio-file', this.saveAudioFile.bind(this));
    }
    async saveAudioFile(_, data) {
        try {
            const filePath = path.join(this.audioDir, data.fileName);
            // 将 base64 转换为 Buffer
            const buffer = Buffer.from(data.base64Data, 'base64');
            // 写入文件
            fs.writeFileSync(filePath, buffer);
            console.log('音频文件已保存:', filePath);
            return { success: true, filePath };
        }
        catch (error) {
            console.error('保存音频文件失败:', error);
            return { success: false, error };
        }
    }
}
console.log('创建 FileService 实例');
exports.default = new FileService();
