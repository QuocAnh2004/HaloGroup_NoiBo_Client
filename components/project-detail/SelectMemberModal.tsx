
import React, { useState, useEffect } from 'react';
import { Plus, Check, Search } from 'lucide-react';
import { TeamMember, UserRole } from '../../types';
import { membersApi } from '../../api/members';
import ModalLayout from '../shared/ModalLayout';
import Loading from '../shared/Loading';
import SearchBox from '../shared/SearchBox';
import MemberItem from '../shared/MemberItem';

interface SelectMemberModalProps {
  onSelect: (member: TeamMember) => void;
  selectedMemberIds: string[];
  // Props mở rộng để tái sử dụng
  sourceMembers?: TeamMember[]; // Nếu có, dùng list này thay vì fetch API
  trigger?: React.ReactNode;
  title?: string;
  subTitle?: string;
}

const SelectMemberModal: React.FC<SelectMemberModalProps> = ({ 
  onSelect, 
  selectedMemberIds, 
  sourceMembers,
  trigger,
  title = "Thêm Nhân Sự",
  subTitle = "Chỉ nhân viên mới có thể được chỉ định vào dự án"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableMembers, setAvailableMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Chỉ fetch nếu đang mở và không có source dữ liệu truyền vào
    if (isOpen && !sourceMembers) {
      fetchMembers();
    }
  }, [isOpen, sourceMembers]);

  const handleOpen = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchTerm('');
  };

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const users = await membersApi.fetchMembers();
      // Chuyển đổi SystemUser sang TeamMember
      const formatted: TeamMember[] = users.map(u => ({
          id: u.id,
          name: u.name,
          role: u.role,
          avatar: u.avatar_url || ''
      }));
      // Chỉ lấy MEMBER khi fetch từ hệ thống (logic cũ)
      setAvailableMembers(formatted.filter(p => p.role === UserRole.MEMBER));
    } catch (error) {
      console.error("Failed to fetch members for selection", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Xác định danh sách hiển thị
  const listToRender = sourceMembers || availableMembers;

  const filteredList = listToRender.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.id.includes(searchTerm)
  );

  return (
    <>
      <div onClick={handleOpen} className="inline-block cursor-pointer">
        {trigger ? trigger : (
          <button 
            type="button"
            className="flex items-center gap-1.5 md:gap-2 bg-slate-900 text-white px-4 py-2.5 md:px-6 md:py-3 rounded-xl md:rounded-2xl shadow-sm hover:shadow-lg hover:bg-slate-800 transition-all duration-300 active:scale-95 text-[11px] md:text-xs font-medium shrink-0"
          >
            <Plus size={14} className="md:w-4 md:h-4" />
            <span>Chỉ Định</span>
          </button>
        )}
      </div>

      <ModalLayout
        isOpen={isOpen}
        onClose={handleClose}
        title={title}
        subTitle={subTitle}
        className="max-w-md"
      >
        <div className="mb-6">
          <SearchBox 
            placeholder="Tìm tên hoặc ID nhân viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>

        <div className="space-y-3 pb-6">
          {isLoading && !sourceMembers ? (
            <div className="py-6">
               <Loading variant="component" />
            </div>
          ) : (
            <>
              {filteredList.map((person) => {
                const isSelected = selectedMemberIds.includes(person.id);
                
                // Toggle visual logic: Hiển thị check và highlight nếu đã chọn
                const ActionIcon = isSelected ? <Check size={18} strokeWidth={3} className="text-indigo-600" /> : null;
                const itemClass = isSelected ? "bg-indigo-50 hover:bg-indigo-100 ring-1 ring-indigo-200" : "";

                return (
                  <MemberItem 
                    key={person.id}
                    member={person}
                    onClick={() => onSelect(person)}
                    action={ActionIcon}
                    className={itemClass}
                  />
                );
              })}

              {filteredList.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center text-slate-300">
                  <Search size={32} className="opacity-20 mb-3" />
                  <p className="text-sm font-light">Không tìm thấy nhân viên phù hợp</p>
                </div>
              )}
            </>
          )}
        </div>
      </ModalLayout>
    </>
  );
};

export default SelectMemberModal;
