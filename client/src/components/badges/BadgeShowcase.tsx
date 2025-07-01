// @ts-nocheck
import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Tooltip,
    Stack
} from '@mui/material';
import Grid from '@mui/material/Grid';
import CategoryIcon from '@mui/icons-material/Category';
import MapIcon from '@mui/icons-material/Map';
import PublicIcon from '@mui/icons-material/Public';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SchoolIcon from '@mui/icons-material/School';
import ExploreIcon from '@mui/icons-material/Explore';

interface BadgeShowcaseProps {
    progressData: any;
    visitedCount: number;
}

const BadgeShowcase: React.FC<BadgeShowcaseProps> = ({ progressData, visitedCount }) => {
    // Generate badges based on milestones and progress
    const badges = [
        // Visit count badges
        {
            id: 'first-visit',
            title: 'First Steps',
            icon: <ExploreIcon sx={{ fontSize: 40 }} color="primary" />,
            description: 'Visited your first cultural site',
            achieved: visitedCount >= 1,
            category: 'milestone'
        },
        {
            id: 'adventurer',
            title: 'Adventurer',
            icon: <ExploreIcon sx={{ fontSize: 40 }} color="primary" />,
            description: 'Visited 5+ cultural sites',
            achieved: visitedCount >= 5,
            category: 'milestone'
        },
        {
            id: 'trailblazer',
            title: 'Trailblazer',
            icon: <ExploreIcon sx={{ fontSize: 40 }} color="success" />,
            description: 'Visited 15+ cultural sites',
            achieved: visitedCount >= 15,
            category: 'milestone'
        },
        {
            id: 'cultural-hero',
            title: 'Cultural Hero',
            icon: <ExploreIcon sx={{ fontSize: 40 }} color="warning" />,
            description: 'Visited 30+ cultural sites',
            achieved: visitedCount >= 30,
            category: 'milestone'
        },
        {
            id: 'legend',
            title: 'Legend',
            icon: <ExploreIcon sx={{ fontSize: 40 }} color="error" />,
            description: 'Visited 50+ cultural sites',
            achieved: visitedCount >= 50,
            category: 'milestone'
        },

        // Category badges - dynamically generated from progressData
        ...(progressData?.categoryProgress?.filter((c: any) => c.completed) || []).map((category: any) => ({
            id: `category-${category.category}`,
            title: `${category.category.charAt(0).toUpperCase() + category.category.slice(1)} Expert`,
            icon: <CategoryIcon sx={{ fontSize: 40 }} color="success" />,
            description: `Visited all ${category.category} sites in Chemnitz`,
            achieved: true,
            category: 'category'
        })),

        // District badges - dynamically generated from progressData
        ...(progressData?.districtProgress?.filter((d: any) => d.completed) || []).map((district: any) => ({
            id: `district-${district.district}`,
            title: `${district.district} Conqueror`,
            icon: <MapIcon sx={{ fontSize: 40 }} color="warning" />,
            description: `Explored all sites in ${district.district}`,
            achieved: true,
            category: 'district'
        })),

        // Add some placeholder badges that could be earned in the future
        {
            id: 'museum-lover',
            title: 'Museum Enthusiast',
            icon: <SchoolIcon sx={{ fontSize: 40 }} color="disabled" />,
            description: 'Visit at least 5 different museums',
            achieved: (progressData?.categoryProgress?.find((c: any) => c.category === 'museum')?.visitedSites?.length || 0) >= 5,
            category: 'achievement'
        },
        {
            id: 'food-critic',
            title: 'Culinary Explorer',
            icon: <FavoriteIcon sx={{ fontSize: 40 }} color="disabled" />,
            description: 'Visit at least 10 different restaurants',
            achieved: (progressData?.categoryProgress?.find((c: any) => c.category === 'restaurant')?.visitedSites?.length || 0) >= 10,
            category: 'achievement'
        },
        {
            id: 'weekend-explorer',
            title: 'Weekend Explorer',
            icon: <PublicIcon sx={{ fontSize: 40 }} color="disabled" />,
            description: 'Visit 3 sites on a weekend',
            achieved: false, // This would need special tracking
            category: 'achievement'
        },
    ];

    // Filter to show only achieved badges first
    const achievedBadges = badges.filter(badge => badge.achieved);
    const unachievedBadges = badges.filter(badge => !badge.achieved);
    const sortedBadges = [...achievedBadges, ...unachievedBadges];

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                    Badges Earned: {achievedBadges.length}/{badges.length}
                </Typography>
            </Stack>

            <Grid container spacing={2}>
                {sortedBadges.map((badge) => (
                    <Grid size={{ xs: 4, sm: 3, md: 2 }} key={badge.id}>
                        <Tooltip
                            title={
                                <Box>
                                    <Typography variant="subtitle1">{badge.title}</Typography>
                                    <Typography variant="body2">{badge.description}</Typography>
                                </Box>
                            }
                            arrow
                        >
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    opacity: badge.achieved ? 1 : 0.5,
                                    filter: badge.achieved ? 'none' : 'grayscale(0.8)',
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                        transform: 'scale(1.05)',
                                        opacity: badge.achieved ? 1 : 0.7,
                                    }
                                }}
                            >
                                {badge.icon}
                                <Typography
                                    variant="caption"
                                    align="center"
                                    sx={{
                                        mt: 1,
                                        fontWeight: badge.achieved ? 600 : 400,
                                        fontSize: '0.7rem',
                                        lineHeight: 1
                                    }}
                                >
                                    {badge.title}
                                </Typography>
                            </Paper>
                        </Tooltip>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default BadgeShowcase;