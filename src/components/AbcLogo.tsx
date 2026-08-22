import Image, { type ImageProps } from "next/image";
import { abcLogoSrc, type LogoBackground } from "@/lib/brand-logo";

type AbcLogoProps = Omit<ImageProps, "src" | "alt"> & {
  /** UI background: dark → white pillars; light → dark pillars */
  background: LogoBackground;
  alt?: string;
};

export default function AbcLogo({
  background,
  alt = "ABC - All About Construction",
  className = "",
  ...props
}: AbcLogoProps) {
  return (
    <Image
      src={abcLogoSrc(background)}
      alt={alt}
      unoptimized
      className={className}
      {...props}
    />
  );
}
