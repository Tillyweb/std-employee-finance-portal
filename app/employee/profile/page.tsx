'use client';
import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useEmployeeStore } from '@/stores/employeeStore';
import { useActivityStore } from '@/stores/activityStore';
import { hashPassword } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ProfilePage() {
  const { currentUser } = useAuthStore();
  const updateEmployee = useEmployeeStore((s) => s.updateEmployee);
  const addActivity = useActivityStore((s) => s.addActivity);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (!currentPassword || !newPassword || !confirmPassword) { setError('กรุณากรอกข้อมูลให้ครบ'); return; }
    if (newPassword !== confirmPassword) { setError('รหัสผ่านใหม่ไม่ตรงกัน'); return; }
    if (newPassword.length < 6) { setError('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร'); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    updateEmployee(currentUser!.id, { password: hashPassword(newPassword) });
    addActivity({ icon: '🔒', description: `${currentUser?.name} เปลี่ยนรหัสผ่าน`, type: 'auth' });
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    setMessage('เปลี่ยนรหัสผ่านสำเร็จแล้ว');
    setLoading(false);
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">โปรไฟล์ของฉัน</h1>
        <p className="text-sm text-gray-500 mt-1">จัดการข้อมูลส่วนตัวและรหัสผ่าน</p>
      </div>
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">👤 ข้อมูลส่วนตัว</h3>
        <div className="space-y-3">
          <InfoRow label="รหัสพนักงาน" value={currentUser?.empNumber ?? '-'} />
          <InfoRow label="ชื่อ-นามสกุล" value={currentUser?.name ?? '-'} />
          <InfoRow label="แผนก" value={currentUser?.dept ?? '-'} />
          <InfoRow label="ตำแหน่ง" value={currentUser?.position ?? '-'} />
          <InfoRow label="เงินเดือนพื้นฐาน" value={currentUser?.baseSalary ? `${currentUser.baseSalary.toLocaleString('th-TH')} บาท` : '-'} />
          <InfoRow label="วันลาคงเหลือ" value={`${currentUser?.vacationBalance ?? 0} วัน`} />
        </div>
      </Card>
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">🔒 เปลี่ยนรหัสผ่าน</h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่านปัจจุบัน</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-purple-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่านใหม่</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="อย่างน้อย 6 ตัวอักษร"
              className="w-full px-4 py-2.5 border border-purple-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-purple-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400" />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}
          <Button type="submit" loading={loading}>บันทึกรหัสผ่านใหม่</Button>
        </form>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between items-center py-2 border-b border-purple-50 last:border-0"><span className="text-sm text-gray-500">{label}</span><span className="text-sm font-medium text-gray-900">{value}</span></div>;
}