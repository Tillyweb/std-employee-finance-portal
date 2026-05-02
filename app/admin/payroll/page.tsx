'use client';
import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useLoanStore } from '@/stores/loanStore';
import { useAdvanceStore } from '@/stores/advanceStore';
import { useTicketStore } from '@/stores/ticketStore';
import { useActivityStore } from '@/stores/activityStore';
import { useEmployeeStore } from '@/stores/employeeStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function PayrollPage() {
  const { currentUser } = useAuthStore();
  const loans = useLoanStore((s) => s.loans);
  const advances = useAdvanceStore((s) => s.advances);
  const employees = useEmployeeStore((s) => s.employees);
  const deductLoan = useLoanStore((s) => s.deductFromLoan);
  const deductAdvance = useAdvanceStore((s) => s.deductFromAdvance);
  const updateTicket = useTicketStore((s) => s.updateTicket);
  const tickets = useTicketStore((s) => s.getAllTickets());
  const addActivity = useActivityStore((s) => s.addActivity);

  const monthKey = getCurrentMonthKey();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ loan: number; advance: number; total: number } | null>(null);
  const [alreadyRan, setAlreadyRan] = useState(false);

  // Get approved advance tickets not yet deducted this month
  const advanceTickets = tickets.filter(
    (t) => t.type === 'advance' && t.status === 'approved' && t.processedAt && t.processedAt.startsWith(monthKey)
  );

  // Get all active loan accounts
  const activeLoans = loans.filter((l) => l.status === 'active' && l.currentBalance > 0);
  const activeAdvances = advances.filter((a) => a.status === 'active' && a.balance > 0);

  const totalLoanDeduction = activeLoans.reduce((s, l) => s + Math.min(l.monthlyDeduction, l.currentBalance), 0);
  const totalAdvanceDeduction = activeAdvances.reduce((s, a) => s + a.balance, 0);

  const handleExecute = async () => {
    setRunning(true);
    setResult(null);

    let totalLoanDeducted = 0;
    let totalAdvanceDeducted = 0;

    // Deduct loans
    for (const loan of activeLoans) {
      const deductAmt = Math.min(loan.monthlyDeduction, loan.currentBalance);
      deductLoan(loan.empId, deductAmt);
      totalLoanDeducted += deductAmt;
    }

    // Deduct advances
    for (const adv of activeAdvances) {
      deductAdvance(adv.empId, adv.balance);
      totalAdvanceDeducted += adv.balance;
    }

    // Mark advance tickets as deducted
    for (const t of advanceTickets) {
      updateTicket(t.id, { adminNote: (t.adminNote || '') + ` [หักเงิน ฿${t.amount.toLocaleString('th-TH')} วันที่ 15 ${new Date().toLocaleDateString('th-TH')}]` });
    }

    addActivity({
      icon: '💸',
      description: `ดำเนินการหักเงินวันที่ 15 — เงินกู้ ฿${totalLoanDeducted.toLocaleString('th-TH')} | เบิกล่วงหน้า ฿${totalAdvanceDeducted.toLocaleString('th-TH')} | รวม ฿${(totalLoanDeducted + totalAdvanceDeducted).toLocaleString('th-TH')}`,
      type: 'payroll',
    });

    await new Promise((r) => setTimeout(r, 800));
    setResult({ loan: totalLoanDeducted, advance: totalAdvanceDeducted, total: totalLoanDeducted + totalAdvanceDeducted });
    setRunning(false);
    setAlreadyRan(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ดำเนินการหักเงินวันที่ 15</h1>
        <p className="text-sm text-gray-500 mt-1">จำลองการหักเงิน ณ วันที่ 15 ของเดือน — กดปุ่มด้านล่างเพื่อดำเนินการหักเงินจากเงินเดือน</p>
      </div>

      <Card className="bg-gradient-to-br from-purple-50 to-fuchsia-50">
        <div className="text-center mb-4">
          <div className="text-5xl mb-2">📅</div>
          <h2 className="text-xl font-bold text-gray-900">วันที่ 15 เดือน {new Date().toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}</h2>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-xl p-4 text-center shadow">
            <p className="text-sm text-gray-500">บัญชีเงินกู้</p>
            <p className="text-2xl font-bold text-purple-700">{activeLoans.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow">
            <p className="text-sm text-gray-500">บัญชีเบิกล่วงหน้า</p>
            <p className="text-2xl font-bold text-fuchsia-700">{activeAdvances.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow">
            <p className="text-sm text-gray-500">ยอดหักรวม</p>
            <p className="text-2xl font-bold text-green-700">{((totalLoanDeduction) + totalAdvanceDeduction).toLocaleString('th-TH')}</p>
          </div>
        </div>

        {alreadyRan || result ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
            <p className="text-green-700 font-semibold text-center">✅ ดำเนินการหักเงินเรียบร้อยแล้ว</p>
            {result && (
              <>
                <div className="flex justify-between text-sm"><span className="text-gray-600">หักเงินกู้รายเดือน</span><span className="font-bold text-purple-700">{result.loan.toLocaleString('th-TH')} บาท</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">หักเบิกล่วงหน้า</span><span className="font-bold text-fuchsia-700">{result.advance.toLocaleString('th-TH')} บาท</span></div>
                <div className="flex justify-between text-sm border-t border-green-200 pt-2 mt-2"><span className="font-semibold text-gray-700">รวมทั้งสิ้น</span><span className="font-bold text-green-700">{result.total.toLocaleString('th-TH')} บาท</span></div>
              </>
            )}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-yellow-800 text-center">
              ⚠️ กดปุ่มด้านล่างเพื่อยืนยันการหักเงิน ระบบจะหักเงินจากบัญชีที่มียอดคงเหลือทุกคน
            </p>
          </div>
        )}

        {!alreadyRan && !result && (
          <Button onClick={handleExecute} loading={running} className="w-full" size="lg">
            💸 ดำเนินการหักเงิน
          </Button>
        )}
        {(alreadyRan || result) && (
          <Button variant="secondary" onClick={() => { setResult(null); setAlreadyRan(false); }} className="w-full">
            🔄 รีเซ็ต / ดำเนินการใหม่
          </Button>
        )}
      </Card>

      {/* Preview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card padding="none">
          <div className="px-4 py-3 bg-purple-50 border-b border-purple-100">
            <h3 className="text-sm font-bold text-purple-700">🏦 รายการหักเงินกู้ ({activeLoans.length} บัญชี)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 bg-gray-50">
                  <th className="px-4 py-2 text-left">พนักงาน</th>
                  <th className="px-4 py-2 text-right">ยอดคงเหลือ</th>
                  <th className="px-4 py-2 text-right">หัก/เดือน</th>
                </tr>
              </thead>
              <tbody>
                {activeLoans.map((l) => {
                  const emp = employees.find((e) => e.empNumber === l.empId);
                  const deductAmt = Math.min(l.monthlyDeduction, l.currentBalance);
                  return (
                    <tr key={l.empId} className="border-t border-purple-50">
                      <td className="px-4 py-2">{emp?.name ?? l.empId}</td>
                      <td className="px-4 py-2 text-right font-medium">{l.currentBalance.toLocaleString('th-TH')}</td>
                      <td className="px-4 py-2 text-right text-purple-600 font-semibold">{deductAmt.toLocaleString('th-TH')}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-purple-50 font-bold">
                  <td className="px-4 py-2">รวม</td>
                  <td className="px-4 py-2 text-right">{activeLoans.reduce((s, l) => s + l.currentBalance, 0).toLocaleString('th-TH')}</td>
                  <td className="px-4 py-2 text-right text-purple-700">{totalLoanDeduction.toLocaleString('th-TH')}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        <Card padding="none">
          <div className="px-4 py-3 bg-fuchsia-50 border-b border-fuchsia-100">
            <h3 className="text-sm font-bold text-fuchsia-700">💸 รายการหักเบิกล่วงหน้า ({activeAdvances.length} บัญชี)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 bg-gray-50">
                  <th className="px-4 py-2 text-left">พนักงาน</th>
                  <th className="px-4 py-2 text-right">ยอดเบิกคงเหลือ</th>
                  <th className="px-4 py-2 text-right">งวดที่</th>
                </tr>
              </thead>
              <tbody>
                {activeAdvances.map((a) => {
                  const emp = employees.find((e) => e.empNumber === a.empId);
                  return (
                    <tr key={a.empId} className="border-t border-fuchsia-50">
                      <td className="px-4 py-2">{emp?.name ?? a.empId}</td>
                      <td className="px-4 py-2 text-right font-medium">{a.balance.toLocaleString('th-TH')}</td>
                      <td className="px-4 py-2 text-right text-fuchsia-600">{a.installments.length}/4</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-fuchsia-50 font-bold">
                  <td className="px-4 py-2">รวม</td>
                  <td className="px-4 py-2 text-right">{activeAdvances.reduce((s, a) => s + a.balance, 0).toLocaleString('th-TH')}</td>
                  <td className="px-4 py-2 text-right"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
