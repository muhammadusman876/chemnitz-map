import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error Boundary caught an error:', error, errorInfo);

        // You can also log the error to an error reporting service here
        // Example: logErrorToService(error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };

    private handleReset = () => {
        this.setState({ hasError: false, error: undefined });
    };

    public render() {
        if (this.state.hasError) {
            return (
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="100vh"
                    p={3}
                >
                    <Paper
                        elevation={3}
                        sx={{
                            p: 4,
                            maxWidth: 500,
                            textAlign: 'center',
                        }}
                    >
                        <ErrorIcon
                            sx={{
                                fontSize: 64,
                                color: 'error.main',
                                mb: 2,
                            }}
                        />
                        <Typography variant="h5" gutterBottom>
                            Oops! Something went wrong
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
                        </Typography>

                        {import.meta.env.DEV && this.state.error && (
                            <Box
                                sx={{
                                    mt: 2,
                                    p: 2,
                                    backgroundColor: 'grey.100',
                                    borderRadius: 1,
                                    textAlign: 'left',
                                }}
                            >
                                <Typography variant="caption" color="error">
                                    {this.state.error.message}
                                </Typography>
                                <pre style={{ fontSize: '0.75rem', overflow: 'auto' }}>
                                    {this.state.error.stack}
                                </pre>
                            </Box>
                        )}

                        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button variant="contained" onClick={this.handleReload}>
                                Refresh Page
                            </Button>
                            <Button variant="outlined" onClick={this.handleReset}>
                                Try Again
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
