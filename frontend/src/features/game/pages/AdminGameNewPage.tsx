import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'

import { GameForm } from '../components/GameForm'
import { useCreateGame } from '../hooks/useCreateGame'
import { applyGameErrors } from '../utils/game-form-errors'
import { EMPTY_GAME_FORM, toGamePayload } from '../utils/game.utils'

export function AdminGameNewPage() {
  useDocumentTitle('Thêm game')
  const navigate = useNavigate()
  const createGame = useCreateGame()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Thêm game</h1>
      <GameForm
        defaultValues={EMPTY_GAME_FORM}
        submitLabel="Thêm game"
        pending={createGame.isPending}
        onSubmit={(values, setError) =>
          createGame.mutate(toGamePayload(values), {
            onSuccess: ({ data }) => {
              toast.success(`Đã thêm game ${data.title}`)
              void navigate('/admin/games')
            },
            onError: (error) => applyGameErrors(error, setError),
          })
        }
      />
    </div>
  )
}
