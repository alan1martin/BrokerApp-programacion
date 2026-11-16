// frontend/src/components/layout/page-header.jsx
import { Box, Stack, Typography } from "@mui/material";

export default function PageHeader({ icon: Icon, title, subtitle, iconColor = "#ff9800" }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
        {Icon && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              borderRadius: 2,
              backgroundColor: iconColor === "gray" || iconColor === "#9e9e9e" 
                ? "rgba(158, 158, 158, 0.12)"
                : `${iconColor}18`,
              border: `1px solid ${iconColor === "gray" ? "#9e9e9e30" : `${iconColor}30`}`,
              flexShrink: 0
            }}
          >
            <Icon sx={{ color: iconColor, fontSize: 26 }} />
          </Box>
        )}
        <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: "-0.01em" }}>
          {title}
        </Typography>
      </Stack>
      {subtitle && (
        <Typography variant="body2" color="gray" sx={{ maxWidth: 800 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}
