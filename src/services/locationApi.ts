import { apiClient } from '@/lib/axios'; // Using your injected axios instance
import { LocationDetails, Suggestion } from '@/types/location';

export const locationApi = {
    getSuggestions: async (query: string): Promise<Suggestion[]> => {
        if (!query.trim()) return [];
        const response = await apiClient.get(`/api/autocomplete/?q=${encodeURIComponent(query)}`);
        return response.data.suggestions || [];
    },

    getCoordinatesByPlaceId: async (placeId: string): Promise<Omit<LocationDetails, 'display_name'>> => {
        const response = await apiClient.get(`/api/coordinates/?place_id=${placeId}`);
        return response.data;
    },

    getReverseGeocode: async (lat: number, lng: number): Promise<Omit<LocationDetails, 'lat' | 'lng'>> => {
        const response = await apiClient.get(`/api/geocode/reverse/?lat=${lat}&lng=${lng}`);
        return response.data;
    }
};