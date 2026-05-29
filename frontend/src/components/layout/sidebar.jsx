
import {
Drawer,
List,
ListItemButton,
ListItemIcon,
ListItemText,
Toolbar,
Typography,
Box,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SettingsIcon from "@mui/icons-material/Settings";

import { Link } from "react-router-dom";

const drawerWidth = 240;

const menuItems = [
{
text: "Dashboard",
path: "/",
icon: <DashboardIcon />,
},
{
text: "Markets",
path: "/markets",
icon: <ShowChartIcon />,
},
{
text: "Portfolio",
path: "/portfolio",
icon: <AccountBalanceWalletIcon />,
},
{
text: "Trading",
path: "/trading",
icon: <TrendingUpIcon />,
},
{
text: "Settings",
path: "/settings",
icon: <SettingsIcon />,
},
];

function Sidebar({ mobileOpen, onClose }) {
const drawerContent = (
<> <Toolbar> <Typography variant="h5" fontWeight={700}>
BrokerApp </Typography> </Toolbar>

  <Box sx={{ overflow: "auto" }}>
    <List>
      {menuItems.map((item) => (
        <ListItemButton
          key={item.text}
          component={Link}
          to={item.path}
          onClick={onClose}
        >
          <ListItemIcon sx={{ color: "#fff" }}>
            {item.icon}
          </ListItemIcon>

          <ListItemText primary={item.text} />
        </ListItemButton>
      ))}
    </List>
  </Box>
</>

);

return (
<>
{/* Desktop Sidebar */}
<Drawer
variant="permanent"
sx={{
display: {
xs: "none",
md: "block",
},


      width: drawerWidth,
      flexShrink: 0,

      "& .MuiDrawer-paper": {
        width: drawerWidth,
        boxSizing: "border-box",
        backgroundColor: "#15181e",
        borderRight: "1px solid #222",
      },
    }}
  >
    {drawerContent}
  </Drawer>

  {/* Mobile Sidebar */}
  <Drawer
    variant="temporary"
    open={mobileOpen}
    onClose={onClose}
    ModalProps={{
      keepMounted: true,
    }}
    sx={{
      display: {
        xs: "block",
        md: "none",
      },

      "& .MuiDrawer-paper": {
        width: drawerWidth,
        backgroundColor: "#15181e",
      },
    }}
  >
    {drawerContent}
  </Drawer>
</>


);
}

export default Sidebar;
