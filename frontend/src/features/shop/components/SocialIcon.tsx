import type { ShopSocialKey } from '../types/shop.types'

// Icon thương hiệu (lucide-react không có), đường vẽ lấy từ bản prototype. Zalo không có icon: hiện chữ.
const ICON_PATHS: Partial<Record<ShopSocialKey, string>> = {
  facebookUrl:
    'M24 12c0-6.6-5.4-12-12-12S0 5.4 0 12c0 6 4.4 11 10.1 11.9V15.5h-3v-3.5h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.3l-.5 3.5h-2.8v8.4C19.6 23 24 18 24 12z',
  tiktokUrl:
    'M19.6 6.3c-1.5 0-2.9-.6-4-1.5v9.7c0 3.7-3 6.7-6.7 6.7s-6.7-3-6.7-6.7c0-3.7 3-6.7 6.7-6.7.4 0 .8 0 1.1.1v3.4c-.4-.1-.7-.2-1.1-.2-1.8 0-3.3 1.5-3.3 3.3 0 1.8 1.5 3.3 3.3 3.3s3.3-1.5 3.3-3.3V0h3.4c0 .3 0 .6.1.8.2 1.6 1.4 2.9 3 3.3.3.1.6.1.9.1v3.1z',
  instagramUrl:
    'M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.9.9 1.4.2.4.4 1 .4 2.2.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.9.7-1.4.9-.4.2-1 .4-2.2.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.9-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.9-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 5.4c-2.4 0-4.4 2-4.4 4.4s2 4.4 4.4 4.4 4.4-2 4.4-4.4-2-4.4-4.4-4.4zm0 7.2c-1.6 0-2.8-1.3-2.8-2.8s1.3-2.8 2.8-2.8 2.8 1.3 2.8 2.8-1.2 2.8-2.8 2.8zm5.6-7.4c0 .6-.5 1-1 1s-1-.5-1-1 .5-1 1-1 1 .4 1 1z',
  youtubeUrl:
    'M23.5 6.2c-.3-1-1.1-1.8-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6c-1 .3-1.8 1.1-2.1 2.1C0 8.1 0 12 0 12s0 3.9.5 5.8c.3 1 1.1 1.8 2.1 2.1 1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5c1-.3 1.8-1.1 2.1-2.1.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z',
}

interface SocialIconProps {
  network: ShopSocialKey
}

/** Icon một mạng xã hội (Zalo hiện chữ "Zalo") */
export function SocialIcon({ network }: SocialIconProps) {
  const path = ICON_PATHS[network]
  if (!path) {
    return <span className="font-display text-[0.65rem] font-black">Zalo</span>
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="size-[18px]">
      <path d={path} />
    </svg>
  )
}
