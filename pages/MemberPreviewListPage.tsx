
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { membersApi, SystemUser } from '../api/members';
import { UserRole, AuthenticatedUser } from '../types';
import PreviewHeader from '../components/preview/PreviewHeader';
import Loading from '../components/shared/Loading';
import SearchBox from '../components/shared/SearchBox';
import { Users, Fingerprint } from 'lucide-react';
import TabTriggers, { TabOption } from '../components/shared/TabTriggers';

interface MemberPreviewListPageProps {
  currentUser: AuthenticatedUser;
  onLogout: () => void;
}

const MemberPreviewListPage: React.FC<MemberPreviewListPageProps> = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<SystemUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | UserRole>('ALL');

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true);
      try {
        const data = await membersApi.fetchMembers();
        setMembers(data);
      } catch (error) {
        console.error("Failed to load members", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            member.id.includes(searchTerm);
      const matchesTab = activeTab === 'ALL' || member.role === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [members, searchTerm, activeTab]);

  const tabs: TabOption<'ALL' | UserRole>[] = [
    { value: 'ALL', label: 'Tất cả', activeBgClass: 'bg-slate-900', activeColorClass: 'text-slate-900' },
    { value: UserRole.MANAGER, label: 'Quản lý', activeBgClass: 'bg-indigo-50', activeColorClass: 'text-indigo-600' },
    { value: UserRole.MEMBER, label: 'Nhân viên', activeBgClass: 'bg-sky-50', activeColorClass: 'text-sky-600' }
  ];

  const handleBack = () => {
    if (currentUser.role === UserRole.MANAGER) {
      navigate('/');
    } else {
      // Member: Bấm Back = Đăng xuất tại chỗ để giữ URL
      onLogout();
    }
  };

  const handleMemberClick = (memberId: string) => {
    if (currentUser.role === UserRole.MANAGER) {
      // Manager vào trang chi tiết có thể chỉnh sửa
      navigate(`/member/${memberId}`);
    } else {
      // Member vào trang xem thông tin (read-only)
      navigate(`/member-info/${memberId}`);
    }
  };

  if (isLoading) {
    return <Loading variant="fullscreen" text="Đang tải danh sách nhân sự..." />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-20 font-light animate-in fade-in">
      {/* Use PreviewHeader */}
      <PreviewHeader 
        onBack={handleBack}
        title="Danh sách nhân sự"
        subtitle={`${members.length} thành viên trong hệ thống`}
        role={currentUser.role} 
        showShare={false} 
      />

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-10 space-y-8">
        
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
           {/* Tabs */}
           <TabTriggers 
             tabs={tabs}
             activeTab={activeTab}
             onTabChange={(val) => setActiveTab(val)}
           />

           {/* Search */}
           <SearchBox 
              placeholder="Tìm theo tên hoặc ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              containerClassName="w-full md:w-80"
           />
        </div>

        {/* Grid List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
           {filteredMembers.map((member) => (
             <div 
                key={member.id} 
                onClick={() => handleMemberClick(member.id)}
                className="bg-white p-5 rounded-[24px] shadow-sm hover:shadow-xl hover:shadow-indigo-100/30 transition-all cursor-pointer border border-transparent hover:border-slate-100 group"
             >
                <div className="flex items-center gap-4">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-medium shadow-md ${
                      member.role === UserRole.MANAGER ? 'bg-indigo-600 shadow-indigo-200' : 'bg-slate-400 shadow-slate-200 group-hover:bg-indigo-500 group-hover:shadow-indigo-200 transition-all'
                   }`}>
                      {member.name.charAt(0).toUpperCase()}
                   </div>
                   
                   <div className="flex flex-col min-w-0">
                      <h3 className="text-sm font-medium text-slate-800 truncate">{member.name}</h3>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                         <Fingerprint size={12} />
                         <span className="font-mono tracking-wide">{member.id}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                         <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-wider ${
                            member.role === UserRole.MANAGER ? 'bg-indigo-50 text-indigo-600' : 'bg-sky-50 text-sky-600'
                         }`}>
                            {member.role === UserRole.MANAGER ? 'Quản lý' : 'Nhân viên'}
                         </span>
                         {member.position && (
                            <span className="text-[9px] text-slate-400 truncate max-w-[100px] border-l border-slate-200 pl-1.5">
                               {member.position}
                            </span>
                         )}
                      </div>
                   </div>
                </div>
             </div>
           ))}
        </div>
        
        {filteredMembers.length === 0 && (
           <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Users size={48} className="opacity-20 mb-4" />
              <p className="text-sm font-light">Không tìm thấy nhân sự nào.</p>
           </div>
        )}

      </div>
    </div>
  );
};

export default MemberPreviewListPage;
