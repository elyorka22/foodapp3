import Image from 'next/image';

type Props = {
  size?: number;
  className?: string;
  priority?: boolean;
};

/** FoodApp brand mark from /logo.png */
export function AppLogo({ size = 40, className = '', priority = false }: Props) {
  return (
    <Image
      src="/logo.png"
      alt="FoodApp"
      width={size}
      height={size}
      className={`rounded-2xl object-cover ${className}`}
      priority={priority}
    />
  );
}
