
import { Box, Toolbar } from "@mui/material";

import { useState } from "react";

import Sidebar from "../components/layout/sidebar";
import Navbar from "../components/layout/navbar";

function DashboardLayout({ children }) {
const [mobileOpen, setMobileOpen] = useState(false);

const handleDrawerToggle = () => {
setMobileOpen(!mobileOpen);
};

return (
<Box sx={{ display: "flex" }}> <Navbar onMenuClick={handleDrawerToggle} />

  <Sidebar
    mobileOpen={mobileOpen}
    onClose={handleDrawerToggle}
  />

  <Box
    component="main"
    sx={{
      flexGrow: 1,
      backgroundColor: "#0f1115",
      minHeight: "100vh",
      padding: 3,

      width: {
        md: `calc(100% - 240px)`,
      },
    }}
  >
    <Toolbar />

    {children}
  </Box>
</Box>


);
}

export default DashboardLayout;
