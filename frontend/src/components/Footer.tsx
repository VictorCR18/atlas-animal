import { Box, Link, Typography } from "@mui/material";
import { palette } from "@/theme/theme";

export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: palette.ocean,
        color: "#C9D8CD",
        px: 2,
        py: 0.75,
        display: "flex",
        justifyContent: "space-between",
        gap: 2,
        flexWrap: "wrap",
      }}
    >
      <Typography variant="caption">
        Dados e fotos:{" "}
        <Link href="https://www.inaturalist.org" target="_blank" rel="noopener noreferrer" sx={{ color: palette.ochre }}>
          iNaturalist
        </Link>
      </Typography>
      <Typography variant="caption">Cada foto tem o crédito do autor e um link para o original.</Typography>
    </Box>
  );
}
