'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export type Product = {
  id: string;
  sku: string;
  name: string;
  description?: string;
  unit: string;
  lowStockThreshold: number;
  isDeleted: boolean;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
  };
  totalStock?: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateProductInput = {
  sku: string;
  name: string;
  description?: string;
  unit?: string;
  lowStockThreshold?: number;
  categoryId?: string;
};

export type UpdateProductInput = Partial<CreateProductInput>;

export type ProductQueryParams = {
  search?: string;
  categoryId?: string;
  lowStockOnly?: boolean;
  includeDeleted?: boolean;
};

// funtions to fetch the proudct details from the api and return the data to the component

export async function fetchProducts(params?: ProductQueryParams): Promise<Product[]> {
  const searchParams = new URLSearchParams();
  if (params?.includeDeleted) searchParams.set('includeDeleted', 'true');
  if (params?.categoryId) searchParams.set('categoryId', params.categoryId);

  const response = await apiClient.get<{ data: Product[] }>(
    `/products?${searchParams.toString()}`,
  );
  let products = response.data.data;

  if (params?.search) {
    const query = params.search.toLowerCase().trim();
    products = products.filter(
      (p) => p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query),
    );
  }

  if (params?.lowStockOnly) {
    products = products.filter((p) => (p.totalStock ?? 0) <= (p.lowStockThreshold ?? 5));
  }

  return products;
}

export async function fetchProductById(id: string): Promise<Product> {
  const response = await apiClient.get<{ data: Product }>(`/products/${id}`);
  return response.data.data;
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const response = await apiClient.post<{ data: Product }>('/products', input);
  return response.data.data;
}

export async function updateProduct(
  id: string,
  data: UpdateProductInput,
): Promise<Product> {
  const response = await apiClient.patch<{ data: Product }>(`/products/${id}`, data);
  return response.data.data;
}

export async function deleteProduct(id: string): Promise<{ success: boolean }> {
  const response = await apiClient.delete<{ data: { success: boolean } }>(
    `/products/${id}`,
  );
  return response.data.data;
}

// Tanstack query for the produxct details

export function useProducts(params?: ProductQueryParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => fetchProductById(id),
    enabled: Boolean(id),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) =>
      updateProduct(id, data),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      void queryClient.invalidateQueries({ queryKey: ['products', variables.id] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });
}
