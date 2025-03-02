import { useState, useEffect } from 'react';

interface Interview {
  id: number;
  date: string;
  duration: string;
  title: string;
}

function HistoryPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        // 模拟从Electron获取面试历史记录
        // @ts-ignore - 忽略window.electronAPI类型错误
        // const result = await window.electronAPI.getInterviews();
        
        // 模拟数据
        const mockInterviews = [
          { id: 1, date: '2023-11-20', duration: '45分钟', title: '前端开发工程师面试' },
          { id: 2, date: '2023-11-15', duration: '30分钟', title: 'React开发工程师面试' },
          { id: 3, date: '2023-11-10', duration: '60分钟', title: '全栈开发工程师面试' },
        ];
        
        setInterviews(mockInterviews);
        setLoading(false);
      } catch (error) {
        console.error('获取面试历史失败:', error);
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold text-gray-800">面试历史</h1>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">加载中...</p>
          </div>
        ) : interviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-gray-500 mb-4">暂无面试记录</p>
            <button className="btn btn-primary">开始新的面试</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviews.map((interview) => (
              <div key={interview.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold mb-2">{interview.title}</h3>
                <div className="text-sm text-gray-500 mb-4">
                  <p>日期: {interview.date}</p>
                  <p>时长: {interview.duration}</p>
                </div>
                <button className="btn btn-primary w-full">查看详情</button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default HistoryPage; 