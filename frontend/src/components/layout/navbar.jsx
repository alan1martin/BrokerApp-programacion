import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";

import { useNavigate } from "react-router-dom";

function Navbar({ onMenuClick }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    navigate("/login");
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: "#15181e",
        boxShadow: "none",
        borderBottom: "1px solid #222",
        zIndex: 1300,
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <IconButton
            color="inherit"
            onClick={onMenuClick}
            sx={{
              display: {
                xs: "flex",
                md: "none",
              },
            }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6">
            Dashboard
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography>
            Martin
          </Typography>

          <Avatar />

          <IconButton
            onClick={handleLogout}
            color="inherit"
          >
            <LogoutIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
