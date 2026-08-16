import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notaId, date, customerName, notes, items } = body;

    // Validate
    if (!notaId || !customerName || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // Calculate totals
    const itemsWithTotals = items.map((item: any) => {
      const lineTotal = item.quantity * item.unitPrice + item.serviceFee;
      return { ...item, lineTotal };
    });
    const totalAmount = itemsWithTotals.reduce((sum: number, item: any) => sum + item.lineTotal, 0);

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          notaId,
          date: new Date(date),
          customerName,
          notes,
          totalAmount,
          status: "DONE",
          items: {
            create: itemsWithTotals.map((item: any) => ({
              description: item.description,
              size: item.size,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              jobType: item.jobType,
              serviceFee: item.serviceFee,
              lineTotal: item.lineTotal,
            })),
          },
        },
        include: { items: true },
      });
      return newOrder;
    });

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "Nota ID sudah ada" },
        { status: 409 }
      );
    }
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, error: "Gagal membuat pesanan" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
    const searchNotaId = searchParams.get("searchNotaId") || undefined;
    const searchCustomer = searchParams.get("searchCustomer") || undefined;
    const status = searchParams.get("status") || undefined;

    const where: any = {};

    if (searchNotaId) {
      where.notaId = { contains: searchNotaId, mode: "insensitive" };
    }
    if (searchCustomer) {
      where.customerName = { contains: searchCustomer, mode: "insensitive" };
    }
    if (status) {
      where.status = status;
    }

    const totalCount = await prisma.order.count({ where });
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const skip = (currentPage - 1) * pageSize;

    const data = await prisma.order.findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      skip,
      take: pageSize,
      include: { items: true },
    });

    return NextResponse.json({
      success: true,
      data,
      pagination: { totalCount, totalPages, currentPage, pageSize },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil pesanan" },
      { status: 500 }
    );
  }
}