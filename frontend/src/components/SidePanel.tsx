"use client";

import { Box } from "@mui/material";
import { AnimatePresence, motion } from "motion/react";
import { useAtlasStore } from "@/store/atlasStore";
import { AnimalDetail } from "./AnimalDetail";
import { AnimalList } from "./AnimalList";

/** Shared content of the desktop side panel and the phone "Explorar" tab. */
export function PanelContent() {
  const regionSlug = useAtlasStore((state) => state.regionSlug);
  const animalId = useAtlasStore((state) => state.animalId);
  const view = animalId !== null ? "detail" : "list";

  return (
    <Box sx={{ height: "100%", minWidth: 0, overflow: "hidden" }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{ height: "100%", minWidth: 0 }}
        >
          {view === "detail" && <AnimalDetail />}
          {view === "list" && <AnimalList key={regionSlug} />}
        </motion.div>
      </AnimatePresence>
    </Box>
  );
}
