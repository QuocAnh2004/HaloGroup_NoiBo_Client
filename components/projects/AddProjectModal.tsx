
import React, { useState } from 'react';
import { Project, ProjectStatus, ProjectPriority } from '../../types';
import { Plus, Flag, Calendar, Type, FileText } from 'lucide-react';
import { useProjects } from './ProjectContext';
import DatePicker from '../shared/DatePicker';
import { generateRandomId } from '../../utils';
import Toast, { ToastType } from '../shared/Toast';
import Button from '../shared/Button';
import ModalLayout from '../shared/ModalLayout';
import Input from '../shared/Input';
import TextArea from '../shared/TextArea';
import SelectGroup, { SelectOption } from '../shared/SelectGroup';

const AddProjectModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { addProject } = useProjects();
  
  // Helper lấy ngày hiện tại format YYYY-MM-DD theo giờ địa phương
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getFutureDateString = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ProjectPriority>(ProjectPriority.MEDIUM);
  
  const [startDate, setStartDate] = useState(getTodayString());
  const [dueDate, setDueDate] = useState(getFutureDateString(30));
  
  // States
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);

  const handleOpen = () => {
      setIsOpen(true);
      // Reset dates to fresh values when opening
      setStartDate(getTodayString());
      setDueDate(getFutureDateString(30));
  };

  const handleClose = () => {
    if (isLoading) return; 
    setIsOpen(false);
    resetForm();
  };

  // Xử lý thay đổi ngày bắt đầu
  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    // Nếu ngày bắt đầu mới > ngày kết thúc hiện tại -> Đẩy ngày kết thúc lên bằng ngày bắt đầu
    if (new Date(date) > new Date(dueDate)) {
      setDueDate(date);
    }
  };

  // Xử lý thay đổi ngày kết thúc
  const handleDueDateChange = (date: string) => {
    setDueDate(date);
    // Nếu ngày kết thúc mới < ngày bắt đầu hiện tại -> Kéo ngày bắt đầu về bằng ngày kết thúc
    if (new Date(date) < new Date(startDate)) {
      setStartDate(date);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    
    const newProject: Project = {
      id: generateRandomId('prj_'), 
      name,
      description,
      status: ProjectStatus.IN_PROGRESS,
      priority,
      techStack: [],
      teamMembers: [],
      startDate: startDate,
      dueDate: dueDate,
      progress: 0,
    };

    try {
      await addProject(newProject);
      setToast({ message: 'Tạo dự án mới thành công!', type: 'success' });
      handleClose();
    } catch (error) {
      setToast({ message: 'Lỗi khi tạo dự án', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPriority(ProjectPriority.MEDIUM);
    // Dates will be reset on handleOpen
  };

  // Cấu hình option cho SelectGroup
  const priorityOptions: SelectOption<ProjectPriority>[] = [
    { 
      value: ProjectPriority.HIGH, 
      label: ProjectPriority.HIGH, 
      activeClass: "bg-rose-500 text-white shadow-lg shadow-rose-200",
      inactiveClass: "bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
    },
    { 
      value: ProjectPriority.MEDIUM, 
      label: ProjectPriority.MEDIUM,
      activeClass: "bg-sky-500 text-white shadow-lg shadow-sky-200",
      inactiveClass: "bg-slate-50 text-slate-400 hover:bg-sky-50 hover:text-sky-500"
    },
    { 
      value: ProjectPriority.LOW, 
      label: ProjectPriority.LOW,
      activeClass: "bg-slate-900 text-white shadow-lg shadow-slate-200",
      inactiveClass: "bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
    }
  ];

  return (
    <>
      <Button 
        onClick={handleOpen}
        variant="primary"
        className="px-6 py-3 text-sm"
        icon={<Plus size={18} />}
      >
        Thêm Dự Án
      </Button>

      <ModalLayout
        isOpen={isOpen}
        onClose={handleClose}
        title="Dự án Mới"
        className="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-8 pb-4">
          
          <Input 
            label="Tên dự án"
            icon={<Type size={12} />}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên dự án..."
            required
            disabled={isLoading}
          />

          <SelectGroup 
            label="Mức độ ưu tiên"
            icon={<Flag size={12} />}
            options={priorityOptions}
            value={priority}
            onChange={(val) => setPriority(val)}
            disabled={isLoading}
          />

          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                  <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                      <Calendar size={12} />
                      Ngày bắt đầu
                  </label>
                  <div className={isLoading ? "opacity-60 pointer-events-none" : ""}>
                    <DatePicker 
                      value={startDate} 
                      onChange={handleStartDateChange} 
                      maxDate={dueDate} // Không được chọn ngày bắt đầu lớn hơn ngày kết thúc
                      label="Ngày bắt đầu"
                    />
                  </div>
              </div>
              <div className="space-y-3">
                  <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                      <Calendar size={12} />
                      Ngày kết thúc
                  </label>
                  <div className={isLoading ? "opacity-60 pointer-events-none" : ""}>
                    <DatePicker 
                      value={dueDate} 
                      onChange={handleDueDateChange} 
                      minDate={startDate} // Không được chọn ngày kết thúc nhỏ hơn ngày bắt đầu
                      label="Ngày kết thúc"
                    />
                  </div>
              </div>
          </div>

          <TextArea 
            label="Mô tả ngắn"
            icon={<FileText size={12} />}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Mô tả mục tiêu và phạm vi của dự án..."
            disabled={isLoading}
          />

          <div className="pt-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="px-6 py-3 text-sm"
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="px-8 py-3 text-sm"
              icon={<Plus size={18} />}
            >
              Tạo dự án
            </Button>
          </div>
        </form>
      </ModalLayout>

      <Toast 
        isVisible={!!toast} 
        message={toast?.message || ''} 
        type={toast?.type} 
        onClose={() => setToast(null)}
      />
    </>
  );
};

export default AddProjectModal;
