"use client";

import React from 'react';
import { User, Map, Home, FileText, Layers, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: <Home size={20} /> },
  { label: 'Utilisateurs', href: '/admin/utilisateurs', icon: <User size={20} /> },
  { label: 'Parcelles', href: '/admin/parcelles', icon: <Layers size={20} /> },
  { label: 'Sièges', href: '/admin/sieges', icon: <Map size={20} /> },
  { label: 'Pépinières', href: '/admin/pepinieres', icon: <Layers size={20} /> },
  { label: 'Import/Export', href: '/admin/import', icon: <FileText size={20} /> },
];

const AdminSidebar = ({ onLogout }) => {
  const pathname = usePathname();
  return (
    <aside className="h-screen w-64 bg-white text-blue-900 flex flex-col shadow-2xl fixed left-0 top-0 z-40 rounded-r-3xl border-r border-blue-100">
      <div className="flex items-center gap-2 px-6 py-6 border-b border-blue-100">
        <span className="font-extrabold text-2xl tracking-tight">GeoMap Admin</span>
      </div>
      <nav className="flex-1 py-6 px-2 space-y-2">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors duration-150 hover:bg-blue-50 hover:text-blue-900 ${pathname === item.href ? 'bg-blue-100 text-blue-900 font-bold shadow' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="px-6 py-4 border-t border-blue-100">
        <button
          onClick={onLogout}
          className="flex items-center gap-2 w-full px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 font-semibold transition border border-blue-100"
        >
          <LogOut size={18} /> Déconnexion
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar; 