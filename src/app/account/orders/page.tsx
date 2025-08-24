"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { OrderData } from "@/app/api/orders/route";

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch orders when the component mounts
  useEffect(() => {
    const getOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (!res.ok) {
          setErrorMessage(data.message || "Failed to fetch orders.");
          setLoading(false); // Stop loading state
          return;
        }
        setOrders(data.orders); // Set the fetched orders
      } catch (err) {
        console.error(err);
        setErrorMessage("Failed to fetch orders. Please try again later.");
      } finally {
        setLoading(false); // Stop loading state
      }
    };

    // Call the function to fetch orders
    getOrders();
  }, []);

  if (loading)
    return (
      <div className="text-center py-12 text-gray-600 text-lg">
        <p>Loading orders...</p>
        <p className="mt-4">Please wait while we fetch your order history.</p>
      </div>
    );
  if (errorMessage)
    return <p className="text-center py-12 text-red-600">{errorMessage}</p>;
  if (orders.length === 0)
    return (
      <p className="text-center py-12 text-gray-500">No order history found.</p>
    );

  // Determine display style based on status
  const getStatusStyle = (
    status: OrderData["status"] | OrderData["paymentStatus"]
  ) => {
    switch (status) {
      case "pending":
      case "processing":
      case "unpaid":
      case "payment_processing":
      case "refund_processing": // In progress or requires confirmation
        return "text-yellow-500";
      case "shipped":
      case "completed":
      case "payment_success": // Positive completion state
        return "text-green-500";
      case "cancelled":
      case "payment_failed":
      case "refunded": // Negative final state
        return "text-red-500";
      default:
        return "text-gray-500"; // Default color
    }
  };

  // Common table style
  const tableStyle = "px-3 py-2 border-b";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="my-4">
        <Link href="/account" className="text-brand-800 hover:underline">
          ← Back to My Page
        </Link>
      </div>
      <h1 className="text-center mb-8">Order History</h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="border rounded-lg shadow-sm p-4">
            <div className="flex justify-between mb-4">
              <div>
                <p className="text-lg font-semibold">Order ID: {order.id}</p>
                <p>
                  Order Date:
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString()
                    : "-"}
                </p>
              </div>
              <div className="text-right font-semibold">
                <p className="text-neutral-800 text-xl">
                  Total Amount: ${order.totalPrice.toLocaleString()} (including shipping)
                </p>
                <p className={getStatusStyle(order.status)}>
                  Order Status: {order.status}
                </p>
                <p className={getStatusStyle(order.paymentStatus)}>
                  Payment Status: {order.paymentStatus}
                </p>
              </div>
            </div>

            <table className="w-full text-left border-t border-gray-200 shadow-lg rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className={tableStyle}>Product Name</th>
                  <th className={tableStyle}>Quantity</th>
                  <th className={tableStyle}>Unit Price (incl. tax)</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className={tableStyle}>{item.productName}</td>
                    <td className={tableStyle}>{item.quantity}</td>
                    <td className={tableStyle}>
                      ${item.unitPrice.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
