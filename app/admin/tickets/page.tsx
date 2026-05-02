'use client';
import React, { useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useTicketStore } from '@/stores/ticketStore';
import { useLoanStore } from '@/stores/loanStore';
import { useAdvanceStore } from '@/stores/advanceStore';
import { useActivityStore } from '@/stores/activityStore';
import { useEmployeeStore } from '@/stores/employeeStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';

export default function AdminTicketsPage() {
  const { currentUser } = useAuthStore();
  const allTickets = useTicketStore((s) => s.tickets);
  const tickets = allTickets;
  const updateTicket = useTicketStore((s) => s.updateTicket);
  const addLoan = useLoanStore((s) => s.addLoan);
  const addInstallment = useAdvanceStore((s) => s.addInstallment);
  const addActivity = useActivityStore((s) => s.addActivity);
  const employees = useEmployeeStore((s) => s.employees);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  const pending = tickets.filter((t) => t.status === 'pending').sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const processed = tickets.filter((t) => t.status !== 'pending').sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const handleApprove = async (ticketId: string) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;
    updateTicket(ticketId, { status: 'approved', adminNote: adminNotes[ticketId] || '', processedAt: new Date().toISOString(), processedBy: currentUser?.empNumber });
    if (ticket.type === 'loan') {
      const emp = employees.find((e) => e.empNumber === ticket.empId);
      if (emp) {
        addLoan({ empId: ticket.empId, name: emp.name, dept: emp.dept, position: emp.position, monthlyDeduction: Math.min(1000, ticket.amount), previousBalance: 0, currentBalance: ticket.amount, status: 'active' });
      }
    } else {
      addInstallment(ticket.empId, ticket.amount);
    }
    const emp = employees.find((e) => e.empNumber === ticket.empId);
    addActivity({ icon: '✅', description: `อนุมัติ${ticket.type === 'loan' ? 'กู้เงิน' : 'เบิกล่วงหน้า'}ของ ${emp?.name ?? ticket.empId} ฿${ticket.amount.toLocaleString('th-TH')}`, type: 'ticket' });
  };

  const handleReject = async (ticketId: string) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    updateTicket(ticketId, { status: 'rejected', adminNote: adminNotes[ticketId] || '', processedAt: new Date().toISOString(), processedBy: currentUser?.empNumber });
    const emp = employees.find((e) => e.empNumber === ticket?.empId);
    addActivity({ icon: '❌', description: `ปฏิเสธ${ticket?.type === 'loan' ? 'กู้เงิน' : 'เบิกล่วงหน้า'}ของ ${emp?.name ?? ticket?.empId}`, type: 'ticket' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">จัดการคำขอทั้งหมด</h1>
        <p className="text-sm text-gray-500 mt-1">อนุมัติหรือปฏิเสธคำขอของพนักงาน</p>
      </div>
      {pending.length === 0 ? (
        <Card className="text-center py-10">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-gray-500">ไม่มีคำขอที่รอดำเนินการ</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">⏳ รอดำเนินการ ({pending.length})</h2>
          {pending.map((t) => {
            const emp = employees.find((e) => e.empNumber === t.empId);
            return (
              <Card key={t.id} className="border-l-4 border-l-yellow-400">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{t.type === 'loan' ? '🏦' : '💸'}</span>
                      <span className="font-bold text-gray-900">{t.type === 'loan' ? 'ขอกู้เงิน' : 'ขอเบิกล่วงหน้า'}</span>
                      <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">รอดำเนินการ</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-700">{t.amount.toLocaleString('th-TH')} บาท</p>
                    <p className="text-sm text-gray-600 mt-1">ผู้ยื่น: {emp?.name ?? t.empId} ({t.empId})</p>
                    {t.reason && <p className="text-sm text-gray-500 mt-1">เหตุผล: {t.reason}</p>}
                    <p className="text-xs text-gray-400 mt-2">ยื่นเมื่อ: {formatDate(t.createdAt)}</p>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <textarea value={adminNotes[t.id] || ''} onChange={(e) => setAdminNotes((p) => ({ ...p, [t.id]: e.target.value }))}
                      placeholder="หมายเหตุ (ถ้ามี)"
                      className="w-48 px-3 py-2 border border-purple-200 rounded-xl text-xs resize-none focus:outline-none focus:ring-2 focus:ring-purple-400" rows={2} />
                    <Button size="sm" onClick={() => handleApprove(t.id)}>✅ อนุมัติ</Button>
                    <Button size="sm" variant="danger" onClick={() => handleReject(t.id)}>❌ ไม่อนุมัติ</Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {processed.length > 0 && (
        <div className="space-y-4 mt-8">
          <h2 className="text-lg font-bold text-gray-900">📋 ดำเนินการแล้ว ({processed.length})</h2>
          {processed.map((t) => {
            const emp = employees.find((e) => e.empNumber === t.empId);
            return (
              <Card key={t.id} padding="sm">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{t.type === 'loan' ? '🏦' : '💸'}</span>
                    <div>
                      <p className="font-medium text-gray-900">{emp?.name ?? t.empId}</p>
                      <p className="text-sm text-gray-500">{t.amount.toLocaleString('th-TH')} บาท • {formatDate(t.createdAt)}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${t.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {t.status === 'approved' ? 'อนุมัติ' : 'ไม่อนุมัติ'}
                  </span>
                </div>
                {t.adminNote && <p className="text-xs text-gray-500 mt-2 ml-9">📝 {t.adminNote}</p>}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}