// import { useEffect } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import { UserRole } from '../../types';

// interface Props {
//   onLogin: (user: any) => void;
// }

// const AuthCallback: React.FC<Props> = ({ onLogin }) => {
//   const [params] = useSearchParams();
//   const navigate = useNavigate();
// // const [params] = useSearchParams();  // ← dòng này có không?

//   useEffect(() => {
//   console.log('>>> useEffect chạy');
//   console.log('>>> full URL:', window.location.href);
//   console.log('>>> search:', window.location.search);
//   console.log('>>> token:', params.get('token'));
//   console.log('>>> id:', params.get('id'));
//   console.log('>>> role:', params.get('role'));
// }, []);


//   useEffect(() => {
//     console.log('>>> AuthCallback chạy vào');
//   console.log('>>> token:', params.get('token'));
//   console.log('>>> error:', params.get('error'));
//   console.log('>>> id:', params.get('id'));
//   console.log('>>> role:', params.get('role'));
//     const token = params.get('token');
//     const error = params.get('error');

//     if (error || !token) {
//       const msg =
//         error === 'account_not_found' ? 'Email Google không tồn tại trong hệ thống.' :
//         error === 'unauthorized_email' ? 'Email không được phép truy cập.' :
//         'Đăng nhập Google thất bại.';
//       navigate(`/login?error=${encodeURIComponent(msg)}`);
//       return;
//     }

//     const user = {
//       token,
//       id: params.get('id'),
//       role: params.get('role'),
//       name: params.get('name'),
//     };

//     onLogin(user);
//     navigate(user.role === UserRole.MEMBER ? `/member-info/${user.id}` : '/');
//   }, []);

//   return (
//     <div className="min-h-screen flex items-center justify-center text-slate-400">
//       Đang xử lý đăng nhập...
//     </div>
//   );
// };

// export default AuthCallback;

import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserRole } from '../../types';

interface Props {
  onLogin: (user: any) => void;
}

const AuthCallback: React.FC<Props> = ({ onLogin }) => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('>>> AuthCallback chạy');
    console.log('>>> token:', params.get('token'));

    const token = params.get('token');
    const error = params.get('error');

    if (error || !token) {
      const msg =
        error === 'account_not_found' ? 'Email Google không tồn tại trong hệ thống.' :
        error === 'unauthorized_email' ? 'Email không được phép truy cập.' :
        'Đăng nhập Google thất bại.';
      navigate(`/login?error=${encodeURIComponent(msg)}`);
      return;
    }

    const user = {
      token,
      id: params.get('id'),
      role: params.get('role') as UserRole,
      name: params.get('name'),
    };

    onLogin(user);
    navigate(user.role === UserRole.MEMBER ? `/member-info/${user.id}` : '/');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center text-slate-400">
      Đang xử lý đăng nhập...
    </div>
  );
};

export default AuthCallback;