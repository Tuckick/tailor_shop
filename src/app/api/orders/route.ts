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
    const where: any = {};
    
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
        ...body,
        queueNumber,
        pickupDate: new Date(body.pickupDate),
        price: parseFloat(body.price)
      }
    });
    
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}