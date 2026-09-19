export type OrderStatus =
  | "Pending Confirmation"
  | "Confirmed"
  | "Packed"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export type OrderItem = {
  productId: string;
  name: string;
  image: string;
  size: string;
  price: number;
  quantity: number;
  color?: string;
  designNo?: string;
};

export type DeliveryDetails = {
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  pincode: string;
};

export type Order = {
  id: string; // Document ID
  orderNumber: string; // e.g., KK-8421
  userId?: string | null; // Null if guest order
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  delivery: DeliveryDetails;
  trackingNumber?: string; // Courier AWB
  courierName?: string; // e.g. Delhivery, DTDC, India Post
  notes?: string;
  createdAt: string;
  updatedAt: string;
};