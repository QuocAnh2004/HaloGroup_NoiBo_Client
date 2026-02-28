
import React, { useState, useEffect } from 'react';
import { Info, Calendar, Github, Globe, Code2, Flag, Layout, Server, Database, Cloud, AlertTriangle } from 'lucide-react';
import { ProjectPriority, ProjectStatus } from '../../types';
import { useProjectDetail } from './ProjectDetailContext';
import DatePicker from '../shared/DatePicker';
import Input from '../shared/Input';
import TextArea from '../shared/TextArea';
import SelectGroup, { SelectOption } from '../shared/SelectGroup';
import { isOverdue } from '../../utils';
import { useNavigate } from 'react-router-dom';
import SaveWarning from '../shared/SaveWarning';
import DangerZone from '../shared/DangerZone';

const ProjectDetailInfo: React.FC = () => {
  const { project, updateProject, deleteProject, isReadOnly } = useProjectDetail();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description,
    startDate: project.startDate,
    dueDate: project.dueDate,
    githubUrl: project.githubUrl || '',
    liveUrl: project.liveUrl || '',
    priority: project.priority,
    // New categorized tech stack
    frontend: '',
    backend: '',
    database: '',
    devops: ''
  });
  
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  // Sync with project data on prop change
  useEffect(() => {
    // Parse the flat techStack array into categories using prefixes
    // Format: "fe:React", "be:Node", "db:Mongo", "do:Docker"
    // Nếu dữ liệu cũ không có prefix, mặc định đưa vào Frontend hoặc một nhóm General (ở đây ta đưa vào Frontend để dễ sửa)
    const techByCategory: { fe: string[], be: string[], db: string[], do: string[] } = { fe: [], be: [], db: [], do: [] };
    
    project.techStack.forEach(tech => {
        if (tech.startsWith('fe:')) techByCategory.fe.push(tech.substring(3));
        else if (tech.startsWith('be:')) techByCategory.be.push(tech.substring(3));
        else if (tech.startsWith('db:')) techByCategory.db.push(tech.substring(3));
        else if (tech.startsWith('do:')) techByCategory.do.push(tech.substring(3));
        else {
            // Legacy data support: Put in Frontend by default so user can reorganize
            techByCategory.fe.push(tech);
        }
    });

    setFormData({
      name: project.name,
      description: project.description,
      startDate: project.startDate,
      dueDate: project.dueDate,
      githubUrl: project.githubUrl || '',
      liveUrl: project.liveUrl || '',
      priority: project.priority,
      frontend: techByCategory.fe.join(', '),
      backend: techByCategory.be.join(', '),
      database: techByCategory.db.join(', '),
      devops: techByCategory.do.join(', ')
    });
    setHasChanges(false);
  }, [project]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
    setIsSavedSuccess(false);
  };

  const handleDateChange = (name: 'startDate' | 'dueDate', value: string) => {
    setFormData(prev => {
        const newData = { ...prev, [name]: value };
        
        // Logic ràng buộc ngày tháng
        if (name === 'startDate') {
            if (new Date(value) > new Date(prev.dueDate)) {
                newData.dueDate = value;
            }
        } else if (name === 'dueDate') {
            if (new Date(value) < new Date(prev.startDate)) {
                newData.startDate = value;
            }
        }
        
        return newData;
    });
    setHasChanges(true);
    setIsSavedSuccess(false);
  };

  const handlePrioritySelect = (p: ProjectPriority) => {
    setFormData(prev => ({ ...prev, priority: p }));
    setHasChanges(true);
    setIsSavedSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Helper to process string input to array with prefix
    const processTech = (input: string, prefix: string) => {
        return input.split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0)
            .map(s => `${prefix}:${s}`);
    };

    const newTechStack = [
        ...processTech(formData.frontend, 'fe'),
        ...processTech(formData.backend, 'be'),
        ...processTech(formData.database, 'db'),
        ...processTech(formData.devops, 'do')
    ];

    await updateProject({
      name: formData.name,
      description: formData.description,
      startDate: formData.startDate,
      dueDate: formData.dueDate,
      techStack: newTechStack,
      githubUrl: formData.githubUrl,
      liveUrl: formData.liveUrl,
      priority: formData.priority
    });
    
    setIsSaving(false);
    setIsSavedSuccess(true);

    setTimeout(() => {
        setIsSavedSuccess(false);
        setHasChanges(false);
    }, 2000);
  };

  const handleCancel = () => {
    // Reset form Logic (duplicate of useEffect logic roughly)
    const techByCategory: { fe: string[], be: string[], db: string[], do: string[] } = { fe: [], be: [], db: [], do: [] };
    project.techStack.forEach(tech => {
        if (tech.startsWith('fe:')) techByCategory.fe.push(tech.substring(3));
        else if (tech.startsWith('be:')) techByCategory.be.push(tech.substring(3));
        else if (tech.startsWith('db:')) techByCategory.db.push(tech.substring(3));
        else if (tech.startsWith('do:')) techByCategory.do.push(tech.substring(3));
        else techByCategory.fe.push(tech);
    });

    setFormData({
      name: project.name,
      description: project.description,
      startDate: project.startDate,
      dueDate: project.dueDate,
      githubUrl: project.githubUrl || '',
      liveUrl: project.liveUrl || '',
      priority: project.priority,
      frontend: techByCategory.fe.join(', '),
      backend: techByCategory.be.join(', '),
      database: techByCategory.db.join(', '),
      devops: techByCategory.do.join(', ')
    });
    setHasChanges(false);
    setIsSavedSuccess(false);
  };

  const handleConfirmDelete = async () => {
    try {
        await deleteProject();
        navigate('/');
    } catch (error) {
        alert("Đã xảy ra lỗi khi xóa dự án.");
    }
  };

  const isCompleted = project.status === ProjectStatus.COMPLETED;
  const isLate = !isCompleted && isOverdue(formData.dueDate);

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
    <div className="space-y-10 relative pb-20">
      
      {/* 1. General Information */}
      <div className="bg-white rounded-[40px] p-8 shadow-sm space-y-8">
        <h4 className="text-lg font-medium text-slate-800 flex items-center gap-2">
           <Info size={20} className="text-indigo-500" />
           Thông tin chung
        </h4>

        <Input 
          label="Tên dự án"
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={isReadOnly}
          className="text-lg font-medium"
        />

        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-3">
              <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                  <Calendar size={12} /> Bắt đầu
              </label>
              <div className={isReadOnly ? "opacity-60 pointer-events-none" : ""}>
                <DatePicker 
                  value={formData.startDate} 
                  onChange={(val) => handleDateChange('startDate', val)} 
                  maxDate={formData.dueDate}
                />
              </div>
           </div>
           <div className="space-y-3">
              <label className={`text-[10px] font-medium uppercase tracking-widest flex items-center gap-2 ml-1 ${isLate ? 'text-rose-500' : 'text-slate-400'}`}>
                  {isLate ? <AlertTriangle size={12} /> : <Calendar size={12} />} 
                  Kết thúc
              </label>
              <div className={isReadOnly ? "opacity-60 pointer-events-none" : ""}>
                <DatePicker 
                  value={formData.dueDate} 
                  onChange={(val) => handleDateChange('dueDate', val)} 
                  minDate={formData.startDate}
                />
              </div>
           </div>
        </div>

        <SelectGroup 
            label="Mức độ ưu tiên"
            icon={<Flag size={12} />}
            options={priorityOptions}
            value={formData.priority}
            onChange={handlePrioritySelect}
            disabled={isReadOnly}
        />

        <TextArea 
          label="Mô tả dự án"
          name="description"
          value={formData.description}
          onChange={handleChange}
          disabled={isReadOnly}
          placeholder="Mô tả mục tiêu, phạm vi và ý nghĩa của dự án..."
        />
      </div>

      {/* 2. Tech Stack (Categorized) */}
      <div className="bg-white rounded-[40px] p-8 shadow-sm space-y-8">
        <h4 className="text-lg font-medium text-slate-800 flex items-center gap-2">
           <Code2 size={20} className="text-indigo-500" />
           Công nghệ sử dụng
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Frontend (Giao diện)"
              name="frontend"
              icon={<Layout size={12} />}
              value={formData.frontend}
              onChange={handleChange}
              disabled={isReadOnly}
              placeholder="VD: React, Vue, TailwindCSS..."
            />
            <Input 
              label="Backend (Xử lý)"
              name="backend"
              icon={<Server size={12} />}
              value={formData.backend}
              onChange={handleChange}
              disabled={isReadOnly}
              placeholder="VD: Node.js, Python, Go..."
            />
            <Input 
              label="Database (Cơ sở dữ liệu)"
              name="database"
              icon={<Database size={12} />}
              value={formData.database}
              onChange={handleChange}
              disabled={isReadOnly}
              placeholder="VD: MongoDB, PostgreSQL, Redis..."
            />
            <Input 
              label="DevOps & Hạ tầng"
              name="devops"
              icon={<Cloud size={12} />}
              value={formData.devops}
              onChange={handleChange}
              disabled={isReadOnly}
              placeholder="VD: Docker, AWS, Firebase..."
            />
        </div>
      </div>

      {/* 3. Resources */}
      <div className="bg-white rounded-[40px] p-8 shadow-sm space-y-8">
        <h4 className="text-lg font-medium text-slate-800 flex items-center gap-2">
           <Globe size={20} className="text-indigo-500" />
           Tài nguyên & Liên kết
        </h4>

        <div className="grid grid-cols-1 gap-6">
          <Input 
            label="Source Code (Github/Gitlab)"
            name="githubUrl"
            icon={<Github size={12} />}
            value={formData.githubUrl}
            onChange={handleChange}
            disabled={isReadOnly}
            placeholder="https://github.com/..."
          />
          <Input 
            label="Live Demo / Website"
            name="liveUrl"
            icon={<Globe size={12} />}
            value={formData.liveUrl}
            onChange={handleChange}
            disabled={isReadOnly}
            placeholder="https://myapp.com"
          />
        </div>
      </div>

      {/* 4. Danger Zone */}
      {!isReadOnly && (
        <DangerZone 
          description="Hành động này sẽ xóa vĩnh viễn dự án và toàn bộ dữ liệu liên quan."
          onAction={handleConfirmDelete}
          verificationText={project.name}
          title="Xóa dự án"
          actionText="Xóa dự án này"
        />
      )}

      {/* Floating Save Warning */}
      <SaveWarning 
        show={hasChanges || isSavedSuccess} 
        isSaving={isSaving}
        isSuccess={isSavedSuccess}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default ProjectDetailInfo;
