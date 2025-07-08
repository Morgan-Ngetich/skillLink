import { Box, Text, Button } from "@chakra-ui/react";
import { Stat } from "../ui/stat";
// import { useMemo } from "react";

const GrowthStats = () => {
  return (
    <Box
      p="6"
      rounded="xl"
      border="1px solid"
      shadow="sm"
    >
      <Text fontSize="lg" fontWeight="bold" mb="4">
        Your Activity
      </Text>

      <Stat
        label="Profile Views"
        value={214}
        change={0.18}
        formatOptions={{ maximumFractionDigits: 0 }}
      />

      <Box mt="6">
        <Text fontSize="sm" fontWeight="medium" mb="1">
          Upcoming Session
        </Text>
        <Text fontSize="sm" color="fg.muted">
          🗓️ Thursday, 4:00 PM — “Breaking into Tech”
        </Text>
      </Box>

      <Button mt="5" size="sm" width="full">
        View Full Activity
      </Button>
    </Box>
  );
}

export default GrowthStats;