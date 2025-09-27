"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomDatePicker } from "@/components/ui/datepicker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/ui/image-uploader";
import { ImageGallery } from "@/components/ui/image-gallery";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { safeParseImageUrls, safeStringifyImageUrls } from "@/lib/json-utils";

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
    imageUrls: string | null;
    createdAt: string;
    updatedAt: string;
}

export default function OrderEditPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
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
        imageIds: [] as string[],
        imageDataUrls: [] as string[], // Add this to store data URLs
    });

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const response = await fetch(`/api/orders/${resolvedParams.id}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        router.push("/orders");
                        return;
                    }
                    throw new Error("ไม่สามารถดึงข้อมูลรายการได้");
                }

                const data = await response.json();
                setOrder(data);

                // Parse image IDs from stored JSON and load data URLs
                const imageIds = data.imageUrls ? JSON.parse(data.imageUrls) : [];
                const imageIdsArray = Array.isArray(imageIds) ? imageIds.map(String) : [];

                // Load image data URLs for existing images
                const imageDataUrls: string[] = [];
                if (imageIdsArray.length > 0) {
                    for (const imageId of imageIdsArray) {
                        try {
                            const imageResponse = await fetch(`/api/images/${imageId}`);
                            if (imageResponse.ok) {
                                const imageData = await imageResponse.json();
                                imageDataUrls.push(imageData.dataUrl);
                            }
                        } catch (error) {
                            console.warn(`Failed to load image ${imageId}:`, error);
                        }
                    }
                }

                setFormData({
                    customerName: data.customerName,
                    customerPhone: data.customerPhone,
                    serviceType: data.serviceType,
                    notes: data.notes || "",
                    pickupDate: data.pickupDate ? new Date(data.pickupDate) : null,
                    price: data.price.toString(),
                    paymentStatus: data.paymentStatus,
                    processingStatus: data.processingStatus,
                    imageIds: imageIdsArray,
                    imageDataUrls: imageDataUrls,
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
    }, [resolvedParams.id, router]);

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

    const handleImagesChange = (imageIds: number[], dataUrls: string[]) => {
        setFormData(prev => ({
            ...prev,
            imageIds: imageIds.map(String),
            imageDataUrls: dataUrls
        }));
    };

    const getProcessingStatusColor = (status: string) => {
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

    const getProcessingStatusText = (status: string) => {
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

    const getPaymentStatusColor = (isPaid: boolean) => {
        return isPaid
            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
            : "bg-rose-100 text-rose-800 border border-rose-200";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.customerName || !formData.customerPhone || !formData.serviceType || !formData.pickupDate || !formData.price) {
            alert("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        setIsSubmitting(true);

        try {
            // Send image IDs instead of URLs
            const dataToSubmit = {
                customerName: formData.customerName,
                customerPhone: formData.customerPhone,
                serviceType: formData.serviceType,
                notes: formData.notes,
                pickupDate: formData.pickupDate?.toISOString(),
                price: parseFloat(formData.price),
                paymentStatus: formData.paymentStatus,
                processingStatus: formData.processingStatus,
                imageIds: formData.imageIds,
            };

            const response = await fetch(`/api/orders/${resolvedParams.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataToSubmit),
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
            const response = await fetch(`/api/orders/${resolvedParams.id}`, {
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
            <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800">แก้ไขรายการ <span className="text-violet-600">#{order.queueNumber}</span></h1>
                <Button variant="danger" onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    ลบรายการ
                </Button>
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
                    <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-lg shadow-sm ml-auto ${getPaymentStatusColor(formData.paymentStatus)}`}>
                        <span className="flex items-center">
                            {formData.paymentStatus ? (
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zM14 6a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h8zM6 10a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H7z" />
                                </svg>
                            ) : (
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                                </svg>
                            )}
                            {formData.paymentStatus ? "จ่ายแล้ว" : "ยังไม่จ่าย"}
                        </span>
                    </span>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="processingStatus" className="block text-sm font-medium text-gray-700 mb-1">สถานะการดำเนินการ</Label>
                        <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-lg shadow-sm ${getProcessingStatusColor(formData.processingStatus)}`}>
                            <span className="flex items-center">
                                {formData.processingStatus === "not_started" && (
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5l-3 5a1 1 0 101.732 1L8 12.039l1.135 1.866a1 1 0 101.73-1.001l-3-5A1 1 0 0010 7z" clipRule="evenodd" />
                                    </svg>
                                )}
                                {formData.processingStatus === "in_progress" && (
                                    <svg className="w-3 h-3 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 20l16-16" />
                                    </svg>
                                )}
                                {formData.processingStatus === "completed" && (
                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                                {getProcessingStatusText(formData.processingStatus)}
                            </span>
                        </span>
                    </div>
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
                        initialImageIds={formData.imageIds.map(Number)}
                        initialDataUrls={formData.imageDataUrls}
                        orderId={order.id}
                        className="pt-2"
                    />
                </div>

                <div className="flex justify-end space-x-5 pt-6 mt-6 border-t border-gray-100">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/orders")}
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