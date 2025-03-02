import { useState } from 'react';

function ProfilePage() {
  const [apiKey, setApiKey] = useState('sk-epfufpjsjnrjfrfqchcypsiaxrqfiqlzanksfpvszfvoakhu');

  const handleSaveSettings = () => {
    // 保存设置
    alert('设置已保存');
  };

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold text-gray-800">我的设置</h1>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 p-6">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold mb-6">API 设置</h2>
          
          <div className="mb-4">
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <input
              type="text"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              用于访问语音转文字和文本分析API的密钥
            </p>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">应用设置</h2>
            
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  defaultChecked
                />
                <span className="ml-2 text-sm text-gray-700">自动保存录音文件</span>
              </label>
            </div>
            
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  defaultChecked
                />
                <span className="ml-2 text-sm text-gray-700">启动时自动检查更新</span>
              </label>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleSaveSettings}
              className="btn btn-primary"
            >
              保存设置
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage; 