import { connectDB } from "@/app/lib/data";
import { NextRequest,NextResponse } from "next/server";

export async function GET(request:Request) {
    const db=await connectDB()
    return NextResponse.json(rows)
}
