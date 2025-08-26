import CartClearHandler from "./CartClearHandler";
import MenuCard from "@/components/MenuCard";
import { getAuthUser } from "@/lib/auth";
import {
  FiUser,
  FiLock,
  FiShoppingBag,
  FiHeart,
  FiShoppingCart,
  FiMessageCircle,
  FiTool,
} from "react-icons/fi";

// My Page - Server Component
interface AccountPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const sp = await searchParams;
  const sessionId = sp?.session_id as string | undefined;

  // Get current user
  const user = await getAuthUser();

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

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <MenuCard
            href="/account/edit"
            title="Edit Profile"
            description="Update your name and email address"
            icon={<FiUser className="w-5 h-5" />}
          />

          <MenuCard
            href="/account/password"
            title="Change Password"
            description="Update your account password"
            icon={<FiLock className="w-5 h-5" />}
          />

          <MenuCard
            href="/account/orders"
            title="Order History"
            description="View your past orders and status"
            icon={<FiShoppingBag className="w-5 h-5" />}
          />

          <MenuCard
            href="/account/favorites"
            title="Favorite Products"
            description="Manage your favorite items"
            icon={<FiHeart className="w-5 h-5" />}
          />

          <MenuCard
            href="/cart"
            title="Shopping Cart"
            description="View items in your cart"
            icon={<FiShoppingCart className="w-5 h-5" />}
          />

          {!user?.isAdmin && (
            <MenuCard
              href="/contact"
              title="Contact Support"
              description="Get help with your account"
              icon={<FiMessageCircle className="w-5 h-5" />}
            />
          )}
        </div>
        {user?.isAdmin && (
          <>
            <h1 className="text-center mt-24">Admin Tools</h1>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <MenuCard
                href="/admin/products"
                title="Manage Products"
                description="Add, edit, or remove products"
                icon={<FiTool className="w-5 h-5" />}
              />

              <MenuCard
                href="/admin/inquiries"
                title="Manage Inquiries"
                description="View customer inquiries"
                icon={<FiMessageCircle className="w-5 h-5" />}
              />
            </div>
          </>
        )}
      </main>
    </>
  );
}
