import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Divider,
    Chip,
    Stack,
    Fade,
    Avatar,
    useTheme,
} from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';

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
    onSiteClick: (coords: [number, number]) => void; // <-- change this line
    selectedCategory: string;
    setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
    search: string;
    categories: string[];
    setCategories: React.Dispatch<React.SetStateAction<string[]>>;
};

const CATEGORY_COLORS: Record<string, string> = {
    museum: '#2563eb',
    restaurant: '#16a34a',
    artwork: '#f59e42',
    theatre: '#a21caf',
    hotel: '#e11d48',
    // ...add more as needed
};

const CulturalSitesList: React.FC<CulturalSitesListProps> = ({
    onSiteClick,
    selectedCategory,
    setSelectedCategory,
    search,
    categories,
    setCategories,
}) => {
    const [sites, setSites] = useState<CulturalSite[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const theme = useTheme();

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
                // Update categories if not set yet
                if (categories.length === 0 && data.length > 0) {
                    setCategories(Array.from(new Set(data.map((site: CulturalSite) => site.category))));
                }
            })
            .catch(() => setLoading(false));
    }, [selectedCategory, search, setCategories, categories.length]);

    const shouldScroll = sites.length > 6;

    return (
        <Box>
            <Box
                sx={{
                    border: "1px solid #e0e7ef",
                    borderRadius: 3,
                    background: theme.palette.mode === 'dark' ? "#18181b" : "#f8fafc",
                    p: 2,
                    maxHeight: shouldScroll ? 420 : "auto",
                    overflowY: shouldScroll ? "auto" : "visible",
                    boxShadow: '0 2px 12px 0 rgba(0,0,0,0.04)',
                    minHeight: 200,
                    transition: "background 0.3s",
                }}
            >
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {loading ? (
                        <>
                            Loading <CircularProgress size={16} sx={{ ml: 1 }} />
                        </>
                    ) : (
                        <>
                            Showing {sites.length}{" "}
                            {selectedCategory === ""
                                ? "sites"
                                : categories.find(cat => cat === selectedCategory) || "sites"}
                        </>
                    )}
                </Typography>
                <List disablePadding>
                    {sites.map(site => (
                        <Fade in timeout={350} key={site._id}>
                            <Box>
                                <ListItem
                                    onClick={() => onSiteClick([site.coordinates.lat, site.coordinates.lng])}
                                    sx={{
                                        borderRadius: 2,
                                        mb: 1,
                                        px: 1.5,
                                        py: 1.2,
                                        transition: "background 0.2s, box-shadow 0.2s",
                                        "&:hover": {
                                            background: theme.palette.mode === 'dark' ? "#27272a" : "#e0e7ff",
                                            boxShadow: 2,
                                        },
                                        alignItems: "flex-start",
                                        gap: 1,
                                        cursor: "pointer",
                                        background: theme.palette.mode === 'dark' ? "#23232b" : "#fff",
                                        boxShadow: "0 1px 4px 0 rgba(0,0,0,0.04)",
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            bgcolor: CATEGORY_COLORS[site.category] || "#64748b",
                                            width: 40,
                                            height: 40,
                                            mr: 2,
                                            boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)",
                                        }}
                                    >
                                        <PlaceIcon sx={{ color: "#fff" }} />
                                    </Avatar>
                                    <ListItemText
                                        primary={
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Typography
                                                    variant="subtitle1"
                                                    fontWeight={700}
                                                    color={CATEGORY_COLORS[site.category] || "text.primary"}
                                                    sx={{ letterSpacing: 0.2 }}
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
                                                        ml: 0.5,
                                                        letterSpacing: 0.5,
                                                        px: 1,
                                                    }}
                                                />
                                            </Stack>
                                        }
                                        secondary={
                                            site.description && (
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                    {site.description.length > 90
                                                        ? site.description.slice(0, 90) + "…"
                                                        : site.description}
                                                </Typography>
                                            )
                                        }
                                    />
                                </ListItem>
                                <Divider />
                            </Box>
                        </Fade>
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