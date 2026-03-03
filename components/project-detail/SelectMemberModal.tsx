
import React, { useState, useEffect } from 'react';
import { Plus, Check, Search, Building2, Users, ChevronDown } from 'lucide-react';
import { TeamMember, UserRole, Department } from '../../types';
import { membersApi } from '../../api/members';
import { departmentsApi } from '../../api/departments';
import ModalLayout from '../shared/ModalLayout';
import Loading from '../shared/Loading'; 
import SearchBox from '../shared/SearchBox';
import MemberItem from '../shared/MemberItem';

// Department constants
type DepartmentType = 'all' | string;

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
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentType>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [availableMembers, setAvailableMembers] = useState<TeamMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Chỉ fetch nếu đang mở và không có source dữ liệu truyền vào
    if (isOpen && !sourceMembers) {
      fetchData();
    }
  }, [isOpen, sourceMembers]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isDropdownOpen && !target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const handleOpen = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchTerm('');
    setSelectedDepartment('all');
    setIsDropdownOpen(false);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch both members and departments in parallel
      const [users, depts] = await Promise.all([
        membersApi.fetchMembers(),
        departmentsApi.fetchDepartments()
      ]);
      
      setDepartments(depts);
      
      // Helper function to get department name
      const getDepartmentName = (departmentId: string | undefined) => {
        if (!departmentId) return 'Chưa phân loại';
        const dept = depts.find(d => d.id === departmentId);
        return dept ? dept.name : 'Chưa phân loại';
      };

      // Chuyển đổi SystemUser sang TeamMember với department name từ departments API
      const formatted: TeamMember[] = users.map(u => ({
          id: u.id,
          name: u.name,
          role: u.role,
          avatar: u.avatar_url || '',
          department: getDepartmentName(u.department_id),
          position: u.position || ''
      }));
      
      // Chỉ lấy MEMBER khi fetch từ hệ thống (logic cũ)
      setAvailableMembers(formatted.filter(p => p.role === UserRole.MEMBER));
    } catch (error) {
      console.error("Failed to fetch data for selection", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Xác định danh sách hiển thị
  const listToRender = sourceMembers || availableMembers;

  // Filter logic: search + department
  const filteredBySearch = listToRender.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.id.includes(searchTerm)
  );

  const filteredByDepartment = selectedDepartment === 'all' 
    ? filteredBySearch
    : filteredBySearch.filter(p => {
        const memberDept = p.department || 'Chưa phân loại';
        return memberDept === selectedDepartment;
      });

  // Group by department for display
  const groupedMembers = filteredByDepartment.reduce((acc, member) => {
    const dept = member.department || 'Chưa phân loại';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(member);
    return acc;
  }, {} as Record<string, TeamMember[]>);

  const departmentKeys = Object.keys(groupedMembers).sort();

  // Department options for dropdown - Dynamic từ departments API
  const departmentOptions = [
    { value: 'all', label: 'Tất cả phòng ban' },
    ...departments.map(dept => ({
      value: dept.name,
      label: `${dept.name} (${dept.code})`
    })),
    { value: 'Chưa phân loại', label: 'Chưa phân loại' }
  ];

  const selectedLabel = departmentOptions.find(opt => opt.value === selectedDepartment)?.label || 'Tất cả phòng ban';

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
        className="max-w-4xl"
      >
        {/* Container với height cố định */}
        <div className="h-[500px] flex flex-col">
          {/* Search & Department Filter - Fixed */}
          <div className="mb-6 space-y-4 shrink-0">
          <SearchBox 
            placeholder="Tìm tên hoặc ID nhân viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          
          {/* Department Dropdown */}
          <div className="space-y-2">
            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Building2 size={12} />
              Phòng ban
            </label>
            <div className="relative dropdown-container">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-sm font-medium text-slate-700 transition-all border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <span>{selectedLabel}</span>
                <ChevronDown 
                  size={16} 
                  className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                />
              </button>
              
              {isDropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  
                  {/* Dropdown Menu */}
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-2 max-h-64 overflow-y-auto">
                    {departmentOptions.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSelectedDepartment(option.value);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${
                          selectedDepartment === option.value 
                            ? 'text-indigo-600 bg-indigo-50 font-medium' 
                            : 'text-slate-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

          {/* Members List - Scrollable */}
          <div className="flex-1 overflow-y-auto space-y-6 pb-6">
            {isLoading && !sourceMembers ? (
            <div className="py-6">
               <Loading variant="component" />
            </div>
          ) : (
            <>
              {departmentKeys.length > 0 ? (
                departmentKeys.map(department => {
                  const members = groupedMembers[department];
                  if (members.length === 0) return null;
                  
                  return (
                    <div key={department} className="space-y-3">
                      {/* Department Header - Only show if not filtering by specific dept */}
                      {selectedDepartment === 'all' && (
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <Users size={14} className="text-indigo-600" />
                          <span className="text-sm font-medium text-slate-700">{department}</span>
                          <span className="text-xs text-slate-400">({members.length} người)</span>
                        </div>
                      )}
                      
                      {/* Department Members */}
                      <div className="space-y-2">
                        {members.map((person) => {
                          const isSelected = selectedMemberIds.includes(person.id);
                          const ActionIcon = isSelected ? <Check size={18} strokeWidth={3} className="text-indigo-600" /> : null;
                          const itemClass = isSelected ? "bg-indigo-50 hover:bg-indigo-100 ring-1 ring-indigo-200" : "";

                          return (
                            <MemberItem 
                              key={person.id}
                              member={person}
                              subText={person.position || person.role}
                              onClick={() => onSelect(person)}
                              action={ActionIcon}
                              className={itemClass}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-slate-300">
                  <Search size={32} className="opacity-20 mb-3" />
                  <p className="text-sm font-light">Không tìm thấy nhân viên phù hợp</p>
                  <p className="text-xs font-light opacity-60">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer - Fixed at bottom */}
        {selectedMemberIds.length > 0 && (
          <div className="pt-4 border-t border-slate-100 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">
                Đã chọn: <span className="font-medium text-indigo-600">{selectedMemberIds.length}</span> nhân viên
              </span>
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all active:scale-95"
              >
                Xác nhận
              </button>
            </div>
          </div>
        )}
      </div>
      </ModalLayout>
    </>
  );
};

export default SelectMemberModal;
