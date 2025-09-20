"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomDatePicker } from "@/components/ui/datepicker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/ui/image-uploader";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewOrderPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        customerName: "",
        customerPhone: "",
        serviceType: "",
        notes: "",
        pickupDate: null as Date | null,
        price: "",
        paymentStatus: false,
        processingStatus: "not_started",
        imageUrls: [] as string[],
    });

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

    const handleImagesChange = (urls: string[]) => {
        setFormData(prev => ({ ...prev, imageUrls: urls }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.customerName || !formData.customerPhone || !formData.serviceType || !formData.pickupDate || !formData.price) {
            alert("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        setIsSubmitting(true);

        try {
            // Convert imageUrls array to JSON string before sending to API
            const dataToSubmit = {
                ...formData,
                imageUrls: formData.imageUrls.length > 0 ? JSON.stringify(formData.imageUrls) : null
            };

            const response = await fetch("/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataToSubmit),
            });

            if (!response.ok) {
                throw new Error("ไม่สามารถบันทึกข้อมูลได้");
            }

            const data = await response.json();

            // Redirect to the order list page after successful creation
            router.push("/orders");
            router.refresh();
        } catch (error) {
            console.error("Error creating order:", error);
            alert("เกิดข้อผิดพลาด: " + (error as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800">สร้างรายการใหม่</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">ชื่อลูกค้า</Label>
                        <Input
                            id="customerName"
                            name="customerName"
                            value={formData.customerName}
                            onChange={handleChange}
                            placeholder="ชื่อลูกค้า"
                            required
                            className="bg-gray-50 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                        />
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</Label>
                        <Input
                            id="customerPhone"
                            name="customerPhone"
                            value={formData.customerPhone}
                            onChange={handleChange}
                            placeholder="เบอร์โทรศัพท์"
                            required
                            className="bg-gray-50 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <Label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-1">ประเภทบริการ</Label>
                    <Select
                        value={formData.serviceType}
                        onValueChange={(value) => handleSelectChange("serviceType", value)}
                    >
                        <SelectTrigger id="serviceType" aria-label="เลือกประเภทบริการ" className="bg-gray-50 border-gray-300 focus:border-violet-500 focus:ring-violet-500">
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

                <div className="space-y-3">
                    <Label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</Label>
                    <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="รายละเอียดเพิ่มเติม"
                        className="bg-gray-50 border-gray-300 focus:border-violet-500 focus:ring-violet-500 min-h-[100px]"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700 mb-1">วันนัดรับ</Label>
                        <div className="relative w-full">
                            <CustomDatePicker
                                selected={formData.pickupDate}
                                onChange={handleDateChange}
                                placeholderText="เลือกวันนัดรับ"
                                required
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">ราคา</Label>
                        <Input
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            type="number"
                            placeholder="ราคา"
                            min="0"
                            required
                            className="bg-gray-50 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-3 p-4 my-2 bg-violet-50 rounded-md border border-violet-100">
                    <Checkbox
                        id="paymentStatus"
                        checked={formData.paymentStatus}
                        onCheckedChange={(checked) => handleCheckboxChange("paymentStatus", checked === true)}
                        className="h-5 w-5 text-violet-600 focus:ring-violet-500 rounded"
                    />
                    <Label htmlFor="paymentStatus" className="cursor-pointer text-gray-800 font-medium">จ่ายเงินแล้ว</Label>
                </div>

                <div className="space-y-3">
                    <Label htmlFor="processingStatus" className="block text-sm font-medium text-gray-700 mb-1">สถานะการดำเนินการ</Label>
                    <Select
                        value={formData.processingStatus}
                        onValueChange={(value) => handleSelectChange("processingStatus", value)}
                    >
                        <SelectTrigger id="processingStatus" aria-label="เลือกสถานะ" className="bg-gray-50 border-gray-300 focus:border-violet-500 focus:ring-violet-500">
                            <SelectValue placeholder="เลือกสถานะ" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="not_started">ยังไม่เริ่ม</SelectItem>
                            <SelectItem value="in_progress">กำลังดำเนินการ</SelectItem>
                            <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-3">
                    <Label className="block text-sm font-medium text-gray-700 mb-1">รูปภาพ (ไม่เกิน 5 รูป)</Label>
                    <ImageUploader
                        maxImages={5}
                        onImagesChange={handleImagesChange}
                        initialImages={formData.imageUrls}
                        className="pt-2"
                    />
                </div>

                <div className="flex justify-end space-x-5 pt-6 mt-6 border-t border-gray-100">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        className="px-6 py-2.5 hover:bg-gray-100 border-gray-300 text-gray-700"
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 min-w-[100px]"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                กำลังบันทึก
                            </>
                        ) : (
                            <>บันทึก</>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}