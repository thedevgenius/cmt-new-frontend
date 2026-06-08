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