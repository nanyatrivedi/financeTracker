import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Transaction from "@/models/transaction";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectMongo();

  try {
    await Transaction.findByIdAndDelete(params.id);
    return NextResponse.json({ message: "Transaction deleted" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json({ message: "Failed to delete transaction" }, { status: 500 });
  }
}
