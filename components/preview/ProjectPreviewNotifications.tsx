
import React, { useEffect, useState } from 'react';
import { Bell, User, Megaphone, Inbox, MessageSquare } from 'lucide-react';
import { ProjectNotification, UserRole } from '../../types';
import { projectsApi } from '../../api/projects';
import { formatSimpleDateTime } from '../../utils';

interface ProjectPreviewNotificationsProps {
  projectId: string;
  currentUserId: string;
  userRole?: UserRole; // Thêm prop role để xử lý hiển thị
}

const ProjectPreviewNotifications: React.FC<ProjectPreviewNotificationsProps> = ({ projectId, currentUserId, userRole }) => {
  const [generalNotifs, setGeneralNotifs] = useState<ProjectNotification[]>([]);
  const [personalNotifs, setPersonalNotifs] = useState<ProjectNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Xác định xem user có phải là Manager không
  const isManager = userRole === UserRole.MANAGER;

  useEffect(() => {
    const load = async () => {
      try {
        const data = await projectsApi.fetchNotifications(projectId);
        
        // Phân loại và sắp xếp
        const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setGeneralNotifs(sorted.filter(n => n.type === 'GENERAL'));
        setPersonalNotifs(sorted.filter(n => n.type === 'PERSONAL' && n.targetMemberId === currentUserId));
      } catch (e) {
        console.error("Failed to load notifications", e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
    
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [projectId, currentUserId]);

  if (isLoading || (generalNotifs.length === 0 && personalNotifs.length === 0)) return null;

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 pb-4 pt-8">
      {/* Grid Layout Adjustment:
          - Manager: 1 cột (chỉ hiện General)
          - Member: 2 cột (General + Personal)
      */}
      <div className={`grid grid-cols-1 ${!isManager ? 'lg:grid-cols-2 gap-6 md:gap-8' : 'gap-6'}`}>
        
        {/* --- CỘT TRÁI: THÔNG BÁO CHUNG (BOARD) --- */}
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4 px-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Megaphone size={18} />
                </div>
                <h3 className="text-lg font-medium text-slate-800">Bảng tin chung</h3>
                {generalNotifs.length > 0 && (
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-medium">
                        {generalNotifs.length}
                    </span>
                )}
            </div>

            <div className="bg-white rounded-[32px] border border-slate-100 shadow-lg shadow-slate-100/50 p-6 md:p-8 flex-1">
                {generalNotifs.length > 0 ? (
                    <div className="space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                        {generalNotifs.map((notif) => (
                            <div key={notif.id} className="group relative pl-4 border-l-2 border-slate-100 hover:border-indigo-500 transition-colors">
                                <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-slate-200 group-hover:bg-indigo-500 transition-colors"></div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            {formatSimpleDateTime(notif.createdAt)}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                                            <User size={10} />
                                            <span>{notif.senderName}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm md:text-base text-slate-700 font-light leading-relaxed whitespace-pre-wrap">
                                        {notif.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 py-12">
                        <Bell size={48} className="opacity-20 mb-3" />
                        <p className="text-sm font-light">Chưa có thông báo chung nào.</p>
                    </div>
                )}
            </div>
        </div>

        {/* --- CỘT PHẢI: THÔNG BÁO RIÊNG (PERSONAL INBOX) --- */}
        {/* Chỉ hiển thị cho MEMBER */}
        {!isManager && (
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Inbox size={18} />
                    </div>
                    <h3 className="text-lg font-medium text-slate-800">Tin nhắn riêng</h3>
                    {personalNotifs.length > 0 && (
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-medium">
                            {personalNotifs.length}
                        </span>
                    )}
                </div>

                {/* Khối GỘP duy nhất cho thông báo riêng */}
                <div className="relative bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[32px] p-6 md:p-8 text-white shadow-xl shadow-indigo-200 flex-1 overflow-hidden">
                    {/* Decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400 opacity-20 rounded-full blur-[40px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                    <div className="relative z-10 h-full flex flex-col">
                        {personalNotifs.length > 0 ? (
                            <div className="relative pl-2 space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-2 -mr-2">
                                {/* Vertical Line */}
                                <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-indigo-400/30"></div>

                                {personalNotifs.map((notif) => (
                                    <div key={notif.id} className="relative pl-6">
                                        {/* Dot */}
                                        <div className="absolute left-[3px] top-1.5 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]"></div>
                                        
                                        <div className="space-y-1.5">
                                            {/* Time */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-medium text-indigo-200 font-mono bg-indigo-800/30 px-1.5 py-0.5 rounded">
                                                    {formatSimpleDateTime(notif.createdAt)}
                                                </span>
                                            </div>

                                            {/* Content */}
                                            <p className="text-sm md:text-base font-light leading-relaxed whitespace-pre-wrap text-white/90">
                                                {notif.content}
                                            </p>
                                            
                                            {/* Sender */}
                                            <div className="text-[10px] text-indigo-300/60 pt-1">
                                                Gửi bởi: {notif.senderName}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-indigo-200/60 py-12">
                                <MessageSquare size={48} className="opacity-30 mb-3" />
                                <p className="text-sm font-light">Hộp thư trống.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default ProjectPreviewNotifications;
