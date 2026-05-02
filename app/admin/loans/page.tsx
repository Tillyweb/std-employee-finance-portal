'use client';
import React, { useState } from 'react';
import { useLoanStore } from '@/stores/loanStore';
import { useActivityStore } from '@/stores/activityStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AdminLoansPage() {
  const loans = useLoanStore((s) => s.loans);
  const updateLoan = useLoanStore((s) => s.updateLoan);
  const addActivity = useActivityStore((s) => s.addActivity);
  const [editing, setEditing] = useState<string | null>(null);
  const [monthlyDeduction, setMonthlyDeduction] = useState(0);

  const handleSave = (empId: string) => {
    updateLoan(empId, { monthlyDeduction });
    const loan = loans.find((l) => l.empId === empId);
    addActivity({ icon: '✏️', description: `แก้ไขยอดหักเงินกู้: ${loan?.name} → ${monthlyDeduction.toLocaleString('th-TH')}/เดือน`, type: 'loan' });
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">บัญชีเงินกู้</h1>
        <p className="text-sm text-gray-500 mt-1">จัดการยอดเงินกู้และการหักรายเดือน</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-purple-50 text-center py-4"><p className="text-sm text-purple-500">จำนวนบัญชี</p><p className="text-2xl font-bold text-purple-700">{loans.length}</p></Card>
        <Card className="bg-fuchsia-50 text-center py-4"><p className="text-sm text-fuchsia-500">ยอดรวมคงเหลือ</p><p className="text-2xl font-bold text-fuchsia-700">{loans.reduce((s, l) => s + l.currentBalance, 0).toLocaleString('th-TH')} บาท</p></Card>
        <Card className="bg-green-50 text-center py-4"><p className="text-sm text-green-500">ชำระหมดแล้ว</p><p className="text-2xl font-bold text-green-700">{loans.filter((l) => l.status === 'paid_off').length}</p></Card>
      </div>
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white text-xs">
                <th className="px-4 py-3 font-semibold">รหัส</th><th className="px-4 py-3 font-semibold">ชื่อ-นามสกุล</th><th className="px-4 py-3 font-semibold">แผนก</th>
                <th className="px-4 py-3 text-center font-semibold">หัก/เดือน</th><th className="px-4 py-3 text-right font-semibold">ยอดคงเหลือ</th>
                <th className="px-4 py-3 text-center font-semibold">สถานะ</th><th className="px-4 py-3 text-center font-semibold">จัดการ</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loans.map((loan) => (
                <tr key={loan.empId} className="border-b border-purple-100 hover:bg-purple-50/50">
                  <td className="px-4 py-3 font-medium text-purple-700">{loan.empId}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{loan.name}</td>
                  <td className="px-4 py-3 text-gray-600">{loan.dept}</td>
                  <td className="px-4 py-3 text-center">
                    {editing === loan.empId ? (
                      <input type="number" value={monthlyDeduction} onChange={(e) => setMonthlyDeduction(Number(e.target.value))}
                        className="w-24 px-2 py-1 border border-purple-300 rounded text-center" />
                    ) : (
                      <span className="font-semibold text-purple-700">{loan.monthlyDeduction.toLocaleString('th-TH')}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">{loan.currentBalance.toLocaleString('th-TH')}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${loan.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {loan.status === 'active' ? 'กำลังผ่อน' : 'ชำระหมด'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {editing === loan.empId ? (
                      <div className="flex gap-1 justify-center">
                        <Button size="sm" onClick={() => handleSave(loan.empId)}>บันทึก</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>ยกเลิก</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => { setEditing(loan.empId); setMonthlyDeduction(loan.monthlyDeduction); }}>แก้ไข</Button>
                    )}
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