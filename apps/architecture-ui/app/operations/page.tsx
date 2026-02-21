import Shell from "@/app/components/layout/Shell";
import { Box, Typography } from "@mui/material";
import { getProductModel } from "@/app/lib/getProductModel";

// Ops widgets (předpokládám, že existují)
import FeatureMatrix from "@/app/components/operations/FeatureMatrix";
import EndpointInventory from "@/app/components/operations/EndpointInventory";
import OperationsStatusPanel from "@/app/components/operations/OperationsStatusPanel";
import DeploymentFeed from "../components/operations/DeploymentFeeds";

export const dynamic = "force-dynamic";

export default async function OperationsPage() {
    const data = await getProductModel();

    return (
        <Shell>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 2, mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    Operations
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.75 }}>
                    Live status + runtime flags + endpoint inventory.
                </Typography>
            </Box>

            <OperationsStatusPanel />

            <DeploymentFeed />
            <Box sx={{ mt: 3 }}>
                <FeatureMatrix runtime={data.runtime} />
            </Box>

            <Box sx={{ mt: 3 }}>
                <EndpointInventory runtime={data.runtime} />
            </Box>
        </Shell>
    );
}