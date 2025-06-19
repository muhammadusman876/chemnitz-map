import React, { useEffect, useState } from 'react';
import L from 'leaflet';

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

function getCategoryIcon(category: string) {
    const color = CATEGORY_COLORS[category] || '#64748b'; // default gray
    return L.divIcon({
        className: '',
        html: `<svg width="32" height="41" viewBox="0 0 32 41" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="16" cy="16" rx="14" ry="14" fill="${color}" stroke="#222" stroke-width="2"/>
      <rect x="14" y="30" width="4" height="8" rx="2" fill="${color}" stroke="#222" stroke-width="2"/>
    </svg>`,
        iconSize: [32, 41],
        iconAnchor: [16, 41],
        popupAnchor: [0, -41],
    });
}

const CulturalSitesList: React.FC<CulturalSitesListProps> = ({
    onSiteClick,
    selectedCategory,
    setSelectedCategory,
}) => {
    const [sites, setSites] = useState<CulturalSite[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [search, setSearch] = useState<string>(''); // <-- NEW

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
        const params = new URLSearchParams();
        if (selectedCategory) params.append('category', selectedCategory);
        if (search) params.append('q', search);

        const url = `http://localhost:5000/api/admin/${params.toString() ? '?' + params.toString() : ''}`;
        fetch(url)
            .then(res => res.json())
            .then(data => setSites(data));
    }, [selectedCategory, search]);

    const shouldScroll = sites.length > 5;

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
                <label className="font-medium text-gray-700">
                    Filter by category:
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="ml-2 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                    >
                        <option value="">All</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </label>
                <span className="text-sm text-gray-500">
                    Showing {sites.length} {selectedCategory ? selectedCategory : 'sites'}
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