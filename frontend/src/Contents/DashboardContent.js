import { Container, Box, Typography } from '@mui/material';

function DashboardContent() {
    return (
      
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box role="main">
                <Typography variant="h3">Home Content</Typography>
            </Box>
        </Container>

    );
}

export default DashboardContent;