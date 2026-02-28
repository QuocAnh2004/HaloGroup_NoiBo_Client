import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ProjectPage from './pages/ProjectPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProjectPreviewPage from './pages/ProjectPreviewPage';
import MemberDetailPage from './pages/MemberDetailPage';
import MemberPreviewListPage from './pages/MemberPreviewListPage'; 
import MemberPreviewPage from './pages/MemberPreviewPage';
import UserGuidePage from './pages/UserGuidePage';
import ProjectTeam from './components/projects/ProjectOnlyTeam';
import ProjectMesseges from './components/projects/ProjectMesseges';
import Login from './components/auth/Login';
import ChangePassword from './components/auth/ChangePassword';
import { AuthenticatedUser, UserRole } from './types';
import ProjectHeader from './components/projects/ProjectHeader';


// Helper component for protected routes defined outside to prevent re-creation and type errors
interface ProtectedRouteProps {
  children: React.ReactElement;
  user: AuthenticatedUser | null;
  requiredRole?: UserRole;
  onLogin: (user: AuthenticatedUser) => void;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, user, requiredRole, onLogin }) => {
  if (!user) {
    return <Login onLogin={onLogin} />;
  }
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={`/member-info/${user.id}`} replace />;
  }
  return children;
};

const App: React.FC = () => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('hola_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('hola_user');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData: AuthenticatedUser) => {
    setUser(userData);
    localStorage.setItem('hola_user', JSON.stringify(userData));
    // Navigation is handled inside Login component based on Role
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('hola_user');
    navigate('/login'); // Redirect to explicit login route
  };

  if (isLoading) return null;

  return (
    <>
      {/* Header luôn hiển thị */}
      {user && (
        <ProjectHeader
          onLogout={handleLogout}
          onChangePassword={() => navigate("/change-password")}
        />
      )}


    <Routes>
      
       
      <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" replace />} />
      
      {/* Route đổi mật khẩu công khai */}
      <Route path="/change-password" element={
        <ChangePassword user={user || undefined} />
      } />

      {/* Trang Hướng dẫn sử dụng (Shared) */}
      <Route path="/guide" element={
        <ProtectedRoute user={user} onLogin={handleLogin}>
          <UserGuidePage />
        </ProtectedRoute>
      } />

      {/* Trang Hướng đến nhân sự */}
      <Route path="/employees" element={
        <ProtectedRoute user={user} onLogin={handleLogin}>
          <ProjectTeam />
        </ProtectedRoute>
      } />
      {/* Trang Hướng đến nhân sự */}
      <Route path="/messages" element={
        <ProtectedRoute user={user} onLogin={handleLogin}>
          <ProjectMesseges />
        </ProtectedRoute>
      } />

      {/* Trang Dashboard (Root): Xử lý logic redirect */}
      <Route path="/" element={
        !user ? <Login onLogin={handleLogin} /> : 
        (user.role === UserRole.MANAGER ? <ProjectPage onLogout={handleLogout} /> : <Navigate to={`/member-info/${user.id}`} replace />)
      } />

      {/* Trang Chi tiết (Edit): Chỉ Manager */}
      <Route path="/project/:projectId" element={
        <ProtectedRoute user={user} onLogin={handleLogin} requiredRole={UserRole.MANAGER}>
          <ProjectDetailPage />
        </ProtectedRoute>
      } />

      {/* Trang Danh sách Nhân viên (Preview): Shared cho cả 2 role */}
      <Route path="/members" element={
        <ProtectedRoute user={user} onLogin={handleLogin}>
          <MemberPreviewListPage currentUser={user!} onLogout={handleLogout} />
        </ProtectedRoute>
      } />

      {/* Trang Chi tiết Nhân viên (Edit): Chỉ Manager */}
      <Route path="/member/:memberId" element={
        <ProtectedRoute user={user} onLogin={handleLogin} requiredRole={UserRole.MANAGER}>
          <MemberDetailPage />
        </ProtectedRoute>
      } />

      {/* Trang Chi tiết Nhân viên (Read Only): Shared cho mọi role */}
      {/* Đây là trang đích của Member sau khi login */}
      <Route path="/member-info/:memberId" element={
        <ProtectedRoute user={user} onLogin={handleLogin}>
          <MemberPreviewPage currentUser={user!} onLogout={handleLogout} />
        </ProtectedRoute>
      } />

      {/* Trang Preview: Cả 2 đều xem được */}
      <Route path="/project/:projectId/preview" element={
        <ProtectedRoute user={user} onLogin={handleLogin}>
          <ProjectPreviewPage currentUser={user!} onLogout={handleLogout} />
        </ProtectedRoute>
      } />
    
      {/* Mọi route lạ đều về trang chủ */}
      <Route path="*" element={<Navigate to="/" replace />} />

    

    </Routes>
    </>
    
  );
};

export default App;