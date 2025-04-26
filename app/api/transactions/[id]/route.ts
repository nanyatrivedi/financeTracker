import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Transaction from "@/models/transaction";

// DELETE a transaction
export async function DELETE(request: NextRequest) {
  await connectMongo();

  const url = new URL(request.url);
  const id = url.pathname.split("/").pop(); // get the last part after /[id]

  if (!id) {
    return NextResponse.json({ message: "Transaction ID is missing" }, { status: 400 });
  }

  try {
    await Transaction.findByIdAndDelete(id);
    return NextResponse.json({ message: "Transaction deleted" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json({ message: "Failed to delete transaction" }, { status: 500 });
  }
}
