// Basic type definition for product data
export type ProductData = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  stock?: number;
  image_url?: string | null;
  review_avg?: number;
  review_count?: number;
  updated_at?: string;
};
