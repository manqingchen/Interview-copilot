import { useState, useEffect } from 'react';

function DevTools() {
  const [pingResult, setPingResult] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // @ts-ignore - 忽略window.electronAPI类型错误
        const result = await window.electronAPI.ping();
        setPingResult(result);
      } catch (error) {
        console.error('测试连接失败:', error);
        setPingResult('连接失败');
      }
    };

    testConnection();
  }, []);

  return (
    <div className="fixed bottom-4 right-4">
      <button 
        onClick={() => setIsVisible(!isVisible)}
        className="bg-gray-800 text-white p-2 rounded-full shadow-lg"
      >
        {isVisible ? '隐藏' : '开发'}
      </button>

      {isVisible && (
        <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg mt-2 w-64">
          <h3 className="text-sm font-bold mb-2">开发工具</h3>
          <div className="text-xs">
            <p>Ping 测试: {pingResult}</p>
            <p>环境: {process.env.NODE_ENV}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-2 py-1 rounded mt-2 text-xs"
            >
              刷新页面
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DevTools; 