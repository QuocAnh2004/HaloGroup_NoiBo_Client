
import React, { useState, useEffect } from 'react';
import { Bell, Send, Users, User, Clock, ChevronRight, MessageSquare, ArrowLeft, Info } from 'lucide-react';
import { useProjectDetail } from './ProjectDetailContext';
import { projectsApi } from '../../api/projects';
import { ProjectNotification } from '../../types';
import Button from '../shared/Button';
import Toast, { ToastType } from '../shared/Toast';
import TabTriggers, { TabOption } from '../shared/TabTriggers';
import MemberItem from '../shared/MemberItem';
import TextArea from '../shared/TextArea';
import { formatSimpleDateTime } from '../../utils';

type TabType = 'GENERAL' | 'PERSONAL';

const ProjectNotificationsManager: React.FC = () => {
  const { project, isReadOnly } = useProjectDetail();
  
  const [notifications, setNotifications] = useState<ProjectNotification[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('GENERAL');
  
  // State cho phần Personal
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  
  // State input
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);

  // Load notifications
  useEffect(() => {
    const loadNotifs = async () => {
        try {
            const data = await projectsApi.fetchNotifications(project.id);
            setNotifications(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (e) {
            console.error("Failed to load notifications", e);
        }
    };
    loadNotifs();
  }, [project.id, isSending]); // Reload khi gửi xong

  // Khi chuyển tab sang General, reset selected member và load lại nội dung mới nhất vào ô nhập
  useEffect(() => {
    if (activeTab === 'GENERAL') {
        setSelectedMemberId(null);
        const latestGeneral = notifications.find(n => n.type === 'GENERAL');
        if (latestGeneral) {
            setContent(latestGeneral.content);
        } else {
            setContent('');
        }
    } else {
        setContent(''); // Clear khi sang tab Personal
    }
  }, [activeTab, notifications]);

  const handleSend = async () => {
    if (!content.trim()) return;
    
    // Validate logic
    if (activeTab === 'PERSONAL' && !selectedMemberId) {
        setToast({ message: 'Vui lòng chọn thành viên', type: 'error' });
        return;
    }

    setIsSending(true);
    try {
      const senderName = "Quản lý dự án"; 
      
      await projectsApi.sendNotification(project.id, {
        projectId: project.id,
        content: content.trim(),
        type: activeTab,
        targetMemberId: activeTab === 'PERSONAL' ? selectedMemberId! : undefined,
        senderName
      });

      setToast({ message: 'Đã gửi thông báo thành công!', type: 'success' });
      // Không clear content ở tab General để user thấy cái mình vừa gửi
      if (activeTab === 'PERSONAL') {
          setContent('');
      }

    } catch (error) {
      setToast({ message: 'Lỗi khi gửi thông báo', type: 'error' });
    } finally {
      setIsSending(false);
    }
  };

  if (isReadOnly) return null;

  const tabs: TabOption<TabType>[] = [
    { 
        value: 'GENERAL', 
        label: 'Thông báo chung', 
        icon: <Users size={18} />,
        activeColorClass: 'text-indigo-600',
        activeBgClass: 'bg-indigo-50'
    },
    { 
        value: 'PERSONAL', 
        label: 'Gửi riêng', 
        icon: <User size={18} />,
        activeColorClass: 'text-sky-600',
        activeBgClass: 'bg-sky-50'
    }
  ];

  // Helper để render lịch sử tin nhắn (Chỉ dùng cho Personal)
  const renderHistory = (filterFn: (n: ProjectNotification) => boolean) => {
      const history = notifications.filter(filterFn);
      if (history.length === 0) return (
          <div className="text-center py-8 text-slate-300 text-xs italic">Chưa có tin nhắn nào.</div>
      );

      return (
          <div className="relative pl-2 space-y-6 mt-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2 pb-4">
              {/* Vertical Line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-slate-200"></div>

              {history.map(notif => (
                  <div key={notif.id} className="relative pl-6 group">
                      {/* Dot */}
                      <div className="absolute left-[3px] top-1.5 w-2.5 h-2.5 rounded-full bg-sky-400 ring-2 ring-white shadow-sm z-10"></div>
                      
                      <div className="flex flex-col gap-1.5 items-start">
                          {/* Time */}
                          <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded-md">
                              {formatSimpleDateTime(notif.createdAt)}
                          </span>
                          
                          {/* Content Bubble */}
                          <p className="text-sm">{notif.content}</p>
                      </div>
                  </div>
              ))}
          </div>
      );
  };

  return (
    <section className="w-full bg-white border-b border-slate-50 px-4 md:px-10 py-8 md:py-12">
      <div className="max-w-[1600px] mx-auto">
         {/* Removed wrapper, increased gap */}
         <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start">
            
            {/* Left: Controls & Context */}
            <div className="md:w-1/3 space-y-8">
               <div className="space-y-3">
                 <h3 className="text-2xl font-medium text-slate-800 flex items-center gap-3 tracking-tight">
                    <Bell size={24} className="text-indigo-600" />
                    Bảng tin dự án
                 </h3>
                 <p className="text-sm text-slate-500 font-light leading-relaxed">
                   Gửi thông báo đến toàn bộ thành viên hoặc trao đổi riêng tư về các vấn đề cụ thể.
                 </p>
               </div>

               <TabTriggers 
                  tabs={tabs}
                  activeTab={activeTab}
                  onTabChange={(val) => setActiveTab(val)}
               />
            </div>

            {/* Right: Content Area - Clean Card Style */}
            <div className="flex-1 w-full bg-white rounded-[32px] p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 min-h-[450px] flex flex-col">
               
               {/* --- GENERAL TAB --- */}
               {activeTab === 'GENERAL' && (
                   <div className="flex-1 flex flex-col animate-in fade-in">
                        <div className="bg-indigo-50/50 p-4 rounded-2xl mb-6 flex items-start gap-3 border border-indigo-100/50">
                            <Info size={18} className="text-indigo-500 mt-0.5" />
                            <p className="text-xs text-indigo-800 font-light leading-relaxed">
                                Nội dung nhập dưới đây sẽ được hiển thị công khai ở đầu trang dự án của tất cả thành viên.
                            </p>
                        </div>

                        <div className="relative flex-1">
                            <TextArea 
                                label="Nội dung thông báo (Hiển thị công khai)"
                                icon={<Bell size={12} />}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Nhập thông báo chung cho cả nhóm..."
                                rows={8}
                                className="h-full bg-slate-50/50"
                            />
                        </div>
                        
                        <div className="flex justify-end pt-6">
                            <Button 
                                onClick={handleSend}
                                isLoading={isSending}
                                disabled={!content.trim()}
                                className="px-8 py-3.5 text-sm !rounded-2xl"
                                icon={<Send size={16} />}
                            >
                                Cập nhật / Gửi thông báo
                            </Button>
                        </div>
                   </div>
               )}

               {/* --- PERSONAL TAB --- */}
               {activeTab === 'PERSONAL' && (
                   <div className="flex-1 flex flex-col animate-in fade-in">
                       {!selectedMemberId ? (
                           // View 1: List Members
                           <div className="flex-1">
                               <h4 className="text-sm font-medium text-slate-700 mb-6">Chọn thành viên để nhắn tin:</h4>
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                                   {project.teamMembers.map(member => (
                                       <MemberItem 
                                            key={member.id}
                                            member={member}
                                            onClick={() => setSelectedMemberId(member.id)}
                                            action={<ChevronRight size={16} className="text-slate-300" />}
                                            className="hover:bg-sky-50 hover:border-sky-100 border border-transparent p-4"
                                       />
                                   ))}
                                   {project.teamMembers.length === 0 && (
                                       <p className="col-span-full text-center text-slate-400 text-xs italic py-12">Chưa có thành viên nào trong dự án.</p>
                                   )}
                               </div>
                           </div>
                       ) : (
                           // View 2: Member Chat
                           <div className="flex-1 flex flex-col h-full">
                               {/* Header */}
                               <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
                                   <button 
                                     onClick={() => setSelectedMemberId(null)}
                                     className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                   >
                                       <ArrowLeft size={20} />
                                   </button>
                                   <div className="flex-1">
                                       <div className="flex items-center gap-3">
                                            <span className="text-base font-medium text-slate-800">
                                                {project.teamMembers.find(m => m.id === selectedMemberId)?.name}
                                            </span>
                                            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-lg font-mono">
                                                ID: {selectedMemberId}
                                            </span>
                                       </div>
                                   </div>
                               </div>

                               {/* History List (Keep personal history) */}
                               <div className="flex-1 min-h-0 flex flex-col mb-6">
                                   <div className="bg-slate-50/50 rounded-[24px] p-5 flex-1 flex flex-col overflow-hidden border border-slate-100/50">
                                       <h5 className="text-[10px] uppercase text-slate-400 font-medium tracking-wider mb-2">Lịch sử gửi tin</h5>
                                       {renderHistory(n => n.type === 'PERSONAL' && n.targetMemberId === selectedMemberId)}
                                   </div>
                               </div>

                               {/* Input */}
                               <div className="relative mt-auto">
                                    <TextArea 
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder={`Nhắn tin riêng cho thành viên này...`}
                                        rows={2}
                                        className="pr-28 bg-slate-50/50"
                                    />
                                    <div className="absolute bottom-4 right-4">
                                        <Button 
                                            onClick={handleSend}
                                            isLoading={isSending}
                                            disabled={!content.trim()}
                                            className="px-5 py-2 text-xs !rounded-xl !bg-sky-600 hover:!bg-sky-700 !shadow-sky-200"
                                            icon={<Send size={14} />}
                                        >
                                            Gửi
                                        </Button>
                                    </div>
                                </div>
                           </div>
                       )}
                   </div>
               )}

            </div>
         </div>
      </div>
      <Toast 
        isVisible={!!toast} 
        message={toast?.message || ''} 
        type={toast?.type} 
        onClose={() => setToast(null)}
      />
    </section>
  );
};

export default ProjectNotificationsManager;
