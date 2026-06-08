"use client";

import React, { useState, useEffect } from 'react';
import { Search, Loader2, FolderSearch, X, ChevronRight, ChevronLeft,  Trash2, Clock } from 'lucide-react';
import { Category } from '@/types/category';
import { useAppDispatch, useAppSelector } from '@/store/useStore';
import { useDebounce } from '@/hooks/useDebounce';
import { fetchCategories, clearSearchResults, addRecentSearch, removeRecentSearch } from '@/store/features/category/categorySlice';

export default function CategorySearchPage() {
	const dispatch = useAppDispatch();
	const { results, recentSearches, isLoading, error, totalCount } = useAppSelector((state) => state.category);

	const [searchTerm, setSearchTerm] = useState('');
	const [isFetching, setIsFetching] = useState(false); // 1. New local fetching state

	const debouncedSearch = useDebounce(searchTerm, 500);

	// 2. Check if the user is actively typing (debounce hasn't caught up yet)
	const isTyping = searchTerm !== debouncedSearch;

	// 3. Combine all loading states to perfectly block UI flashes
	const isEffectivelyLoading = isLoading || isFetching || isTyping;

	useEffect(() => {
		if (debouncedSearch.trim().length > 0) {
			// Set local fetching instantly to bridge the Redux dispatch gap
			setIsFetching(true);

			// .finally() ensures we turn it off whether it succeeds or fails
			dispatch(fetchCategories(debouncedSearch)).finally(() => {
				setIsFetching(false);
			});
		} else {
			dispatch(clearSearchResults());
		}
	}, [debouncedSearch, dispatch]);

	const handleClear = () => {
		setSearchTerm('');
		dispatch(clearSearchResults());
	};

	const handleCategoryClick = (category: Category) => {
		// Save to persistent recent searches
		dispatch(addRecentSearch(category));

		// TODO: Execute your navigation or selection logic here
		console.log(`Selected category: ${category.name}`);
		// e.g., router.push(`/category/${category.slug}`)
	};

	return (
		<div className="max-w-3xl mx-auto p-4 md:p-8 w-full min-h-screen bg-gray-50">
			<h1 className="text-2xl font-bold text-gray-800 mb-6">Search Categories</h1>

			{/* Search Input Box */}
			<div className="relative bg-white rounded-xl shadow-sm border border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
				<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
				<input
					type="search"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					placeholder="Search for medical, electronics, etc..."
					className="w-full pl-12 pr-12 py-4 bg-transparent rounded-xl outline-none text-gray-800 placeholder-gray-400"
					autoFocus
				/>

				{/* 4. Use the combined loading state for the spinner */}
				{isEffectivelyLoading ? (
					<div className="absolute right-4 top-1/2 -translate-y-1/2">
						<Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
					</div>
				) : searchTerm.length > 0 ? (
					<button
						onClick={handleClear}
						className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
					>
						<X className="w-4 h-4" />
					</button>
				) : null}
			</div>

			{/* Error State */}
			{error && (
				<div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 text-sm">
					{error}
				</div>
			)}

			{/* Results Area */}
			<div className="mt-6">
				{/* Results Count Header */}
				{!isEffectivelyLoading && searchTerm.length > 0 && results.length > 0 && (
					<p className="text-sm font-medium text-gray-500 mb-4 px-1">
						Found {totalCount} result{totalCount !== 1 ? 's' : ''} for "{debouncedSearch}"
					</p>
				)}

				<div className="mt-6">

					{/* --- LIVE SEARCH RESULTS --- */}
					{searchTerm.length > 0 ? (
						<>
							{!isEffectivelyLoading && results.length > 0 && (
								<p className="text-sm font-medium text-gray-500 mb-4 px-1">
									Found {totalCount} result{totalCount !== 1 ? 's' : ''} for "{debouncedSearch}"
								</p>
							)}

							<div className="space-y-3">
								{results.map((category) => (
									<button
										key={`result-${category.id}`}
										onClick={() => handleCategoryClick(category)}
										className="w-full text-left bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all flex items-center justify-between group active:scale-[0.99]"
									>
										<div className="flex items-center gap-4">
											<div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
												<FolderSearch className="w-5 h-5 text-blue-600" />
											</div>
											<div>
												<h3 className="font-semibold text-gray-800 text-[16px]">
													{category.name}
												</h3>
												<p className="text-[13px] text-gray-400 mt-0.5">
													Slug: /{category.slug}
												</p>
											</div>
										</div>

										{!category.is_active && (
											<span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">
												Inactive
											</span>
										)}
									</button>
								))}
							</div>

							{/* Empty State for Live Search */}
							{!isEffectivelyLoading && results.length === 0 && !error && (
								<div className="flex flex-col items-center justify-center py-16 text-center">
									<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
										<Search className="w-8 h-8 text-gray-400" />
									</div>
									<h3 className="text-lg font-medium text-gray-800">No categories found</h3>
									<p className="text-gray-500 mt-1 max-w-sm">
										We couldn't find any categories matching "{searchTerm}".
									</p>
								</div>
							)}
						</>
					) : (
						/* --- RECENT SEARCHES (Shown when input is empty) --- */
						recentSearches.length > 0 && (
							<div>
								<h3 className="text-[13px] font-medium text-gray-500 mb-4 px-1 uppercase tracking-wider">
									Recent Searches
								</h3>
								<div className="space-y-2">
									{recentSearches.map((category) => (
										<div
											key={`recent-${category.slug}`}
											className="flex items-center w-full bg-white rounded-xl shadow-sm border border-gray-100 hover:border-gray-300 transition-all group overflow-hidden"
										>
											{/* Main clickable area */}
											<button
												// onClick={() => handleCategoryClick(category)}
												className="flex-1 flex items-center gap-4 p-4 text-left active:bg-gray-50"
											>
												<Clock className="w-5 h-5 text-gray-400 shrink-0" />
												<span className="font-medium text-gray-700 text-[15px] truncate">
													{category.name}
												</span>
											</button>

											{/* Individual Delete Button */}
											<button
												onClick={(e) => {
													e.stopPropagation(); // Prevent clicking the parent button
													dispatch(removeRecentSearch(category.slug));
												}}
												className="p-4 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
												title="Remove from recent"
											>
												<Trash2 className="w-4 h-4" />
											</button>
										</div>
									))}
								</div>
							</div>
						)
					)}
				</div>
			</div>
		</div>
	);
}