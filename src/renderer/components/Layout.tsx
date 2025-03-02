import { Outlet, NavLink } from 'react-router-dom';

function Layout() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* 侧边栏导航 */}
      <div className="w-24 bg-white shadow-md flex flex-col items-center py-6">
        <div className="mb-6 text-xl font-bold text-blue-600">IC</div>
        <div className="flex-1 flex flex-col items-center space-y-6 w-full">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `p-3 w-full text-center transition-colors ${
                isActive ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-500 hover:text-blue-500'
              }`
            }
          >
            首页
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              `p-3 w-full text-center transition-colors ${
                isActive ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-500 hover:text-blue-500'
              }`
            }
          >
            历史
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `p-3 w-full text-center transition-colors ${
                isActive ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-500 hover:text-blue-500'
              }`
            }
          >
            设置
          </NavLink>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout; 