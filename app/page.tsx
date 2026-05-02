'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function HomePage() {
  const { isAuthenticated, currentUser } = useAuthStore();
  const isHydrated = useAuthStore((s) => s._hasHydrated);
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;
    if (isAuthenticated && currentUser) {
      router.replace(currentUser.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, currentUser, router, isHydrated]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-fuchsia-500">
        <div className="text-white text-xl font-semibold">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-fuchsia-500">
      <div className="text-white text-xl font-semibold">กำลังโหลด...</div>
    </div>
  );
}