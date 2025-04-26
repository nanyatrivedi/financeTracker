import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Transaction from "@/models/transaction";

export async function GET() {
  try {
    await connectMongo();
    const transactions = await Transaction.find().sort({ date: -1 });
    return NextResponse.json(transactions, { status: 200 });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ message: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectMongo();
    const { amount, description, date, category } = await request.json();

    if (!amount || !description || !date || !category) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const newTransaction = await Transaction.create({
      amount,
      description,
      date,
      category,
    });

    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error("Error adding transaction:", error);
    return NextResponse.json({ message: "Failed to add transaction" }, { status: 500 });
  }
}

