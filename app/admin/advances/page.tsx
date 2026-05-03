'use client';
import React, { useState } from 'react';
import { useAdvanceStore } from '@/stores/advanceStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AdminAdvancesPage() {
  const advances = useAdvanceStore((s) => s.advances);
  const updateAdvance = useAdvanceStore((s) => s.updateAdvance);
  const deleteAdvance = useAdvanceStore((s) => s.deleteAdvance);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');

  const handleEdit = (adv: typeof advances[0]) => {
    setEditingId(adv.empId);
    setEditAmount(adv.totalAdvanced.toString());
  };

  const handleSave = (empId: string) => {
    const newAmount = parseInt(editAmount);
    if (!isNaN(newAmount) && newAmount > 0) {
      updateAdvance(empId, { totalAdvanced: newAmount, balance: newAmount });
    }
    setEditingId(null);
  };

  const handleDelete = (empId: string) => {
    if (confirm('ยืนยันการลบบัญชีเบิกล่วงหน้า?')) {
      deleteAdvance(empId);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">บัญชีเบิกล่วงหน้า</h1>
        <p className="text-sm text-gray-500 mt-1">ดูรายการเบิกล่วงหน้าของพนักงานทั้งหมด • หักทุกวันเงินเดือน</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-fuchsia-50 text-center py-4"><p className="text-sm text-fuchsia-500">จำนวนบัญชี</p><p className="text-2xl font-bold text-fuchsia-700">{advances.length}</p></Card>
        <Card className="bg-purple-50 text-center py-4"><p className="text-sm text-purple-500">ยอดรวมเบิกไป</p><p className="text-2xl font-bold text-purple-700">{advances.reduce((s, a) => s + a.totalAdvanced, 0).toLocaleString('th-TH')} บาท</p></Card>
      </div>
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="bg-gradient-to-r from-fuchsia-600 to-pink-400 text-white text-xs">
                <th className="px-4 py-3 font-semibold">รหัส</th>
                <th className="px-4 py-3 font-semibold">ชื่อ-นามสกุล</th>
                <th className="px-4 py-3 font-semibold">แผนก</th>
                <th className="px-4 py-3 text-right font-semibold">ยอดเบิกรวม</th>
                <th className="px-4 py-3 text-center font-semibold">จัดการ</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {advances.map((adv) => (
                <tr key={adv.empId} className="border-b border-fuchsia-100 hover:bg-fuchsia-50/50">
                  <td className="px-4 py-3 font-medium text-fuchsia-700">{adv.empId}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{adv.name}</td>
                  <td className="px-4 py-3 text-gray-600">{adv.dept}</td>
                  <td className="px-4 py-3 text-right">
                    {editingId === adv.empId ? (
                      <input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="w-28 px-2 py-1 border border-fuchsia-300 rounded text-right text-sm"
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium text-gray-900">{adv.totalAdvanced.toLocaleString('th-TH')}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {editingId === adv.empId ? (
                        <>
                          <button onClick={() => handleSave(adv.empId)} className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">บันทึก</button>
                          <button onClick={() => setEditingId(null)} className="text-xs bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500">ยกเลิก</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(adv)} className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">แก้ไข</button>
                          <button onClick={() => handleDelete(adv.empId)} className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">ลบ</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {advances.length === 0 && (
            <div className="text-center py-8 text-gray-400">ยังไม่มีรายการเบิกล่วงหน้า</div>
          )}
        </div>
      </Card>
    </div>
  );
}