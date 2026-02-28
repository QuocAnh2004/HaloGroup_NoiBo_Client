
/**
 * Định dạng khoảng thời gian dự án theo dạng (dd/MM/YY - dd/MM/YY)
 */
import type {AuthenticatedUser } from "@/types";// dùng type sẵn có

export const formatProjectDates = (startDate: string, dueDate: string): string => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '??/??/??';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  return `(${formatDate(startDate)} - ${formatDate(dueDate)})`;
};

/**
 * Định dạng ngày đơn giản dd/MM/yyyy
 */
export const formatSimpleDate = (dateStr: string): string => {
  if (!dateStr) return 'Chưa chọn';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Định dạng ngày giờ đơn giản dd/MM/yy HH:mm
 */
export const formatSimpleDateTime = (dateStr: string): string => {
  if (!dateStr) return 'Chưa định ngày';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Chuyển đổi bất kỳ chuỗi ngày nào sang định dạng YYYY-MM-DDTHH:mm cho input datetime-local
 */
export const toDatetimeLocal = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  
  const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
  const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);
  return localISOTime;
};

/**
 * Kiểm tra xem ngày giờ có quá hạn so với hiện tại không
 */
export const isOverdue = (dateStr: string): boolean => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  
  return date.getTime() < Date.now();
};

/**
 * Tạo ID ngẫu nhiên gồm chữ và số (VD: prj_k9s21a)
 */
export const generateRandomId = (prefix: string = ''): string => {
  return `${prefix}${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Tạo ID số ngẫu nhiên (cho User ID)
 */
export const generateNumericId = (length: number = 4): string => {
  let result = '';
  const characters = '0123456789';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// --- NEW LOGIC FOR TASK STATUS ---

export type TaskStatusType = 'COMPLETED_ON_TIME' | 'COMPLETED_LATE' | 'LATE' | 'WARNING' | 'IN_PROGRESS';

interface TaskStatusInfo {
  type: TaskStatusType;
  label: string;
  color: string;      // Text color class
  bgColor: string;    // Background color class
  borderColor: string; // Border color class
  shadowColor: string; // Shadow color class
}

export const getTaskStatus = (dueDateStr: string, isCompleted: boolean): TaskStatusInfo => {
  const now = new Date().getTime();
  const due = new Date(dueDateStr).getTime();
  const isLate = due < now;
  
  // 24 hours in milliseconds
  const WARNING_THRESHOLD = 24 * 60 * 60 * 1000; 
  const isWarning = !isLate && (due - now < WARNING_THRESHOLD);

  if (isCompleted) {
    if (isLate) {
      return {
        type: 'COMPLETED_LATE',
        label: 'Xong (Trễ)',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        shadowColor: 'shadow-emerald-100'
      };
    }
    return {
      type: 'COMPLETED_ON_TIME',
      label: 'Đã hoàn tất',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      shadowColor: 'shadow-emerald-100'
    };
  }

  if (isLate) {
    return {
      type: 'LATE',
      label: 'Trễ hạn',
      color: 'text-rose-500',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100',
      shadowColor: 'shadow-rose-100'
    };
  }

  if (isWarning) {
    return {
      type: 'WARNING',
      label: 'Sắp đến hạn',
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      shadowColor: 'shadow-amber-100'
    };
  }

  return {
    type: 'IN_PROGRESS',
    label: 'Đang làm',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-100',
    shadowColor: 'shadow-indigo-100'
  };
};

export const getTimeRemaining = (dueDateStr: string) => {
  const total = Date.parse(dueDateStr) - Date.now();
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  
  return {
    total,
    days,
    hours,
    minutes,
    seconds
  };
};

export function getCurrentUser(): AuthenticatedUser | null {
  try {
    const saved = localStorage.getItem("hola_user");
    if (!saved) return null;
    return JSON.parse(saved) as AuthenticatedUser;
  } catch {
    return null;
  }
}

  // export const getInitialUppercase = (name: string) => {
  //   return name.charAt(0).toUpperCase();
  // };
export function getInitialUppercase(value?: string | null) {
  const s = String(value ?? "").trim();
  return s ? s.charAt(0).toUpperCase() : "?";
}