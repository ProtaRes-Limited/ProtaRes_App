import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto bg-white">
      <Outlet />
    </div>
  );
}
