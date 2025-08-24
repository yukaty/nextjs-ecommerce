'use client';

import Image from 'next/image';
import { CartItem } from '@/hooks/useCart';

interface CartItemCardProps {
  item: CartItem;
  isEditable?: boolean;
  onUpdateQuantity?: (id: string, quantity: number) => void; // event handler for quantity change
  onRemove?: (id: string) => void; // event handler for item removal
}

export default function CartItemCard({
  item,
  isEditable,
  onUpdateQuantity,
  onRemove
}: CartItemCardProps) {
  // Generate quantity options from 1 to 10
  const quantityOptions = Array.from({ length: 10 }, (_, i) => (
    <option key={i + 1} value={i + 1}>{i + 1}</option>
  ));

  return (
    <div className="flex items-center gap-12 border border-gray-200 rounded p-8">
      <Image
        src={item.imageUrl ? `/uploads/${item.imageUrl}` : '/images/no-image.jpg'}
        alt={item.title}
        width={120}
        height={120}
        className="object-contain"
      />
      <div className="flex-grow">
        <h2 className="text-xl">{item.title}</h2>
        <p className="font-bold text-xl">
          ${item.price.toLocaleString()}
          <span className="text-base font-normal text-gray-500"> (tax included)</span>
        </p>
        {isEditable ? (
          <div className="flex items-center mt-2 gap-4">
            <label htmlFor={`quantity-${item.id}`} className="text-sm text-gray-700">
              Quantity:
            </label>
            <select
                id={`quantity-${item.id}`}
                value={item.quantity}
                onChange={(e) => onUpdateQuantity && onUpdateQuantity(item.id, Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-brand-500"
            >
                {quantityOptions}
            </select>
            <button
                onClick={() => onRemove && onRemove(item.id)}
                className="text-red-600 hover:underline cursor-pointer"
            >
              Remove
            </button>
          </div>
        ) : (
          <p className="text-lg font-semibold">Quantity: {item.quantity}</p>
        )}
      </div>
      <p className="text-right font-semibold text-lg w-32">
        Total: ${(item.price * item.quantity).toLocaleString()}
      </p>
    </div>
  );
}

