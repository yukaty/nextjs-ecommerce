// Basic type definition for review data
export type ReviewData = {
  id: number;
  product_id: number;
  user_id: number;
  score: number;
  content: string;
  created_at: string;
  user_name: string;
};

// Type definition for response retrieved from review API
export type ReviewsResponse = {
  reviews: ReviewData[];
  review_avg: number;
  pagination: {
    currentPage: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
  };
};

