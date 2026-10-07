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
 * Dải game trang chủ tự trượt sang trái liên tục (animate-marquee). Danh sách lặp 2 lần và trượt
 * đúng nửa chiều dài rồi quay về đầu, nên nối liền mạch. Rê chuột / focus thì dừng; người dùng bật
 * "giảm chuyển động" thì không chạy, thay bằng cuộn ngang. Ít game thì hiện lưới (GameList).
 */
export function GameCarousel({ limit = 16 }: GameCarouselProps) {
  const { data, isPending } = useGames({ limit })
  const games = data?.items ?? []

  // Đang tải, lỗi, rỗng hoặc ít game: dùng lưới (đã có đủ 3 trạng thái)
  if (isPending || games.length < MIN_FOR_CAROUSEL) {
    return <GameList query={{ limit: 8 }} />
  }

  return (
    <div
      role="region"
      aria-label="Game nổi bật, tự trượt; rê chuột để dừng"
      className="group overflow-x-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] motion-reduce:overflow-x-auto"
    >
      <div className="flex w-max animate-marquee group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused]">
        {/* Bản thứ 2 lặp lại để nối liền mạch, ẩn với trình đọc màn hình */}
        {[false, true].map((copy) => (
          <ul key={String(copy)} aria-hidden={copy || undefined} className="flex">
            {games.map((game) => (
              // Khoảng cách bằng padding (không dùng gap) để 2 bản lặp dài đúng bằng nhau
              <li key={game.id} className="w-44 shrink-0 pr-4 sm:w-56 sm:pr-6">
                <GameCard game={game} />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}
