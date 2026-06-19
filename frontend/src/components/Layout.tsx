import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BookOpen, Mic, PenTool, Users, BarChart3, Menu, X } from 'lucide-react';

const navItems = [
  { to: '/collection', label: '词条采集', icon: BookOpen },
  { to: '/pronunciation', label: '发音备注', icon: Mic },
  { to: '/annotation', label: '语义注解', icon: PenTool },
  { to: '/collaboration', label: '家庭共编', icon: Users },
  { to: '/statistics', label: '统计总览', icon: BarChart3 },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-cream-300/50 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-cream-200">
            <h1 className="font-display text-xl text-ochre-500 leading-tight">方言词汇采集</h1>
            <p className="text-xs text-ink-400 mt-1">家庭语义注解平台</p>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-ochre-500 text-white shadow-sm'
                      : 'text-ink-600 hover:bg-cream-100 hover:text-ink-900'
                  }`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-cream-200">
            <div className="text-xs text-ink-400 text-center">传承方言 · 留住记忆</div>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 bg-cream-100/80 backdrop-blur-md border-b border-cream-200 px-6 py-3 flex items-center gap-4 lg:px-8">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-cream-200 transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-ink-400 text-sm hidden sm:inline">方言保护</span>
            <span className="text-ink-300 hidden sm:inline">·</span>
            <span className="font-display text-ochre-500">家庭共编</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
