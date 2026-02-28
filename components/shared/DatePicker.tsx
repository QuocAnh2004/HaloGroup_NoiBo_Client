
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatSimpleDate } from '../../utils';
import ModalLayout from './ModalLayout';

interface DatePickerProps {
  value: string;
  minDate?: string;
  maxDate?: string;
  onChange: (newValue: string) => void;
  label?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  minDate,
  maxDate,
  onChange,
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Helper: Parse string YYYY-MM-DD thành Date object (00:00 Local Time)
  const parseLocal = (dateStr?: string) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    return new Date(dateStr);
  };

  const currentDate = parseLocal(value);
  const min = minDate ? parseLocal(minDate) : new Date(1970, 0, 1);
  const max = maxDate ? parseLocal(maxDate) : new Date(2100, 0, 1);

  // Reset giờ về 0 hết để so sánh ngày chuẩn xác
  currentDate.setHours(0,0,0,0);
  min.setHours(0,0,0,0);
  max.setHours(0,0,0,0);

  const [viewDate, setViewDate] = useState(new Date(currentDate));

  const handleDateSelect = (day: number) => {
    // Tạo ngày mới theo Local Time
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    
    // Clamp date (So sánh timestamp)
    let finalDate = newDate;
    if (newDate.getTime() < min.getTime()) finalDate = min;
    if (newDate.getTime() > max.getTime()) finalDate = max;

    // Format thủ công YYYY-MM-DD theo Local Time để tránh lỗi timezone khi dùng toISOString()
    const year = finalDate.getFullYear();
    const month = String(finalDate.getMonth() + 1).padStart(2, '0');
    const d = String(finalDate.getDate()).padStart(2, '0');
    
    onChange(`${year}-${month}-${d}`);
    setIsOpen(false);
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
      
      const isBeforeMin = dObj.getTime() < min.getTime();
      const isAfterMax = dObj.getTime() > max.getTime();
      const isDisabled = isBeforeMin || isAfterMax;
      
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

  return (
    <>
      <button
        type="button"
        onClick={() => {
            // Khi mở, reset view về ngày hiện tại đang chọn
            setViewDate(new Date(currentDate));
            setIsOpen(true);
        }}
        className="w-full flex items-center justify-between bg-slate-50 text-slate-800 rounded-xl px-5 py-3 hover:bg-indigo-50/50 transition-colors font-light text-left"
      >
        <span className={!value ? "text-slate-400" : ""}>
          {value ? formatSimpleDate(value) : (label || "Chọn ngày...")}
        </span>
      </button>

      <ModalLayout
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Chọn ngày"
        subTitle={viewDate.toLocaleString('vi-VN', { month: 'long', year: 'numeric' })}
        className="max-w-[360px]"
      >
        <div className="flex justify-end items-center mb-4">
          <div className="flex gap-1">
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

        <div className="pt-6 space-y-4">
          <button 
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full py-4 bg-slate-900 text-white rounded-[24px] text-sm font-medium hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
          >
            Đóng
          </button>
        </div>
      </ModalLayout>
    </>
  );
};

export default DatePicker;
