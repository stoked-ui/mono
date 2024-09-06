import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import GradientText from '../typography/GradientText';
import GetStartedButtons from '../icon/GetStartedButtons';
import SectionHeadline from '../typography/SectionHeadline';

export default function StartToday() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: { xs: 'auto', sm: 'center' },
      }}
    >
      <SectionHeadline
        alwaysCenter
        overline="Start now"
        title={
          <Typography variant="h2">
            Ship your next project <GradientText>faster</GradientText>
          </Typography>
        }
        description="Find out why SUI's tools are trusted by thousands of open-source developers and teams around the world."
      />
      <GetStartedButtons primaryLabel="Discover the Core libraries" primaryUrl="/core/" />
    </Box>
  );
}
