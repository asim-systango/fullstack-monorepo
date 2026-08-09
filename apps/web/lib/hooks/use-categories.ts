'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export type Category = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

// Function to fetch the category details

export async function fetchCategories(): Promise<Category[]> {
  const response = await apiClient.get<{ data: Category[] }>('/categories');
  return response.data.data;
}

// Tanstack query to use the get the category details in teh component

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });
}
