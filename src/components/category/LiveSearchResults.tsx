"use client";

import React from 'react';
import { Search, FolderSearch } from 'lucide-react';
import { CategoryNode, RecentCategory } from '@/types/category';

interface LiveSearchResultsProps {
    searchTerm: string;
    searchResults: CategoryNode[];
    isSearching: boolean;
    onCategoryClick: (category: CategoryNode | RecentCategory) => void;
}

export default function LiveSearchResults({ 
    searchTerm, 
    searchResults, 
    isSearching, 
    onCategoryClick 
}: LiveSearchResultsProps) {
    
    // Determine if we should show the "No Results" state
    const showEmptyState = !isSearching && searchTerm.length > 0 && searchResults.length === 0;

    return (
        <div className="w-full">
            {/* Results Count Header */}
            {searchResults.length > 0 && (
                <p className="text-sm font-medium text-gray-500 mb-4 px-1">
                    Found {searchResults.length} match{searchResults.length !== 1 ? 'es' : ''}
                </p>
            )}

            {/* List of Results */}
            <div 
                className="space-y-3 transition-opacity duration-200" 
                style={{ opacity: isSearching ? 0.6 : 1 }}
            >
                {searchResults.map((category) => (
                    <button 
                        key={`result-${category.id}`}
                        onClick={() => onCategoryClick(category)}
                        className="w-full text-left bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-100 transition-all flex items-center justify-between group active:scale-[0.99]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                                <FolderSearch className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 text-[16px]">
                                    {category.name}
                                </h3>
                                <p className="text-[13px] text-gray-400 mt-0.5">
                                    /{category.slug}
                                </p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Empty State / No Results Found */}
            {showEmptyState && (
                <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-300">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">No categories found</h3>
                    <p className="text-gray-500 mt-1 max-w-sm">
                        We couldn't find any categories matching "{searchTerm}". Check for typos or try a different keyword.
                    </p>
                </div>
            )}
        </div>
    );
}