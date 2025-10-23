import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/AdminSidebar';
import AdminNavbar from '@/components/layout/AdminNavbar';
import AdminFooter from '@/components/layout/AdminFooter';
import { Suspense } from 'react';
import LoadingFallback from './LoadingFallback';
import { toast } from 'sonner';
import { socket } from '@/socket';
import useUserStore from '@/stores/userStore';

const AdminLayout = () => {
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    socket.connect();

    const handleConnect = async () => {
      socket.emit('join-admin');
      if (user.role_name === 'staff') {
        socket.emit('join-staff', user.id);
      }
    };

    const handleToast = (data) => {
      toast[data.type || 'info'](data.message);
    };

    const handleError = (err) => {
      console.error('❌ Socket connection error:', err.message);
    };

    // Set up event listeners
    socket.on('connect', handleConnect);
    socket.on('toast', handleToast);
    socket.on('connect_error', handleError);

    // Cleanup on unmount
    return () => {
      socket.off('connect', handleConnect);
      socket.off('toast', handleToast);
      socket.off('connect_error', handleError);

      socket.disconnect();
    };
  }, []);

  return (
    <div className="grid min-h-screen w-full grid-cols-[auto_1fr] grid-rows-[auto_1fr_auto]">
      <aside className="sticky top-0 row-span-3 h-screen">
        <Sidebar />
      </aside>

      <AdminNavbar />

      <main className="bg-admin overflow-y-auto">
        <Suspense fallback={<LoadingFallback />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="text-muted-foreground border-t text-sm">
        <AdminFooter />
      </footer>
    </div>
  );
};

export default AdminLayout;
