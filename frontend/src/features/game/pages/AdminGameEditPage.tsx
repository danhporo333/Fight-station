import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'

import { FormAlert } from '@/shared/components/ui/FormAlert'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'
import { getErrorMessage } from '@/shared/utils/error-messages'

import { GameForm } from '../components/GameForm'
import { useGame } from '../hooks/useGame'
import { useUpdateGame } from '../hooks/useUpdateGame'
import { applyGameErrors } from '../utils/game-form-errors'
import { toGameFormValues, toGamePayload } from '../utils/game.utils'

export function AdminGameEditPage() {
  useDocumentTitle('Sửa game')
  const navigate = useNavigate()
  const id = Number(useParams().id)
  const { data: game, isPending, error } = useGame(id, true)
  const updateGame = useUpdateGame()

  if (!(id > 0) || error) {
    return (
      <div className="flex flex-col items-start gap-3">
        <FormAlert message={error ? getErrorMessage(error) : 'Đường dẫn không hợp lệ'} />
        <Link to="/admin/games" className="text-sm text-brand-400 hover:underline">
          Về danh sách game
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Sửa game{game ? `: ${game.title}` : ''}</h1>
      {isPending ? (
        <div
          aria-hidden="true"
          className="h-96 max-w-2xl animate-pulse rounded-xl bg-neutral-900"
        />
      ) : (
        <GameForm
          key={game.updatedAt}
          defaultValues={toGameFormValues(game)}
          submitLabel="Lưu thay đổi"
          pending={updateGame.isPending}
          onSubmit={(values, setError) =>
            updateGame.mutate(
              { id, payload: toGamePayload(values) },
              {
                onSuccess: ({ data }) => {
                  toast.success(`Đã lưu game ${data.title}`)
                  void navigate('/admin/games')
                },
                onError: (err) => applyGameErrors(err, setError),
              },
            )
          }
        />
      )}
    </div>
  )
}
