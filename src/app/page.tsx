"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Navigation } from "@/components/navigation";

export default function Home() {
  return (
    <>
      <Navigation />
      
      {/* Hero section with gradient background */}
      <div className="bg-gradient-to-b from-violet-50 to-white py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-6 text-violet-700">
              ยินดีต้อนรับสู่ร้านเย็บผ้า
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              ระบบจัดการรายการเย็บผ้า ติดตามความคืบหน้า และรายงานรายได้อย่างง่ายดาย
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-violet-100 flex flex-col items-center card hover:border-violet-300">
              <div className="bg-violet-100 p-4 rounded-full mb-6 text-violet-700 text-2xl">
                ✂️
              </div>
              <h2 className="text-2xl font-semibold mb-4 text-violet-800">จัดการรายการเย็บผ้า</h2>
              <p className="text-gray-600 mb-8 text-center">
                สร้างรายการเย็บผ้าใหม่ ดูรายการทั้งหมด หรือแก้ไขรายการที่มีอยู่
              </p>
              <div className="mt-auto space-y-3 w-full">
                <Link href="/orders/new" className="block w-full">
                  <Button className="w-full" size="lg">สร้างรายการใหม่</Button>
                </Link>
                <Link href="/orders" className="block w-full">
                  <Button className="w-full" variant="outline" size="lg">ดูรายการทั้งหมด</Button>
                </Link>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-cyan-100 flex flex-col items-center card hover:border-cyan-300">
              <div className="bg-cyan-100 p-4 rounded-full mb-6 text-cyan-700 text-2xl">
                📊
              </div>
              <h2 className="text-2xl font-semibold mb-4 text-cyan-800">รายงานรายได้</h2>
              <p className="text-gray-600 mb-8 text-center">
                ดูรายงานรายได้ประจำวัน ประจำเดือน หรือประจำปี เพื่อวิเคราะห์ธุรกิจ
              </p>
              <div className="mt-auto w-full">
                <Link href="/reports" className="block w-full">
                  <Button className="w-full" variant="secondary" size="lg">ดูรายงาน</Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-16 bg-white p-8 rounded-2xl shadow-md border border-amber-200">
            <h3 className="text-2xl font-semibold mb-6 text-center text-amber-700">วิธีใช้งาน</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-amber-100 shadow-sm">
                <div className="bg-amber-200 w-12 h-12 rounded-full flex items-center justify-center text-amber-800 font-bold mb-3">1</div>
                <p className="text-amber-900 font-medium">สร้างรายการเย็บผ้าใหม่โดยการกรอกข้อมูลลูกค้าและรายละเอียดงาน</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-amber-100 shadow-sm">
                <div className="bg-amber-200 w-12 h-12 rounded-full flex items-center justify-center text-amber-800 font-bold mb-3">2</div>
                <p className="text-amber-900 font-medium">ติดตามสถานะงานและจัดการรายการที่มีอยู่ในหน้ารายการ</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-amber-100 shadow-sm">
                <div className="bg-amber-200 w-12 h-12 rounded-full flex items-center justify-center text-amber-800 font-bold mb-3">3</div>
                <p className="text-amber-900 font-medium">บันทึกการชำระเงินและสถานะการเย็บผ้า</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-amber-100 shadow-sm">
                <div className="bg-amber-200 w-12 h-12 rounded-full flex items-center justify-center text-amber-800 font-bold mb-3">4</div>
                <p className="text-amber-900 font-medium">ดูรายงานรายได้ประจำวัน เดือน หรือปี</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
