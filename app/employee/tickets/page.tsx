'use client';
import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useTicketStore } from '@/stores/ticketStore';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';

export default function EmployeeTicketsPage() {
  const { currentUser } = useAuthStore();
  const tickets = useTicketStore((s) => s.getTicketsByEmp(currentUser?.empNumber ?? ''));
  const sorted = [...tickets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">คำขอของฉัน</h1>
        <p className="text-sm text-gray-500 mt-1">ติดตามสถานะคำขอทั้งหมด</p>
      </div>
      {sorted.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-gray-500">ยังไม่มีคำขอใดๆ</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {sorted.map((t) => (
            <Card key={t.id} padding="md">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{t.type === 'loan' ? '🏦' : '💸'}</span>
                    <span className="font-bold text-gray-900">{t.type === 'loan' ? 'คำขอกู้เงิน' : 'คำขอเบิกล่วงหน้า'}</span>
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="text-2xl font-bold text-purple-700 mt-1">{t.amount.toLocaleString('th-TH')} <span className="text-sm font-normal text-gray-500">บาท</span></p>
                  {t.reason && <p className="text-sm text-gray-500 mt-1">เหตุผล: {t.reason}</p>}
                  <p className="text-xs text-gray-400 mt-2">ส่งเมื่อ: {formatDate(t.createdAt)}</p>
                  {t.adminNote && (
                    <div className="mt-2 p-2 bg-purple-50 rounded-lg">
                      <p className="text-xs text-purple-600 font-medium">📝 หมายเหตุจากผู้ดูแล:</p>
                      <p className="text-xs text-gray-600">{t.adminNote}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'approved') return <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">อนุมัติ</span>;
  if (status === 'rejected') return <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">ไม่อนุมัติ</span>;
  return <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">รอดำเนินการ</span>;
}