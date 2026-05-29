
import { Box, Toolbar } from "@mui/material";

import Sidebar from "../components/layout/sidebar";
import Navbar from "../components/layout/navbar";

function DashboardLayout({ children }) {
return (
<Box sx={{ display: "flex" }}>



  <Sidebar />

  <Box
    component="main"
    sx={{
      flexGrow: 1,
      p: 3,
      backgroundColor: "#0f1115",
      minHeight: "100vh",
    }}
  >
    <Toolbar />

    {children}
  </Box>
</Box>

);
}

export default DashboardLayout;
