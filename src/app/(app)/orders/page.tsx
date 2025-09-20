"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomDatePicker } from "@/components/ui/datepicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import Link from "next/link";
import * as Tabs from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

interface Order {
    id: number;
    queueNumber: number;
    customerName: string;
    customerPhone: string;
    serviceType: string;
    notes: string | null;
    pickupDate: string;
    price: number;
    paymentStatus: boolean;
    processingStatus: string;
    createdAt: string;
    updatedAt: string;
}

export default function OrderListPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [activeTab, setActiveTab] = useState("all");

    // Filter states
    const [statusFilter, setStatusFilter] = useState("all");
    const [queueFilter, setQueueFilter] = useState("");
    const [searchFilter, setSearchFilter] = useState("");
    const [pickupDateFilter, setPickupDateFilter] = useState<Date | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch("/api/orders");

                if (!response.ok) {
                    throw new Error("ไม่สามารถดึงข้อมูลรายการได้");
                }

                const data = await response.json();
                setOrders(data);
                setFilteredOrders(data);
            } catch (error) {
                console.error("Error fetching orders:", error);
                alert("เกิดข้อผิดพลาดในการดึงข้อมูล");
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [statusFilter, queueFilter, searchFilter, pickupDateFilter, activeTab, orders]);

    const applyFilters = () => {
        let filtered = [...orders];

        // Apply tab filter (completed vs ongoing)
        if (activeTab === "completed") {
            filtered = filtered.filter((order) => order.processingStatus === "completed");
        } else if (activeTab === "ongoing") {
            filtered = filtered.filter((order) => order.processingStatus !== "completed");
        }

        // Apply status filter
        if (statusFilter && statusFilter !== 'all') {
            filtered = filtered.filter((order) => order.processingStatus === statusFilter);
        }

        // Apply queue filter
        if (queueFilter) {
            filtered = filtered.filter((order) =>
                order.queueNumber.toString().includes(queueFilter)
            );
        }

        // Apply search filter (name/phone)
        if (searchFilter) {
            filtered = filtered.filter(
                (order) =>
                    order.customerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
                    order.customerPhone.includes(searchFilter)
            );
        }

        // Apply pickup date filter
        if (pickupDateFilter) {
            const filterDate = new Date(pickupDateFilter);
            filterDate.setHours(0, 0, 0, 0);

            filtered = filtered.filter((order) => {
                const orderDate = new Date(order.pickupDate);
                orderDate.setHours(0, 0, 0, 0);
                return orderDate.getTime() === filterDate.getTime();
            });
        }

        setFilteredOrders(filtered);
    };

    const resetFilters = () => {
        setStatusFilter("all");
        setQueueFilter("");
        setSearchFilter("");
        setPickupDateFilter(null);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "not_started":
                return "ยังไม่เริ่ม";
            case "in_progress":
                return "กำลังดำเนินการ";
            case "completed":
                return "เสร็จสิ้น";
            default:
                return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "not_started":
                return "bg-gray-100 text-gray-800";
            case "in_progress":
                return "bg-yellow-100 text-yellow-800";
            case "completed":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <h1 className="text-2xl font-bold mb-6">รายการเย็บผ้า</h1>
                <p>กำลังโหลดข้อมูล...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-800">รายการเย็บผ้า</h1>
                <Link href="/orders/new">
                    <Button className="bg-violet-600 hover:bg-violet-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        สร้างรายการใหม่
                    </Button>
                </Link>
            </div>

            <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
                <Tabs.List className="flex border-b mb-6 bg-white rounded-t-lg overflow-hidden">
                    <Tabs.Trigger
                        value="all"
                        className={cn(
                            "px-6 py-3 border-b-2 transition-colors font-medium",
                            activeTab === "all"
                                ? "border-violet-600 text-violet-600 bg-violet-50"
                                : "border-transparent hover:text-violet-600 hover:bg-violet-50/50"
                        )}
                    >
                        ทั้งหมด
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="ongoing"
                        className={cn(
                            "px-6 py-3 border-b-2 transition-colors font-medium",
                            activeTab === "ongoing"
                                ? "border-violet-600 text-violet-600 bg-violet-50"
                                : "border-transparent hover:text-violet-600 hover:bg-violet-50/50"
                        )}
                    >
                        กำลังดำเนินการ
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="completed"
                        className={cn(
                            "px-6 py-3 border-b-2 transition-colors font-medium",
                            activeTab === "completed"
                                ? "border-violet-600 text-violet-600 bg-violet-50"
                                : "border-transparent hover:text-violet-600 hover:bg-violet-50/50"
                        )}
                    >
                        เสร็จสิ้นแล้ว
                    </Tabs.Trigger>
                </Tabs.List>

                <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-100">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">ค้นหาและกรองรายการ</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ลูกค้า</label>
                            <Input
                                placeholder="ค้นหาตามชื่อ/เบอร์โทร"
                                value={searchFilter}
                                onChange={(e) => setSearchFilter(e.target.value)}
                                className="bg-gray-50 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">วันนัดรับ</label>
                            <CustomDatePicker
                                selected={pickupDateFilter}
                                onChange={setPickupDateFilter}
                                placeholderText="กรองตามวันรับ"
                                className="bg-gray-50"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            variant="outline"
                            onClick={resetFilters}
                            className="hover:bg-gray-100"
                        >
                            ล้างตัวกรอง
                        </Button>
                    </div>
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">ไม่พบรายการ</h3>
                        <p className="mt-1 text-sm text-gray-500">ลองปรับตัวกรองหรือสร้างรายการใหม่</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 shadow-md rounded-lg overflow-hidden">
                            <thead className="bg-violet-100">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-violet-800 uppercase tracking-wider">
                                        คิว
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-violet-800 uppercase tracking-wider">
                                        ลูกค้า
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-violet-800 uppercase tracking-wider">
                                        บริการ
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-violet-800 uppercase tracking-wider">
                                        วันนัดรับ
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-violet-800 uppercase tracking-wider">
                                        ราคา
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-violet-800 uppercase tracking-wider">
                                        สถานะ
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-violet-800 uppercase tracking-wider">
                                        การชำระเงิน
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-violet-800 uppercase tracking-wider">
                                        จัดการ
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                                            #{order.queueNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-800">{order.customerName}</div>
                                            <div className="text-xs text-gray-500">{order.customerPhone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {order.serviceType}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {formatDate(order.pickupDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-800">{order.price.toLocaleString()} บาท</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.processingStatus)}`}>
                                                {getStatusText(order.processingStatus)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${order.paymentStatus ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                {order.paymentStatus ? "จ่ายแล้ว" : "ยังไม่จ่าย"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link href={`/orders/${order.id}`}>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="hover:bg-violet-100 hover:text-violet-700 transition-colors"
                                                >
                                                    แก้ไข
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Tabs.Root>
        </div>
    );
}