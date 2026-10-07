import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { toast } from 'sonner'

import { Button } from '@/shared/components/ui/Button'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { getErrorMessage } from '@/shared/utils/error-messages'

import { AdminGameSearch } from '../components/AdminGameSearch'
import { GameTable } from '../components/GameTable'
import { useDeleteGame } from '../hooks/useDeleteGame'
import { useGames } from '../hooks/useGames'
import type { Game } from '../types/game.types'
import { GAME_SEARCH_PARAMS } from '../utils/game.utils'

export function AdminGamesPage() {
  useDocumentTitle('Quản lý game')
  const q = useSearchParams()[0].get(GAME_SEARCH_PARAMS.q)?.trim() || undefined
  const { data: games, isPending, error, refetch } = useGames({ includeInactive: true, q })
  const deleteGame = useDeleteGame()
  const [toDelete, setToDelete] = useState<Game | null>(null)

  const confirmDelete = () => {
    if (!toDelete) return
    deleteGame.mutate(toDelete.id, {
      onSuccess: () => toast.success(`Đã xóa game ${toDelete.title}`),
      onError: (err) => toast.error(getErrorMessage(err)),
      onSettled: () => setToDelete(null),
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Game</h1>
        <div className="flex gap-3">
          <Link
            to="/admin/game-categories"
            className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-semibold hover:border-brand-500"
          >
            Thể loại
          </Link>
          <Link
            to="/admin/games/new"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500"
          >
            Thêm game
          </Link>
        </div>
      </header>

      <AdminGameSearch />

      {isPending && (
        <div aria-hidden="true" className="h-64 animate-pulse rounded-xl bg-neutral-900" />
      )}

      {error && (
        <div className="flex flex-col items-start gap-3">
          <p role="alert" className="text-sm text-red-400">
            {getErrorMessage(error)}
          </p>
          <Button variant="secondary" onClick={() => void refetch()}>
            Thử lại
          </Button>
        </div>
      )}

      {games?.length === 0 && (
        <p className="text-neutral-400">
          {q
            ? `Không có game nào có tên chứa “${q}”.`
            : 'Chưa có game nào. Bấm “Thêm game” để bắt đầu.'}
        </p>
      )}

      {games && games.length > 0 && <GameTable games={games} onDelete={setToDelete} />}

      <ConfirmDialog
        open={toDelete !== null}
        title={`Xóa game “${toDelete?.title ?? ''}”?`}
        loading={deleteGame.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      >
        Xóa thật, không khôi phục được. Muốn tạm ẩn thì vào “Sửa” và bỏ chọn “Đang hoạt động”.
      </ConfirmDialog>
    </div>
  )
}
