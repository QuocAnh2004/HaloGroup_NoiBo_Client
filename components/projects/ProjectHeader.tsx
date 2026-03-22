import React from 'react';
import { LogOut, ShieldCheck, HelpCircle, Menu, X, MessageCircleMore, Users, ListTodo } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from "@/utils";
import { UserRole } from "../../types";

interface ProjectHeaderProps {
  onLogout: () => void;
  onChangePassword: () => void;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ onLogout, onChangePassword }) => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const currentUser = getCurrentUser();

  return (
    <>
      <nav className="sticky top-0 z-30 bg-[#f8fafc]/80 backdrop-blur-md px-4 md:px-8 py-5 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200 overflow-hidden">
            <img src="/logo.png" alt="HolaGroup" className="w-full h-full object-cover" />
          </div>
          <span className="text-2xl font-medium tracking-tight text-slate-900">HolaGroup</span>
        </div>

        {/* Desktop menu items - chỉ hiện trên md trở lên */}
        <div className="hidden md:flex items-center gap-1">
          {currentUser?.role === UserRole.MANAGER && (
            <>
              <button
                onClick={() => navigate("/employees")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-indigo-600 transition-all duration-200 text-sm font-medium"
              >
                <Users size={17} strokeWidth={1.5} />
                <span>Nhân sự</span>
              </button>

              <button
                onClick={() => navigate("/members/task-list")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-green-600 transition-all duration-200 text-sm font-medium"
              >
                <ListTodo size={17} strokeWidth={1.5} />
                <span>Công việc nhân viên</span>
              </button>
            </>
          )}

          <button
            onClick={() => navigate("/messages")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-all duration-200 text-sm font-medium"
          >
            <MessageCircleMore size={17} strokeWidth={1.5} />
            <span>Tin nhắn</span>
          </button>

          <button
            onClick={() => navigate("/guide")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-all duration-200 text-sm font-medium"
          >
            <HelpCircle size={17} strokeWidth={1.5} />
            <span>Hướng dẫn</span>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-slate-200 mx-1" />

          <button
            onClick={onChangePassword}
            className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-indigo-600 transition-all duration-200 text-sm font-medium"
          >
            <ShieldCheck size={17} strokeWidth={1.5} />
            <span>Đổi mật khẩu</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-rose-50 text-rose-500 transition-all duration-200 text-sm font-semibold"
          >
            <LogOut size={17} strokeWidth={1.5} />
            <span>Đăng xuất</span>
          </button>
        </div>

        {/* Mobile: nút hamburger - chỉ hiện khi < md */}
        <button
          onClick={() => setOpen(true)}
          className="md:hidden w-11 h-11 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all duration-300"
          title="Menu"
        >
          <Menu size={22} strokeWidth={1.5} />
        </button>
      </nav>

      {/* Overlay - chỉ dùng trên mobile */}
      <div
        className={`fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Slide-in menu - chỉ dùng trên mobile */}
      <aside
        className={`fixed top-0 right-0 z-[9999] h-screen w-[320px] bg-slate-900 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
          <span className="font-bold text-xl text-white">Menu</span>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {currentUser?.role === UserRole.MANAGER && (
            <>
              <button
                onClick={() => { navigate("/employees"); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-300 transition group"
              >
                <Users size={20} className="group-hover:text-blue-400" />
                <span>Nhân sự</span>
              </button>

              <button
                onClick={() => { navigate("/members/task-list"); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-300 transition group"
              >
                <ListTodo size={20} className="group-hover:text-green-400" />
                <span>Công việc nhân viên</span>
              </button>
            </>
          )}

          <button
            onClick={() => { navigate("/messages"); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-300 transition group"
          >
            <MessageCircleMore size={20} className="group-hover:text-blue-400" />
            <span>Tin nhắn</span>
          </button>
        </div>

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