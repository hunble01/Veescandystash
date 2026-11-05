"use client";

import Image from "next/image";
import { useState } from "react";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import type { Product } from "@/lib/types";

// Product photos: one big photo and tappable thumbnails underneath. Shows the
// labelled placeholders until the product has photos in the Studio.
export function ProductGallery({ product }: { product: Product }) {
  const photos = product.photos;
  const [shown, setShown] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="grid content-start gap-3">
        <PhotoPlaceholder accent={product.accent} className="aspect-square" />
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <PhotoPlaceholder key={i} accent={product.accent} className="aspect-square" label="Photo" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid content-start gap-3">
      <div className="relative aspect-square overflow-hidden rounded-[var(--radius-card)] border-[3px] border-ink bg-white shadow-[var(--shadow-pop)]">
        <Image
          src={photos[shown]}
          alt={`${product.name}, photo ${shown + 1} of ${photos.length}`}
          fill
          sizes="(min-width: 1024px) 560px, 100vw"
          className="object-cover"
          priority
        />
      </div>
      {photos.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {photos.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setShown(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-pressed={i === shown}
              className={`relative aspect-square overflow-hidden rounded-2xl border-[3px] transition ${i === shown ? "border-ink shadow-[var(--shadow-pop)]" : "border-ink/20 opacity-80 hover:opacity-100"}`}
            >
              <Image src={src} alt="" fill sizes="140px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
