
import { TaskGroup } from '../types';

export const aiApi = {
  // Sinh cấu trúc công việc dựa trên mô tả dự án
  generateTaskStructure: async (projectName: string, description: string): Promise<TaskGroup[]> => {
    // Đã loại bỏ delay giả lập để phản hồi tức thì
    const generateId = () => Math.random().toString(36).substr(2, 9);
    const now = new Date();
    const addDays = (days: number) => new Date(now.getTime() + days * 86400000).toISOString();

    // Logic giả lập đơn giản dựa trên từ khóa
    const isMobile = description.toLowerCase().includes('app') || description.toLowerCase().includes('mobile');
    const isWeb = description.toLowerCase().includes('web') || description.toLowerCase().includes('site') || description.toLowerCase().includes('platform');
    
    const commonPhase: TaskGroup = {
      id: generateId(),
      title: 'Khởi tạo & Phân tích',
      description: 'Thiết lập môi trường và phân tích yêu cầu nghiệp vụ.',
      estimatedTime: addDays(5),
      assignedMemberIds: [],
      taskItems: [
        {
          id: generateId(),
          title: 'Thu thập yêu cầu',
          description: 'Làm việc với stakeholders để chốt danh sách tính năng.',
          estimatedTime: addDays(2),
          checkItems: [
            { id: generateId(), title: 'Phỏng vấn key users', completed: false },
            { id: generateId(), title: 'Viết tài liệu SRS', completed: false }
          ],
          assignedMemberIds: []
        },
        {
          id: generateId(),
          title: 'Thiết kế hệ thống',
          description: 'Vẽ kiến trúc High-level và Database Schema.',
          estimatedTime: addDays(5),
          checkItems: [
            { id: generateId(), title: 'Sơ đồ ERD', completed: false },
            { id: generateId(), title: 'Kiến trúc Server', completed: false }
          ],
          assignedMemberIds: []
        }
      ]
    };

    const devPhase: TaskGroup = {
      id: generateId(),
      title: 'Phát triển Tính năng',
      description: `Lập trình các module chính cho ${isMobile ? 'ứng dụng Mobile' : 'nền tảng Web'}.`,
      estimatedTime: addDays(20),
      assignedMemberIds: [],
      taskItems: [
        {
          id: generateId(),
          title: isMobile ? 'Dựng UI Screens' : 'Frontend Components',
          description: 'Hiện thực hóa các màn hình từ bản thiết kế.',
          estimatedTime: addDays(10),
          checkItems: [],
          assignedMemberIds: []
        },
        {
          id: generateId(),
          title: 'Backend API Development',
          description: 'Xây dựng các API RESTful phục vụ client.',
          estimatedTime: addDays(15),
          checkItems: [],
          assignedMemberIds: []
        }
      ]
    };

    const deployPhase: TaskGroup = {
      id: generateId(),
      title: 'Kiểm thử & Triển khai',
      description: 'Đảm bảo chất lượng và đưa sản phẩm ra thị trường.',
      estimatedTime: addDays(30),
      assignedMemberIds: [],
      taskItems: [
        {
          id: generateId(),
          title: 'UAT Testing',
          description: 'Kiểm thử chấp nhận người dùng.',
          estimatedTime: addDays(25),
          checkItems: [],
          assignedMemberIds: []
        },
        {
          id: generateId(),
          title: 'Go-live',
          description: 'Triển khai lên môi trường Production.',
          estimatedTime: addDays(30),
          checkItems: [],
          assignedMemberIds: []
        }
      ]
    };

    return [commonPhase, devPhase, deployPhase];
  }
};
