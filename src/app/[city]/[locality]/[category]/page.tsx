import React from 'react';
import { MapPin, Search } from 'lucide-react';

// Define the shape of all three dynamic parameters
interface CategoryPageProps {
    params: Promise<{
        city: string;
        locality: string;
        category: string;
    }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    // Await the params (Required in Next.js 15+)
    const resolvedParams = await params;
    
    // 1. Decode the URL to handle spaces (e.g., "salt%20lake" -> "salt lake")
    const city = decodeURIComponent(resolvedParams.city);
    const locality = decodeURIComponent(resolvedParams.locality);
    const category = decodeURIComponent(resolvedParams.category);

    // 2. Format strings for nice UI display (capitalize first letters)
    const displayCity = city.charAt(0).toUpperCase() + city.slice(1);
    const displayLocality = locality.charAt(0).toUpperCase() + locality.slice(1);
    const displayCategory = category.charAt(0).toUpperCase() + category.slice(1);

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 w-full min-h-screen bg-gray-50">
            
            {/* Breadcrumb Navigation */}
            <nav className="text-sm text-gray-500 mb-6 flex gap-2">
                <a href="/" className="hover:text-blue-600 transition-colors">Home</a>
                <span>&gt;</span>
                <span className="capitalize">{displayCity}</span>
                <span>&gt;</span>
                <span className="capitalize">{displayLocality}</span>
                <span>&gt;</span>
                <span className="font-semibold text-gray-800 capitalize">{displayCategory}</span>
            </nav>

            {/* Header Section */}
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 capitalize flex items-center gap-2">
                    {displayCategory} in {displayLocality}, {displayCity}
                </h1>
                <p className="text-gray-500 mt-2 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    Showing the best {category.toLowerCase()} near your selected location.
                </p>
            </header>

            {/* TODO: Fetch your data from the database here using the dynamic params!
                e.g., const results = await fetchSearchResults(city, locality, category);
            */}
            
            {/* Example Results Grid */}
            

        </div>
    );
}