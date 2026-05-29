import { createTheme } from "@mui/material/styles";

const theme = createTheme({
palette: {
mode: "dark",

primary: {
  main: "#00c853",
},

secondary: {
  main: "#2962ff",
},

background: {
  default: "#0f1115",
  paper: "#1a1d24",
},

},

typography: {
fontFamily: "Inter, sans-serif",

h4: {
  fontWeight: 700,
},

h5: {
  fontWeight: 600,
},

},

shape: {
borderRadius: 12,
},
});

export default theme;
