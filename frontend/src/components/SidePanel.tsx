"use client";

import { Box } from "@mui/material";
import { AnimatePresence, motion } from "motion/react";
import { useAtlasStore } from "@/store/atlasStore";
import { AnimalDetail } from "./AnimalDetail";
import { AnimalList } from "./AnimalList";

/** Shared content of the desktop side panel and the mobile bottom sheet. */
export function PanelContent() {
  const regionSlug = useAtlasStore((state) => state.regionSlug);
  const animalId = useAtlasStore((state) => state.animalId);
  const view = animalId !== null ? "detail" : "list";

  return (
    <Box sx={{ height: "100%", overflow: "hidden" }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{ height: "100%" }}
        >
          {view === "detail" && <AnimalDetail />}
          {view === "list" && <AnimalList key={regionSlug} />}
        </motion.div>
      </AnimatePresence>
    </Box>
  );
}

/** Bottom sheet for small screens: slides up when a region is selected. */
export function MobileSheet({ open }: { open: boolean }) {
  return (
    <Box sx={{ display: { xs: "block", md: "none" }, minHeight: 0, overflow: "hidden" }}>
      <AnimatePresence>
        {open && (
          <motion.section
            key="sheet"
            aria-label="Animais da região"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            style={{
              height: "100%",
              background: "#F8FAF7",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              borderTop: "1px solid #C9D4CC",
              overflow: "hidden",
            }}
          >
            <PanelContent />
          </motion.section>
        )}
      </AnimatePresence>
    </Box>
  );
}
