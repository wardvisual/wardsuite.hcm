interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ size = 'md' }: LogoProps) {
  const iconSize = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className="flex items-center gap-2.5">
      <div className={`${iconSize} rounded-2xl bg-[#111111] flex items-center justify-center shrink-0`}>
        <span className="text-white font-black text-sm">W</span>
      </div>
      <span className={`${textSize} font-black text-[#111111] tracking-tight`}>
        WardSuite
      </span>
    </div>
  );
}
