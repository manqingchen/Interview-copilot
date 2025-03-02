import axios from 'axios';

const API_BASE_URL = 'https://api.siliconflow.cn';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// 设置API Key
export const setApiKey = (apiKey: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
};

// 初始化默认API Key
setApiKey('sk-epfufpjsjnrjfrfqchcypsiaxrqfiqlzanksfpvszfvoakhu');

// 语音转文字API
export const transcribeAudio = async (audioBlob: Blob) => {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');
  formData.append('model', 'whisper-1');
  
  try {
    const response = await api.post('/v1/audio/transcriptions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('转录失败:', error);
    throw error;
  }
};

// 文本分析API
export const analyzeText = async (text: string) => {
  try {
    const response = await api.post('/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '你是一个面试助手，帮助分析面试官的问题并提供建议。'
        },
        {
          role: 'user',
          content: `分析以下面试问题，并提供简短的建议：${text}`
        }
      ],
      temperature: 0.7,
    });
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('分析失败:', error);
    throw error;
  }
};

export default api; 