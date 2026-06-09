"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useAppSelector } from '@/store/useStore';
import { CategoryNode } from '@/types/category';
import Link from 'next/link';

export default function CategoryTabsLayout() {
    const { fullTree, isTreeLoaded } = useAppSelector((state) => state.categorySearch);
    const [activeTabId, setActiveTabId] = useState<number | null>(null);
    
    const tabsContainerRef = useRef<HTMLDivElement>(null);
    const tabRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});

    // 1. Initialize active tab once data loads
    useEffect(() => {
        if (fullTree.length > 0 && activeTabId === null) {
            setActiveTabId(fullTree[0].id);
        }
    }, [fullTree, activeTabId]);

    // 2. High-Performance Scroll-Spy using IntersectionObserver
    useEffect(() => {
        if (fullTree.length === 0) return;

        const observerOptions = {
            root: null, // viewport
            rootMargin: '-120px 0px -70% 0px', // Adjusted to trigger exactly when passing under the search header
            threshold: 0,
        };

        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = Number(entry.target.id.replace('cat-sec-', ''));
                    setActiveTabId(id);
                    
                    // Auto-scroll the horizontal tab bar if active tab goes off-screen
                    const activeTabButton = tabRefs.current[id];
                    if (activeTabButton && tabsContainerRef.current) {
                        tabsContainerRef.current.scrollTo({
                            left: activeTabButton.offsetLeft - 32,
                            behavior: 'smooth',
                        });
                    }
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        // Track all top-level category container DOM elements
        fullTree.forEach((category) => {
            const el = document.getElementById(`cat-sec-${category.id}`);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [fullTree]);

    // 3. Smooth click-to-scroll handler
    const handleTabClick = (id: number) => {
        setActiveTabId(id);
        const element = document.getElementById(`cat-sec-${id}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    if (!isTreeLoaded || fullTree.length === 0) return null;

    return (
        <div className="w-full flex flex-col">
            {/* Sticky Horizontal Tab Bar */}
            <div 
                className="sticky top-20 z-20 bg-gray-50 border-b border-gray-200/80 backdrop-blur-md px-4 py-2 -mx-4 overflow-x-auto scrollbar-none flex gap-2 shrink-0 transition-all"
                ref={tabsContainerRef}
            >
                {fullTree.map((category) => (
                    <button
                        key={category.id}
                        ref={(el) => { tabRefs.current[category.id] = el; }}
                        onClick={() => handleTabClick(category.id)}
                        className={`px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap border transition-all duration-200 ${
                            activeTabId === category.id
                                ? 'bg-green-600 border-green-600 text-white shadow-sm'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                    >
                        {category.name}
                    </button>
                ))}
            </div>

            {/* Vertical Browse Directory Layout */}
            <div className="mt-6 space-y-10 pb-32">
                {fullTree.map((mainCategory) => (
                    <div 
                        key={mainCategory.id} 
                        id={`cat-sec-${mainCategory.id}`} 
                        className="category-section scroll-mt-35" // scroll-mt offsets sticky tabs + sticky input elements perfectly
                    >
                        {/* Section Header */}
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4 tracking-tight">
                            {mainCategory.name}
                        </h2>

                        {/* Nested Sub-Categories Wrapper */}
                        <div className="space-y-6">
                            {mainCategory.children?.map((subCategory) => (
                                <div key={subCategory.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <h3 className="font-semibold text-gray-700 text-sm mb-3">
                                        {subCategory.name}
                                    </h3>
                                    
                                    {/* Sub-sub categories styled in a scannable grid */}
                                    <div className="flex flex-wrap gap-2">
                                        {subCategory.children?.map((leafCategory) => (
                                            <Link
                                                key={leafCategory.id}
                                                href={`/kolkata/jadavpur/${leafCategory.slug}`} // Dynamically maps to your established routing scheme
                                                className="px-3 py-1.5 bg-gray-50 hover:bg-green-50 hover:text-green-700 text-gray-600 text-xs font-medium rounded-lg border border-gray-100 transition-colors"
                                            >
                                                {leafCategory.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}