"use client";

import AdminSidebar from '../../components/AdminSidebar';
import { Button } from '../../components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../components/Providers';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export default function AdminLayout({ children }) {
  const { logout, user } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar desktop */}
      <div className="hidden lg:block">
        <AdminSidebar onLogout={handleLogout} />
      </div>
      {/* Sidebar mobile (sheet/drawer) */}
      <div className="lg:hidden fixed top-0 left-0 z-50">
        <Button variant="outline" size="icon" className="m-2" onClick={() => setSidebarOpen(true)}>
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="2" rx="1" fill="currentColor"/><rect x="3" y="11" width="18" height="2" rx="1" fill="currentColor"/><rect x="3" y="16" width="18" height="2" rx="1" fill="currentColor"/></svg>
        </Button>
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-40" onClick={() => setSidebarOpen(false)}>
            <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-2xl rounded-r-3xl border-r border-blue-100" onClick={e => e.stopPropagation()}>
              <AdminSidebar onLogout={handleLogout} />
            </div>
          </div>
        )}
      </div>
      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen" style={{ marginLeft: '0', paddingLeft: '0' }}>
        {/* Header admin propre */}
        <header className="sticky top-0 z-30 bg-white shadow flex items-center justify-between px-6 py-4 border-b border-blue-100" style={{ minHeight: 64 }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-extrabold text-blue-900 tracking-tight">Admin</span>
            <span className="text-sm text-gray-500 font-medium hidden sm:inline">Panel d'administration</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
              <User size={20} className="text-blue-900" />
              <span className="font-semibold text-blue-900 text-sm">{user?.username || 'Admin'}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut size={16} /> <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 bg-gray-50 min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
    </div>
  );
} 