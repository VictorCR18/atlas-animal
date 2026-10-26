"use client";

import type { ReactNode } from "react";
import { Box, Link, Stack, Typography } from "@mui/material";
import { useAtlasStore, type MobileTab } from "@/store/atlasStore";
import { PanelContent } from "../SidePanel";

/** Full-area panel that covers the map while its tab is active; it stays mounted to keep scroll and filters. */
function TabPanel({ tab, label, children }: { tab: MobileTab; label: string; children: ReactNode }) {
  const active = useAtlasStore((state) => state.mobileTab === tab);
  return (
    <Box
      component="section"
      aria-label={label}
      hidden={!active}
      sx={{
        display: active ? "block" : "none",
        position: "absolute",
        inset: 0,
        zIndex: 2,
        overflow: "hidden",
        bgcolor: "background.paper",
        pt: "env(safe-area-inset-top)",
      }}
    >
      {children}
    </Box>
  );
}

export function ExplorePanel() {
  return (
    <TabPanel tab="explorar" label="Explorar animais">
      <PanelContent />
    </TabPanel>
  );
}

export function AboutPanel() {
  return (
    <TabPanel tab="sobre" label="Sobre o Atlas Animal">
      <Box sx={{ height: "100%", overflowY: "auto", overscrollBehavior: "contain", p: 2.5 }}>
        <Typography variant="h5" component="h2">
          Sobre o Atlas Animal
        </Typography>
        <Typography sx={{ mt: 1, maxWidth: "52ch" }}>
          Toque num país ou bioma para ver quais animais a comunidade registrou ali. Escolha um animal para ver as fotos, a
          classificação científica e os pontos onde ele já foi visto.
        </Typography>

        <Stack spacing={2} sx={{ mt: 3 }}>
          <Box>
            <Typography variant="subtitle2" component="h3">
              Dados e fotos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vêm do{" "}
              <Link href="https://www.inaturalist.org" target="_blank" rel="noopener noreferrer">
                iNaturalist
              </Link>
              . Cada foto mostra o crédito do autor e leva ao original.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" component="h3">
              Nomes e textos em português
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vêm do{" "}
              <Link href="https://www.wikidata.org" target="_blank" rel="noopener noreferrer">
                Wikidata
              </Link>{" "}
              e da{" "}
              <Link href="https://pt.wikipedia.org" target="_blank" rel="noopener noreferrer">
                Wikipédia
              </Link>
              , sob licença CC BY-SA.
            </Typography>
          </Box>
        </Stack>
      </Box>
    </TabPanel>
  );
}
