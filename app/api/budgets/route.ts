import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Budget from "@/lib/budget";

export async function GET() {
  await connectMongo();

  const budgets = await Budget.find();
  return NextResponse.json(budgets);
}

export async function POST(request: NextRequest) {
  await connectMongo();

  const { category, amount } = await request.json();

  if (!category || amount === undefined) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
  }

  const existing = await Budget.findOne({ category });

  if (existing) {
    existing.amount = amount;
    await existing.save();
    return NextResponse.json(existing, { status: 200 });
  } else {
    const newBudget = await Budget.create({ category, amount });
    return NextResponse.json(newBudget, { status: 201 });
  }
}
