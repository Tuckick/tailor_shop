import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/orders - Get all orders with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const queue = searchParams.get('queue');
    const search = searchParams.get('search'); // For customer name or phone
    const pickupDate = searchParams.get('pickupDate');
    
    // Build filter conditions
    interface WhereCondition {
      processingStatus?: string;
      queueNumber?: number;
      OR?: Array<{ customerName?: { contains: string }; customerPhone?: { contains: string } }>;
      pickupDate?: {
        gte: Date;
        lt: Date;
      };
    }
    
    const where: WhereCondition = {};
    
    if (status) {
      where.processingStatus = status;
    }
    
    if (queue) {
      where.queueNumber = parseInt(queue);
    }
    
    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { customerPhone: { contains: search } }
      ];
    }
    
    if (pickupDate) {
      const date = new Date(pickupDate);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      
      where.pickupDate = {
        gte: date,
        lt: nextDay
      };
    }
    
    const orders = await prisma.order.findMany({
      where,
      orderBy: {
        queueNumber: 'desc'
      }
    });
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get the highest queue number to increment
    const highestQueue = await prisma.order.findFirst({
      orderBy: {
        queueNumber: 'desc'
      }
    });
    
    const queueNumber = highestQueue ? highestQueue.queueNumber + 1 : 1;
    
    // Create the new order with auto-incremented queue number
    const newOrder = await prisma.order.create({
      data: {
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        serviceType: body.serviceType,
        notes: body.notes || null,
        queueNumber,
        pickupDate: new Date(body.pickupDate),
        price: parseFloat(body.price),
        paymentStatus: body.paymentStatus || false,
        processingStatus: body.processingStatus || 'not_started',
        // Keep the deprecated field for backward compatibility
        imageUrls: body.imageIds && body.imageIds.length > 0 ? JSON.stringify(body.imageIds) : null
      }
    });
    
    // Link uploaded images to this order
    if (body.imageIds && body.imageIds.length > 0) {
      const imageIds = body.imageIds.map((id: string) => parseInt(id)).filter((id: number) => !isNaN(id));
      
      if (imageIds.length > 0) {
                // Get all images that need to be linked to this order (those without an orderId)
        const allImages = await prisma.image.findMany({
          where: {
            id: { in: imageIds }
          }
        });
        
        // Filter for images without orderId
        const imagesToUpdate = allImages.filter((image: any) => image.orderId === null);
        
        // Update each image individually 
        for (const image of imagesToUpdate) {
          await prisma.image.update({
            where: { id: image.id },
            data: { orderId: newOrder.id }
          });
        }
      }
    }
    
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}