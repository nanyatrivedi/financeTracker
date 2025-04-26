import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Transaction from "@/models/transaction"; 

interface Params {
  id: string;
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  await connectMongo();

  try {
    await Transaction.findByIdAndDelete(params.id);
    return NextResponse.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json({ message: "Failed to delete transaction" }, { status: 500 });
  }
}
