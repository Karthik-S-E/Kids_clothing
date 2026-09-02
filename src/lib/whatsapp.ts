import { social } from "../config";
import { formatINR } from "./formatINR";
import type { CartItem } from "../store/cartStore";

export function buildOrderMessage(opts: {
  productName: string;
  size: string;
  price: number;
}): string {
  return `Hi Kandamma Kids! I would like to order ${opts.productName} (Size: ${opts.size}, Price: ${formatINR(opts.price)}). Please share availability and payment details.`;
}

export function whatsappOrderUrl(opts: {
  productName: string;
  size: string;
  price: number;
}): string {
  const text = encodeURIComponent(buildOrderMessage(opts));
  return `https://wa.me/${social.whatsappNumber}?text=${text}`;
}

export function whatsappChatUrl(message?: string): string {
  const text = encodeURIComponent(
    message ?? "Hi Kandamma Kids! I would like to know more about your latest collection.",
  );
  return `https://wa.me/${social.whatsappNumber}?text=${text}`;
}

export function whatsappCartUrl(items: CartItem[]): string {
  if (items.length === 0) return whatsappChatUrl();

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  
  const itemsList = items
    .map(
      (item) =>
        `• ${item.product.name} (Size: ${item.size}, Qty: ${item.quantity}, Price: ${formatINR(item.product.price)})`
    )
    .join("\n");

  const message = `Hi Kandamma Kids! I would like to place an order for the following items:\n\n${itemsList}\n\nTotal: ${formatINR(total)}\n\nPlease share availability and payment details.`;
  
  return `https://wa.me/${social.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
