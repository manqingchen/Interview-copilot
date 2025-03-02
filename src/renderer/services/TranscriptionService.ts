import axios from 'axios';

class TranscriptionService {
  private apiKey = 'sk-epfufpjsjnrjfrfqchcypsiaxrqfiqlzanksfpvszfvoakhu';
  
  async transcribeAudio(audioBlob: Blob): Promise<{ success: boolean; text?: string; error?: string }> {
    try {
      console.log('开始转录音频...');
      
      // 将 Blob 转换为 base64 字符串
      const reader = new FileReader();
      
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64Data = reader.result as string;
          resolve(base64Data.split(',')[1]); // 移除 data:audio/webm;base64, 前缀
        };
        
        reader.onerror = () => {
          reject(new Error('读取音频数据失败'));
        };
        
        reader.readAsDataURL(audioBlob);
      });
      
      const base64Data = await base64Promise;
      
      // 通过 Electron 的 IPC 调用主进程进行 API 请求
      const result = await window.electronAPI.transcribeAudio({
        base64Data,
        apiKey: this.apiKey,
        model: 'FunAudioLLM/SenseVoiceSmall'
      });
      
      console.log('转录结果:', result);
      
      if (result.success && result.text) {
        return { success: true, text: result.text };
      } else {
        return { success: false, error: result.error || '转录结果为空' };
      }
    } catch (error) {
      console.error('转录失败:', error);
      let errorMessage = '转录失败';
      
      if (error instanceof Error) {
        errorMessage = `转录失败: ${error.message}`;
      }
      
      return { success: false, error: errorMessage };
    }
  }
  
  // 改进的文本处理，将转录文本分割成对话形式
  processTranscription(text: string): Array<{ speaker: 'interviewer' | 'interviewee', text: string }> {
    console.log('原始转录文本:', text);
    
    // 分割文本为段落
    const paragraphs = text.split('\n').filter(line => line.trim() !== '');
    const result: Array<{ speaker: 'interviewer' | 'interviewee', text: string }> = [];
    
    // 如果没有明确的说话者标记，我们需要尝试推断
    // 默认第一个说话者是面试者（因为通常是面试者先开始自我介绍）
    let currentSpeaker: 'interviewer' | 'interviewee' = 'interviewee';
    
    for (const paragraph of paragraphs) {
      // 检查是否有明确的说话者标记
      if (paragraph.match(/^(面试官|interviewer|hr|HR|面试人员|招聘方)[:：]/i)) {
        // 明确标记为面试官
        const content = paragraph.replace(/^(面试官|interviewer|hr|HR|面试人员|招聘方)[:：]\s*/i, '').trim();
        if (content) {
          result.push({ speaker: 'interviewer', text: content });
          currentSpeaker = 'interviewer';
        }
      } else if (paragraph.match(/^(我|应聘者|面试者|interviewee|candidate|求职者)[:：]/i)) {
        // 明确标记为面试者
        const content = paragraph.replace(/^(我|应聘者|面试者|interviewee|candidate|求职者)[:：]\s*/i, '').trim();
        if (content) {
          result.push({ speaker: 'interviewee', text: content });
          currentSpeaker = 'interviewee';
        }
      } else {
        // 没有明确标记，使用启发式规则
        
        // 1. 检查是否包含问题标记
        const isQuestion = paragraph.endsWith('?') || paragraph.endsWith('？') || 
                           paragraph.includes('吗？') || paragraph.includes('吗?') ||
                           paragraph.includes('能否') || paragraph.includes('请问') ||
                           paragraph.includes('介绍一下') || paragraph.includes('说一说') ||
                           paragraph.includes('讲一讲') || paragraph.includes('谈谈');
        
        // 2. 检查是否包含自我介绍
        const isSelfIntro = paragraph.includes('我的名字') || paragraph.includes('我叫') || 
                            paragraph.includes('我是') || paragraph.includes('我今年') ||
                            paragraph.includes('我毕业于') || paragraph.includes('我的经验');
        
        // 3. 检查是否包含面试官常用语
        const isInterviewerTalk = paragraph.includes('下一个问题') || paragraph.includes('接下来') ||
                                 paragraph.includes('谢谢你的回答') || paragraph.includes('非常好') ||
                                 paragraph.includes('公司的情况') || paragraph.includes('团队的情况');
        
        // 根据上下文和内容特征判断说话者
        if (isQuestion || isInterviewerTalk) {
          // 提问或面试官常用语，可能是面试官
          result.push({ speaker: 'interviewer', text: paragraph });
          currentSpeaker = 'interviewer';
        } else if (isSelfIntro || (currentSpeaker === 'interviewee' && !isQuestion)) {
          // 自我介绍或者上一个说话者也是面试者，可能是面试者继续说话
          if (result.length > 0 && result[result.length - 1].speaker === 'interviewee') {
            // 如果上一条也是面试者，则合并
            result[result.length - 1].text += ' ' + paragraph;
          } else {
            result.push({ speaker: 'interviewee', text: paragraph });
          }
          currentSpeaker = 'interviewee';
        } else {
          // 默认交替对话模式
          const lastSpeaker = result.length > 0 ? result[result.length - 1].speaker : null;
          const newSpeaker = lastSpeaker === 'interviewer' ? 'interviewee' : 'interviewer';
          
          result.push({ speaker: newSpeaker, text: paragraph });
          currentSpeaker = newSpeaker;
        }
      }
    }
    
    console.log('处理后的对话:', result);
    return result;
  }
}

export default new TranscriptionService(); 