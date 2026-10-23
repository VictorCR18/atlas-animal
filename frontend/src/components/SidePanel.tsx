"use client";

import { Box } from "@mui/material";
import { AnimatePresence, motion } from "motion/react";
import { useAtlasStore } from "@/store/atlasStore";
import { AnimalDetail } from "./AnimalDetail";
import { palette } from "@/theme/theme";
import { AnimalList } from "./AnimalList";

/** Shared content of the desktop side panel and the mobile bottom sheet. */
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

/** Bottom sheet for small screens: slides up when a region is selected. */
export function MobileSheet({ open }: { open: boolean }) {
  return (
    <Box sx={{ display: { xs: "block", md: "none" }, minHeight: 0, minWidth: 0, overflow: "hidden" }}>
      <AnimatePresence>
        {open && (
          <motion.section
            key="sheet"
            aria-label="Animais da região"
            role="region"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            style={{
              height: "100%",
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              background: palette.paper,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              boxShadow: "0 -8px 24px rgba(15, 42, 37, 0.25)",
              overflow: "hidden",
            }}
          >
            <Box aria-hidden sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: palette.line, mx: "auto", mt: 1, flexShrink: 0 }} />
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <PanelContent />
            </Box>
          </motion.section>
        )}
      </AnimatePresence>
    </Box>
  );
}
