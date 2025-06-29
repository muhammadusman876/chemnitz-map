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
    useTheme,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Alert
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import DeleteIcon from "@mui/icons-material/Delete";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import LockIcon from "@mui/icons-material/Lock";
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
    const [avatarMenuAnchor, setAvatarMenuAnchor] = useState<null | HTMLElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Password change states
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

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
            console.error('Error updating profile:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handle avatar menu
    const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
        setAvatarMenuAnchor(event.currentTarget);
    };

    const handleAvatarMenuClose = () => {
        setAvatarMenuAnchor(null);
    };

    // Handle avatar upload
    const handleAvatarUpload = () => {
        fileInputRef.current?.click();
        setAvatarMenuAnchor(null);
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
            ('✅ Avatar uploaded successfully');
        } catch (err) {
            console.error('❌ Error uploading avatar:', err);
        } finally {
            setAvatarUploading(false);
        }
    };

    // Handle avatar remove using DELETE method
    const handleAvatarRemove = async () => {
        setAvatarUploading(true);
        try {
            await axios.delete(
                "http://localhost:5000/api/auth/avatar",
                { withCredentials: true }
            );
            setUser((prev: any) => prev ? { ...prev, avatar: null } : prev);
            ('✅ Avatar removed successfully');
        } catch (err) {
            console.error('❌ Error removing avatar:', err);
        } finally {
            setAvatarUploading(false);
            setAvatarMenuAnchor(null);
        }
    };

    // Password change handlers
    const handlePasswordDialogOpen = () => {
        setPasswordDialogOpen(true);
        setPasswordError('');
        setPasswordSuccess('');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    const handlePasswordDialogClose = () => {
        setPasswordDialogOpen(false);
        setPasswordError('');
        setPasswordSuccess('');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordForm({
            ...passwordForm,
            [e.target.name]: e.target.value
        });
        setPasswordError(''); // Clear error when user types
    };

    const handlePasswordUpdate = async () => {
        setPasswordError('');
        setPasswordSuccess('');

        // Validation
        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            setPasswordError('All fields are required');
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters long');
            return;
        }

        if (passwordForm.currentPassword === passwordForm.newPassword) {
            setPasswordError('New password must be different from current password');
            return;
        }

        setPasswordLoading(true);
        try {
            await axios.put(
                "http://localhost:5000/api/auth/password",
                {
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                },
                { withCredentials: true }
            );

            setPasswordSuccess('Password updated successfully!');
            ('✅ Password updated successfully');

            // Close dialog after 2 seconds
            setTimeout(() => {
                handlePasswordDialogClose();
            }, 2000);

        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to update password';
            setPasswordError(errorMessage);
            console.error('❌ Error updating password:', err);
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <Box
            sx={{
                width: "100%",
                py: 3,
                px: 3,
                background: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)' // Slightly lighter in dark mode
                    : theme.palette.background.paper, // White in light mode
                borderRadius: 3,
                boxShadow: theme.shadows[1],
                border: theme.palette.mode === 'dark'
                    ? '1px solid rgba(255, 255, 255, 0.1)' // Subtle border in dark mode
                    : 'none',
            }}
        >
            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={3}
                alignItems={{ xs: "center", sm: "flex-start" }}
                sx={{ width: "100%" }}
            >
                {/* Avatar Section */}
                <Box sx={{ position: "relative", width: 96, height: 96, flexShrink: 0 }}>
                    <Avatar
                        src={user?.avatar ? `http://localhost:5000${user.avatar}` : undefined}
                        sx={{
                            width: 96,
                            height: 96,
                            fontSize: 40,
                            bgcolor: "primary.main",
                            border: `3px solid ${theme.palette.primary.light}`,
                            boxShadow: 2,
                            cursor: 'pointer'
                        }}
                        onClick={handleAvatarClick}
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

                    {/* Avatar Menu */}
                    <Menu
                        anchorEl={avatarMenuAnchor}
                        open={Boolean(avatarMenuAnchor)}
                        onClose={handleAvatarMenuClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                        }}
                    >
                        <MenuItem onClick={handleAvatarUpload}>
                            <ListItemIcon>
                                <PhotoCameraIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Upload new photo</ListItemText>
                        </MenuItem>

                        {user?.avatar && (
                            <MenuItem
                                onClick={handleAvatarRemove}
                                sx={{ color: 'error.main' }}
                            >
                                <ListItemIcon>
                                    <DeleteIcon fontSize="small" color="error" />
                                </ListItemIcon>
                                <ListItemText>Remove photo</ListItemText>
                            </MenuItem>
                        )}
                    </Menu>

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

                {/* Content Section - Takes up remaining space */}
                <Box flex={1} minWidth={0} sx={{ width: "100%" }}>
                    {/* Username with Edit Icon nearby */}
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                        <Typography variant="h4" fontWeight={700} sx={{ wordBreak: "break-word" }}>
                            {user?.username}
                        </Typography>
                        <IconButton
                            onClick={handleOpen}
                            aria-label="Edit profile"
                            size="small"
                            sx={{
                                background: theme.palette.mode === "dark" ? "#222" : "#f3f6fa",
                                color: theme.palette.primary.main,
                                border: `1px solid ${theme.palette.primary.light}`,
                                "&:hover": {
                                    background: theme.palette.primary.light,
                                    color: "#fff"
                                }
                            }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Stack>

                    {/* Email and other info */}
                    <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                        {user?.email}
                    </Typography>

                    {/* Welcome message */}
                    <Typography variant="body1" color="text.secondary">
                        Welcome back! Continue your cultural exploration journey.
                    </Typography>
                </Box>
            </Stack>

            {/* Profile Edit Dialog */}
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

                        {/* Change Password Button */}
                        <Button
                            onClick={handlePasswordDialogOpen}
                            variant="outlined"
                            color="warning"
                            startIcon={<LockIcon />}
                            sx={{ mt: 2 }}
                        >
                            Change Password
                        </Button>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} variant="contained" disabled={loading}>
                        {loading ? <CircularProgress size={20} /> : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Password Change Dialog */}
            <Dialog open={passwordDialogOpen} onClose={handlePasswordDialogClose} maxWidth="xs" fullWidth>
                <DialogTitle>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <LockIcon color="warning" />
                        <Typography variant="h6">Change Password</Typography>
                    </Stack>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        {passwordError && (
                            <Alert severity="error">{passwordError}</Alert>
                        )}
                        {passwordSuccess && (
                            <Alert severity="success">{passwordSuccess}</Alert>
                        )}

                        <TextField
                            label="Current Password"
                            name="currentPassword"
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                            fullWidth
                            required
                            autoComplete="current-password"
                        />
                        <TextField
                            label="New Password"
                            name="newPassword"
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            fullWidth
                            required
                            helperText="Must be at least 6 characters"
                            autoComplete="new-password"
                        />
                        <TextField
                            label="Confirm New Password"
                            name="confirmPassword"
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                            fullWidth
                            required
                            autoComplete="new-password"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handlePasswordDialogClose} disabled={passwordLoading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handlePasswordUpdate}
                        variant="contained"
                        disabled={passwordLoading || !!passwordSuccess}
                        color="warning"
                    >
                        {passwordLoading ? <CircularProgress size={20} /> : 'Update Password'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserProfileEdit;