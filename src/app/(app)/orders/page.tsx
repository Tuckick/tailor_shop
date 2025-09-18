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
    const [statusFilter, setStatusFilter] = useState("");
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
        if (statusFilter) {
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
        setStatusFilter("");
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
                return "bg-gray-200";
            case "in_progress":
                return "bg-yellow-200";
            case "completed":
                return "bg-green-200";
            default:
                return "bg-gray-200";
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
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">รายการเย็บผ้า</h1>
                <Link href="/orders/new">
                    <Button>สร้างรายการใหม่</Button>
                </Link>
            </div>

            <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
                <Tabs.List className="flex border-b mb-6">
                    <Tabs.Trigger
                        value="all"
                        className={cn(
                            "px-4 py-2 border-b-2 transition-colors",
                            activeTab === "all"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent hover:text-blue-600"
                        )}
                    >
                        ทั้งหมด
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="ongoing"
                        className={cn(
                            "px-4 py-2 border-b-2 transition-colors",
                            activeTab === "ongoing"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent hover:text-blue-600"
                        )}
                    >
                        กำลังดำเนินการ
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="completed"
                        className={cn(
                            "px-4 py-2 border-b-2 transition-colors",
                            activeTab === "completed"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent hover:text-blue-600"
                        )}
                    >
                        เสร็จสิ้นแล้ว
                    </Tabs.Trigger>
                </Tabs.List>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger aria-label="กรองตามสถานะ">
                                <SelectValue placeholder="กรองตามสถานะ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">ทั้งหมด</SelectItem>
                                <SelectItem value="not_started">ยังไม่เริ่ม</SelectItem>
                                <SelectItem value="in_progress">กำลังดำเนินการ</SelectItem>
                                <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Input
                            placeholder="ค้นหาตามคิว"
                            value={queueFilter}
                            onChange={(e) => setQueueFilter(e.target.value)}
                        />
                    </div>

                    <div>
                        <Input
                            placeholder="ค้นหาตามชื่อ/เบอร์โทร"
                            value={searchFilter}
                            onChange={(e) => setSearchFilter(e.target.value)}
                        />
                    </div>

                    <div>
                        <CustomDatePicker
                            selected={pickupDateFilter}
                            onChange={setPickupDateFilter}
                            placeholderText="กรองตามวันรับ"
                        />
                    </div>
                </div>

                <div className="flex justify-end mb-4">
                    <Button variant="outline" onClick={resetFilters}>
                        ล้างตัวกรอง
                    </Button>
                </div>

                {filteredOrders.length === 0 ? (
                    <p className="text-center py-8">ไม่พบรายการ</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        คิว
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ลูกค้า
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        บริการ
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        วันนัดรับ
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ราคา
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        สถานะ
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        การชำระเงิน
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        จัดการ
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {order.queueNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>{order.customerName}</div>
                                            <div className="text-xs">{order.customerPhone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.serviceType}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(order.pickupDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.price.toLocaleString()} บาท
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.processingStatus)}`}>
                                                {getStatusText(order.processingStatus)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.paymentStatus ? "จ่ายแล้ว" : "ยังไม่จ่าย"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link href={`/orders/${order.id}`}>
                                                <Button variant="secondary" size="sm">
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