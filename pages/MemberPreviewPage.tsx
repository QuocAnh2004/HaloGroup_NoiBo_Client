
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { membersApi, SystemUser } from '../api/members';
import { projectsApi } from '../api/projects';
import { Project, AuthenticatedUser, UserRole } from '../types';
import Loading from '../components/shared/Loading';
import MemberStats from '../components/member/MemberStats';
import MemberProjects from '../components/member/MemberProjects';
import PreviewHeader from '../components/preview/PreviewHeader';
import Input from '../components/shared/Input';
import Button from '../components/shared/Button';
import Toast, { ToastType } from '../components/shared/Toast';
import { Mail, Phone, Briefcase, Award, Layers, Github, Code2, PencilLine, Check, User, Fingerprint, Info } from 'lucide-react';

interface MemberPreviewPageProps {
  currentUser: AuthenticatedUser;
  onLogout: () => void;
}

// --- Component hiển thị/chỉnh sửa thông tin ---
const MemberProfileCard: React.FC<{ 
  member: SystemUser; 
  isOwner: boolean; 
  onUpdate: (data: SystemUser) => void; 
}> = ({ member, isOwner, onUpdate }) => {
  // Kiểm tra xem hồ sơ có trống thông tin không (Chưa có email và sđt)
  const isEmptyProfile = !member.email && !member.phone && !member.github_url && !member.skills;

  // UX Change: Nếu là chính chủ và hồ sơ trống -> Mặc định bật Edit Mode luôn, đỡ phải bấm nút.
  const [isEditing, setIsEditing] = useState(isOwner && isEmptyProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    github_url: '',
    skills: ''
  });

  useEffect(() => {
    if (member) {
      setFormData({
        email: member.email || '',
        phone: member.phone || '',
        github_url: member.github_url || '',
        skills: member.skills || ''
      });
      
      // Re-check khi data load xong (trường hợp mount lần đầu chưa có data)
      const empty = !member.email && !member.phone && !member.github_url && !member.skills;
      if (isOwner && empty) {
        setIsEditing(true);
      }
    }
  }, [member, isOwner]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Gọi API update
      const updated = await membersApi.updateMember(member.id, formData);
      onUpdate(updated); // Cập nhật state cha
      setToast({ message: 'Cập nhật hồ sơ thành công!', type: 'success' });
      setIsEditing(false);
    } catch (error) {
      setToast({ message: 'Có lỗi xảy ra khi lưu.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form về data cũ
    setFormData({
      email: member.email || '',
      phone: member.phone || '',
      github_url: member.github_url || '',
      skills: member.skills || ''
    });
    setIsEditing(false);
  };

  // Helper render dòng thông tin (Read mode)
  const InfoRow = ({ icon, label, value, isLink = false }: { icon: React.ReactNode, label: string, value?: string, isLink?: boolean }) => {
    return (
      <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-50">
        <div className="mt-0.5 text-slate-400 shrink-0">{icon}</div>
        <div className="flex flex-col min-w-0 w-full">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mb-0.5">{label}</span>
          {value ? (
            isLink ? (
              <a href={value} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline truncate text-sm font-light block">
                {value}
              </a>
            ) : (
              <span className="text-slate-800 text-sm font-light truncate block">{value}</span>
            )
          ) : (
            <span className="text-slate-300 text-xs italic">Chưa cập nhật</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-8 rounded-[40px] shadow-sm space-y-6 relative group h-full flex flex-col">
      
      {/* Header Card */}
      <div className="flex items-center justify-between shrink-0">
        <h4 className="text-lg font-medium text-slate-800 flex items-center gap-2">
          <User size={20} className="text-indigo-500" />
          Thông tin chi tiết
        </h4>
        
        {isOwner && !isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-95"
          >
            <PencilLine size={14} />
            <span>Chỉnh sửa</span>
          </button>
        )}
      </div>

      {/* --- EDIT MODE --- */}
      {isEditing ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 flex-1 overflow-y-auto custom-scrollbar pr-2">
           {isEmptyProfile && (
             <div className="bg-indigo-50 p-4 rounded-2xl flex items-start gap-3 border border-indigo-100">
                <Info size={18} className="text-indigo-500 mt-0.5" />
                <p className="text-xs text-indigo-800 font-light leading-relaxed">
                   Chào mừng thành viên mới! Vui lòng cập nhật thông tin liên hệ để đồng nghiệp dễ dàng kết nối với bạn.
                </p>
             </div>
           )}

           <div className="grid grid-cols-1 gap-5">
              {/* Context ID - Readonly */}
              <div className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between px-4">
                 <div className="flex items-center gap-2 text-slate-400">
                    <Fingerprint size={16} />
                    <span className="text-xs font-medium">ID Nhân viên</span>
                 </div>
                 <span className="font-mono text-sm font-bold text-slate-700">{member.id}</span>
              </div>

              <Input 
                label="Email liên hệ"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                icon={<Mail size={12} />}
                placeholder="example@hola.com"
                autoFocus={isEmptyProfile} // Focus ngay nếu là profile mới
              />
              <Input 
                label="Số điện thoại"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                icon={<Phone size={12} />}
                placeholder="09xx..."
              />
              <Input 
                label="Github Profile"
                value={formData.github_url}
                onChange={(e) => setFormData({...formData, github_url: e.target.value})}
                icon={<Github size={12} />}
                placeholder="https://github.com/username"
              />
              <div className="space-y-3">
                <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                  <Code2 size={12} /> Kỹ năng (Ngăn cách bằng dấu phẩy)
                </label>
                <textarea
                  className="w-full bg-slate-50 text-slate-800 rounded-2xl px-6 py-4 focus:outline-none focus:bg-indigo-50/50 transition-all font-light placeholder:text-slate-300 resize-none"
                  rows={3}
                  value={formData.skills}
                  onChange={(e) => setFormData({...formData, skills: e.target.value})}
                  placeholder="React, Node.js, Design..."
                />
              </div>
           </div>

           {/* Read-only fields context */}
           <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3 mt-4">
              <Layers size={16} className="text-slate-400 mt-0.5" />
              <div className="text-xs text-slate-500 font-light">
                 Vị trí <span className="font-medium text-slate-700">{member.position || 'N/A'}</span> và 
                 Phòng ban <span className="font-medium text-slate-700">{member.department || 'N/A'}</span> được quản lý bởi Admin.
              </div>
           </div>

           {/* Actions */}
           <div className="flex gap-3 pt-2 pb-2">
              <Button 
                variant="secondary" 
                onClick={handleCancel}
                className="flex-1 py-3 rounded-xl text-xs"
                disabled={isLoading}
              >
                {isEmptyProfile ? 'Để sau' : 'Hủy bỏ'}
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSave}
                isLoading={isLoading}
                className="flex-1 py-3 rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                icon={<Check size={16} />}
              >
                {isEmptyProfile ? 'Lưu thông tin' : 'Lưu thay đổi'}
              </Button>
           </div>
        </div>
      ) : (
        /* --- VIEW MODE --- */
        <div className="flex-1 flex flex-col">
            <div className="space-y-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <InfoRow icon={<Mail size={18} />} label="Email" value={member.email} />
                <InfoRow icon={<Phone size={18} />} label="Số điện thoại" value={member.phone} />
                <InfoRow icon={<Briefcase size={18} />} label="Vị trí" value={member.position} />
                <InfoRow icon={<Award size={18} />} label="Cấp độ" value={member.level} />
                <InfoRow icon={<Layers size={18} />} label="Phòng ban" value={member.department} />
                <InfoRow icon={<Github size={18} />} label="Github" value={member.github_url} isLink />
              </div>

              {member.skills && (
                <div className="pt-6 border-t border-slate-50 mt-4">
                  <div className="flex items-center gap-2 mb-4 text-slate-400 px-4">
                      <Code2 size={18} />
                      <span className="text-[10px] uppercase tracking-wider font-medium">Kỹ năng chuyên môn</span>
                  </div>
                  <div className="flex flex-wrap gap-2 px-4">
                      {member.skills.split(',').map((skill, idx) => (
                        <span key={idx} className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-light border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-default">
                          {skill.trim()}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
        </div>
      )}

      <Toast 
        isVisible={!!toast} 
        message={toast?.message || ''} 
        type={toast?.type} 
        onClose={() => setToast(null)}
      />
    </div>
  );
};

// --- Main Page Component ---
const MemberPreviewPage: React.FC<MemberPreviewPageProps> = ({ currentUser, onLogout }) => {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();

  const [member, setMember] = useState<SystemUser | null>(null);
  const [participatedProjects, setParticipatedProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Kiểm tra xem người xem có phải là chủ sở hữu của profile này không
  // Logic: 
  // 1. URL không có memberId -> Mặc định là xem chính mình -> isOwner = true
  // 2. URL có memberId -> So sánh với currentUser.id
  const targetId = memberId || currentUser.id;
  const isOwner = currentUser.id === targetId;

  useEffect(() => {
    const fetchData = async () => {
      if (!targetId) return;
      setIsLoading(true);
      try {
        // 1. Fetch Member Info
        const memberData = await membersApi.fetchMemberById(targetId);
        setMember(memberData);

        // 2. Fetch Projects and Filter
        const allProjects = await projectsApi.fetchProjects();
        const memberProjects = allProjects.filter(p => 
          p.teamMembers.some(m => m.id === targetId)
        );
        setParticipatedProjects(memberProjects);

      } catch (error) {
        console.error("Failed to load member data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [targetId]);

  const handleExit = () => {
    if (currentUser.role === UserRole.MANAGER) {
      navigate(-1);
    } else {
      // Member: Đăng xuất
      onLogout();
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}/preview`);
  };

  const handleMemberUpdate = (updated: SystemUser) => {
    setMember(updated);
  };

  if (isLoading) {
    return <Loading variant="fullscreen" text="Đang tải hồ sơ nhân sự..." />;
  }

  if (!member) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <p className="text-slate-400 font-light">Không tìm thấy thông tin nhân viên.</p>
        <button onClick={handleExit} className="text-indigo-600 hover:underline text-sm">Quay lại</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-light animate-in fade-in">
      <PreviewHeader 
        onBack={handleExit}
        title={isOwner ? "Hồ sơ của bạn" : "Hồ sơ nhân sự"}
        subtitle={member.name}
        showShare={false} 
      />

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-stretch">
          
          {/* Left Column (50%): Stats & Projects List */}
          <div className="w-full lg:w-1/2 space-y-12">
            <MemberStats member={member} projects={participatedProjects} />
            <div className="w-full h-[1px] bg-slate-200/60 lg:hidden"></div>
            <MemberProjects 
              projects={participatedProjects} 
              onProjectClick={handleProjectClick} 
            />
          </div>

          {/* Right Column (50%): Editable Profile Info */}
          <div className="w-full lg:w-1/2 lg:pl-10 lg:border-l lg:border-slate-200/60 flex flex-col">
             <MemberProfileCard 
                member={member} 
                isOwner={isOwner} 
                onUpdate={handleMemberUpdate}
             />
          </div>

        </div>
      </div>
    </div>
  );
};

export default MemberPreviewPage;
