
import {
AppBar,
Toolbar,
Typography,
Box,
Avatar,
} from "@mui/material";

function Navbar() {
return (
<AppBar
position="fixed"
sx={{
backgroundColor: "#15181e",
boxShadow: "none",
borderBottom: "1px solid #222",
}}
>
<Toolbar
sx={{
display: "flex",
justifyContent: "space-between",
}}
>

Dashboard



    <Box display="flex" alignItems="center" gap={2}>
      <Typography>
        Martin
      </Typography>

      <Avatar />
    </Box>
  </Toolbar>
</AppBar>

);
}

export default Navbar;
