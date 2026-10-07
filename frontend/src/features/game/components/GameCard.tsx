import type { Game } from '../types/game.types'
import { ACCENT_TEXT_CLASS } from '../utils/accent'

interface GameCardProps {
  game: Game
}

/** Thẻ game kiểu prototype: poster 3:4 (trống thì hiện tên game chữ to theo màu nhấn), tên, thể loại, số người */
export function GameCard({ game }: GameCardProps) {
  return (
    <article className="group overflow-hidden border border-brand-500/15 bg-card transition duration-300 hover:-translate-y-2 hover:border-brand-500 hover:shadow-[0_10px_40px_rgb(255_106_0/0.25)]">
      <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-linear-135 from-dark to-card after:absolute after:inset-0 after:bg-linear-to-t after:from-card after:to-transparent after:to-50%">
        {game.posterUrl ? (
          <img
            src={game.posterUrl}
            alt={`Poster ${game.title}`}
            loading="lazy"
            width={300}
            height={400}
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <p
            aria-hidden="true"
            className={`relative z-10 p-4 text-center text-2xl leading-tight font-bold break-words uppercase [text-shadow:0_0_20px_currentColor] ${ACCENT_TEXT_CLASS[game.accentColor]}`}
          >
            {game.title}
          </p>
        )}
      </div>

      <div className="p-4">
        <h3 className="mb-1 font-bold uppercase">{game.title}</h3>
        <p className="flex items-center justify-between gap-2 font-mono text-xs tracking-wider text-muted">
          <span className="text-brand-500">{game.category.name}</span>
          {game.players && <span>{game.players}</span>}
        </p>
      </div>
    </article>
  )
}
