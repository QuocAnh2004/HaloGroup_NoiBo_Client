import React from 'react';
import BackButton from '../components/shared/BackButton';
import { MemberTaskList } from '../components/member/MemberTaskList';

export const MemberTaskListPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <BackButton onClick={() => window.history.back()} />
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Danh sách nhân viên và công việc
            </h1>
            <p className="text-gray-600 mt-1">
              Theo dõi số lượng task đang thực hiện của từng nhân viên
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <MemberTaskList />

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Thông tin về số liệu
                </h3>
                <div className="mt-2 text-sm text-blue-700 space-y-1">
                  <p>• Chỉ tính các task chưa hoàn thành (còn check items chưa completed)</p>
                  <p>• Khi một task hoàn thành tất cả check items, sẽ không được tính vào số task đang làm</p>
                  <p>• Màu sắc hiển thị:
                    <span className="text-green-600 font-medium"> Xanh (≤3 tasks)</span>,
                    <span className="text-yellow-600 font-medium"> Vàng (4-6 tasks)</span>,
                    <span className="text-red-600 font-medium"> Đỏ (&gt;6 tasks)</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};