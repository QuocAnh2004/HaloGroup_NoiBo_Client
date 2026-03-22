import React from 'react';
import { LogOut, ShieldCheck, HelpCircle, Menu, X, MessageCircleMore, Users, ListTodo } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from './ProjectContext';
import TabTriggers, { TabOption } from '../shared/TabTriggers';
import SearchBox from '../shared/SearchBox';
import { AuthenticatedUser, UserRole } from '../../types';

interface ProjectHeaderProps {
  user?: AuthenticatedUser;
  onLogout: () => void;
  onChangePassword: () => void;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ user, onLogout, onChangePassword }) => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const { 
    activeTab, 
    setActiveTab, 
    activeCount, 
    completedCount, 
    totalMemberTasks,
    searchTerm,
    setSearchTerm
  } = useProjects();

  const tabs: TabOption<'IN_PROGRESS' | 'COMPLETED' | 'MEMBER_TASKS'>[] = [
    {
      value: 'IN_PROGRESS',
      label: 'Đang làm',
      icon: <ListTodo size={18} />,
      count: activeCount,
      activeColorClass: 'text-indigo-600',
      activeBgClass: 'bg-indigo-50'
    },
    {
      value: 'COMPLETED',
      label: 'Đã xong',
      icon: <ShieldCheck size={18} />,
      count: completedCount,
      activeColorClass: 'text-emerald-600',
      activeBgClass: 'bg-emerald-50'
    },
    {
      value: 'MEMBER_TASKS',
      label: 'Công việc nhân viên',
      icon: <Users size={18} />,
      count: totalMemberTasks,
      activeColorClass: 'text-blue-600',
      activeBgClass: 'bg-blue-50'
    }
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-4 md:px-8 py-3 flex justify-between items-center h-20">
        {/* Left side: Logo */}
        <div className="flex items-center">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200 overflow-hidden">
              <img src="/logo.png" alt="HolaGroup" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl font-medium tracking-tight text-slate-900 hidden sm:block">HolaGroup</span>
          </div>
        </div>

        {/* Center: Tabs - Absolute Centered */}
        {user?.role === UserRole.MANAGER && (
          <div className="absolute left-1/2 -translate-x-1/2 hidden lg:block">
            <TabTriggers 
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              className="border-none !gap-4"
            />
          </div>
        )}

        {/* Right side: Search & Actions */}
        <div className="flex items-center gap-4">
          {user?.role === UserRole.MANAGER && activeTab !== 'MEMBER_TASKS' && (
            <div className="hidden xl:block w-64">
              <SearchBox 
                placeholder="Tìm kiếm dự án..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                containerClassName="w-full"
              />
            </div>
          )}
          
          <button
            onClick={() => setOpen(true)}
            className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-95"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>
        </div>
      </nav>

      {/* OVERLAY: Lớp phủ tối phía sau */}
      <div
        className={`fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        onClick={() => setOpen(false)}
      />

      {/* ASIDE: Menu trượt ra */}
      <aside
        className={`fixed top-0 right-0 z-[9999] h-screen w-[320px] bg-slate-900 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Header của Menu */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
          <span className="font-bold text-xl text-white">Menu</span>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body của Menu: Dài xuống hết cỡ */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">

          <button
            onClick={() => { navigate("/employees"); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-300 transition group"
          >
            <Users size={20} className="group-hover:text-blue-400" />
            <span>Nhân sự</span>
          </button>
          <button
            onClick={() => { navigate("/messages"); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-300 transition group"
          >
            <MessageCircleMore size={20} className="group-hover:text-blue-400" />
            <span>Tin nhắn</span>
          </button>


        </div>

        {/* Footer*/}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <button
            onClick={() => { navigate("/guide"); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-300 transition group"
          >
            <HelpCircle size={20} className="group-hover:text-blue-400" />
            <span>Hướng dẫn sử dụng</span>
          </button>

          <button
            onClick={() => { onChangePassword?.(); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-300 transition group"
          >
            <ShieldCheck size={20} className="group-hover:text-indigo-400" />
            <span>Đổi mật khẩu</span>
          </button>
          <button
            onClick={() => { onLogout?.(); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-950/30 text-rose-500 transition font-bold"
          >
            <LogOut size={20} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default ProjectHeader;