'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, currentUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (currentUser?.role !== 'admin') {
      router.replace('/employee/dashboard');
    }
  }, [isAuthenticated, currentUser, router]);

  if (!isAuthenticated || currentUser?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-purple-50 flex">
      <aside className="w-64 bg-white border-r border-purple-100 flex flex-col shadow-lg">
        <div className="p-5 border-b border-purple-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-fuchsia-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">🦷</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm">STD Finance</h1>
              <p className="text-xs text-purple-500">Admin Panel</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <div className="px-3 py-1 text-xs font-semibold text-purple-400 uppercase tracking-wider">จัดการระบบ</div>
          <a href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-purple-50 hover:text-purple-700 rounded-xl transition-colors text-sm font-medium">🏠 แดชบอร์ด</a>
          <a href="/admin/employees" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-purple-50 hover:text-purple-700 rounded-xl transition-colors text-sm font-medium">👥 พนักงาน</a>
          <a href="/admin/tickets" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-purple-50 hover:text-purple-700 rounded-xl transition-colors text-sm font-medium">📋 คำขอทั้งหมด</a>
          <a href="/admin/loans" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-purple-50 hover:text-purple-700 rounded-xl transition-colors text-sm font-medium">🏦 บัญชีเงินกู้</a>
          <a href="/admin/advances" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-purple-50 hover:text-purple-700 rounded-xl transition-colors text-sm font-medium">💸 บัญชีเบิกล่วงหน้า</a>
          <div className="px-3 py-1 mt-4 text-xs font-semibold text-purple-400 uppercase tracking-wider">ทั่วไป</div>
          <a href="/employee/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-purple-50 hover:text-purple-700 rounded-xl transition-colors text-sm font-medium">👤 หน้าพนักงาน</a>
        </nav>
        <div className="p-4 border-t border-purple-100">
          <div className="p-3 bg-purple-50 rounded-xl mb-3">
            <p className="text-xs text-purple-500">ผู้ดูแลระบบ</p>
            <p className="font-semibold text-gray-900 text-sm">{currentUser?.name}</p>
            <p className="text-xs text-gray-400">{currentUser?.empNumber}</p>
          </div>
          <button onClick={() => { useAuthStore.getState().logout(); router.replace('/login'); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm">
            🚪 ออกจากระบบ
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}