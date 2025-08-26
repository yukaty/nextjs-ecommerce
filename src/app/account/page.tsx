import Link from "next/link";
import CartClearHandler from "./CartClearHandler";

// My Page - Server Component
interface AccountPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const sp = await searchParams;
  const sessionId = sp?.session_id as string | undefined;

  // Common menu item styles
  const menuItemStyle =
    "w-full flex items-center px-4 pt-4 border border-gray-300 rounded shadow-lg hover:ring-2 hover:ring-brand-200 hover:shadow-xl hover:bg-gray-100";

  // Set message based on query parameters
  const message = sp?.edited
    ? "Member information has been updated."
    : sp?.["password-changed"]
    ? "Password has been changed."
    : null;

  return (
    <>
      <CartClearHandler sessionId={sessionId || null} />
      {sessionId && (
        <div className="w-full bg-green-100 text-green-800 p-3 text-center shadow-md flex flex-col items-center justify-center mb-6 rounded-md">
          <p className="text-xl font-bold mt-4">Thank you for your order!</p>
          <p>Please wait while your products are being delivered.</p>
        </div>
      )}
      {message && (
        <div className="w-full bg-green-100 text-green-800 p-3 text-center shadow-md flex items-center justify-center">
          {message}
        </div>
      )}
      <main className="container mx-auto px-4 py-18">
        <h1 className="text-center mb-8">My Page</h1>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <Link href="/account/edit" className={menuItemStyle}>
            <div className="flex flex-col text-left">
              <h2 className="mt-0 font-medium">Edit Member Information</h2>
              <p className="text-gray-600">
                You can edit your name and email address
              </p>
            </div>
          </Link>

          <Link href="/account/password" className={menuItemStyle}>
            <div className="flex flex-col text-left">
              <h2 className="mt-0 font-medium">Change Password</h2>
              <p className="text-gray-600">You can change your password</p>
            </div>
          </Link>

          <Link href="/account/orders" className={menuItemStyle}>
            <div className="flex flex-col text-left">
              <h2 className="mt-0 font-medium">Order History</h2>
              <p className="text-gray-600">You can check your order history</p>
            </div>
          </Link>

          <Link href="/account/favorites" className={menuItemStyle}>
            <div className="flex flex-col text-left">
              <h2 className="mt-0 font-medium">Check Favorite Products</h2>
              <p className="text-gray-600">
                You can check your favorite products
              </p>
            </div>
          </Link>
        </div>
      </main>
    </>
  );
}
