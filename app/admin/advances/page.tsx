'use client';
import React from 'react';
import { useAdvanceStore } from '@/stores/advanceStore';
import { Card } from '@/components/ui/Card';

export default function AdminAdvancesPage() {
  const advances = useAdvanceStore((s) => s.advances);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">บัญชีเบิกล่วงหน้า</h1>
        <p className="text-sm text-gray-500 mt-1">ดูรายการเบิกล่วงหน้าของพนักงานทั้งหมด</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-fuchsia-50 text-center py-4"><p className="text-sm text-fuchsia-500">จำนวนบัญชี</p><p className="text-2xl font-bold text-fuchsia-700">{advances.length}</p></Card>
        <Card className="bg-purple-50 text-center py-4"><p className="text-sm text-purple-500">ยอดรวมเบิกไป</p><p className="text-2xl font-bold text-purple-700">{advances.reduce((s, a) => s + a.totalAdvanced, 0).toLocaleString('th-TH')} บาท</p></Card>
        <Card className="bg-green-50 text-center py-4"><p className="text-sm text-green-500">ยอดคงเหลือ</p><p className="text-2xl font-bold text-green-700">{advances.reduce((s, a) => s + a.balance, 0).toLocaleString('th-TH')} บาท</p></Card>
      </div>
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-gradient-to-r from-fuchsia-600 to-pink-400 text-white text-xs">
                <th className="px-4 py-3 font-semibold">รหัส</th><th className="px-4 py-3 font-semibold">ชื่อ-นามสกุล</th><th className="px-4 py-3 font-semibold">แผนก</th>
                <th className="px-4 py-3 text-center font-semibold">จำนวนงวด</th><th className="px-4 py-3 text-right font-semibold">ยอดเบิกรวม</th>
                <th className="px-4 py-3 text-right font-semibold">ยอดคงเหลือ</th><th className="px-4 py-3 text-center font-semibold">สถานะ</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {advances.map((adv) => (
                <tr key={adv.empId} className="border-b border-fuchsia-100 hover:bg-fuchsia-50/50">
                  <td className="px-4 py-3 font-medium text-fuchsia-700">{adv.empId}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{adv.name}</td>
                  <td className="px-4 py-3 text-gray-600">{adv.dept}</td>
                  <td className="px-4 py-3 text-center"><span className="text-sm font-semibold text-fuchsia-700">{adv.installments.length}/4 งวด</span></td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{adv.totalAdvanced.toLocaleString('th-TH')}</td>
                  <td className="px-4 py-3 text-right font-bold text-fuchsia-700">{adv.balance.toLocaleString('th-TH')}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${adv.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {adv.status === 'active' ? 'กำลังผ่อน' : 'ชำระหมด'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}