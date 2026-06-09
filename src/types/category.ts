export interface Category {
    id: number;
    name: string;
    slug: string;
    description: string;
    parent: number | null;
    is_active: boolean;
    is_featured: boolean;
    sort_order: number;
    meta_title: string;
}

export interface CategorySearchResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Category[];
}


export interface CategoryNode {
    id: number;
    name: string;
    slug: string;
    children?: CategoryNode[]; // Optional because deeply nested items have no children
}

// Keep the lightweight type for recent searches
export type RecentCategory = Pick<CategoryNode, 'id' | 'name' | 'slug'>;