"use client";

import { Button } from "@/components/ui/button";
import { CustomDatePicker } from "@/components/ui/datepicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

interface Order {
    id: number;
    queueNumber: number;
    customerName: string;
    serviceType: string;
    price: number;
    createdAt: string;
}

interface DailyData {
    date: string;
    income: number;
    count: number;
}

interface MonthlyData {
    month: number;
    income: number;
    count: number;
}

interface Report {
    date?: string;
    year?: number;
    month?: number;
    totalIncome: number;
    dailyBreakdown?: DailyData[];
    monthlyBreakdown?: MonthlyData[];
    totalOrders?: number;
    orders?: Order[];
}

export default function FinancialReportPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("daily");
    const [report, setReport] = useState<Report | null>(null);

    // Filter states
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    useEffect(() => {
        fetchReport();
    }, [activeTab, selectedDate]);

    const fetchReport = async () => {
        setIsLoading(true);

        try {
            // Format date to YYYY-MM-DD
            const formattedDate = selectedDate.toISOString().split('T')[0];

            const response = await fetch(`/api/reports/income?period=${activeTab}&date=${formattedDate}`);

            if (!response.ok) {
                throw new Error("ไม่สามารถดึงข้อมูลรายงานได้");
            }

            const data = await response.json();
            setReport(data);
        } catch (error) {
            console.error("Error fetching report:", error);
            alert("เกิดข้อผิดพลาดในการดึงข้อมูลรายงาน");
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 2,
        });
    };

    const formatMonth = (monthIndex: number) => {
        const date = new Date();
        date.setMonth(monthIndex - 1);
        return date.toLocaleDateString('th-TH', { month: 'long' });
    };

    const getDatePickerLabel = () => {
        if (activeTab === "daily") {
            return "เลือกวัน";
        } else if (activeTab === "monthly") {
            return "เลือกเดือน";
        } else {
            return "เลือกปี";
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-800">รายงานรายได้</h1>
            </div>

            <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
                <Tabs.List className="flex border-b mb-6 bg-white rounded-t-lg overflow-hidden">
                    <Tabs.Trigger
                        value="daily"
                        className={cn(
                            "px-6 py-3 border-b-2 transition-colors font-medium",
                            activeTab === "daily"
                                ? "border-violet-600 text-violet-600 bg-violet-50"
                                : "border-transparent hover:text-violet-600 hover:bg-violet-50/50"
                        )}
                    >
                        รายวัน
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="monthly"
                        className={cn(
                            "px-6 py-3 border-b-2 transition-colors font-medium",
                            activeTab === "monthly"
                                ? "border-violet-600 text-violet-600 bg-violet-50"
                                : "border-transparent hover:text-violet-600 hover:bg-violet-50/50"
                        )}
                    >
                        รายเดือน
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="yearly"
                        className={cn(
                            "px-6 py-3 border-b-2 transition-colors font-medium",
                            activeTab === "yearly"
                                ? "border-violet-600 text-violet-600 bg-violet-50"
                                : "border-transparent hover:text-violet-600 hover:bg-violet-50/50"
                        )}
                    >
                        รายปี
                    </Tabs.Trigger>
                </Tabs.List>

                <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-100">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">ค้นหาข้อมูลรายงาน</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{getDatePickerLabel()}</label>
                            <CustomDatePicker
                                selected={selectedDate}
                                onChange={(date) => date && setSelectedDate(date)}
                                placeholderText={getDatePickerLabel()}
                                showMonthYearPicker={activeTab === "monthly"}
                                showYearPicker={activeTab === "yearly"}
                                dateFormat={
                                    activeTab === "daily"
                                        ? "dd/MM/yyyy"
                                        : activeTab === "monthly"
                                            ? "MM/yyyy"
                                            : "yyyy"
                                }
                            />
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="py-16 text-center bg-white rounded-lg shadow-sm border border-gray-100">
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="rounded-full bg-violet-100 h-12 w-12 mb-4"></div>
                            <div className="h-4 bg-violet-100 rounded w-1/4 mb-2"></div>
                            <div className="h-3 bg-gray-100 rounded w-1/3"></div>
                        </div>
                        <p className="mt-4 text-gray-500">กำลังโหลดข้อมูล...</p>
                    </div>
                ) : (
                    <>
                        {!report ? (
                            <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="mt-2 text-lg font-medium text-gray-900">ไม่พบข้อมูล</h3>
                                <p className="mt-1 text-sm text-gray-500">โปรดเลือกช่วงเวลาอื่น</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="bg-violet-50 p-6 rounded-lg shadow-sm border border-violet-100">
                                    <h2 className="text-xl font-bold mb-2">สรุปรายได้</h2>
                                    <div className="text-3xl font-bold text-violet-700">
                                        {formatCurrency(report.totalIncome)}
                                    </div>
                                    {report.totalOrders !== undefined && (
                                        <div className="text-sm text-gray-600 mt-1">
                                            จำนวนรายการ: {report.totalOrders} รายการ
                                        </div>
                                    )}
                                </div>

                                <Tabs.Content value="daily" className="space-y-6">
                                    {report.orders && report.orders.length > 0 ? (
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
                                                            วันที่
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-violet-800 uppercase tracking-wider">
                                                            ราคา
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {report.orders.map((order) => (
                                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                                                                #{order.queueNumber}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm font-medium text-gray-800">{order.customerName}</div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                                {order.serviceType}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                                {formatDate(order.createdAt)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-800 text-right">
                                                                {formatCurrency(order.price)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <h3 className="mt-2 text-lg font-medium text-gray-900">ไม่พบข้อมูลรายการ</h3>
                                            <p className="mt-1 text-sm text-gray-500">ไม่พบข้อมูลรายการในวันที่เลือก</p>
                                        </div>
                                    )}
                                </Tabs.Content>

                                <Tabs.Content value="monthly" className="space-y-6">
                                    {report.dailyBreakdown && report.dailyBreakdown.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 shadow-md rounded-lg overflow-hidden">
                                                <thead className="bg-violet-100">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-violet-800 uppercase tracking-wider">
                                                            วันที่
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-violet-800 uppercase tracking-wider">
                                                            จำนวนรายการ
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-violet-800 uppercase tracking-wider">
                                                            รายได้
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {report.dailyBreakdown.map((day, index) => (
                                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                                                {formatDate(day.date)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                                <span className="px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-800 font-medium">
                                                                    {day.count} รายการ
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-800 text-right">
                                                                {formatCurrency(day.income)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <h3 className="mt-2 text-lg font-medium text-gray-900">ไม่พบข้อมูลรายการ</h3>
                                            <p className="mt-1 text-sm text-gray-500">ไม่พบข้อมูลรายการในเดือนที่เลือก</p>
                                        </div>
                                    )}
                                </Tabs.Content>

                                <Tabs.Content value="yearly" className="space-y-6">
                                    {report.monthlyBreakdown && report.monthlyBreakdown.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 shadow-md rounded-lg overflow-hidden">
                                                <thead className="bg-violet-100">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-violet-800 uppercase tracking-wider">
                                                            เดือน
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-violet-800 uppercase tracking-wider">
                                                            จำนวนรายการ
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-violet-800 uppercase tracking-wider">
                                                            รายได้
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {report.monthlyBreakdown.map((month) => (
                                                        <tr key={month.month} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                                                {formatMonth(month.month)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                                <span className="px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-800 font-medium">
                                                                    {month.count} รายการ
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-800 text-right">
                                                                {formatCurrency(month.income)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <h3 className="mt-2 text-lg font-medium text-gray-900">ไม่พบข้อมูลรายการ</h3>
                                            <p className="mt-1 text-sm text-gray-500">ไม่พบข้อมูลรายการในปีที่เลือก</p>
                                        </div>
                                    )}
                                </Tabs.Content>
                            </div>
                        )}
                    </>
                )}
            </Tabs.Root>
        </div>
    );
}