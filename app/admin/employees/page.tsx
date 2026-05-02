'use client';
import React, { useState } from 'react';
import { useEmployeeStore } from '@/stores/employeeStore';
import { useActivityStore } from '@/stores/activityStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DEFAULT_PASSWORD } from '@/stores/employeeStore';
import { hashPassword } from '@/lib/utils';

interface NewEmployee {
  empNumber: string;
  prefix: string;
  firstName: string;
  lastName: string;
  dept: string;
  position: string;
  baseSalary: string;
}

export default function AdminEmployeesPage() {
  const employees = useEmployeeStore((s) => s.employees);
  const addEmployee = useEmployeeStore((s) => s.addEmployee);
  const updateEmployee = useEmployeeStore((s) => s.updateEmployee);
  const deleteEmployee = useEmployeeStore((s) => s.deleteEmployee);
  const addActivity = useActivityStore((s) => s.addActivity);

  const [search, setSearch] = useState('');
  const [showResetModal, setShowResetModal] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmp, setNewEmp] = useState<NewEmployee>({
    empNumber: '', prefix: 'นาย', firstName: '', lastName: '',
    dept: '', position: '', baseSalary: '',
  });

  const filtered = employees.filter((e) =>
    e.empNumber.toLowerCase().includes(search.toLowerCase()) || e.name.includes(search)
  );

  const handleResetPassword = (empId: string) => {
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return;
    updateEmployee(empId, { password: hashPassword(DEFAULT_PASSWORD), plainPassword: DEFAULT_PASSWORD });
    addActivity({ icon: '🔑', description: `รีเซ็ตรหัสผ่านของ ${emp.name} (${emp.empNumber}) เป็น "${DEFAULT_PASSWORD}"`, type: 'auth' });
    setShowResetModal(null);
  };

  const handleDelete = (empId: string) => {
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return;
    deleteEmployee(empId);
    addActivity({ icon: '🗑️', description: `ลบพนักงาน ${emp.name} (${emp.empNumber})`, type: 'ticket' });
    setShowDeleteModal(null);
  };

  const handleAddEmployee = () => {
    if (!newEmp.empNumber || !newEmp.firstName) return;
    const fullName = `${newEmp.prefix} ${newEmp.firstName} ${newEmp.lastName}`.trim();
    addEmployee({
      id: newEmp.empNumber,
      empNumber: newEmp.empNumber,
      prefix: newEmp.prefix,
      firstName: newEmp.firstName,
      lastName: newEmp.lastName,
      name: fullName,
      dept: newEmp.dept,
      position: newEmp.position,
      baseSalary: Number(newEmp.baseSalary) || 0,
      password: hashPassword(DEFAULT_PASSWORD),
      plainPassword: DEFAULT_PASSWORD,
      role: 'employee',
      vacationBalance: 6,
      status: 'active',
      createdAt: new Date().toISOString(),
    });
    addActivity({ icon: '👤➕', description: `เพิ่มพนักงานใหม่ ${fullName} (${newEmp.empNumber})`, type: 'ticket' });
    setShowAddModal(false);
    setNewEmp({ empNumber: '', prefix: 'นาย', firstName: '', lastName: '', dept: '', position: '', baseSalary: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการพนักงาน</h1>
          <p className="text-sm text-gray-500 mt-1">ดูและแก้ไขข้อมูลพนักงานทั้งหมด</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>+ เพิ่มพนักงาน</Button>
      </div>
      <div className="relative max-w-sm">
        <input type="text" placeholder="ค้นหารหัสหรือชื่อ..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-purple-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</div>
      </div>
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white text-xs">
                <th className="px-4 py-3 font-semibold">รหัส</th>
                <th className="px-4 py-3 font-semibold">ชื่อ-นามสกุล</th>
                <th className="px-4 py-3 font-semibold">แผนก</th>
                <th className="px-4 py-3 font-semibold">ตำแหน่ง</th>
                <th className="px-4 py-3 text-center font-semibold">สิทธิ์</th>
                <th className="px-4 py-3 text-center font-semibold">รหัสผ่าน</th>
                <th className="px-4 py-3 text-center font-semibold">สถานะ</th>
                <th className="px-4 py-3 text-center font-semibold">จัดการ</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filtered.map((emp) => (
                <tr key={emp.id} className="border-b border-purple-100 hover:bg-purple-50/50">
                  <td className="px-4 py-3 font-medium text-purple-700">{emp.empNumber}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{emp.name}</p>
                    <p className="text-xs text-gray-400">{emp.prefix}{emp.firstName}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{emp.dept}</td>
                  <td className="px-4 py-3 text-gray-600">{emp.position}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${emp.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                      {emp.role === 'admin' ? 'ผู้ดูแล' : 'พนักงาน'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => setShowPasswordModal(emp.id)}
                      className="text-xs px-2 py-1 bg-purple-50 text-purple-600 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors font-mono">
                      {emp.plainPassword}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${emp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {emp.status === 'active' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => setShowResetModal(emp.id)}
                        className="text-xs px-2 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                        title="รีเซ็ตรหัสผ่าน">🔑 รีเซ็ต</button>
                      <button onClick={() => setShowDeleteModal(emp.id)}
                        className="text-xs px-2 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        title="ลบพนักงาน">🗑️ ลบ</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">➕ เพิ่มพนักงานใหม่</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">รหัสพนักงาน *</label>
                <input value={newEmp.empNumber} onChange={(e) => setNewEmp({ ...newEmp, empNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="เช่น STD999" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">คำนำหน้า</label>
                <select value={newEmp.prefix} onChange={(e) => setNewEmp({ ...newEmp, prefix: e.target.value })}
                  className="w-full px-3 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
                  <option>นาย</option><option>นาง</option><option>นางสาว</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ชื่อ *</label>
                <input value={newEmp.firstName} onChange={(e) => setNewEmp({ ...newEmp, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="ชื่อจริง" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">นามสกุล</label>
                <input value={newEmp.lastName} onChange={(e) => setNewEmp({ ...newEmp, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="นามสกุล" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">แผนก</label>
                <input value={newEmp.dept} onChange={(e) => setNewEmp({ ...newEmp, dept: e.target.value })}
                  className="w-full px-3 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="เช่น ช่างทันตกรรม" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">ตำแหน่ง</label>
                <input value={newEmp.position} onChange={(e) => setNewEmp({ ...newEmp, position: e.target.value })}
                  className="w-full px-3 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="ตำแหน่ง" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">เงินเดือนพื้นฐาน</label>
                <input type="number" value={newEmp.baseSalary} onChange={(e) => setNewEmp({ ...newEmp, baseSalary: e.target.value })}
                  className="w-full px-3 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="0" />
              </div>
            </div>
            <p className="text-xs text-gray-400">รหัสผ่านเริ่มต้น: <span className="font-mono text-purple-600">"{DEFAULT_PASSWORD}"</span></p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowAddModal(false)}>ยกเลิก</Button>
              <Button className="flex-1" onClick={handleAddEmployee}>เพิ่มพนักงาน</Button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">🔑 รีเซ็ตรหัสผ่าน</h3>
            <p className="text-sm text-gray-500">
              รหัสผ่านใหม่จะถูกตั้งเป็น: <span className="font-mono text-purple-600 font-bold">"{DEFAULT_PASSWORD}"</span>
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowResetModal(null)}>ยกเลิก</Button>
              <Button className="flex-1" onClick={() => handleResetPassword(showResetModal)}>ยืนยัน</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteModal && (() => {
        const emp = employees.find((e) => e.id === showDeleteModal);
        if (!emp) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
              <h3 className="text-lg font-bold text-red-600">🗑️ ยืนยันการลบพนักงาน</h3>
              <p className="text-sm text-gray-500">
                คุณต้องการลบ <span className="font-semibold text-gray-900">{emp.name}</span> ({emp.empNumber}) หรือไม่?
              </p>
              <p className="text-xs text-red-500">การกระทำนี้ไม่สามารถย้อนกลับได้</p>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setShowDeleteModal(null)}>ยกเลิก</Button>
                <Button className="flex-1 bg-red-500 hover:bg-red-600" onClick={() => handleDelete(showDeleteModal)}>ลบพนักงาน</Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* View Password Modal */}
      {showPasswordModal && (() => {
        const emp = employees.find((e) => e.id === showPasswordModal);
        if (!emp) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-900">รหัสผ่านของ {emp.name}</h3>
              <div className="p-4 bg-purple-50 rounded-xl text-center">
                <p className="text-xs text-gray-500 mb-2">รหัสผ่านปัจจุบัน</p>
                <p className="text-2xl font-mono font-bold text-purple-700">{emp.plainPassword}</p>
              </div>
              <Button className="w-full" onClick={() => setShowPasswordModal(null)}>ปิด</Button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
