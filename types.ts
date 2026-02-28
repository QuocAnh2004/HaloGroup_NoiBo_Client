
export enum ProjectStatus {
  IN_PROGRESS = 'Đang làm',
  COMPLETED = 'Đã xong'
}

export enum ProjectPriority {
  HIGH = 'Cao',
  MEDIUM = 'Trung bình',
  LOW = 'Thấp'
}

export enum UserRole {
  MANAGER = 'MANAGER',
  MEMBER = 'MEMBER'
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  role: UserRole;
  token?: string; // Thêm trường token
}

export interface CheckItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  estimatedTime: string;
  checkItems: CheckItem[];
  assignedMemberIds?: string[];
  lateReason?: string; // Lý do trễ hạn
  createdAt?: string; // Dùng để sắp xếp
}

export interface TaskGroup {
  id: string;
  title: string;
  description?: string;
  estimatedTime: string;
  taskItems: TaskItem[];
  assignedMemberIds?: string[];
  lateReason?: string; // Lý do trễ hạn
  createdAt?: string; // Dùng để sắp xếp
}

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export interface ProjectNotification {
  id: string;
  projectId: string;
  content: string;
  type: 'GENERAL' | 'PERSONAL';
  targetMemberId?: string; // ID của thành viên nếu là tin nhắn riêng
  senderName: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  techStack: string[];
  teamMembers: TeamMember[];
  startDate: string;
  dueDate: string;
  progress: number;
  taskGroups?: TaskGroup[];
  notifications?: ProjectNotification[]; // Thêm danh sách thông báo
  githubUrl?: string;
  liveUrl?: string;
  category?: string;
}

export interface ChatMessage {
  message_id: number;

  sender_id: AuthenticatedUser;
  receiver_id: AuthenticatedUser;
  // sender_id: string;
  // receiver_id: string;

  content: string;
  message_type: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO';

  is_read: boolean;
  is_deleted: boolean;

  reply_to_message_id?: number | null;
  attachment_url?: string | null;

  created_at: Date;
  read_at?: Date | null;
  deleted_at?: Date | null;
}

