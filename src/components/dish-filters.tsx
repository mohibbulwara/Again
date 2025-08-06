'use client';

import { useLanguage } from '@/lib/hooks';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import RatingInput from '@/components/rating-input';
import { X, Search, Filter } from 'lucide-react';
import { categories } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';

const categoryNames = ['All', ...categories.map(c => c.name)];

export default function DishFilters() {
    const { t } = useLanguage();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Local state for controlled components, initialized from URL
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [category, setCategory] = useState(searchParams.get('category') || 'All');
    const [rating, setRating] = useState(Number(searchParams.get('rating')) || 0);
    const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'rating-desc');
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    
    const [debouncedSearch] = useDebounce(searchTerm, 500);

    const createQueryString = useCallback(
        (paramsToUpdate: Record<string, string | number | undefined>) => {
          const params = new URLSearchParams(searchParams.toString())
          
          for (const [name, value] of Object.entries(paramsToUpdate)) {
            if (value !== undefined && value !== null && String(value).length > 0) {
                params.set(name, String(value));
            } else {
                params.delete(name);
            }
          }
     
          return params.toString()
        },
        [searchParams]
    );

    useEffect(() => {
        const query = createQueryString({ 
            search: debouncedSearch ? debouncedSearch : undefined,
            category: category === 'All' ? undefined : category,
            rating: rating > 0 ? rating : undefined,
            sortBy: sortBy,
        });
        router.replace(pathname + (query ? '?' + query : ''), { scroll: false });
    }, [debouncedSearch, category, rating, sortBy, router, pathname, createQueryString]);

    const clearFilters = () => {
        setSearchTerm('');
        setCategory('All');
        setRating(0);
        setSortBy('rating-desc');
    };

    const activeFiltersCount = [
        searchTerm ? 1 : 0,
        category !== 'All' ? 1 : 0,
        rating > 0 ? 1 : 0,
        sortBy !== 'rating-desc' ? 1 : 0
    ].reduce((a, b) => a + b, 0);

    return (
        <div className="space-y-6">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
                <Button
                    variant="outline"
                    onClick={() => setMobileFiltersOpen(true)}
                    className="gap-x-2 text-sm"
                >
                    <Filter className="h-4 w-4" />
                    Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </Button>
            </div>

            {/* Search - Always Visible */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                    type="text"
                    placeholder="Search dishes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full border-gray-300 focus:border-primary focus:ring-primary rounded-lg"
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                        <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    </button>
                )}
            </div>

            {/* Desktop Filters */}
            <div className="hidden lg:block space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Refine by</h3>
                    {activeFiltersCount > 0 && (
                        <button
                            onClick={clearFilters}
                            className="text-sm font-medium text-primary hover:text-primary/80"
                        >
                            Clear all
                        </button>
                    )}
                </div>

                {/* Sort By */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full border-gray-300 focus:border-primary focus:ring-primary">
                            <SelectValue placeholder="Select sorting" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-md">
                            <SelectItem value="rating-desc" className="hover:bg-gray-50">
                                Best Rating
                            </SelectItem>
                            <SelectItem value="price-asc" className="hover:bg-gray-50">
                                Price: Low to High
                            </SelectItem>
                            <SelectItem value="price-desc" className="hover:bg-gray-50">
                                Price: High to Low
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</Label>
                    <div className="grid grid-cols-2 gap-2">
                        {categoryNames.map((cat) => (
                            <Button
                                key={cat}
                                variant={category === cat ? 'default' : 'outline'}
                                onClick={() => setCategory(cat)}
                                className={`text-sm ${category === cat ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                {cat === 'All' ? t('all') : cat}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Rating Filter */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Minimum Rating</Label>
                    <div className="flex items-center space-x-4">
 <RatingInput
 value={rating}
 onChange={setRating}
 />
                        {rating > 0 && (
                            <button
                                onClick={() => setRating(0)}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filters Panel */}
            {mobileFiltersOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-25" onClick={() => setMobileFiltersOpen(false)} />
                    <div className="absolute inset-y-0 right-0 max-w-xs w-full bg-white dark:bg-gray-800 shadow-xl overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
                                <button
                                    type="button"
                                    onClick={() => setMobileFiltersOpen(false)}
                                    className="-mr-2 w-10 h-10 flex items-center justify-center"
                                >
                                    <X className="h-6 w-6 text-gray-400" />
                                </button>
                            </div>

                            <div className="mt-6 space-y-6">
                                {/* Sort By */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by</Label>
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select sorting" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="rating-desc">Best Rating</SelectItem>
                                            <SelectItem value="price-asc">Price: Low to High</SelectItem>
                                            <SelectItem value="price-desc">Price: High to Low</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Category Filter */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {categoryNames.map((cat) => (
                                            <Button
                                                key={cat}
                                                variant={category === cat ? 'default' : 'outline'}
                                                onClick={() => setCategory(cat)}
                                                className={`text-sm ${category === cat ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                                            >
                                                {cat === 'All' ? t('all') : cat}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Rating Filter */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Minimum Rating</Label>
                                    <div className="flex items-center space-x-4">
                                        <RatingInput 
 value={rating}
 onChange={setRating}
                                        />
                                        {rating > 0 && (
                                            <button
                                                onClick={() => setRating(0)}
                                                className="text-sm text-gray-500 hover:text-gray-700"
                                            >
                                                Reset
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Button
                                    onClick={() => setMobileFiltersOpen(false)}
                                    className="w-full"
                                >
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}