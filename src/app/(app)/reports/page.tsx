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
            <h1 className="text-2xl font-bold mb-6">รายงานรายได้</h1>

            <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
                <Tabs.List className="flex border-b mb-6">
                    <Tabs.Trigger
                        value="daily"
                        className={cn(
                            "px-4 py-2 border-b-2 transition-colors",
                            activeTab === "daily"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent hover:text-blue-600"
                        )}
                    >
                        รายวัน
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="monthly"
                        className={cn(
                            "px-4 py-2 border-b-2 transition-colors",
                            activeTab === "monthly"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent hover:text-blue-600"
                        )}
                    >
                        รายเดือน
                    </Tabs.Trigger>
                    <Tabs.Trigger
                        value="yearly"
                        className={cn(
                            "px-4 py-2 border-b-2 transition-colors",
                            activeTab === "yearly"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent hover:text-blue-600"
                        )}
                    >
                        รายปี
                    </Tabs.Trigger>
                </Tabs.List>

                <div className="flex flex-col md:flex-row gap-4 mb-6 items-start">
                    <div className="w-full md:w-auto">
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

                {isLoading ? (
                    <div className="py-8 text-center">กำลังโหลดข้อมูล...</div>
                ) : (
                    <>
                        {!report ? (
                            <div className="py-8 text-center">ไม่พบข้อมูล</div>
                        ) : (
                            <div className="space-y-8">
                                <div className="bg-blue-50 p-6 rounded-lg shadow">
                                    <h2 className="text-xl font-bold mb-2">สรุปรายได้</h2>
                                    <div className="text-3xl font-bold text-blue-700">
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
                                                            วันที่
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            ราคา
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {report.orders.map((order) => (
                                                        <tr key={order.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                {order.queueNumber}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {order.customerName}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {order.serviceType}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {formatDate(order.createdAt)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                                                {formatCurrency(order.price)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6">ไม่พบข้อมูลรายการในวันที่เลือก</div>
                                    )}
                                </Tabs.Content>

                                <Tabs.Content value="monthly" className="space-y-6">
                                    {report.dailyBreakdown && report.dailyBreakdown.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            วันที่
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            จำนวนรายการ
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            รายได้
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {report.dailyBreakdown.map((day, index) => (
                                                        <tr key={index}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                {formatDate(day.date)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {day.count} รายการ
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                                                {formatCurrency(day.income)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6">ไม่พบข้อมูลรายการในเดือนที่เลือก</div>
                                    )}
                                </Tabs.Content>

                                <Tabs.Content value="yearly" className="space-y-6">
                                    {report.monthlyBreakdown && report.monthlyBreakdown.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            เดือน
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            จำนวนรายการ
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            รายได้
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {report.monthlyBreakdown.map((month) => (
                                                        <tr key={month.month}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                {formatMonth(month.month)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {month.count} รายการ
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                                                {formatCurrency(month.income)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6">ไม่พบข้อมูลรายการในปีที่เลือก</div>
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