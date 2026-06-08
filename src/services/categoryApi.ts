import { apiClient } from '@/lib/axios'; // Or standard axios if you haven't abstracted it
import { CategorySearchResponse } from '@/types/category';

export const categoryApi = {
    searchCategories: async (query: string): Promise<CategorySearchResponse> => {
        // Prevent empty queries from hitting the backend
        if (!query.trim()) {
            return { count: 0, next: null, previous: null, results: [] };
        }
        const response = await apiClient.get(`/api/categories?search=${encodeURIComponent(query)}`);
        return response.data;
    }
};