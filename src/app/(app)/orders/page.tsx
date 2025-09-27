"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomDatePicker } from "@/components/ui/datepicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import * as Tabs from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import { ImagePreviewModal } from "@/components/ui/image-preview-modal";
import { safeParseImageUrls } from "@/lib/json-utils";

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
    imageUrls: string | null;
    createdAt: string;
    updatedAt: string;
}

export default function OrderListPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [activeTab, setActiveTab] = useState("ongoing");
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [imageCache, setImageCache] = useState<{ [key: string]: string }>({});

    // Filter states
    const [statusFilter, setStatusFilter] = useState("all");
    const [queueFilter, setQueueFilter] = useState("");
    const [searchFilter, setSearchFilter] = useState("");
    const [pickupDateFilter, setPickupDateFilter] = useState<Date | null>(null);

    // Sorting states
    const [sortBy, setSortBy] = useState<"priority" | "pickupDate" | "queueNumber" | "price">("priority");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    // Collapse state for filter section
    const [isFilterSectionExpanded, setIsFilterSectionExpanded] = useState(false);

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

    // This font size management is now handled by FontSizeContext

    useEffect(() => {
        applyFilters();
    }, [statusFilter, queueFilter, searchFilter, pickupDateFilter, activeTab, orders, sortBy, sortOrder]);

    useEffect(() => {
        // Load images for all orders when orders change
        const loadImagesForOrders = async () => {
            const promises = orders.map(order => {
                if (order.imageUrls) {
                    return loadImageForOrder(order);
                }
                return Promise.resolve();
            });
            await Promise.all(promises);
        };

        if (orders.length > 0) {
            loadImagesForOrders();
        }
    }, [orders]);

    // เพิ่ม useEffect เพื่อรีเฟรชข้อมูลเมื่อกลับมาที่หน้านี้
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                // รีเฟรชข้อมูลเมื่อกลับมาที่หน้า
                const fetchOrders = async () => {
                    try {
                        const response = await fetch("/api/orders");
                        if (response.ok) {
                            const data = await response.json();
                            setOrders(data);
                            setFilteredOrders(data);
                            // ล้าง image cache เพื่อให้โหลดรูปใหม่
                            setImageCache({});
                        }
                    } catch (error) {
                        console.error("Error refreshing orders:", error);
                    }
                };

                fetchOrders();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

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

        // Apply sorting
        filtered.sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case "priority":
                    // จัดลำดับความสำคัญตามสถานะและวันนัดรับ
                    const priorityA = getPriorityScore(a);
                    const priorityB = getPriorityScore(b);
                    comparison = priorityA - priorityB;
                    break;

                case "pickupDate":
                    const dateA = new Date(a.pickupDate);
                    const dateB = new Date(b.pickupDate);
                    comparison = dateA.getTime() - dateB.getTime();
                    break;

                case "queueNumber":
                    comparison = a.queueNumber - b.queueNumber;
                    break;

                case "price":
                    comparison = a.price - b.price;
                    break;

                default:
                    comparison = 0;
            }

            return sortOrder === "asc" ? comparison : -comparison;
        });

        setFilteredOrders(filtered);
    };

    // ฟังก์ชันคำนวณคะแนนความสำคัญ
    const getPriorityScore = (order: Order) => {
        let score = 0;
        const today = new Date();
        const pickupDate = new Date(order.pickupDate);
        const daysUntilPickup = Math.ceil((pickupDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // สถานะการทำงาน (ยังไม่เริ่ม = สำคัญมาก, กำลังทำ = สำคัญปานกลาง)
        if (order.processingStatus === "not_started") {
            score += 100;
        } else if (order.processingStatus === "in_progress") {
            score += 50;
        }

        // วันนัดรับ (ยิ่งใกล้ยิ่งสำคัญ)
        if (daysUntilPickup <= 0) {
            score += 200; // เลยกำหนดแล้ว = สำคัญที่สุด
        } else if (daysUntilPickup <= 1) {
            score += 150; // วันนี้หรือพรุ่งนี้
        } else if (daysUntilPickup <= 3) {
            score += 100; // 2-3 วัน
        } else if (daysUntilPickup <= 7) {
            score += 50;  // สัปดาห์นี้
        }

        // การชำระเงิน (ยังไม่จ่าย = ลำดับต่ำกว่า)
        if (!order.paymentStatus) {
            score -= 10;
        }

        return score;
    };

    // ฟังก์ชันแสดงไอคอนความสำคัญ
    const getPriorityIcon = (order: Order) => {
        const score = getPriorityScore(order);

        if (score >= 250) {
            return <span className="text-red-600 text-lg" title={`คะแนนความสำคัญ: ${score}`}>🚨</span>; // ฉุกเฉิน
        } else if (score >= 150) {
            return <span className="text-orange-500 text-lg" title={`คะแนนความสำคัญ: ${score}`}>⚡</span>; // สำคัญมาก
        } else if (score >= 100) {
            return <span className="text-yellow-500 text-lg" title={`คะแนนความสำคัญ: ${score}`}>⭐</span>; // สำคัญ
        } else if (score >= 50) {
            return <span className="text-blue-500 text-lg" title={`คะแนนความสำคัญ: ${score}`}>📋</span>; // ปกติ
        } else {
            return <span className="text-gray-400 text-lg" title={`คะแนนความสำคัญ: ${score}`}>⭕</span>; // ความสำคัญต่ำ
        }
    };

    const resetFilters = () => {
        setStatusFilter("all");
        setQueueFilter("");
        setSearchFilter("");
        setPickupDateFilter(null);
        setSortBy("priority");
        setSortOrder("asc");
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
                return "bg-red-100 text-red-800 border border-red-200";
            case "in_progress":
                return "bg-orange-100 text-orange-800 border border-orange-200";
            case "completed":
                return "bg-green-100 text-green-800 border border-green-200";
            default:
                return "bg-gray-100 text-gray-800 border border-gray-200";
        }
    };

    const getPaymentStatusColor = (isPaid: boolean) => {
        return isPaid
            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
            : "bg-rose-100 text-rose-800 border border-rose-200";
    };

    const loadImageForOrder = async (order: Order) => {
        if (!order.imageUrls) return;

        try {
            const imageIds = JSON.parse(order.imageUrls);
            if (!Array.isArray(imageIds) || imageIds.length === 0) return;

            // หารูปแรกที่มีอยู่จริงในฐานข้อมูล
            for (const imageId of imageIds) {
                const imageIdStr = imageId.toString();

                // ถ้ามีใน cache แล้วให้ใช้เลย
                if (imageCache[imageIdStr]) {
                    return;
                }

                try {
                    const response = await fetch(`/api/images/${imageIdStr}`);
                    if (response.ok) {
                        const imageData = await response.json();
                        setImageCache(prev => ({
                            ...prev,
                            [imageIdStr]: imageData.dataUrl,
                            [`order_${order.id}_first`]: imageData.dataUrl // เก็บ reference ถึงรูปแรกของ order นี้
                        }));
                        return; // พอได้รูปแรกที่โหลดได้แล้วก็หยุด
                    }
                } catch (error) {
                    console.warn(`Failed to load image ${imageIdStr}:`, error);
                    continue; // ลองรูปต่ไป
                }
            }
        } catch (error) {
            console.error('Error loading image for order:', order.id, error);
        }
    };

    const getFirstImageUrl = (order: Order): string | null => {
        if (!order.imageUrls) return null;

        try {
            const imageIds = JSON.parse(order.imageUrls);
            if (!Array.isArray(imageIds) || imageIds.length === 0) return null;

            // ลองหารูปแรกที่มีอยู่ใน cache
            for (const imageId of imageIds) {
                const imageIdStr = imageId.toString();
                if (imageCache[imageIdStr]) {
                    return imageCache[imageIdStr];
                }
            }

            // ถ้าไม่เจอ ลองดูจาก order-specific cache
            const orderFirstImage = imageCache[`order_${order.id}_first`];
            if (orderFirstImage) {
                return orderFirstImage;
            }

            return null;
        } catch (error) {
            return null;
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
        <div className="container mx-auto py-4 px-2 sm:py-8 sm:px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">รายการเย็บผ้า</h1>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        onClick={() => {
                            // รีเฟรชข้อมูลและล้าง cache
                            setImageCache({});
                            const fetchOrders = async () => {
                                setIsLoading(true);
                                try {
                                    const response = await fetch("/api/orders");
                                    if (response.ok) {
                                        const data = await response.json();
                                        setOrders(data);
                                        setFilteredOrders(data);
                                    }
                                } catch (error) {
                                    console.error("Error refreshing orders:", error);
                                } finally {
                                    setIsLoading(false);
                                }
                            };
                            fetchOrders();
                        }}
                        className="hover:bg-gray-100 text-sm sm:text-base w-full sm:w-auto"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.01M20 4v5h-.01M4 20v-5h.01M20 20v-5h-.01M12 3v3m6.366-.366l-2.12 2.12M21 12h-3m-.366 6.366l-2.12-2.12M12 21v-3m-6.366-.366l2.12-2.12M3 12h3m.366-6.366l2.12 2.12" />
                        </svg>
                        <span className="hidden sm:inline">รีเฟรช</span>
                        <span className="sm:hidden">รีเฟรช</span>
                    </Button>
                    <Link href="/orders/new" className="w-full sm:w-auto">
                        <Button className="bg-violet-600 hover:bg-violet-700 text-sm sm:text-base w-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            <span className="hidden sm:inline">สร้างรายการใหม่</span>
                            <span className="sm:hidden">รายการใหม่</span>
                        </Button>
                    </Link>
                </div>
            </div>

            <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
                <Tabs.List className="flex border-b mb-4 sm:mb-6 bg-white rounded-t-lg overflow-hidden overflow-x-auto">
                    <Tabs.Trigger
                        value="ongoing"
                        className={cn(
                            "px-3 sm:px-6 py-2 sm:py-3 border-b-2 transition-colors font-medium text-sm sm:text-base whitespace-nowrap",
                            activeTab === "ongoing"
                                ? "border-violet-600 text-violet-600 bg-violet-50"
                                : "border-transparent hover:text-violet-600 hover:bg-violet-50/50"
                        )}
                    >
                        <span className="hidden sm:inline">กำลังดำเนินการ</span>
                        <span className="sm:hidden">กำลังทำ</span>
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="completed"
                        className={cn(
                            "px-3 sm:px-6 py-2 sm:py-3 border-b-2 transition-colors font-medium text-sm sm:text-base whitespace-nowrap",
                            activeTab === "completed"
                                ? "border-violet-600 text-violet-600 bg-violet-50"
                                : "border-transparent hover:text-violet-600 hover:bg-violet-50/50"
                        )}
                    >
                        <span className="hidden sm:inline">เสร็จสิ้นแล้ว</span>
                        <span className="sm:hidden">เสร็จแล้ว</span>
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="all"
                        className={cn(
                            "px-3 sm:px-6 py-2 sm:py-3 border-b-2 transition-colors font-medium text-sm sm:text-base whitespace-nowrap",
                            activeTab === "all"
                                ? "border-violet-600 text-violet-600 bg-violet-50"
                                : "border-transparent hover:text-violet-600 hover:bg-violet-50/50"
                        )}
                    >
                        ทั้งหมด
                    </Tabs.Trigger>
                </Tabs.List>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    {/* Collapsible Header */}
                    <div
                        className="flex items-center justify-between p-4 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
                        onClick={() => setIsFilterSectionExpanded(!isFilterSectionExpanded)}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-violet-100 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-base sm:text-lg font-medium text-gray-800">ค้นหา กรอง และเรียงลำดับรายการ</h2>
                                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                                    {isFilterSectionExpanded ? 'คลิกเพื่อซ่อนตัวเลือก' : 'คลิกเพื่อแสดงตัวเลือกการกรอง'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            {/* Filter Status Indicator */}
                            {(statusFilter !== "all" || queueFilter || searchFilter || pickupDateFilter || sortBy !== "priority" || sortOrder !== "asc") && (
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                                    <span className="text-xs text-violet-600 font-medium hidden sm:inline">
                                        กำลังกรอง
                                    </span>
                                </div>
                            )}
                            {/* Expand/Collapse Icon */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isFilterSectionExpanded ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {/* Collapsible Content */}
                    <div className={`transition-all duration-300 ease-in-out ${isFilterSectionExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                            {/* ส่วนการเรียงลำดับ */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-violet-50 rounded-lg border border-violet-200">
                                <div>
                                    <label className="block text-sm font-medium text-violet-700 mb-2">
                                        📊 เรียงลำดับตาม
                                    </label>
                                    <Select value={sortBy} onValueChange={(value: "priority" | "pickupDate" | "queueNumber" | "price") => setSortBy(value)}>
                                        <SelectTrigger className="bg-white border-violet-300 focus:border-violet-500 focus:ring-violet-500">
                                            <SelectValue placeholder="เลือกการเรียงลำดับ" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="priority">🎯 ความสำคัญ (แนะนำ)</SelectItem>
                                            <SelectItem value="pickupDate">📅 วันนัดรับ</SelectItem>
                                            <SelectItem value="queueNumber">🔢 หมายเลขคิว</SelectItem>
                                            <SelectItem value="price">💰 ราคา</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-violet-700 mb-2">
                                        🔄 ทิศทางการเรียง
                                    </label>
                                    <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
                                        <SelectTrigger className="bg-white border-violet-300 focus:border-violet-500 focus:ring-violet-500">
                                            <SelectValue placeholder="เลือกทิศทาง" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="asc">
                                                {sortBy === "priority" ? "⬆️ สำคัญมากก่อน" :
                                                    sortBy === "pickupDate" ? "⬆️ วันใกล้ก่อน" :
                                                        sortBy === "price" ? "⬆️ ราคาน้อยก่อน" : "⬆️ น้อยไปมาก"}
                                            </SelectItem>
                                            <SelectItem value="desc">
                                                {sortBy === "priority" ? "⬇️ สำคัญน้อยก่อน" :
                                                    sortBy === "pickupDate" ? "⬇️ วันไกลก่อน" :
                                                        sortBy === "price" ? "⬇️ ราคามากก่อน" : "⬇️ มากไปน้อย"}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ลูกค้า</label>
                                    <Input
                                        placeholder="ค้นหาตามชื่อ/เบอร์โทร"
                                        value={searchFilter}
                                        onChange={(e) => setSearchFilter(e.target.value)}
                                        className="bg-gray-50 border-gray-300 focus:border-violet-500 focus:ring-violet-500 text-sm sm:text-base"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">วันนัดรับ</label>
                                    <CustomDatePicker
                                        selected={pickupDateFilter}
                                        onChange={setPickupDateFilter}
                                        placeholderText="กรองตามวันรับ"
                                        className="bg-gray-50 text-sm sm:text-base"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                                <div className="text-sm text-gray-600 order-2 sm:order-1">
                                    {sortBy === "priority" && (
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 px-3 py-2 rounded-lg">
                                            <div className="flex items-start space-x-2">
                                                <span className="text-blue-600 mt-0.5">💡</span>
                                                <div>
                                                    <div className="text-blue-800 font-medium text-xs sm:text-sm">เรียงตามความสำคัญ</div>
                                                    <div className="text-blue-600 text-xs mt-0.5 hidden sm:block">
                                                        สถานะงาน + วันนัดรับ + การชำระเงิน
                                                    </div>
                                                    <div className="text-blue-600 text-xs mt-0.5 sm:hidden">
                                                        สถานะ + วันรับ + การชำระ
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={resetFilters}
                                    className="order-1 sm:order-2 bg-white hover:bg-red-50 border-red-200 text-red-600 hover:text-red-700 hover:border-red-300 transition-all duration-200 flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-lg shadow-sm w-full sm:w-auto"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span>ล้างตัวกรอง</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100 mt-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">ไม่พบรายการ</h3>
                        <p className="mt-1 text-sm text-gray-500">ลองปรับตัวกรองหรือสร้างรายการใหม่</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden lg:block overflow-x-auto mt-6">
                            <table className="min-w-full divide-y divide-gray-200 shadow-md rounded-lg overflow-hidden">
                                <thead className="bg-violet-100">
                                    <tr>
                                        {sortBy === "priority" && (
                                            <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-violet-800 uppercase tracking-wider">
                                                🎯
                                            </th>
                                        )}
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-violet-800 uppercase tracking-wider">
                                            คิว
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-violet-800 uppercase tracking-wider">
                                            รูปภาพ
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
                                            การชำระเงิน
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-violet-800 uppercase tracking-wider">
                                            สถานะ
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredOrders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={(e) => {
                                                // ป้องกันการนำทางเมื่อคลิกที่รูปภาพ
                                                if ((e.target as HTMLElement).closest('.image-preview-container')) {
                                                    return;
                                                }
                                                // นำทางไปหน้าแก้ไข
                                                window.location.href = `/orders/${order.id}`;
                                            }}
                                            title="คลิกเพื่อแก้ไขรายการนี้"
                                        >
                                            {sortBy === "priority" && (
                                                <td className="px-3 py-4 whitespace-nowrap text-center">
                                                    {getPriorityIcon(order)}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                                                #{order.queueNumber}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="image-preview-container">
                                                    {getFirstImageUrl(order) ? (
                                                        <div
                                                            className="relative h-12 w-12 rounded-md overflow-hidden cursor-pointer border border-gray-200 hover:border-violet-500 transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // ป้องกันการ trigger click event ของ row
                                                                setPreviewImage(getFirstImageUrl(order));
                                                            }}
                                                        >
                                                            <img
                                                                src={getFirstImageUrl(order)!}
                                                                alt="รูปภาพออเดอร์"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="h-12 w-12 rounded-md flex items-center justify-center bg-gray-100 text-gray-400">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
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
                                                <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-lg shadow-sm ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                    <span className="flex items-center">
                                                        {order.paymentStatus ? (
                                                            <>
                                                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                                ชำระแล้ว
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                </svg>
                                                                ยังไม่ชำระ
                                                            </>
                                                        )}
                                                    </span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-lg shadow-sm ${getStatusColor(order.processingStatus)}`}>
                                                    <span className="flex items-center">
                                                        {order.processingStatus === "not_started" && (
                                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5l-3 5a1 1 0 101.732 1L8 12.039l1.135 1.866a1 1 0 101.73-1.001l-3-5A1 1 0 0010 7z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                        {order.processingStatus === "in_progress" && (
                                                            <svg className="w-3 h-3 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 20l16-16" />
                                                            </svg>
                                                        )}
                                                        {order.processingStatus === "completed" && (
                                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                        {getStatusText(order.processingStatus)}
                                                    </span>
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden space-y-4 mt-6">
                            {filteredOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all"
                                    onClick={(e) => {
                                        // ป้องกันการนำทางเมื่อคลิกที่รูปภาพ
                                        if ((e.target as HTMLElement).closest('.image-preview-container')) {
                                            return;
                                        }
                                        window.location.href = `/orders/${order.id}`;
                                    }}
                                    title="แตะเพื่อแก้ไขรายการนี้"
                                >
                                    {/* Header with Queue Number and Priority */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-lg font-bold text-gray-800">#{order.queueNumber}</span>
                                                {sortBy === "priority" && (
                                                    <span className="text-lg">{getPriorityIcon(order)}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 text-xs leading-4 font-semibold rounded-full ${getStatusColor(order.processingStatus)}`}>
                                                {getStatusText(order.processingStatus)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Customer Info and Image */}
                                    <div className="flex items-start space-x-3 mb-3">
                                        <div className="image-preview-container">
                                            {getFirstImageUrl(order) ? (
                                                <div
                                                    className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden cursor-pointer border border-gray-200 hover:border-violet-500 transition-colors flex-shrink-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreviewImage(getFirstImageUrl(order));
                                                    }}
                                                >
                                                    <img
                                                        src={getFirstImageUrl(order)!}
                                                        alt="รูปภาพออเดอร์"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg flex items-center justify-center bg-gray-100 text-gray-400 flex-shrink-0">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-gray-900 text-base mb-1">{order.customerName}</div>
                                            <div className="text-sm text-gray-600 mb-2">{order.customerPhone}</div>
                                            <div className="text-sm text-gray-700 mb-1">
                                                <span className="font-medium">บริการ:</span> {order.serviceType}
                                            </div>
                                            <div className="text-sm text-gray-700">
                                                <span className="font-medium">นัดรับ:</span> {formatDate(order.pickupDate)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Status */}
                                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                        <span className={`px-3 py-1 text-xs leading-4 font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                                            {order.paymentStatus ? (
                                                <span className="flex items-center">
                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    ชำระแล้ว
                                                </span>
                                            ) : (
                                                <span className="flex items-center">
                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                    ยังไม่ชำระ
                                                </span>
                                            )}
                                        </span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </Tabs.Root>

            {/* Image Preview Modal */}
            {previewImage && (
                <ImagePreviewModal
                    imageUrl={previewImage}
                    isOpen={!!previewImage}
                    onClose={() => setPreviewImage(null)}
                />
            )}
        </div>
    );
}