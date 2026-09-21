import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function updateOrderStatus(orderId: string, status: "Confirmed" | "Cancelled" | "Saved for Later") {
  try {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, { status });
  } catch (err: any) {
    console.error("Failed to update order status:", err);
    throw err;
  }
}