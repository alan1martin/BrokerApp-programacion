
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


function Sidebar() {
return (
<Drawer
variant="permanent"
sx={{
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


BrokerApp




  <Box sx={{ overflow: "auto" }}>
    <List>
      {menuItems.map((item) => (
        <ListItemButton
              key={item.text}
              component={Link}
              to={item.path}>
          <ListItemIcon sx={{ color: "#fff" }}>
            {item.icon}
          </ListItemIcon>

          <ListItemText primary={item.text} />
        </ListItemButton>
      ))}
    </List>
  </Box>
</Drawer>

);
}

export default Sidebar;
