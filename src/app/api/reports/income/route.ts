import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/reports/income - Get income reports (daily, monthly, yearly)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'daily'; // daily, monthly, yearly
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Parse the date
    const targetDate = new Date(date);
    
    // Check if date is valid
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }
    
    let startDate: Date;
    let endDate: Date;
    
    // Calculate date ranges based on the period
    if (period === 'daily') {
      // For daily report, set start to beginning of the day and end to end of the day
      startDate = new Date(targetDate);
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(targetDate);
      endDate.setHours(23, 59, 59, 999);
    } 
    else if (period === 'monthly') {
      // For monthly report, set start to first day of month and end to last day of month
      startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999);
    } 
    else if (period === 'yearly') {
      // For yearly report, set start to first day of year and end to last day of year
      startDate = new Date(targetDate.getFullYear(), 0, 1);
      endDate = new Date(targetDate.getFullYear(), 11, 31, 23, 59, 59, 999);
    } 
    else {
      return NextResponse.json(
        { error: 'Invalid period. Use daily, monthly, or yearly' },
        { status: 400 }
      );
    }
    
    // Get all paid orders within the date range
    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: true,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    // Calculate total income
    const totalIncome = orders.reduce((sum: number, order: any) => sum + order.price, 0);
    
    // Format the response based on the period
    let reportData;
    
    if (period === 'daily') {
      reportData = {
        date: date,
        totalIncome,
        orders
      };
    } 
    else if (period === 'monthly') {
      // Group by day for monthly report
      const dailyData = orders.reduce((acc: any, order: any) => {
        const day = order.createdAt.getDate();
        if (!acc[day]) {
          acc[day] = {
            date: new Date(order.createdAt.getFullYear(), order.createdAt.getMonth(), day).toISOString().split('T')[0],
            income: 0,
            count: 0
          };
        }
        acc[day].income += order.price;
        acc[day].count += 1;
        return acc;
      }, {});
      
      reportData = {
        year: targetDate.getFullYear(),
        month: targetDate.getMonth() + 1,
        totalIncome,
        dailyBreakdown: Object.values(dailyData),
        totalOrders: orders.length
      };
    } 
    else if (period === 'yearly') {
      // Group by month for yearly report
      const monthlyData = orders.reduce((acc: any, order: any) => {
        const month = order.createdAt.getMonth();
        if (!acc[month]) {
          acc[month] = {
            month: month + 1,
            income: 0,
            count: 0
          };
        }
        acc[month].income += order.price;
        acc[month].count += 1;
        return acc;
      }, {});
      
      reportData = {
        year: targetDate.getFullYear(),
        totalIncome,
        monthlyBreakdown: Object.values(monthlyData),
        totalOrders: orders.length
      };
    }
    
    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate income report' },
      { status: 500 }
    );
  }
}