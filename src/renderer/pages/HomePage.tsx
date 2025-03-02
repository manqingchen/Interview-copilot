import { useState, useEffect, useRef } from 'react';
import RecordingService from '../services/RecordingService';
import TranscriptionService from '../services/TranscriptionService';

function HomePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<Array<{ speaker: 'interviewer' | 'interviewee', text: string }>>([]);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // 添加调试信息
  const addDebugInfo = (info: string) => {
    console.log('调试信息:', info);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  useEffect(() => {
    // 检查 API 是否可用
    if (window.electronAPI) {
      addDebugInfo('Electron API 已加载');
    } else {
      addDebugInfo('警告: Electron API 未加载');
    }
  }, []);

  const startRecording = async () => {
    addDebugInfo('尝试开始录音...');
    try {
      // 使用渲染进程的录音服务
      const result = await RecordingService.startRecording();
      
      if (result.success) {
        addDebugInfo('录音开始成功');
        setIsRecording(true);
        // 清空之前的转录结果
        setTranscription([]);
        setAudioUrl(null);
        setAudioBlob(null);
      } else {
        addDebugInfo(`录音开始失败: ${result.error}`);
      }
    } catch (error) {
      addDebugInfo(`录音失败: ${error}`);
      console.error('录音失败:', error);
    }
  };

  const stopRecording = async () => {
    addDebugInfo('尝试停止录音...');
    try {
      // 使用渲染进程的录音服务
      const result = await RecordingService.stopRecording();
      
      if (result.success && result.audioBlob && result.audioUrl) {
        addDebugInfo('录音停止成功');
        setIsRecording(false);
        setAudioUrl(result.audioUrl);
        setAudioBlob(result.audioBlob);
        
        // 保存录音文件
        const fileName = `interview_${Date.now()}.webm`;
        const saveResult = await RecordingService.saveRecording(result.audioBlob, fileName);
        
        if (saveResult.success) {
          addDebugInfo(`录音已保存: ${saveResult.filePath}`);
        } else {
          addDebugInfo(`保存录音失败: ${saveResult.error}`);
        }
        
        // 开始转录
        await transcribeAudio(result.audioBlob);
      } else {
        addDebugInfo(`录音停止失败: ${result.error}`);
      }
    } catch (error) {
      addDebugInfo(`停止录音失败: ${error}`);
      console.error('停止录音失败:', error);
    }
  };

  const transcribeAudio = async (blob: Blob) => {
    addDebugInfo('开始转录音频...');
    setIsTranscribing(true);
    
    try {
      const result = await TranscriptionService.transcribeAudio(blob);
      
      if (result.success && result.text) {
        addDebugInfo('转录成功');
        addDebugInfo(`转录文本: ${result.text.substring(0, 50)}...`);
        
        // 处理转录文本
        const processedTranscription = TranscriptionService.processTranscription(result.text);
        setTranscription(processedTranscription);
      } else {
        addDebugInfo(`转录失败: ${result.error}`);
      }
    } catch (error) {
      addDebugInfo(`转录过程出错: ${error}`);
      console.error('转录过程出错:', error);
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold text-gray-800">面试助手</h1>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 p-6 flex flex-col">
        {/* 转录内容区域 */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-6 mb-6 overflow-auto">
          <h2 className="text-lg font-semibold mb-4">实时转录</h2>
          
          {transcription.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              {isRecording ? (
                <div className="text-center">
                  <div className="animate-pulse text-lg mb-4">正在录音中...</div>
                  <div className="text-red-500 font-bold text-xl">●</div>
                </div>
              ) : isTranscribing ? (
                <div className="text-center">
                  <div className="animate-pulse text-lg mb-4">正在转录中...</div>
                  <div className="loader"></div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-lg mb-4">点击下方按钮开始录音</div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {transcription.map((item, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg ${
                    item.speaker === 'interviewer' 
                      ? 'bg-blue-50 text-blue-800 mr-12' 
                      : 'bg-gray-50 text-gray-800 ml-12'
                  }`}
                >
                  <div className="text-xs font-medium mb-1">
                    {item.speaker === 'interviewer' ? '面试官' : '我'}
                  </div>
                  <div>{item.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 音频播放器 */}
        {audioUrl && (
          <div className="mb-4 bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium mb-2">录音预览:</h3>
            <audio ref={audioRef} src={audioUrl} controls className="w-full" />
            {audioBlob && !isTranscribing && transcription.length === 0 && (
              <button 
                onClick={() => audioBlob && transcribeAudio(audioBlob)}
                className="mt-2 bg-green-500 hover:bg-green-600 text-white rounded px-4 py-2 text-sm"
              >
                重新转录
              </button>
            )}
          </div>
        )}

        {/* 控制按钮 */}
        <div className="flex justify-center mb-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isTranscribing}
            className={`btn ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : isTranscribing
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
            } rounded-lg px-6 py-3 font-medium shadow-lg`}
          >
            {isRecording ? '停止录音' : isTranscribing ? '转录中...' : '开始录音'}
          </button>
        </div>

        {/* 调试信息 */}
        <div className="bg-gray-100 p-4 rounded-lg text-xs font-mono h-32 overflow-auto">
          <h3 className="font-bold mb-2">调试信息:</h3>
          {debugInfo.length === 0 ? (
            <div className="text-gray-500">暂无调试信息</div>
          ) : (
            <ul className="space-y-1">
              {debugInfo.map((info, index) => (
                <li key={index}>{info}</li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

export default HomePage; 