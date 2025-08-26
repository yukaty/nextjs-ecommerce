"use client";

import Image from "next/image";
import { CartItem } from "@/hooks/useCart";
import { FaMinus, FaPlus, FaRegTrashAlt } from "react-icons/fa";

interface CartItemCardProps {
  item: CartItem;
  isEditable?: boolean;
  onUpdateQuantity?: (id: string, quantity: number) => void;
  onRemove?: (id: string) => void;
}

export default function CartItemCard({
  item,
  isEditable = false,
  onUpdateQuantity,
  onRemove,
}: CartItemCardProps) {
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 99) return;
    onUpdateQuantity?.(item.id, newQuantity);
  };

  const totalPrice = (Number(item.price) * item.quantity).toFixed(2);

  return (
    <div className="group relative bg-white border border-gray-100 hover:border-gray-200 rounded-xl p-4 sm:p-6 transition-all duration-200 hover:shadow-md">
      {/* Remove button */}
      {isEditable && (
        <button
          onClick={() => onRemove?.(item.id)}
          className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 z-10"
          aria-label="Remove item"
        >
          <FaRegTrashAlt size={16} />
        </button>
      )}

      <div className="flex gap-4 sm:gap-6">
        {/* Product Image */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-50">
            <Image
              src={
                item.imageUrl
                  ? `/uploads/${item.imageUrl}`
                  : "/images/no-image.jpg"
              }
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 80px, 96px"
            />
          </div>
          {/* Quantity Controls or Display */}
          {isEditable ? (
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                <button
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Decrease quantity"
                >
                  <FaMinus size={14} />
                </button>

                <input
                  type="number"
                  min="1"
                  max="99"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(Number(e.target.value))}
                  className="w-10 sm:w-12 px-1 sm:px-2 py-1.5 sm:py-2 text-center text-sm font-medium bg-transparent border-0 focus:outline-none"
                />

                <button
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  disabled={item.quantity >= 99}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Increase quantity"
                >
                  <FaPlus size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-1">
              <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                Qty: {item.quantity}
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0 space-y-2">
          <h3 className="font-semibold text-gray-900 text-base sm:text-lg line-clamp-2 leading-tight">
            {item.title}
          </h3>

          <div className="space-y-1">
            <div className="font-bold text-lg text-gray-900">
              ${item.price.toLocaleString()}
            </div>
            <span className="text-sm text-gray-500">tax included</span>
          </div>
        </div>

        {/* Price Section */}
        <div className="flex-shrink-0 text-end w-20 sm:w-24 pt-1">
          <div className="mt-10 space-y-1">
            <div className="text-xs sm:text-sm font-medium text-gray-500">
              Total
            </div>
            <div className="font-bold text-lg sm:text-xl text-gray-900">
              ${totalPrice}
            </div>
            {item.quantity > 1 && (
              <div className="text-xs text-gray-400">
                ${item.price} × {item.quantity}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
