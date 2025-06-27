import React, { useState, useRef } from "react";
import {
    Box,
    Typography,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    Avatar,
    Tooltip,
    CircularProgress,
    Chip,
    useTheme
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useAuth } from "../../hooks/useAuth";
import axios from "axios";

const UserProfileEdit: React.FC = () => {
    const { user, setUser } = useAuth();
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        username: user?.username || "",
        location: user?.location?.address || "",
    });
    const [loading, setLoading] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await axios.put(
                "http://localhost:5000/api/auth/user",
                form,
                { withCredentials: true }
            );
            setUser(res.data);
            setOpen(false);
        } catch (err) {
            // Optionally show error
        } finally {
            setLoading(false);
        }
    };

    // Handle avatar upload
    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("avatar", file);

        setAvatarUploading(true);
        try {
            const res = await axios.post(
                "http://localhost:5000/api/auth/avatar",
                formData,
                {
                    withCredentials: true,
                    headers: { "Content-Type": "multipart/form-data" }
                }
            );
            setUser((prev: any) => prev ? { ...prev, avatar: res.data.avatar } : prev);
        } catch (err) {
            // Optionally show error
        } finally {
            setAvatarUploading(false);
        }
    };

    return (
        <Box>
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={3}
                alignItems="center"
                sx={{
                    width: "100%",
                    py: 2,
                    px: { xs: 0, sm: 2 },
                    background: theme.palette.background.paper,
                    borderRadius: 3,
                    boxShadow: theme.shadows[1],
                }}
            >
                <Box sx={{ position: "relative", width: 96, height: 96 }}>
                    <Avatar
                        src={user?.avatar ? `http://localhost:5000${user.avatar}` : undefined}
                        sx={{
                            width: 96,
                            height: 96,
                            fontSize: 40,
                            bgcolor: "primary.main",
                            border: `3px solid ${theme.palette.primary.light}`,
                            boxShadow: 2,
                        }}
                    >
                        {user?.username?.[0]?.toUpperCase()}
                    </Avatar>
                    <Tooltip title="Change profile picture">
                        <IconButton
                            size="small"
                            sx={{
                                position: "absolute",
                                bottom: 6,
                                right: 6,
                                background: theme.palette.background.paper,
                                boxShadow: 2,
                                p: 0.5,
                                "&:hover": {
                                    background: theme.palette.primary.light,
                                    color: "#fff"
                                }
                            }}
                            onClick={handleAvatarClick}
                        >
                            <CameraAltIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleAvatarChange}
                    />
                    {avatarUploading && (
                        <CircularProgress
                            size={40}
                            sx={{
                                position: "absolute",
                                top: 28,
                                left: 28,
                                zIndex: 2
                            }}
                        />
                    )}
                </Box>
                <Box flex={1} minWidth={0}>
                    <Typography variant="h4" fontWeight={700} sx={{ wordBreak: "break-word" }}>
                        {user?.username}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                        {user?.email}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" sx={{ mb: 1 }}>
                        <Chip
                            icon={<LocationOnIcon color="action" />}
                            label={user?.location?.address || "No location set"}
                            variant="outlined"
                            sx={{ fontWeight: 500 }}
                        />
                        <Chip
                            label={user?.role === "admin" ? "Admin" : "User"}
                            color={user?.role === "admin" ? "error" : "default"}
                            variant="outlined"
                            sx={{ fontWeight: 500 }}
                        />
                    </Stack>
                </Box>
                <IconButton
                    onClick={handleOpen}
                    aria-label="Edit profile"
                    sx={{
                        ml: { xs: 0, sm: 2 },
                        background: theme.palette.mode === "dark" ? "#222" : "#f3f6fa",
                        color: theme.palette.primary.main,
                        border: `1px solid ${theme.palette.primary.light}`,
                        "&:hover": {
                            background: theme.palette.primary.light,
                            color: "#fff"
                        }
                    }}
                >
                    <EditIcon />
                </IconButton>
            </Stack>

            <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Username"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            label="Location"
                            name="location"
                            value={form.location}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} variant="contained" disabled={loading}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserProfileEdit;