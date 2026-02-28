
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fingerprint, Info, ShieldCheck, User } from 'lucide-react';
import AddMemberModal from './AddMemberModal';
import { UserRole } from '../../types';
import { membersApi, SystemUser } from '../../api/members';
import Toast, { ToastType } from '../shared/Toast';
import Loading from '../shared/Loading';
import SearchBox from '../shared/SearchBox';
import TabTriggers, { TabOption } from '../shared/TabTriggers';

const ProjectTeam: React.FC = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<SystemUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<UserRole>(UserRole.MEMBER); 
  
  // Toast State
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const data = await membersApi.fetchMembers();
      setMembers(data);
    } catch (error) {
      console.error("Failed to load members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const handleAddMember = async (newMember: any) => {
    const tempMember = { ...newMember, role: UserRole.MEMBER };
    setMembers(prev => [tempMember, ...prev]);
    setActiveTab(UserRole.MEMBER);

    try {
      await membersApi.addMember(tempMember);
      loadMembers();
    } catch (error) {
      setToast({ message: 'Lỗi khi thêm thành viên', type: 'error' });
      loadMembers(); 
    }
  };

  const managerCount = useMemo(() => members.filter(m => m.role === UserRole.MANAGER).length, [members]);
  const memberCount = useMemo(() => members.filter(m => m.role === UserRole.MEMBER).length, [members]);

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            member.id.includes(searchTerm);
      const matchesTab = member.role === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [members, searchTerm, activeTab]);

  const tabs: TabOption<UserRole>[] = [
    {
      value: UserRole.MANAGER,
      label: 'Quản lý',
      icon: <ShieldCheck size={18} />,
      count: managerCount,
      activeColorClass: 'text-indigo-600',
      activeBgClass: 'bg-indigo-50'
    },
    {
      value: UserRole.MEMBER,
      label: 'Nhân viên',
      icon: <User size={18} />,
      count: memberCount,
      activeColorClass: 'text-sky-600',
      activeBgClass: 'bg-sky-50'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <h3 className="text-2xl font-medium tracking-tight text-slate-900">Nhân Sự</h3>
        <div className="flex items-center gap-3">
           <AddMemberModal onAdd={handleAddMember} />
        </div>
      </div>

      {/* Tabs Selection */}
      <TabTriggers 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(val) => setActiveTab(val)}
      />

      {/* Search */}
      <SearchBox 
        placeholder={activeTab === UserRole.MANAGER ? "Tìm quản lý..." : "Tìm nhân viên..."}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        containerClassName="w-full bg-white rounded-3xl shadow-sm"
        className="!bg-white"
      />

      {/* List or Loading */}
      {isLoading ? (
        <div className="py-12">
           <Loading variant="component" text="Đang tải danh sách..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredMembers.map((member) => (
            <div 
              key={member.id} 
              onClick={() => navigate(`/member/${member.id}`)}
              className="group cursor-pointer flex items-center justify-between p-4 bg-white rounded-[28px] hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300 relative"
            >
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center text-white text-xl font-medium shadow-lg shadow-indigo-100 transition-all duration-500 ${member.role === UserRole.MANAGER ? 'bg-indigo-600' : 'bg-slate-300 group-hover:bg-indigo-500'}`}>
                  {getInitial(member.name)}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-sm font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">{member.name}</h4>
                    {member.role === UserRole.MANAGER && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Fingerprint size={12} />
                    <span className="text-[10px] font-medium tracking-widest uppercase bg-slate-50 px-2 py-0.5 rounded-lg">
                      {member.id}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredMembers.length === 0 && (
            <div className="text-center py-16 bg-white/50 rounded-[32px]">
              <p className="text-slate-400 text-sm font-light">
                {searchTerm 
                  ? "Không tìm thấy kết quả phù hợp." 
                  : activeTab === UserRole.MANAGER 
                    ? "Chưa có quản lý nào khác." 
                    : "Chưa có nhân viên nào."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Warning Info */}
      <div className="bg-indigo-50/50 p-6 rounded-[28px] flex items-start gap-4">
        <div className="mt-0.5 text-indigo-400 shrink-0">
          <Info size={20} />
        </div>
        <p className="text-xs text-indigo-900/60 leading-relaxed font-light">
          Nhấn vào một nhân viên để xem <strong>Hồ sơ chi tiết</strong>, lịch sử tham gia dự án và cài đặt tài khoản.
        </p>
      </div>

      <Toast 
        isVisible={!!toast} 
        message={toast?.message || ''} 
        type={toast?.type} 
        onClose={() => setToast(null)}
      />
    </div>
  );
};

export default ProjectTeam;
