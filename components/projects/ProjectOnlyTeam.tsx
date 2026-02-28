import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Fingerprint, Info, ShieldCheck, User } from "lucide-react";
import AddMemberModal from "./AddMemberModal";
import { UserRole } from "../../types";
import { membersApi, SystemUser } from "../../api/members";
import Toast, { ToastType } from "../shared/Toast";
import Loading from "../shared/Loading";
import SearchBox from "../shared/SearchBox";
import TabTriggers, { TabOption } from "../shared/TabTriggers";
import BackButton from "../shared/BackButton";

const ProjectTeam: React.FC = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<SystemUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<UserRole>(UserRole.MEMBER);

  // Toast State
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const data = await membersApi.fetchMembers();
      setMembers(data);
    } catch (error) {
      console.error("Failed to load members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const handleAddMember = async (newMember: any) => {
    const tempMember = { ...newMember, role: UserRole.MEMBER };
    setMembers((prev) => [tempMember, ...prev]);
    setActiveTab(UserRole.MEMBER);

    try {
      await membersApi.addMember(tempMember);
      loadMembers();
    } catch (error) {
      setToast({ message: "Lỗi khi thêm thành viên", type: "error" });
      loadMembers();
    }
  };

  const managerCount = useMemo(
    () => members.filter((m) => m.role === UserRole.MANAGER).length,
    [members],
  );
  const memberCount = useMemo(
    () => members.filter((m) => m.role === UserRole.MEMBER).length,
    [members],
  );

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.id.includes(searchTerm);
      const matchesTab = member.role === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [members, searchTerm, activeTab]);

  const tabs: TabOption<UserRole>[] = [
    {
      value: UserRole.MANAGER,
      label: "Quản lý",
      icon: <ShieldCheck size={18} />,
      count: managerCount,
      activeColorClass: "text-indigo-600",
      activeBgClass: "bg-indigo-50",
    },
    {
      value: UserRole.MEMBER,
      label: "Nhân viên",
      icon: <User size={18} />,
      count: memberCount,
      activeColorClass: "text-sky-600",
      activeBgClass: "bg-sky-50",
    },
  ];

  return (
 <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-slate-50 via-white to-white">
  <div className="container mx-auto max-w-7xl px-4 md:px-8 py-6 md:py-10">
    <div className="space-y-8 animate-in fade-in">
      {/* HERO HEADER */}
      <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white/80 backdrop-blur">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />

        <div className="relative p-5 md:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1 flex items-center gap-3">
              <BackButton onClick={() => navigate(-1)} />
            <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
              Nhân Sự
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <AddMemberModal onAdd={handleAddMember} />
          </div>
        </div>

        {/* CONTROL BAR */}
        <div className="border-t border-slate-100 p-4 md:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <TabTriggers
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={(val) => setActiveTab(val)}
              />
            </div>

            <div className="lg:w-[420px]">
              <SearchBox
                placeholder={
                  activeTab === UserRole.MANAGER
                    ? "Tìm quản lý..."
                    : "Tìm nhân viên..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                containerClassName="w-full bg-white rounded-2xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/30"
                className="!bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* LIST / LOADING */}
      {isLoading ? (
        <div className="rounded-[28px] border border-slate-200 bg-white p-10">
          <Loading variant="component" text="Đang tải danh sách..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              onClick={() => navigate(`/member/${member.id}`)}
              className="group cursor-pointer rounded-[28px] border border-slate-200 bg-white p-4 md:p-5
                         hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(15,23,42,0.08)]
                         hover:border-indigo-200 transition-all duration-300
                         focus-within:ring-2 focus-within:ring-indigo-500/30"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div
                    className={`relative w-14 h-14 rounded-[22px] flex items-center justify-center text-white text-lg font-semibold
                    shadow-lg transition-all duration-500
                    ${
                      member.role === UserRole.MANAGER
                        ? "bg-indigo-600 shadow-indigo-100"
                        : "bg-slate-300 shadow-slate-100 group-hover:bg-indigo-500"
                    }`}
                  >
                    {getInitial(member.name)}
                    <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {member.name}
                      </h4>

                     

                      {member.role === UserRole.MANAGER && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-slate-400">
                      <Fingerprint size={12} />
                      <span className="text-[10px] font-medium tracking-widest uppercase bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                        {member.id}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Chevron */}
                <div className="h-10 w-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400
                                group-hover:text-indigo-600 group-hover:border-indigo-200 transition">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-5 w-5"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          ))}

          {filteredMembers.length === 0 && (
            <div className="md:col-span-2 rounded-[32px] border border-slate-200 bg-white p-10 text-center">
              <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="2">
                  <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                  <circle cx="11" cy="11" r="7" />
                </svg>
              </div>
              <p className="text-slate-500 text-sm">
                {searchTerm
                  ? "Không tìm thấy kết quả phù hợp."
                  : activeTab === UserRole.MANAGER
                    ? "Chưa có quản lý nào khác."
                    : "Chưa có nhân viên nào."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* INFO */}
      <div className="rounded-[28px] border border-indigo-100 bg-indigo-50/40 p-5 md:p-6 flex items-start gap-4">
        <div className="mt-0.5 text-indigo-500 shrink-0">
          <Info size={20} />
        </div>
        <p className="text-xs text-indigo-900/60 leading-relaxed">
          Nhấn vào một nhân viên để xem <strong>Hồ sơ chi tiết</strong>, lịch sử tham gia dự án và cài đặt tài khoản.
        </p>
      </div>

      <Toast
        isVisible={!!toast}
        message={toast?.message || ""}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </div>
  </div>
</div>

  );
};

export default ProjectTeam;
