import { Box, Link, Typography } from "@mui/material";
import { palette } from "@/theme/theme";

const linkSx = { color: palette.ochre, "&:hover": { color: "#F4D58D" } };

export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: palette.ocean,
        color: palette.onOceanSoft,
        px: 2,
        py: 0.75,
        display: "flex",
        justifyContent: "space-between",
        columnGap: 2,
        flexWrap: "wrap",
        flexShrink: 0,
        position: "relative",
        zIndex: 1,
        pb: "calc(0.75rem + env(safe-area-inset-bottom))",
      }}
    >
      <Typography variant="caption">
        Dados e fotos:{" "}
        <Link href="https://www.inaturalist.org" target="_blank" rel="noopener noreferrer" sx={linkSx}>
          iNaturalist
        </Link>
        . Nomes e textos em português:{" "}
        <Link href="https://www.wikidata.org" target="_blank" rel="noopener noreferrer" sx={linkSx}>
          Wikidata
        </Link>{" "}
        e{" "}
        <Link href="https://pt.wikipedia.org" target="_blank" rel="noopener noreferrer" sx={linkSx}>
          Wikipédia
        </Link>
        .
      </Typography>
      <Typography variant="caption" sx={{ display: { xs: "none", sm: "block" } }}>
        Cada foto tem o crédito do autor e um link para o original.
      </Typography>
    </Box>
  );
}
