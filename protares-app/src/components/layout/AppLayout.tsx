import { Outlet } from 'react-router-dom';
import { TabBar } from './TabBar';

export function AppLayout() {
  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-gray-50 shadow-lg">
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <TabBar />
    </div>
  );
}
