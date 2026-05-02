'use client';
import React, { useEffect, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useLoanStore } from '@/stores/loanStore';
import { useAdvanceStore } from '@/stores/advanceStore';
import { useTicketStore } from '@/stores/ticketStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatRelativeTime } from '@/lib/utils';
import { Wallet, CreditCard, Ticket, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function EmployeeDashboard() {
  const { currentUser } = useAuthStore();
  const isHydrated = useTicketStore((s) => s._hasHydrated);
  const initSeedData = useTicketStore((s) => s.initSeedData);
  useEffect(() => {
    if (isHydrated) initSeedData();
  }, [isHydrated, initSeedData]);
  const loan = useLoanStore((s) => s.getLoan(currentUser?.empNumber ?? ''));
  const advance = useAdvanceStore((s) => s.getAdvance(currentUser?.empNumber ?? ''));
  const allTickets = useTicketStore((s) => s.tickets);
  const tickets = useMemo(() => allTickets.filter((t) => t.empId === (currentUser?.empNumber ?? '')), [allTickets, currentUser?.empNumber]);
  const pendingCount = tickets.filter((t) => t.status === 'pending').length;
  const approvedCount = tickets.filter((t) => t.status === 'approved').length;
  const recentTickets = tickets.slice(-5).reverse();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-fuchsia-500 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">ยินดีต้อนรับ, {currentUser?.firstName}!</h1>
        <p className="text-purple-100 mt-1">ระบบจัดการสินเชื่อพนักงาน STD Dental Lab</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/employee/tickets/new?type=advance">
          <Button className="w-full h-20 text-left justify-start px-6" size="lg">
            <CreditCard className="w-5 h-5 mr-3" />
            <div><p className="font-semibold">💸 ขอเบิกเงินล่วงหน้า</p><p className="text-sm opacity-80">เบิกเงินล่วงหน้า 4 งวด</p></div>
          </Button>
        </Link>
        <Link href="/employee/tickets/new?type=loan">
          <Button variant="secondary" className="w-full h-20 text-left justify-start px-6" size="lg">
            <Wallet className="w-5 h-5 mr-3" />
            <div><p className="font-semibold">🏦 ขอกู้เงินใหม่</p><p className="text-sm opacity-70">ยื่นคำขอกู้เงิน</p></div>
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center"><Wallet className="w-6 h-6 text-white" /></div>
            <div>
              <p className="text-sm text-purple-500 font-medium">ยอดเงินกู้คงเหลือ</p>
              <p className="text-xl font-bold text-purple-700">{loan ? loan.currentBalance.toLocaleString('th-TH') : '0'} บาท</p>
              {loan && <p className="text-xs text-gray-400">หัก {loan.monthlyDeduction.toLocaleString('th-TH')}/เดือน</p>}
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-fuchsia-50 to-fuchsia-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-fuchsia-500 rounded-xl flex items-center justify-center"><CreditCard className="w-6 h-6 text-white" /></div>
            <div>
              <p className="text-sm text-fuchsia-500 font-medium">ยอดเบิกล่วงหน้าคงเหลือ</p>
              <p className="text-xl font-bold text-fuchsia-700">{advance ? advance.balance.toLocaleString('th-TH') : '0'} บาท</p>
              {advance && <p className="text-xs text-gray-400">{advance.installments.length}/4 งวด</p>}
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center"><CheckCircle className="w-6 h-6 text-white" /></div>
            <div>
              <p className="text-sm text-green-600 font-medium">สถานะคำขอ</p>
              <p className="text-xl font-bold text-green-700">{approvedCount} อนุมัติ</p>
              {pendingCount > 0 && <p className="text-xs text-orange-500">{pendingCount} รอดำเนินการ</p>}
            </div>
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">👤 ข้อมูลส่วนตัว</h3>
          <div className="space-y-3">
            <InfoRow label="รหัสพนักงาน" value={currentUser?.empNumber ?? '-'} />
            <InfoRow label="ชื่อ-นามสกุล" value={currentUser?.name ?? '-'} />
            <InfoRow label="แผนก" value={currentUser?.dept ?? '-'} />
            <InfoRow label="ตำแหน่ง" value={currentUser?.position ?? '-'} />
            <InfoRow label="เงินเดือนพื้นฐาน" value={currentUser?.baseSalary ? `${currentUser.baseSalary.toLocaleString('th-TH')} บาท` : '-'} />
          </div>
        </Card>
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Ticket className="w-5 h-5 text-purple-500" /> คำขอล่าสุด</h3>
            <Link href="/employee/tickets"><Button variant="ghost" size="sm">ดูทั้งหมด →</Button></Link>
          </div>
          {recentTickets.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">ยังไม่มีคำขอ</p>
          ) : (
            <div className="space-y-3">
              {recentTickets.map((t) => (
                <div key={t.id} className="p-3 bg-purple-50 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.type === 'loan' ? '🏦 ขอกู้เงิน' : '💸 ขอเบิกล่วงหน้า'} {t.amount.toLocaleString('th-TH')} บาท</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatRelativeTime(new Date(t.createdAt).getTime())}</p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between items-center py-2 border-b border-purple-50 last:border-0"><span className="text-sm text-gray-500">{label}</span><span className="text-sm font-medium text-gray-900">{value}</span></div>;
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'approved') return <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">อนุมัติ</span>;
  if (status === 'rejected') return <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">ไม่อนุมัติ</span>;
  return <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">รอดำเนินการ</span>;
}