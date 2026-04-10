import Image from "next/image";

type BrandLogoProps = {
  variant?: "full" | "mark";
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

const LOGO_DIMENSIONS = {
  full: { src: "/logo.png", width: 1920, height: 219 },
  mark: { src: "/logo-sm.png", width: 3199, height: 3200 },
} as const;

export function BrandLogo({
  variant = "full",
  alt,
  className,
  priority = false,
  sizes,
}: BrandLogoProps) {
  const logo = LOGO_DIMENSIONS[variant];

  return (
    <Image
      src={logo.src}
      alt={alt}
      width={logo.width}
      height={logo.height}
      priority={priority}
      sizes={sizes}
      className={className}
    />
  );
}
