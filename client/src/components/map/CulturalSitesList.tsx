import React from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    Divider,
    Chip,
    Fade,
    Avatar,
    useTheme,
} from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import useMediaQuery from '@mui/material/useMediaQuery';

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
    museum: '#dc2626',
    gallery: '#06b6d4',
    artwork: '#F564A9',
    theatre: '#A888B5',
    hotel: '#A27B5C',
    guest_house: '#f97316',
    restaurant: '#10b981',  // emerald
};

const CulturalSitesList: React.FC<CulturalSitesListProps> = ({
    sites,
    onSiteClick,
    selectedCategory,
    search,
    paginationLimit = 200,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
                        px: { xs: 1, sm: 2 },
                        py: { xs: 0.5, sm: 1 },
                        borderRadius: 2,
                        background: theme.palette.mode === 'dark' ? '#23232b' : '#e0e7ef',
                        color: theme.palette.mode === 'dark' ? '#fff' : '#222',
                        fontStyle: 'italic',
                        fontSize: { xs: 13, sm: 15 },
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
                    p: { xs: 1, sm: 2 },
                    maxHeight: shouldScroll ? (isMobile ? 320 : 420) : "auto",
                    overflowY: shouldScroll ? "auto" : "visible",
                    boxShadow: theme.palette.mode === 'dark'
                        ? '0 2px 12px 0 rgba(0,0,0,0.3)'
                        : '0 2px 12px 0 rgba(0,0,0,0.04)',
                    minHeight: 120,
                    transition: "all 0.3s ease",
                    // --- Custom Scrollbar Styling ---
                    '&::-webkit-scrollbar': {
                        width: 8,
                        borderRadius: 10,
                        background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: theme.palette.mode === 'dark' ? '#23232b' : '#e0e7ef',
                        borderRadius: 10,
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
                                            borderRadius: 3,
                                            mb: 1.5,
                                            px: { xs: 1.5, sm: 2 },
                                            py: { xs: 1, sm: 1.5 },
                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                            alignItems: "flex-start",
                                            gap: 1,
                                            cursor: "pointer",
                                            background: isSelected
                                                ? theme.palette.mode === 'dark'
                                                    ? `linear-gradient(135deg, ${CATEGORY_COLORS[props.category]}15, ${CATEGORY_COLORS[props.category]}08)`
                                                    : `linear-gradient(135deg, ${CATEGORY_COLORS[props.category]}08, ${CATEGORY_COLORS[props.category]}04)`
                                                : theme.palette.mode === 'dark'
                                                    ? "linear-gradient(135deg, #1f2937, #111827)"
                                                    : "linear-gradient(135deg, #ffffff, #f8fafc)",
                                            border: isSelected
                                                ? `2px solid ${CATEGORY_COLORS[props.category] || "#64748b"}60`
                                                : theme.palette.mode === 'dark'
                                                    ? "1px solid #374151"
                                                    : "1px solid #e5e7eb",
                                            boxShadow: isSelected
                                                ? `0 4px 20px 0 ${CATEGORY_COLORS[props.category] || "#64748b"}20, 0 0 0 1px ${CATEGORY_COLORS[props.category] || "#64748b"}10`
                                                : theme.palette.mode === 'dark'
                                                    ? "0 2px 8px 0 rgba(0,0,0,0.3), 0 1px 3px 0 rgba(0,0,0,0.2)"
                                                    : "0 2px 8px 0 rgba(0,0,0,0.06), 0 1px 3px 0 rgba(0,0,0,0.04)",
                                            transform: isSelected ? 'translateY(-1px)' : 'translateY(0)',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: theme.palette.mode === 'dark'
                                                    ? "0 4px 16px 0 rgba(0,0,0,0.4), 0 2px 6px 0 rgba(0,0,0,0.3)"
                                                    : "0 4px 16px 0 rgba(0,0,0,0.1), 0 2px 6px 0 rgba(0,0,0,0.06)",
                                            },
                                        }}
                                    >
                                        <Avatar
                                            sx={{
                                                bgcolor: CATEGORY_COLORS[props.category] || "#64748b",
                                                width: { xs: 36, sm: 44 },
                                                height: { xs: 36, sm: 44 },
                                                mr: { xs: 1.5, sm: 2 },
                                                boxShadow: theme.palette.mode === 'dark'
                                                    ? "0 3px 12px 0 rgba(0,0,0,0.4)"
                                                    : "0 3px 12px 0 rgba(0,0,0,0.15)",
                                                border: isSelected
                                                    ? `3px solid ${CATEGORY_COLORS[props.category]}`
                                                    : `2px solid ${theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb'}`,
                                                borderRadius: '50% 50% 50% 0',
                                                transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                position: 'relative',
                                                '&::after': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    bottom: '-2px',
                                                    right: '-2px',
                                                    width: '6px',
                                                    height: '6px',
                                                    backgroundColor: CATEGORY_COLORS[props.category] || "#64748b",
                                                    borderRadius: '50%',
                                                    border: `1px solid ${theme.palette.mode === 'dark' ? '#18181b' : '#ffffff'}`,
                                                    opacity: isSelected ? 1 : 0.7,
                                                },
                                            }}
                                        >
                                            <PlaceIcon sx={{
                                                color: "#fff",
                                                fontSize: { xs: 22, sm: 26 },
                                                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                                                transform: 'translateY(-1px)',
                                            }} />
                                        </Avatar>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
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
                                                            transition: "all 0.2s ease",
                                                            fontSize: { xs: 15, sm: 17 },
                                                        }}
                                                    >
                                                        {props.name}
                                                    </Typography>
                                                    <Box>
                                                        <Chip
                                                            label={
                                                                props.category
                                                                    ? props.category.charAt(0).toUpperCase() + props.category.slice(1).replace(/_/g, ' ')
                                                                    : "Unknown"
                                                            }
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: CATEGORY_COLORS[props.category] || "#334155",
                                                                color: "#fff",
                                                                fontWeight: 500,
                                                                letterSpacing: 0.3,
                                                                px: 1,
                                                                py: 0.2,
                                                                opacity: isSelected ? 1 : 0.9,
                                                                transform: isSelected ? "scale(1.05)" : "scale(1)",
                                                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                                fontSize: { xs: 10, sm: 11 },
                                                                height: { xs: 20, sm: 22 },
                                                                boxShadow: `0 1px 3px 0 ${CATEGORY_COLORS[props.category] || "#334155"}40`,
                                                                border: `1px solid ${CATEGORY_COLORS[props.category] || "#334155"}30`,
                                                                borderRadius: 1.5,
                                                                '& .MuiChip-label': {
                                                                    fontSize: { xs: 10, sm: 11 },
                                                                    px: 0.5,
                                                                },
                                                            }}
                                                        />
                                                    </Box>
                                                </Box>
                                            }
                                            secondary={props.description ? (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    component="span"
                                                    sx={{
                                                        mt: 0.5,
                                                        opacity: theme.palette.mode === 'dark' ? 0.8 : 0.7,
                                                        fontSize: { xs: 12, sm: 14 },
                                                        display: 'block',
                                                    }}
                                                >
                                                    {props.description.length > 90
                                                        ? props.description.slice(0, 90) + "…"
                                                        : props.description}
                                                </Typography>
                                            ) : null}
                                        />
                                    </ListItem>
                                    <Divider sx={{
                                        borderColor: theme.palette.mode === 'dark'
                                            ? '#374151'
                                            : '#e5e7eb',
                                        opacity: 0.3,
                                        mx: 1,
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
                            sx={{ mt: 2, fontSize: { xs: 13, sm: 15 } }}
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