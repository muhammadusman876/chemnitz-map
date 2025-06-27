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
    sites: CulturalSite[]; // <-- new prop
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
    // ...add more as needed
};

const CulturalSitesList: React.FC<CulturalSitesListProps> = ({
    sites,
    onSiteClick,
    selectedCategory,
    setSelectedCategory,
    search,
    categories,
    setCategories,
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
                    Showing {displayedSites.length}{" "}
                    {selectedCategory === ""
                        ? "sites"
                        : categories.find(cat => cat === selectedCategory) || "sites"}
                </Typography>
                <List disablePadding>
                    {displayedSites.map(site => {
                        const props = site.properties || site; // fallback for old data shape
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
                                                bgcolor: CATEGORY_COLORS[props.category] || "#64748b",
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
                                                        color={CATEGORY_COLORS[props.category] || "text.primary"}
                                                        sx={{ letterSpacing: 0.2 }}
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
                                                        }}
                                                    />
                                                </Stack>
                                            }
                                            secondary={
                                                props.description && (
                                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                        {props.description.length > 90
                                                            ? props.description.slice(0, 90) + "…"
                                                            : props.description}
                                                    </Typography>
                                                )
                                            }
                                        />
                                    </ListItem>
                                    <Divider />
                                </Box>
                            </Fade>
                        );
                    })}
                    {!displayedSites.length && (
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                            No sites found.
                        </Typography>
                    )}
                </List>
                {isAllMode && sites.length > paginationLimit && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        align="center"
                        sx={{ mt: 2, fontStyle: 'italic' }}
                    >
                        Showing only the first {paginationLimit} sites. Use search or filters to find more.
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default CulturalSitesList;