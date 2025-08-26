import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { executeQuery, TABLES } from "@/lib/db";
import { OrderData, OrderJoinRecord } from "@/types/orders";

export default async function OrdersPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect('/login?redirect=/account/orders');
  }

  // Get orders and order details associated with user ID
  const ordersData = await executeQuery<OrderJoinRecord>(`
    SELECT
      o.id AS id,
      o.total_amount AS totalAmount,
      o.status AS status,
      o.payment_status AS paymentStatus,
      o.created_at AS createdAt,
      oi.product_name AS productName,
      oi.quantity AS quantity,
      oi.unit_price AS unitPrice
    FROM ${TABLES.orders} AS o
    JOIN ${TABLES.order_items} AS oi ON o.id = oi.order_id
    WHERE o.user_id = $1
    ORDER BY o.created_at DESC, oi.id ASC;`,
    [user.userId]
  );

  // Use Map object to group product data by order
  const ordersMap = new Map<number, OrderData>();
  ordersData.forEach((row: OrderJoinRecord) => {
    if (!ordersMap.has(row.id)) {
      ordersMap.set(row.id, {
        id: row.id,
        totalAmount: Number(row.totalamount),
        status: row.status,
        paymentStatus: row.paymentstatus,
        createdAt: row.createdat,
        items: []
      });
    }

    // Add current record's product details to items array
    ordersMap.get(row.id)?.items.push({
      productName: row.productname,
      quantity: Number(row.quantity),
      unitPrice: Number(row.unitprice),
    });
  });

  const orders = Array.from(ordersMap.values());

  // Determine display style based on status
  const getStatusStyle = (
    status: OrderData["status"] | OrderData["paymentStatus"]
  ) => {
    switch (status) {
      case "pending":
      case "processing":
      case "unpaid":
      case "payment_processing":
      case "refund_processing":
        return "text-yellow-500";
      case "shipped":
      case "completed":
      case "payment_success":
        return "text-green-500";
      case "cancelled":
      case "payment_failed":
      case "refunded":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="my-4">
          <Link href="/account" className="text-brand-800 hover:underline">
            ← Back to My Page
          </Link>
        </div>
        <h1 className="text-center mb-8">Order History</h1>
        <p className="text-center py-12 text-gray-500">No order history found.</p>
      </div>
    );
  }

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
                  Total Amount: ${order.totalAmount.toLocaleString()} (including shipping)
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