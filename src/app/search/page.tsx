"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { Search, Loader2, X, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/useStore';
import { fetchCategoryTree, executeLocalSearch, clearSearchResults } from '@/store/features/category/categorySearchSlice';
import CategoryTabsLayout from '@/components/category/CategoryTabsLayout'; // <-- Import the component
import LiveSearchResults from '@/components/category/LiveSearchResults'; //// Optional abstraction layer

export default function CategorySearchPage() {
    const dispatch = useAppDispatch();
    const { isTreeLoaded, isTreeLoading, treeError, searchResults } = useAppSelector((state) => state.categorySearch);

    const [searchTerm, setSearchTerm] = useState('');
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (!isTreeLoaded && !isTreeLoading) {
            dispatch(fetchCategoryTree());
        }
    }, [dispatch, isTreeLoaded, isTreeLoading]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchTerm(query);
        startTransition(() => {
            dispatch(executeLocalSearch(query));
        });
    };

    const handleClear = () => {
        setSearchTerm('');
        dispatch(clearSearchResults());
    };

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8 w-full min-h-screen bg-gray-50 flex flex-col">
            
            {/* Header Input Shell Frame - STICKY TOP */}
            <div className="bg-gray-50 pb-3 pt-2 shrink-0">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Search Categories</h1>
                
                <div className="relative bg-white rounded-xl shadow-sm border border-gray-200 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-all">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search for categories, services..."
                        className="w-full pl-12 pr-12 py-4 bg-transparent rounded-xl outline-none text-gray-800 placeholder-gray-400"
                        autoFocus
                    />
                    {isPending && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                        </div>
                    )}
                </div>
            </div>

            {/* Main Display Controller Engine */}
            <div className="flex-1 mt-2">
                {treeError && <div className="text-red-600 bg-red-50 p-3 rounded-lg text-sm mb-4">{treeError}</div>}

                {searchTerm.length > 0 ? (
                    /* --- CONDITIONAL SWITCH 1: Live Results Output Window --- */
                    <div style={{ opacity: isPending ? 0.6 : 1 }}>
                        {/* ... your searchResults.map list code goes here ... */}
                        <LiveSearchResults 
                            searchTerm={searchTerm}
                            searchResults={searchResults}
                            isSearching={isPending}
                            onCategoryClick={(category) => {
                                // Handle category click from search results (e.g., navigate to category page)
                                console.log('Category clicked:', category);
                            }}
                        />
                    </div>
                ) : (
                    /* --- CONDITIONAL SWITCH 2: Directory Tab Explorer (Hidden during search) --- */
                    <CategoryTabsLayout />
                )}
            </div>
        </div>
    );
}