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
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
class StorageService {
    constructor() {
        // 创建存储目录
        this.storagePath = path.join(os.homedir(), '.interview-copilot');
        if (!fs.existsSync(this.storagePath)) {
            fs.mkdirSync(this.storagePath, { recursive: true });
        }
        this.setupIpcHandlers();
    }
    setupIpcHandlers() {
        electron_1.ipcMain.handle('save-interview', this.saveInterview.bind(this));
        electron_1.ipcMain.handle('get-interviews', this.getInterviews.bind(this));
    }
    async saveInterview(_, data) {
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
        }
        catch (error) {
            console.error('保存面试记录失败:', error);
            return { success: false, error };
        }
    }
    async getInterviews(_) {
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
        }
        catch (error) {
            console.error('获取面试记录失败:', error);
            return { success: false, error, interviews: [] };
        }
    }
}
exports.default = new StorageService();
