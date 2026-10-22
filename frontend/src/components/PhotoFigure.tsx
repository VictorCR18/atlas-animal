"use client";

import { useState } from "react";
import { Box, Link, Skeleton, Typography } from "@mui/material";
import PetsIcon from "@mui/icons-material/Pets";
import type { Photo } from "@/types/dto";

interface PhotoImageProps {
  photo: Photo | null;
  alt: string;
  variant: "thumb" | "large";
}

/** Photo with a placeholder (skeleton plus icon) when there is no photo or it fails to load. */
export function PhotoImage({ photo, alt, variant }: PhotoImageProps) {
  const [failed, setFailed] = useState(false);
  const src = photo ? (variant === "thumb" ? photo.thumbUrl : photo.largeUrl) : null;
  const sizing =
    variant === "thumb"
      ? { width: 72, height: 72, flexShrink: 0, borderRadius: 1 }
      : { width: "100%", aspectRatio: "4 / 3", borderRadius: 1.5 };

  return (
    <Box sx={{ position: "relative", overflow: "hidden", bgcolor: "#DCE5DE", ...sizing }}>
      {src && !failed ? (
        <Box
          component="img"
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <>
          <Skeleton
            variant="rectangular"
            animation={false}
            width="100%"
            height="100%"
            sx={{ position: "absolute", inset: 0 }}
          />
          <PetsIcon
            titleAccess="Sem foto disponível"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "text.secondary",
              fontSize: variant === "thumb" ? 28 : 48,
            }}
          />
        </>
      )}
    </Box>
  );
}

/** Photographer credit linking to the photo on iNaturalist, as required by their terms. */
export function PhotoCredit({ photo, noWrap = false }: { photo: Photo; noWrap?: boolean }) {
  return (
    <Typography variant="caption" color="text.secondary" noWrap={noWrap} component="p" sx={{ m: 0 }}>
      Foto:{" "}
      <Link
        href={photo.attributionUrl}
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
        color="inherit"
      >
        {photo.attribution}
      </Link>
    </Typography>
  );
}
