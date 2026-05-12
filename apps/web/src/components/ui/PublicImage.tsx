import { cn } from '@web/lib/utils';

interface PublicImageProps {
  file: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  rounded?: boolean;
}

export function PublicImage({ file, alt, className, imgClassName, rounded = true }: PublicImageProps) {
  return (
    <div className={cn('overflow-hidden', rounded && 'rounded-[24px]', className)}>
      <img
        src={`/${file}`}
        alt={alt}
        className={cn('w-full h-full object-cover', imgClassName)}
      />
    </div>
  );
}
