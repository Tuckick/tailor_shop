"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
    return (
        <div className="container mx-auto py-16 px-4">
            <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl font-bold mb-6">ยินดีต้อนรับสู่ร้านเย็บผ้า</h1>
                <p className="text-xl text-gray-600 mb-8">
                    ระบบจัดการรายการเย็บผ้า ติดตามความคืบหน้า และรายงานรายได้
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 flex flex-col items-center">
                        <h2 className="text-2xl font-semibold mb-4">จัดการรายการเย็บผ้า</h2>
                        <p className="text-gray-600 mb-6 text-center">
                            สร้างรายการเย็บผ้าใหม่ ดูรายการทั้งหมด หรือแก้ไขรายการที่มีอยู่
                        </p>
                        <div className="mt-auto space-y-3 w-full">
                            <Link href="/orders/new">
                                <Button className="w-full">สร้างรายการใหม่</Button>
                            </Link>
                            <Link href="/orders">
                                <Button className="w-full" variant="outline">ดูรายการทั้งหมด</Button>
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 flex flex-col items-center">
                        <h2 className="text-2xl font-semibold mb-4">รายงานรายได้</h2>
                        <p className="text-gray-600 mb-6 text-center">
                            ดูรายงานรายได้ประจำวัน ประจำเดือน หรือประจำปี
                        </p>
                        <div className="mt-auto w-full">
                            <Link href="/reports">
                                <Button className="w-full">ดูรายงาน</Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-gray-600">
                    <p className="mb-2">วิธีใช้งาน:</p>
                    <ol className="list-decimal text-left max-w-md mx-auto space-y-2">
                        <li>สร้างรายการเย็บผ้าใหม่โดยการกรอกข้อมูลลูกค้าและรายละเอียดงาน</li>
                        <li>ติดตามสถานะงานและจัดการรายการที่มีอยู่ในหน้ารายการ</li>
                        <li>บันทึกการชำระเงินและสถานะการเย็บผ้า</li>
                        <li>ดูรายงานรายได้ประจำวัน เดือน หรือปี</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}