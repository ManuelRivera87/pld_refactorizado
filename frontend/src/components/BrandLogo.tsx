type BrandLogoProps = {
  compact?: boolean;
};

export function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <div className={compact ? "brand-logo brand-logo-compact" : "brand-logo"}>
      AUTOCOM
    </div>
  );
}
