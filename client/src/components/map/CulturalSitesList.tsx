import React from 'react';
import {
    Box,
    Typography,
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
    // Optional properties for GeoJSON-like structure
    properties?: {
        _id: string;
        name: string;
        description: string;
        category: string;
        coordinates: {
            lat: number;
            lng: number;
        };
    };
    geometry?: {
        coordinates: [number, number]; // [lng, lat] format
    };
}

type CulturalSitesListProps = {
    sites: CulturalSite[];
    onSiteClick: (coords: [number, number]) => void;
    selectedCategory: string;
    setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
    search: string;
    categories: string[];
    setCategories: React.Dispatch<React.SetStateAction<string[]>>;
    paginationLimit?: number;
};

const CATEGORY_COLORS: Record<string, string> = {
    museum: '#2563eb',
    restaurant: '#16a34a',
    artwork: '#f59e42',
    theatre: '#a21caf',
    hotel: '#e11d48',
    guest_house: '#0ea5e9',
    gallery: '#f97316',
    // ...add more as needed
};

const CulturalSitesList: React.FC<CulturalSitesListProps> = ({
    sites,
    onSiteClick,
    selectedCategory,
    search,
    paginationLimit = 200,
}) => {
    const theme = useTheme();

    const isAllMode = !search && !selectedCategory;
    const displayedSites = isAllMode
        ? sites.slice(0, paginationLimit)
        : sites;

    const shouldScroll = displayedSites.length > 6;

    return (
        <Box>
            {isAllMode && sites.length > paginationLimit && (
                <Box
                    sx={{
                        mb: 2,
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        background: theme.palette.mode === 'dark' ? '#23232b' : '#e0e7ef',
                        color: theme.palette.mode === 'dark' ? '#fff' : '#222',
                        fontStyle: 'italic',
                        fontSize: 15,
                        fontWeight: 500,
                        textAlign: 'center',
                        boxShadow: theme.palette.mode === 'dark'
                            ? '0 2px 8px 0 rgba(0,0,0,0.25)'
                            : '0 2px 8px 0 rgba(0,0,0,0.06)',
                    }}
                >
                    Few suggested sites. Use search or filters to find more.
                </Box>
            )}
            <Box
                sx={{
                    border: `1px solid ${theme.palette.mode === 'dark' ? '#374151' : '#e0e7ef'}`,
                    borderRadius: 3,
                    background: theme.palette.mode === 'dark' ? "#18181b" : "#f8fafc",
                    p: 2,
                    maxHeight: shouldScroll ? 420 : "auto",
                    overflowY: shouldScroll ? "auto" : "visible",
                    boxShadow: theme.palette.mode === 'dark'
                        ? '0 2px 12px 0 rgba(0,0,0,0.3)'
                        : '0 2px 12px 0 rgba(0,0,0,0.04)',
                    minHeight: 200,
                    transition: "all 0.3s ease",
                    // --- Custom Scrollbar Styling ---
                    '&::-webkit-scrollbar': {
                        width: 10,
                        borderRadius: 12,
                        background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: theme.palette.mode === 'dark' ? '#23232b' : '#e0e7ef',
                        borderRadius: 12,
                        border: '2px solid transparent',
                        backgroundClip: 'padding-box',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        background: theme.palette.mode === 'dark' ? '#374151' : '#cbd5e1',
                    },
                    '&::-webkit-scrollbar-corner': {
                        background: 'transparent',
                    },
                    // For Firefox
                    scrollbarColor: `${theme.palette.mode === 'dark' ? '#23232b' : '#e0e7ef'} transparent`,
                    scrollbarWidth: 'thin',
                }}
            >
                <List disablePadding>
                    {displayedSites.map(site => {
                        const props = site.properties || site;
                        const isSelected = selectedCategory && props.category === selectedCategory;

                        return (
                            <Fade in timeout={350} key={props._id || site._id}>
                                <Box>
                                    <ListItem
                                        onClick={() => onSiteClick([
                                            site.geometry ? site.geometry.coordinates[1] : props.coordinates.lat,
                                            site.geometry ? site.geometry.coordinates[0] : props.coordinates.lng
                                        ])}
                                        sx={{
                                            borderRadius: 2,
                                            mb: 1,
                                            px: 1.5,
                                            py: 1.2,
                                            transition: "all 0.3s ease",
                                            "&:hover": {
                                                background: theme.palette.mode === 'dark'
                                                    ? "#374151"
                                                    : "#e0e7ff",
                                                boxShadow: theme.palette.mode === 'dark'
                                                    ? '0 4px 12px rgba(0,0,0,0.4)'
                                                    : '0 4px 12px rgba(0,0,0,0.1)',
                                                transform: "translateY(-2px)",
                                            },
                                            alignItems: "flex-start",
                                            gap: 1,
                                            cursor: "pointer",
                                            // Dynamic background based on selection and theme
                                            background: isSelected
                                                ? theme.palette.mode === 'dark'
                                                    ? `${CATEGORY_COLORS[props.category]}20` // 20% opacity
                                                    : `${CATEGORY_COLORS[props.category]}10` // 10% opacity
                                                : theme.palette.mode === 'dark'
                                                    ? "#1f2937"
                                                    : "#ffffff",
                                            border: isSelected
                                                ? `2px solid ${CATEGORY_COLORS[props.category] || "#64748b"}40`
                                                : theme.palette.mode === 'dark'
                                                    ? "1px solid #374151"
                                                    : "1px solid #e5e7eb",
                                            boxShadow: isSelected
                                                ? `0 0 0 3px ${CATEGORY_COLORS[props.category] || "#64748b"}20`
                                                : theme.palette.mode === 'dark'
                                                    ? "0 1px 4px 0 rgba(0,0,0,0.2)"
                                                    : "0 1px 4px 0 rgba(0,0,0,0.04)",
                                        }}
                                    >
                                        <Avatar
                                            sx={{
                                                bgcolor: CATEGORY_COLORS[props.category] || "#64748b",
                                                width: 40,
                                                height: 40,
                                                mr: 2,
                                                boxShadow: theme.palette.mode === 'dark'
                                                    ? "0 2px 8px 0 rgba(0,0,0,0.4)"
                                                    : "0 2px 8px 0 rgba(0,0,0,0.10)",
                                                border: isSelected ? `2px solid ${CATEGORY_COLORS[props.category]}` : 'none',
                                            }}
                                        >
                                            <PlaceIcon sx={{ color: "#fff" }} />
                                        </Avatar>
                                        <ListItemText
                                            primary={
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Typography
                                                        variant="subtitle1"
                                                        fontWeight={isSelected ? 800 : 700}
                                                        color={
                                                            isSelected
                                                                ? CATEGORY_COLORS[props.category] || "text.primary"
                                                                : theme.palette.text.primary
                                                        }
                                                        sx={{
                                                            letterSpacing: 0.2,
                                                            transition: "all 0.2s ease"
                                                        }}
                                                    >
                                                        {props.name}
                                                    </Typography>
                                                    <Chip
                                                        label={
                                                            props.category
                                                                ? props.category.charAt(0).toUpperCase() + props.category.slice(1)
                                                                : "Unknown"
                                                        }
                                                        size="small"
                                                        sx={{
                                                            background: CATEGORY_COLORS[props.category] || "#334155",
                                                            color: "#fff",
                                                            fontWeight: 600,
                                                            ml: 0.5,
                                                            letterSpacing: 0.5,
                                                            px: 1,
                                                            opacity: isSelected ? 1 : 0.8,
                                                            transform: isSelected ? "scale(1.05)" : "scale(1)",
                                                            transition: "all 0.2s ease",
                                                        }}
                                                    />
                                                </Stack>
                                            }
                                            secondary={
                                                props.description && (
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{
                                                            mt: 0.5,
                                                            opacity: theme.palette.mode === 'dark' ? 0.8 : 0.7
                                                        }}
                                                    >
                                                        {props.description.length > 90
                                                            ? props.description.slice(0, 90) + "…"
                                                            : props.description}
                                                    </Typography>
                                                )
                                            }
                                        />
                                    </ListItem>
                                    <Divider sx={{
                                        borderColor: theme.palette.mode === 'dark'
                                            ? '#374151'
                                            : '#e5e7eb',
                                        opacity: 0.5
                                    }} />
                                </Box>
                            </Fade>
                        );
                    })}
                    {!displayedSites.length && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            align="center"
                            sx={{ mt: 2 }}
                        >
                            No sites found.
                        </Typography>
                    )}
                </List>
            </Box>
        </Box>
    );
};

export default CulturalSitesList;