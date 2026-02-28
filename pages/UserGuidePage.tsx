
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, ShieldCheck, User, FolderKanban, ListTree, 
  CheckSquare, MessageSquare, Bell, Zap, Layout, ChevronRight, 
  Clock, AlertTriangle, CheckCircle2, ArrowLeft
} from 'lucide-react';
import BackButton from '../components/shared/BackButton';

const GuideSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}> = ({ title, icon, children, delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: delay * 0.1 }}
    className="bg-white rounded-[40px] p-8 md:p-10 shadow-sm border border-slate-100 space-y-6"
  >
    <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
        {icon}
      </div>
      <h2 className="text-xl font-medium text-slate-800 tracking-tight">{title}</h2>
    </div>
    <div className="text-slate-500 font-light leading-relaxed space-y-4">
      {children}
    </div>
  </motion.div>
);

const UserGuidePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100 px-4 md:px-8 py-4">
        <div className="max-w-[1000px] mx-auto flex items-center gap-4">
          <BackButton onClick={() => navigate(-1)} />
          <h1 className="text-xl font-medium text-slate-900">Hướng dẫn sử dụng</h1>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 md:px-8 pt-10 space-y-8">
        
        {/* Hero Area */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 py-10"
        >
          <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-[32px] flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-200 mb-6">
            <BookOpen size={40} strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl md:text-5xl font-medium text-slate-900 tracking-tight">
            Làm chủ <span className="text-indigo-600">HolaGroup</span>
          </h1>
          <p className="text-lg text-slate-400 font-light max-w-2xl mx-auto">
            Hệ thống quản lý dự án tập trung vào tính đơn giản, trực quan và hiệu quả. 
            Dưới đây là mọi thứ bạn cần biết để bắt đầu.
          </p>
        </motion.div>

        {/* 1. Roles */}
        <GuideSection title="Phân quyền hệ thống" icon={<ShieldCheck size={24} />} delay={1}>
          <p>Hệ thống chia làm 2 vai trò chính với quyền hạn khác nhau:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Manager Card */}
            <div className="bg-indigo-50/50 p-6 rounded-[28px] border border-indigo-100">
              <div className="flex items-center gap-3 mb-3 text-indigo-700">
                <ShieldCheck size={20} />
                <h3 className="font-medium">Quản lý (Manager)</h3>
              </div>
              <ul className="space-y-2 text-sm text-indigo-900/70">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 bg-indigo-400 rounded-full shrink-0"></span>
                  Toàn quyền Tạo, Sửa, Xóa Dự án & Nhân sự.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 bg-indigo-400 rounded-full shrink-0"></span>
                  Phân công nhiệm vụ và đặt deadline.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 bg-indigo-400 rounded-full shrink-0"></span>
                  Gửi thông báo chung cho toàn bộ dự án.
                </li>
              </ul>
            </div>

            {/* Member Card */}
            <div className="bg-slate-50 p-6 rounded-[28px] border border-slate-100">
              <div className="flex items-center gap-3 mb-3 text-slate-700">
                <User size={20} />
                <h3 className="font-medium">Nhân viên (Member)</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 bg-slate-300 rounded-full shrink-0"></span>
                  Xem danh sách dự án mình tham gia.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 bg-slate-300 rounded-full shrink-0"></span>
                  Theo dõi tiến độ và timeline chi tiết (Read-only).
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 bg-slate-300 rounded-full shrink-0"></span>
                  Nhận tin nhắn riêng từ Quản lý.
                </li>
              </ul>
            </div>
          </div>
        </GuideSection>

        {/* 2. Project Structure */}
        <GuideSection title="Cấu trúc dự án" icon={<FolderKanban size={24} />} delay={2}>
          <p>Mỗi dự án được tổ chức theo mô hình cây 3 cấp độ để dễ dàng quản lý khối lượng công việc lớn:</p>
          
          <div className="bg-slate-50 rounded-[32px] p-6 md:p-8 space-y-6 relative overflow-hidden">
            {/* Visual Guide Line */}
            <div className="absolute left-[39px] md:left-[47px] top-10 bottom-10 w-[2px] bg-slate-200"></div>

            {/* Level 1: Giai đoạn */}
            <div className="relative flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center shrink-0 z-10 text-indigo-600 font-bold border border-slate-100">1</div>
              <div className="bg-white p-4 rounded-2xl shadow-sm flex-1 border border-slate-100">
                <div className="text-indigo-600 font-medium text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
                  <Layout size={14} /> Giai đoạn (Group)
                </div>
                <p className="text-sm">Ví dụ: "Thiết kế UI/UX", "Phát triển Backend". Đây là các cột mốc lớn của dự án.</p>
              </div>
            </div>

            {/* Level 2: Nhiệm vụ */}
            <div className="relative flex items-start gap-4 pl-8 md:pl-12">
              <div className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center shrink-0 z-10 text-slate-500 border border-slate-100">
                <ListTree size={20} />
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm flex-1 border border-slate-100">
                <div className="text-slate-600 font-medium text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
                  <CheckSquare size={14} /> Nhiệm vụ (Task Item)
                </div>
                <p className="text-sm">Ví dụ: "Vẽ Wireframe", "Thiết kế Database". Các đầu việc cụ thể cần hoàn thành trong giai đoạn.</p>
              </div>
            </div>

            {/* Level 3: Checklist */}
            <div className="relative flex items-start gap-4 pl-16 md:pl-24">
              <div className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center shrink-0 z-10 text-emerald-500 border border-slate-100">
                <CheckCircle2 size={16} />
              </div>
              <div className="bg-white p-3 rounded-2xl shadow-sm flex-1 border border-slate-100">
                <div className="text-emerald-600 font-medium text-xs uppercase tracking-wider mb-1">
                   Checklist con
                </div>
                <p className="text-xs">Các bước nhỏ: "Xác định User Flow", "Chốt màu sắc chủ đạo"...</p>
              </div>
            </div>
          </div>
        </GuideSection>

        {/* 3. Status Indicators */}
        <GuideSection title="Trạng thái & Màu sắc" icon={<Zap size={24} />} delay={3}>
          <p>Hệ thống tự động tính toán trạng thái dựa trên thời gian thực tế so với Deadline:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                <Clock size={20} />
              </div>
              <span className="font-medium text-slate-800">Đang thực hiện</span>
              <span className="text-xs text-slate-400">Chưa đến hạn, mọi thứ ổn định.</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm flex flex-col items-center text-center gap-2 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
              <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <span className="font-medium text-rose-600">Trễ hạn / Cảnh báo</span>
              <span className="text-xs text-slate-400">Đã quá deadline hoặc sắp hết hạn (trong 48h).</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle2 size={20} />
              </div>
              <span className="font-medium text-emerald-600">Hoàn thành</span>
              <span className="text-xs text-slate-400">Tất cả checklist con đã được đánh dấu xong.</span>
            </div>
          </div>
        </GuideSection>

        {/* 4. Communication */}
        <GuideSection title="Trao đổi & Thông báo" icon={<MessageSquare size={24} />} delay={4}>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl shrink-0">
                <Bell size={18} />
              </div>
              <div>
                <h4 className="font-medium text-slate-800">Bảng tin chung</h4>
                <p className="text-sm">Nơi Quản lý đăng các thông báo quan trọng cho toàn bộ team. Mọi thành viên đều nhìn thấy.</p>
              </div>
            </div>
            <div className="w-full h-[1px] bg-slate-100"></div>
            <div className="flex items-start gap-4">
              <div className="p-2 bg-sky-100 text-sky-600 rounded-xl shrink-0">
                <MessageSquare size={18} />
              </div>
              <div>
                <h4 className="font-medium text-slate-800">Tin nhắn riêng</h4>
                <p className="text-sm">Quản lý có thể gửi tin nhắn nhắc nhở hoặc trao đổi riêng với từng thành viên cụ thể.</p>
              </div>
            </div>
          </div>
        </GuideSection>

        {/* Footer Note */}
        <div className="text-center pt-10 pb-6">
          <p className="text-slate-400 text-sm font-light italic">
            "Sự rõ ràng là sức mạnh của hiệu suất."
          </p>
          <div className="mt-6">
            <button 
              onClick={() => navigate('/')}
              className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-sm font-medium hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
            >
              Bắt đầu làm việc
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserGuidePage;
