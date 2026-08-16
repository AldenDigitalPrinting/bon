import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rollNumber, date, shift, revenue, dailyTotal, rollTotal } = body;

    if (!rollNumber || !date || !shift) {
      return NextResponse.json(
        { success: false, error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const gelondongan = await prisma.gelondongan.create({
      data: {
        rollNumber: parseInt(rollNumber),
        date: new Date(date),
        shift,
        revenue: parseInt(revenue.toString()) || 0,
        dailyTotal: parseInt(dailyTotal.toString()) || 0,
        rollTotal: parseInt(rollTotal.toString()) || 0,
      },
    });

    return NextResponse.json({ success: true, data: gelondongan });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "Nomor roll sudah ada" },
        { status: 409 }
      );
    }
    console.error("Error creating gelondongan:", error);
    return NextResponse.json(
      { success: false, error: "Gagal membuat roll" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

    const totalCount = await prisma.gelondongan.count();
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const skip = (currentPage - 1) * pageSize;

    const data = await prisma.gelondongan.findMany({
      orderBy: [{ date: "desc" }, { rollNumber: "desc" }],
      skip,
      take: pageSize,
      include: {
        items: {
          include: { order: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data,
      pagination: { totalCount, totalPages, currentPage, pageSize },
    });
  } catch (error) {
    console.error("Error fetching gelondongans:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}