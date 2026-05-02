'use client';
import React, { useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useEmployeeStore } from '@/stores/employeeStore';
import { useTicketStore } from '@/stores/ticketStore';
import { Card } from '@/components/ui/Card';
import { Users, Ticket, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { currentUser } = useAuthStore();
  const employees = useEmployeeStore((s) => s.employees);
  const allTickets = useTicketStore((s) => s.tickets);
  const tickets = allTickets;
  const pending = tickets.filter((t) => t.status === 'pending').length;
  const approved = tickets.filter((t) => t.status === 'approved').length;
  const rejected = tickets.filter((t) => t.status === 'rejected').length;
  const activeEmployees = employees.filter((e) => e.status === 'active').length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-fuchsia-500 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">ยินดีต้อนรับ, {currentUser?.name}!</h1>
        <p className="text-purple-100 mt-1">ผู้ดูแลระบบ STD Dental Lab Finance Portal</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 text-center py-5">
          <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-purple-700">{activeEmployees}</p>
          <p className="text-sm text-gray-500 mt-1">พนักงานทั้งหมด</p>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 text-center py-5">
          <Ticket className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-yellow-700">{pending}</p>
          <p className="text-sm text-gray-500 mt-1">รอดำเนินการ</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 text-center py-5">
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-green-700">{approved}</p>
          <p className="text-sm text-gray-500 mt-1">อนุมัติแล้ว</p>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 text-center py-5">
          <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-red-700">{rejected}</p>
          <p className="text-sm text-gray-500 mt-1">ไม่อนุมัติ</p>
        </Card>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link href="/admin/employees"><Card className="hover:shadow-lg transition-shadow cursor-pointer"><Users className="w-6 h-6 text-purple-500 mb-2" /><p className="font-semibold text-gray-900">พนักงาน</p></Card></Link>
        <Link href="/admin/tickets"><Card className="hover:shadow-lg transition-shadow cursor-pointer"><Ticket className="w-6 h-6 text-purple-500 mb-2" /><p className="font-semibold text-gray-900">คำขอทั้งหมด</p></Card></Link>
        <Link href="/admin/loans"><Card className="hover:shadow-lg transition-shadow cursor-pointer"><div className="text-2xl mb-1">🏦</div><p className="font-semibold text-gray-900">บัญชีเงินกู้</p></Card></Link>
        <Link href="/admin/advances"><Card className="hover:shadow-lg transition-shadow cursor-pointer"><div className="text-2xl mb-1">💸</div><p className="font-semibold text-gray-900">บัญชีเบิกล่วงหน้า</p></Card></Link>
        <Link href="/admin/payroll"><Card className="hover:shadow-lg transition-shadow cursor-pointer"><div className="text-2xl mb-1">📅</div><p className="font-semibold text-gray-900">หักเงินวันที่ 15</p></Card></Link>
      </div>
      {pending > 0 && (
        <Card className="border-yellow-300 bg-yellow-50">
          <div className="flex items-center gap-3">
            <div className="text-3xl">⚠️</div>
            <div>
              <p className="font-semibold text-yellow-800">มี {pending} คำขอที่รอดำเนินการ</p>
              <p className="text-sm text-yellow-600">กรุณาตรวจสอบและดำเนินการ</p>
              <Link href="/admin/tickets"><span className="text-sm text-purple-600 font-medium underline mt-1 inline-block">ไปหน้าคำขอ →</span></Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}