// Helper function to search a nested tree and return a flat array of matches

import { CategoryNode } from "@/types/category";

export const searchCategoryTree = (
    nodes: CategoryNode[], 
    query: string
): CategoryNode[] => {
    let results: CategoryNode[] = [];
    const lowerQuery = query.toLowerCase();

    for (const node of nodes) {
        // 1. Check if the current node matches
        if (node.name.toLowerCase().includes(lowerQuery) || node.slug.toLowerCase().includes(lowerQuery)) {
            // Push a copy without the children array so the UI list stays flat and clean
            const { children, ...flatNode } = node;
            results.push(flatNode);
        }

        // 2. If it has children, recursively search them and merge the results
        if (node.children && node.children.length > 0) {
            results = results.concat(searchCategoryTree(node.children, query));
        }
    }

    return results;
};