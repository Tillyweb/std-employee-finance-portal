'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const [empId, setEmpId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!empId.trim() || !password.trim()) {
      setError('กรุณากรอกรหัสพนักงานและรหัสผ่าน');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    const ok = login(empId.trim(), password);
    if (ok) {
      const { currentUser } = useAuthStore.getState();
      router.push(currentUser?.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard');
    } else {
      setError('รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-purple-700 to-fuchsia-600 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur">
            <span className="text-4xl">🦷</span>
          </div>
          <h1 className="text-2xl font-bold text-white">STD Finance Portal</h1>
          <p className="text-purple-200 text-sm mt-1">ระบบจัดการสินเชื่อพนักงาน</p>
        </div>

        <Card className="shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">เข้าสู่ระบบ</h2>
              <p className="text-sm text-gray-500 mt-1">กรุณาใช้รหัสพนักงานและรหัสผ่านของคุณ</p>
            </div>

            <Input
              label="รหัสพนักงาน"
              placeholder="เช่น STD004"
              value={empId}
              onChange={(e) => setEmpId(e.target.value)}
              autoComplete="username"
            />

            <Input
              label="รหัสผ่าน"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 text-center">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              เข้าสู่ระบบ
            </Button>

            <div className="text-center text-xs text-gray-400 mt-2">
              รหัสผ่านเริ่มต้น: <span className="font-mono text-purple-600">pass</span><br />
              Admin: <span className="font-mono text-purple-600">STD001</span> / <span className="font-mono text-purple-600">admin123</span>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
