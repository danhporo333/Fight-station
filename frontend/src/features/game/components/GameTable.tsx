import { Link } from 'react-router'

import { Button } from '@/shared/components/ui/Button'

import type { Game } from '../types/game.types'

interface GameTableProps {
  games: Game[]
  onDelete: (game: Game) => void
}

const TH = 'px-4 py-3 font-medium'

/** Bảng game ở trang quản trị (gồm cả game đang ẩn) */
export function GameTable({ games, onDelete }: GameTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-neutral-900 text-neutral-400">
          <tr>
            <th scope="col" className={TH}>
              Game
            </th>
            <th scope="col" className={TH}>
              Thể loại
            </th>
            <th scope="col" className={TH}>
              Người chơi
            </th>
            <th scope="col" className={`${TH} text-center`}>
              Thứ tự
            </th>
            <th scope="col" className={TH}>
              Trạng thái
            </th>
            <th scope="col" className="px-4 py-3">
              <span className="sr-only">Thao tác</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800">
          {games.map((game) => (
            <tr key={game.id} className={game.isActive ? '' : 'text-neutral-500'}>
              <td className="px-4 py-3 font-semibold text-neutral-100">{game.title}</td>
              <td className="px-4 py-3">
                {game.categories.map((category) => category.name).join(', ')}
              </td>
              <td className="px-4 py-3">{game.players ?? '—'}</td>
              <td className="px-4 py-3 text-center">{game.sortOrder}</td>
              <td className="px-4 py-3">
                {game.isActive ? (
                  <span className="text-green-400">Đang hiện</span>
                ) : (
                  <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs">Đang ẩn</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Link
                    to={`/admin/games/${game.id}/edit`}
                    className="rounded-lg px-3 py-1.5 font-semibold text-brand-400 hover:bg-neutral-800"
                  >
                    Sửa
                  </Link>
                  <Button
                    variant="ghost"
                    className="px-3 py-1.5 text-red-400 hover:text-red-300"
                    onClick={() => onDelete(game)}
                  >
                    Xóa
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
