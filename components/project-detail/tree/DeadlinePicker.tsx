
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, AlertCircle, AlertTriangle, CheckCircle2, Timer } from 'lucide-react';
import { formatSimpleDateTime, getTaskStatus, getTimeRemaining } from '../../../utils';
import ModalLayout from '../../shared/ModalLayout';

interface DeadlinePickerProps {
  value: string;
  minDate: string;
  maxDate: string;
  onChange: (newValue: string) => void;
  isEditing: boolean;
  isCompleted?: boolean;
}

// Component đếm ngược nhỏ
const CountdownLabel: React.FC<{ dueDate: string }> = ({ dueDate }) => {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(dueDate));

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getTimeRemaining(dueDate);
      setTimeLeft(remaining);
      if (remaining.total <= 0) {
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [dueDate]);

  if (timeLeft.total <= 0) return <span>Đang cập nhật...</span>;

  // Format: HH:MM:SS
  const formatNum = (num: number) => String(num).padStart(2, '0');
  
  return (
    <span className="font-mono tracking-tight">
      {formatNum(timeLeft.hours)}:{formatNum(timeLeft.minutes)}:{formatNum(timeLeft.seconds)}
    </span>
  );
};

const DeadlinePicker: React.FC<DeadlinePickerProps> = ({
  value,
  minDate,
  maxDate,
  onChange,
  isEditing,
  isCompleted = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Tính toán status hiện tại
  const statusInfo = getTaskStatus(value, isCompleted);
  
  const currentDate = new Date(value || Date.now());
  const min = new Date(minDate.includes('T') ? minDate : `${minDate}T00:00`);
  const max = new Date(maxDate.includes('T') ? maxDate : `${maxDate}T23:59`);

  const [viewDate, setViewDate] = useState(new Date(currentDate));

  const handleDateSelect = (day: number) => {
    const newDate = new Date(viewDate);
    newDate.setDate(day);
    newDate.setHours(currentDate.getHours());
    newDate.setMinutes(currentDate.getMinutes());

    let finalDate = newDate;
    if (newDate < min) finalDate = min;
    if (newDate > max) finalDate = max;

    onChange(finalDate.toISOString());
  };

  const handleTimeChange = (type: 'h' | 'm', val: number) => {
    const newDate = new Date(currentDate);
    if (type === 'h') {
      const h = isNaN(val) ? 0 : Math.min(23, Math.max(0, val));
      newDate.setHours(h);
    } else {
      const m = isNaN(val) ? 0 : Math.min(59, Math.max(0, val));
      newDate.setMinutes(m);
    }

    let finalDate = newDate;
    if (newDate < min) finalDate = min;
    if (newDate > max) finalDate = max;

    onChange(finalDate.toISOString());
  };

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-9 w-9" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dObj = new Date(year, month, d);
      const isSelected = d === currentDate.getDate() && month === currentDate.getMonth() && year === currentDate.getFullYear();
      const isDisabled = dObj < new Date(min.getFullYear(), min.getMonth(), min.getDate()) || 
                         dObj > new Date(max.getFullYear(), max.getMonth(), max.getDate());
      
      days.push(
        <button
          key={d}
          type="button"
          disabled={isDisabled}
          onClick={() => handleDateSelect(d)}
          className={`h-9 w-9 rounded-xl text-[11px] transition-all flex items-center justify-center ${
            isSelected 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
              : isDisabled 
                ? 'text-slate-200 cursor-not-allowed' 
                : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
          }`}
        >
          {d}
        </button>
      );
    }
    return days;
  };

  // --- RENDER DISPLAY MODE (Badge) ---
  if (!isEditing) {
    // Xác định icon và style dựa trên statusInfo
    let Icon = Clock;
    if (statusInfo.type === 'LATE') Icon = AlertCircle;
    if (statusInfo.type === 'WARNING') Icon = Timer;
    if (statusInfo.type.includes('COMPLETED')) Icon = CheckCircle2;

    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
        <Icon size={12} className={statusInfo.color} />
        
        <div className={`flex items-center gap-1.5 text-[11px] ${statusInfo.color}`}>
          <span className="font-light tracking-tight hidden sm:inline">
            {formatSimpleDateTime(value)}
          </span>
          
          {/* Label Status */}
          <span className="font-medium">
             — {statusInfo.type === 'WARNING' ? <CountdownLabel dueDate={value} /> : statusInfo.label}
          </span>
        </div>
      </div>
    );
  }

  // --- RENDER EDIT MODE (Button) ---
  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl shadow-sm hover:shadow-md transition-all text-indigo-600 border border-slate-100"
      >
        <CalendarIcon size={12} />
        <span className="text-[11px] font-medium">{formatSimpleDateTime(value)}</span>
      </button>

      <ModalLayout
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Chọn thời hạn"
        subTitle={viewDate.toLocaleString('vi-VN', { month: 'long', year: 'numeric' })}
        className="max-w-[360px]"
      >
         <div className="flex justify-between items-center mb-4">
             <div className="flex gap-1 ml-auto">
                <button 
                  type="button"
                  onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))}
                  className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  type="button"
                  onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))}
                  className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
         </div>

        <div className="grid grid-cols-7 gap-1">
          {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
            <div key={d} className="h-9 w-9 flex items-center justify-center text-[9px] font-medium text-slate-300 uppercase">
              {d}
            </div>
          ))}
          {renderCalendar()}
        </div>

        <div className="pt-4 border-t border-slate-50 flex items-center justify-between px-1 mt-2">
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            <Clock size={12} /> Thời gian
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="number"
              value={currentDate.getHours()}
              onChange={(e) => handleTimeChange('h', parseInt(e.target.value))}
              className="w-12 h-10 bg-slate-50 text-slate-800 rounded-xl text-center text-[13px] focus:outline-none focus:bg-indigo-50 transition-colors font-medium appearance-none"
            />
            <span className="text-slate-200 font-light">:</span>
            <input 
              type="number"
              value={currentDate.getMinutes()}
              onChange={(e) => handleTimeChange('m', parseInt(e.target.value))}
              className="w-12 h-10 bg-slate-50 text-slate-800 rounded-xl text-center text-[13px] focus:outline-none focus:bg-indigo-50 transition-colors font-medium appearance-none"
            />
          </div>
        </div>

        <div className="pt-6 space-y-4">
          <div className="bg-slate-50/70 p-4 rounded-[24px]">
            <p className="text-[10px] text-slate-400 font-light leading-relaxed">
              Hạn chót nằm trong khoảng thời gian dự án cho phép.
            </p>
          </div>
          <button 
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full py-4 bg-slate-900 text-white rounded-[24px] text-sm font-medium hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
          >
            Xác nhận
          </button>
        </div>
      </ModalLayout>
    </>
  );
};

export default DeadlinePicker;
