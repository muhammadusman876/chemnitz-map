import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import Select from 'react-select';
import {
    Box,
    Typography,
    TextField,
    InputAdornment,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Divider,
    Chip,
    Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

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
    const [loading, setLoading] = useState<boolean>(false);

    // Fetch all categories on mount
    useEffect(() => {
        fetch('http://localhost:5000/api/admin/')
            .then(res => res.json())
            .then(data => {
                setCategories(Array.from(new Set(data.map((site: CulturalSite) => site.category))));
            });
    }, []);

    // Fetch sites for selected category and search
    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedCategory) params.append('category', selectedCategory);
        if (search) params.append('q', search);

        const url = `http://localhost:5000/api/admin/${params.toString() ? '?' + params.toString() : ''}`;
        fetch(url)
            .then(res => res.json())
            .then(data => {
                setSites(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
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

    return (
        <Box>
            <Typography variant="h4" fontWeight={800} align="center" color="primary" gutterBottom>
                Cultural Sites
            </Typography>
            {/* Search input */}
            <Box sx={{ mb: 3 }}>
                <TextField
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name or description..."
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="primary" />
                            </InputAdornment>
                        ),
                    }}
                    variant="outlined"
                    sx={{ background: "#f8fafc", borderRadius: 2 }}
                />
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Box sx={{ minWidth: 220 }}>
                    <Typography variant="subtitle1" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
                        Filter by category:
                    </Typography>
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
                                    : '#334155',
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
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: { xs: 2, sm: 0 } }}>
                    {loading ? (
                        <>
                            Loading <CircularProgress size={16} sx={{ ml: 1 }} />
                        </>
                    ) : (
                        <>
                            Showing {sites.length}{" "}
                            {selectedCategory === ""
                                ? "sites"
                                : categoryOptions.find(opt => opt.value === selectedCategory)?.label || "sites"}
                        </>
                    )}
                </Typography>
            </Stack>
            {/* List */}
            <Box
                sx={{
                    border: "1px solid #e0e7ef",
                    borderRadius: 3,
                    background: "#f8fafc",
                    p: 2,
                    maxHeight: selectedCategory === '' ? 400 : shouldScroll ? 300 : "auto",
                    overflowY: selectedCategory === '' || shouldScroll ? "auto" : "visible",
                }}
            >
                <List>
                    {sites.map(site => (
                        <React.Fragment key={site._id}>
                            <ListItem
                                button
                                onClick={() => onSiteClick([site.coordinates.lat, site.coordinates.lng])}
                                sx={{
                                    borderRadius: 2,
                                    mb: 1,
                                    transition: "background 0.2s",
                                    "&:hover": { background: "#e0e7ff" },
                                    alignItems: "flex-start",
                                }}
                            >
                                <ListItemText
                                    primary={
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Typography
                                                variant="subtitle1"
                                                fontWeight={700}
                                                color={CATEGORY_COLORS[site.category] || "text.primary"}
                                            >
                                                {site.name}
                                            </Typography>
                                            <Chip
                                                label={site.category.charAt(0).toUpperCase() + site.category.slice(1)}
                                                size="small"
                                                sx={{
                                                    background: CATEGORY_COLORS[site.category] || "#334155",
                                                    color: "#fff",
                                                    fontWeight: 600,
                                                }}
                                            />
                                        </Stack>
                                    }
                                    secondary={
                                        site.description && (
                                            <Typography variant="body2" color="text.secondary">
                                                {site.description}
                                            </Typography>
                                        )
                                    }
                                />
                            </ListItem>
                            <Divider />
                        </React.Fragment>
                    ))}
                    {!sites.length && !loading && (
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                            No sites found.
                        </Typography>
                    )}
                </List>
            </Box>
        </Box>
    );
};

export default CulturalSitesList;