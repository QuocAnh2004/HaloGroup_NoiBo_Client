import React, { useState, useEffect } from 'react';
import { membersApi, SystemUserWithTaskCount } from '../../api/members';
import Loading from '../shared/Loading';

interface MemberTaskListProps {
  className?: string;
}

export const MemberTaskList: React.FC<MemberTaskListProps> = ({ className = '' }) => {
  const [members, setMembers] = useState<SystemUserWithTaskCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMembersWithTaskCount();
  }, []);

  const fetchMembersWithTaskCount = async () => {
    try {
      setLoading(true);
      const data = await membersApi.fetchMembersWithTaskCount();
      setMembers(data);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full';
    switch (role) {
      case 'MANAGER':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'MEMBER':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getTaskCountColor = (count: number) => {
    if (count === 0) return 'text-gray-500';
    if (count <= 3) return 'text-green-600';
    if (count <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 text-sm">{error}</div>
        <button
          onClick={fetchMembersWithTaskCount}
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Danh sách nhân viên và công việc
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Tổng số nhân viên: {members.length}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nhân viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chức vụ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phòng ban
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số task đang làm
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {member.avatar_url ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={member.avatar_url}
                            alt={member.name}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {member.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {member.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {member.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {member.position || '-'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {member.level || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {member.department?.name || '-'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {member.department?.code || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getRoleBadge(member.role)}>
                      {member.role === 'MANAGER' ? 'Quản lý' : 'Nhân viên'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className={`text-2xl font-bold ${getTaskCountColor(member.task_count)}`}>
                      {member.task_count}
                    </div>
                    <div className="text-xs text-gray-500">
                      {member.task_count === 0 ? 'tasks' :
                        member.task_count === 1 ? 'task' : 'tasks'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {members.length === 0 && (
          <div className="px-6 py-12 text-center">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.239" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không có nhân viên</h3>
              <p className="mt-1 text-sm text-gray-500">
                Chưa có nhân viên nào trong hệ thống.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
