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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Danh sách nhân viên và công việc
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Tổng số {members.length} nhân viên
            </p>
          </div>
        </div>

        {/* Scrollable Container with Max Height */}
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  Nhân viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  Vị trí
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  Phòng ban
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  Số lượng Task
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                        {member.avatar_url ? (
                          <img
                            className="w-full h-full object-cover"
                            src={member.avatar_url}
                            alt={member.name}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500 font-bold uppercase">
                            {member.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">
                          {member.name}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          #{member.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-700">
                      {member.position || '-'}
                    </div>
                    <div className="text-xs text-slate-400">
                      {member.level || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-700">
                      {member.department?.name || '-'}
                    </div>
                    <div className="text-xs text-slate-400 uppercase font-bold tracking-tighter">
                      {member.department?.code || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      member.role === 'MANAGER' 
                        ? 'bg-blue-50 text-blue-600 border-blue-100' 
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {member.role === 'MANAGER' ? 'Quản lý' : 'Nhân viên'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex flex-col items-center">
                       <div className={`text-lg font-bold ${getTaskCountColor(member.task_count)}`}>
                         {member.task_count}
                       </div>
                       <div className="w-12 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              member.task_count <= 3 ? 'bg-green-500' : member.task_count <= 6 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, (member.task_count / 8) * 100)}%` }}
                          ></div>
                       </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {members.length === 0 && (
          <div className="px-6 py-12 text-center">
            <div className="text-slate-400 text-sm">Chưa có dữ liệu nhân viên.</div>
          </div>
        )}
      </div>
    </div>
  );
};
