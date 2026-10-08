import { Marquee } from '@/shared/components/ui/Marquee'

import { useGames } from '../hooks/useGames'
import { GameCard } from './GameCard'
import { GameList } from './GameList'

/** Ít hơn số này thì trượt sẽ hở khoảng trống: hiện lưới thường */
const MIN_FOR_CAROUSEL = 6

interface GameCarouselProps {
  /** Số game tối đa đưa vào dải trượt */
  limit?: number
}

/**
 * Dải game trang chủ tự trượt sang trái liên tục, dùng `Marquee`. Ít game thì hiện lưới (GameList).
 */
export function GameCarousel({ limit = 16 }: GameCarouselProps) {
  const { data, isPending } = useGames({ limit })
  const games = data?.items ?? []

  // Đang tải, lỗi, rỗng hoặc ít game: dùng lưới (đã có đủ 3 trạng thái)
  if (isPending || games.length < MIN_FOR_CAROUSEL) {
    return <GameList query={{ limit: 8 }} />
  }

  return (
    <Marquee label="Game nổi bật, tự trượt; rê chuột để dừng">
      {games.map((game) => (
        // Khoảng cách bằng padding (không dùng gap) để 2 bản lặp dài đúng bằng nhau
        <li key={game.id} className="w-44 shrink-0 pr-4 sm:w-56 sm:pr-6">
          <GameCard game={game} />
        </li>
      ))}
    </Marquee>
  )
}
