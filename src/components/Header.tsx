"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { type AuthUser } from "@/lib/auth";
import { FiHeart, FiShoppingCart, FiUser, FiMenu, FiX } from "react-icons/fi";

// Type definition for data (props) passed to Header component
export interface HeaderProps {
  user: AuthUser | null;
}

// Common header
export default function Header({ user }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Menu open/close state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile menu state
  const menuRef = useRef<HTMLDivElement>(null); // DOM reference for menu
  // Function to close menu
  const closeMenu = () => setIsMenuOpen(false);
  // Function to toggle menu open/close state
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  // Function to toggle mobile menu
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  // Get total quantity of items in cart
  const { totalQuantity } = useCart();
  // Cart quantity for display (initial value is 0)
  const [displayQuantity, setDisplayQuantity] = useState(0);
  // Track if component has mounted to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);

  const searchParams = useSearchParams();
  const [searchState, setSearchState] = useState({
    perPage: "10",
    sort: "new",
    keyword: "",
  });

  useEffect(() => {
    setSearchState({
      perPage: searchParams.get("perPage") || "10",
      sort: searchParams.get("sort") || "new",
      keyword: searchParams.get("keyword") || "",
    });
  }, [searchParams]);

  // Detect clicks outside menu and close menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Hide if clicked outside menu
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };
    // Event listener to detect clicks outside menu
    document.addEventListener("click", handleClickOutside);

    // Cleanup processing (remove event listener)
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Update display when cart item quantity changes
  useEffect(() => {
    setMounted(true);
    setDisplayQuantity(totalQuantity);
  }, [totalQuantity]);

  // Common style for menu items
  const menuItemStyle =
    "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100";

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        {/* Main header row */}
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <Image
                src="/images/logo.webp"
                alt="MAPLE Store"
                width={910}
                height={200}
                className="w-[180px] md:w-[250px] h-[40px] md:h-[55px] object-contain"
              />
            </Link>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-3 md:space-x-4">
            {/* Search - hidden on mobile */}
            <form action="/products" method="GET" className="hidden lg:block">
              <input type="hidden" name="page" value="1" />
              <input type="hidden" name="perPage" value={searchState.perPage} />
              <input type="hidden" name="sort" value={searchState.sort} />
              <input
                type="text"
                name="keyword"
                placeholder="Search..."
                defaultValue={searchState.keyword}
                className="border border-gray-300 rounded-md py-1 px-3 text-sm focus:ring-brand-500"
              />
            </form>

            {/* Action icons */}
            <Link href="/account/favorites" className="hidden sm:block">
              <FiHeart className="w-6 h-6 text-stone-600 hover:text-brand-500 transition-colors" />
            </Link>

            <Link href="/cart" className="relative">
              <FiShoppingCart className="w-6 h-6 text-stone-600 hover:text-brand-500 transition-colors" />
              {displayQuantity > 0 && mounted && (
                <span className="absolute -top-2 -right-2 w-[20px] h-[20px] bg-brand-500 text-white flex items-center justify-center rounded-full ring-2 ring-white text-xs font-semibold">
                  {displayQuantity > 9 ? "9+" : displayQuantity}
                </span>
              )}
            </Link>

            {/* User menu */}
            <div className="relative" ref={menuRef}>
              <button onClick={toggleMenu} className="cursor-pointer relative">
                <FiUser className="w-6 h-6 text-stone-600 hover:text-brand-500 transition-colors" />
                {user && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white" />
                )}
              </button>

              {/* Desktop user dropdown menu */}
              {isMenuOpen && (
                <div className="hidden md:block absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-300">
                  {user ? (
                    <>
                      <Link
                        href="/account"
                        onClick={closeMenu}
                        className={menuItemStyle}
                      >
                        My Account
                      </Link>
                      <form method="POST" action="/api/auth/logout">
                        <button
                          type="submit"
                          className={`${menuItemStyle} w-full text-left`}
                        >
                          Logout
                        </button>
                      </form>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={closeMenu}
                        className={menuItemStyle}
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        onClick={closeMenu}
                        className={menuItemStyle}
                      >
                        Register
                      </Link>
                    </>
                  )}
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-1 ml-2"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <FiX className="w-6 h-6 text-stone-600" />
                ) : (
                  <FiMenu className="w-6 h-6 text-stone-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="space-y-2">
              {/* Mobile user menu */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                {user ? (
                  <>
                    <Link
                      href="/account"
                      className="block py-2 px-4 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Account
                    </Link>
                    <form
                      method="POST"
                      action="/api/auth/logout"
                      className="px-4"
                    >
                      <button
                        type="submit"
                        className="block w-full text-left py-2 hover:bg-gray-100 transition-colors"
                      >
                        Logout
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block py-2 px-4 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="block py-2 px-4 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </nav>

            {/* Mobile search */}
            <div className="px-4 pt-4 border-t border-gray-200 mt-4 lg:hidden">
              <form action="/products" method="GET">
                <input type="hidden" name="page" value="1" />
                <input
                  type="hidden"
                  name="perPage"
                  value={searchState.perPage}
                />
                <input type="hidden" name="sort" value={searchState.sort} />
                <input
                  type="text"
                  name="keyword"
                  placeholder="Search products..."
                  defaultValue={searchState.keyword}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-brand-500"
                />
              </form>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
