"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomDatePicker } from "@/components/ui/datepicker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface OrderDetails {
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

export default function OrderEditPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [formData, setFormData] = useState({
        customerName: "",
        customerPhone: "",
        serviceType: "",
        notes: "",
        pickupDate: null as Date | null,
        price: "",
        paymentStatus: false,
        processingStatus: "",
    });

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const response = await fetch(`/api/orders/${params.id}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        router.push("/orders");
                        return;
                    }
                    throw new Error("ไม่สามารถดึงข้อมูลรายการได้");
                }

                const data = await response.json();
                setOrder(data);

                setFormData({
                    customerName: data.customerName,
                    customerPhone: data.customerPhone,
                    serviceType: data.serviceType,
                    notes: data.notes || "",
                    pickupDate: data.pickupDate ? new Date(data.pickupDate) : null,
                    price: data.price.toString(),
                    paymentStatus: data.paymentStatus,
                    processingStatus: data.processingStatus,
                });
            } catch (error) {
                console.error("Error fetching order:", error);
                alert("เกิดข้อผิดพลาดในการดึงข้อมูล");
                router.push("/orders");
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderDetails();
    }, [params.id, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleDateChange = (date: Date | null) => {
        setFormData(prev => ({ ...prev, pickupDate: date }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.customerName || !formData.customerPhone || !formData.serviceType || !formData.pickupDate || !formData.price) {
            alert("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/orders/${params.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("ไม่สามารถอัพเดตข้อมูลได้");
            }

            // Redirect to the order list page after successful update
            router.push("/orders");
            router.refresh();
        } catch (error) {
            console.error("Error updating order:", error);
            alert("เกิดข้อผิดพลาด: " + (error as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("คุณต้องการลบรายการนี้ใช่หรือไม่?")) {
            return;
        }

        try {
            const response = await fetch(`/api/orders/${params.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("ไม่สามารถลบข้อมูลได้");
            }

            router.push("/orders");
            router.refresh();
        } catch (error) {
            console.error("Error deleting order:", error);
            alert("เกิดข้อผิดพลาดในการลบข้อมูล");
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <h1 className="text-2xl font-bold mb-6">แก้ไขรายการ</h1>
                <p>กำลังโหลดข้อมูล...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container mx-auto py-8 px-4">
                <h1 className="text-2xl font-bold mb-6">แก้ไขรายการ</h1>
                <p>ไม่พบข้อมูลรายการ</p>
                <Button onClick={() => router.push("/orders")} className="mt-4">
                    กลับไปหน้ารายการ
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">แก้ไขรายการ #{order.queueNumber}</h1>
                <Button variant="danger" onClick={handleDelete}>
                    ลบรายการ
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="customerName">ชื่อลูกค้า</Label>
                        <Input
                            id="customerName"
                            name="customerName"
                            value={formData.customerName}
                            onChange={handleChange}
                            placeholder="ชื่อลูกค้า"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="customerPhone">เบอร์โทรศัพท์</Label>
                        <Input
                            id="customerPhone"
                            name="customerPhone"
                            value={formData.customerPhone}
                            onChange={handleChange}
                            placeholder="เบอร์โทรศัพท์"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="serviceType">ประเภทบริการ</Label>
                    <Select
                        value={formData.serviceType}
                        onValueChange={(value) => handleSelectChange("serviceType", value)}
                    >
                        <SelectTrigger id="serviceType" aria-label="เลือกประเภทบริการ">
                            <SelectValue placeholder="เลือกประเภทบริการ" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ตัด">ตัด</SelectItem>
                            <SelectItem value="เย็บ">เย็บ</SelectItem>
                            <SelectItem value="ปัก">ปัก</SelectItem>
                            <SelectItem value="ซ่อม">ซ่อม</SelectItem>
                            <SelectItem value="อื่นๆ">อื่นๆ</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="notes">หมายเหตุ</Label>
                    <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="รายละเอียดเพิ่มเติม"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="pickupDate">วันนัดรับ</Label>
                        <CustomDatePicker
                            selected={formData.pickupDate}
                            onChange={handleDateChange}
                            placeholderText="เลือกวันนัดรับ"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="price">ราคา</Label>
                        <Input
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            type="number"
                            placeholder="ราคา"
                            min="0"
                            required
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="paymentStatus"
                        checked={formData.paymentStatus}
                        onCheckedChange={(checked) => handleCheckboxChange("paymentStatus", checked === true)}
                    />
                    <Label htmlFor="paymentStatus" className="cursor-pointer">จ่ายเงินแล้ว</Label>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="processingStatus">สถานะการดำเนินการ</Label>
                    <Select
                        value={formData.processingStatus}
                        onValueChange={(value) => handleSelectChange("processingStatus", value)}
                    >
                        <SelectTrigger id="processingStatus" aria-label="เลือกสถานะ">
                            <SelectValue placeholder="เลือกสถานะ" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="not_started">ยังไม่เริ่ม</SelectItem>
                            <SelectItem value="in_progress">กำลังดำเนินการ</SelectItem>
                            <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex justify-end space-x-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/orders")}
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
                    </Button>
                </div>
            </form>
        </div>
    );
}