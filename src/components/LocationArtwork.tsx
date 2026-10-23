import type { OfficeSizeId } from "../data/officeLayouts";

/** Atmospheric location artwork; the live office remains the furnishing view. */
export default function LocationArtwork({
  size = "hacker_den", className = "", hero = false,
}: { size?: OfficeSizeId; className?: string; hero?: boolean }) {
  const image = { hacker_den: "garage", small: "house", medium: "office", large: "headquarters", campus: "campus" }[size];
  return (
    <img
      className={`location-artwork ${className}`}
      src={`/images/locations/${image}-640.jpg`}
      srcSet={`/images/locations/${image}-640.jpg 640w, /images/locations/${image}-1600.jpg 1600w`}
      sizes={hero ? "(max-aspect-ratio: 16/9) 178vh, 100vw" : "(max-width: 640px) 100vw, 560px"}
      width={1600}
      height={900}
      alt=""
      loading={hero ? "eager" : "lazy"}
      fetchPriority={hero ? "high" : "auto"}
      decoding="async"
    />
  );
}
