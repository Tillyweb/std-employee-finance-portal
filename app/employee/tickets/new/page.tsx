'use client';
import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useTicketStore } from '@/stores/ticketStore';
import { useActivityStore } from '@/stores/activityStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const MAX_LOAN = 50000;

export default function NewTicketPage() {
  const searchParams = useSearchParams();
  const initialType = (searchParams.get('type') as 'loan' | 'advance') || 'loan';
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const addTicket = useTicketStore((s) => s.addTicket);
  const addActivity = useActivityStore((s) => s.addActivity);
  const [type, setType] = useState<'loan' | 'advance'>(initialType);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const numAmount = Number(amount);
    if (!amount || numAmount <= 0) return;
    if (type === 'loan' && numAmount > MAX_LOAN) {
      setError(`วงเงินกู้สูงสุด ${MAX_LOAN.toLocaleString('th-TH')} บาท ต่อครั้ง`);
      return;
    }
    setSubmitting(true);
    addTicket({ empId: currentUser!.empNumber, type, amount: numAmount, reason: reason.trim(), status: 'pending' });
    addActivity({ icon: '📝', description: `${currentUser?.name} ยื่นคำขอ${type === 'loan' ? 'กู้เงิน' : 'เบิกล่วงหน้า'} ฿${numAmount.toLocaleString('th-TH')}`, type: 'ticket' });
    await new Promise((r) => setTimeout(r, 500));
    router.push('/employee/tickets');
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ยื่นคำขอใหม่</h1>
        <p className="text-sm text-gray-500 mt-1">กรอกรายละเอียดคำขอของคุณ</p>
      </div>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทคำขอ</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setType('loan')} className={`p-4 rounded-xl border-2 transition-all ${type === 'loan' ? 'border-purple-500 bg-purple-50' : 'border-purple-200 bg-white hover:bg-purple-50'}`}>
                <div className="text-2xl mb-1">🏦</div>
                <p className="font-semibold text-gray-900">ขอกู้เงิน</p>
                <p className="text-xs text-gray-500 mt-1">สูงสุด ฿50,000</p>
              </button>
              <button type="button" onClick={() => setType('advance')} className={`p-4 rounded-xl border-2 transition-all ${type === 'advance' ? 'border-fuchsia-500 bg-fuchsia-50' : 'border-fuchsia-200 bg-white hover:bg-fuchsia-50'}`}>
                <div className="text-2xl mb-1">💸</div>
                <p className="font-semibold text-gray-900">ขอเบิกล่วงหน้า</p>
                <p className="text-xs text-gray-500 mt-1">เบิกได้ 4 งวด</p>
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนเงิน (บาท)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(''); }}
              min="1"
              max={type === 'loan' ? MAX_LOAN : undefined}
              required
              placeholder="0"
              className="w-full px-4 py-2.5 border border-purple-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            {type === 'loan' && <p className="text-xs text-purple-400 mt-1">วงเงินกู้สูงสุด ฿50,000 ต่อครั้ง</p>}
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เหตุผล / หมายเหตุ</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="ระบุเหตุผลหรือหมายเหตุ (ถ้ามี)"
              className="w-full px-4 py-2.5 border border-purple-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
              rows={4}
            />
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-800">⚠️ วงเงินกู้สูงสุด ฿50,000 ต่อครั้ง | คำขอจะถูกส่งให้ผู้ดูแลระบบพิจารณา</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" type="button" onClick={() => router.back()} className="flex-1">ยกเลิก</Button>
            <Button type="submit" loading={submitting} className="flex-1">ส่งคำขอ</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
