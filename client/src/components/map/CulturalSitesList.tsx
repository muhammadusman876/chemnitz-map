import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import Select from 'react-select';

interface CulturalSite {
    _id: string;
    name: string;
    description: string;
    category: string;
    coordinates: {
        lat: number;
        lng: number;
    };
}

type CulturalSitesListProps = {
    onSiteClick: React.Dispatch<React.SetStateAction<[number, number] | null>>;
    selectedCategory: string;
    setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
};

const CATEGORY_COLORS: Record<string, string> = {
    museum: '#2563eb',      // blue
    restaurant: '#16a34a',  // green
    artwork: '#f59e42',     // orange
    theatre: '#a21caf',     // purple
    hotel: '#e11d48',       // red
    // ...add more as needed
};

const CulturalSitesList: React.FC<CulturalSitesListProps> = ({
    onSiteClick,
    selectedCategory,
    setSelectedCategory,
}) => {
    const [sites, setSites] = useState<CulturalSite[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [search, setSearch] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false); // <-- NEW

    // Fetch all sites and categories on mount
    useEffect(() => {
        fetch('http://localhost:5000/api/admin/')
            .then(res => res.json())
            .then(data => {
                setCategories(Array.from(new Set(data.map((site: CulturalSite) => site.category))));
            });
    }, []);

    // Fetch sites for selected category and search
    useEffect(() => {
        setLoading(true); // <-- NEW
        const params = new URLSearchParams();
        if (selectedCategory) params.append('category', selectedCategory);
        if (search) params.append('q', search);

        const url = `http://localhost:5000/api/admin/${params.toString() ? '?' + params.toString() : ''}`;
        fetch(url)
            .then(res => res.json())
            .then(data => {
                setSites(data);
                setLoading(false); // <-- NEW
            })
            .catch(() => setLoading(false)); // <-- NEW
    }, [selectedCategory, search]);

    const shouldScroll = sites.length > 5;

    // Prepare options for react-select
    const categoryOptions = [
        { value: '', label: 'All', color: '#334155' },
        ...categories.map(cat => ({
            value: cat,
            label: cat.charAt(0).toUpperCase() + cat.slice(1),
            color: CATEGORY_COLORS[cat] || '#334155'
        }))
    ];

    // Simple spinner SVG
    const Spinner = () => (
        <svg className="animate-spin h-4 w-4 text-indigo-600 inline-block ml-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
    );

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-8">
            <h2 className="text-3xl font-bold mb-6 text-center text-indigo-700">Cultural Sites</h2>
            {/* Search input */}
            <div className="mb-4 flex items-center">
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name or description..."
                    className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition w-full"
                />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                <label className="font-medium text-gray-700 w-full sm:w-auto">
                    Filter by category:
                    <div className="mt-2 sm:mt-0 sm:ml-2 min-w-[180px]">
                        <Select
                            value={categoryOptions.find(opt => opt.value === selectedCategory)}
                            onChange={opt => setSelectedCategory(opt?.value || '')}
                            options={categoryOptions}
                            isSearchable={false}
                            styles={{
                                option: (styles, { data, isFocused, isSelected }) => ({
                                    ...styles,
                                    backgroundColor: isSelected
                                        ? data.color
                                        : isFocused
                                            ? '#e0e7ff'
                                            : undefined,
                                    color: isSelected
                                        ? '#fff'
                                        : '#334155', // Always dark text for unselected/unfocused
                                    fontWeight: isSelected ? 700 : 400,
                                }),
                                singleValue: (styles, { data }) => ({
                                    ...styles,
                                    backgroundColor: data.color,
                                    color: '#fff',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontWeight: 600,
                                }),
                                control: (styles) => ({
                                    ...styles,
                                    minHeight: '40px',
                                }),
                                menu: (styles) => ({
                                    ...styles,
                                    zIndex: 20,
                                }),
                            }}
                        />
                    </div>
                </label>
                <span className="text-sm text-gray-500 flex items-center">
                    {loading ? (
                        <>
                            Loading
                            <Spinner />
                        </>
                    ) : (
                        <>
                            Showing {sites.length}{"  "}
                            {selectedCategory === ""
                                ? "sites"
                                : categoryOptions.find(opt => opt.value === selectedCategory)?.label || "sites"}
                        </>
                    )}
                </span>
            </div>
            {/* "All" category: flat, scrollable list */}
            {selectedCategory === '' ? (
                <div className="h-96 overflow-y-auto border rounded p-2 bg-gray-50">
                    <ul>
                        {sites.map(site => (
                            <li
                                key={site._id}
                                className="py-2 px-2 hover:bg-indigo-50 rounded transition cursor-pointer"
                                onClick={() => onSiteClick([site.coordinates.lat, site.coordinates.lng])}
                            >
                                <span
                                    className="font-semibold"
                                    style={{ color: CATEGORY_COLORS[site.category] || '#334155' }}
                                >
                                    {site.name}
                                </span>
                                {site.description && (
                                    <span className="block text-sm text-gray-600">{site.description}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                // Other categories: scrollable if more than 5 sites
                <div className={shouldScroll ? "max-h-64 overflow-y-auto border rounded p-2 bg-gray-50" : ""}>
                    <ul className="divide-y divide-gray-200">
                        {sites.map(site => (
                            <li
                                key={site._id}
                                className="py-4 px-2 hover:bg-indigo-50 rounded transition flex flex-col gap-1 cursor-pointer"
                                onClick={() => onSiteClick([site.coordinates.lat, site.coordinates.lng])}
                            >
                                <span className="font-semibold text-lg text-indigo-800">{site.name}</span>
                                <span className="text-sm text-gray-600">{site.description}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CulturalSitesList;