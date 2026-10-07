import type { FieldErrors, UseFormRegister } from 'react-hook-form'

import { useBranchOptions } from '../hooks/useBranchOptions'
import type { GameFormInput } from '../types/game.schema'

interface GameBranchesFieldProps {
  register: UseFormRegister<GameFormInput>
  errors: FieldErrors<GameFormInput>
  /** Giá trị hiện tại của ô "Có ở mọi chi nhánh" (form watch) */
  allBranches: boolean
}

/**
 * Chọn chi nhánh có game: "Có ở mọi chi nhánh" (mặc định, gồm cả chi nhánh mở sau này)
 * hoặc tick từng chi nhánh. Danh sách chi nhánh lấy từ API /branches.
 */
export function GameBranchesField({ register, errors, allBranches }: GameBranchesFieldProps) {
  const { data: branches, isPending, error } = useBranchOptions()

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-2 text-lg font-semibold">Chi nhánh có game</legend>
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 size-4 accent-brand-500"
          {...register('allBranches')}
        />
        <span className="flex flex-col">
          <span className="text-sm font-medium text-neutral-200">Có ở mọi chi nhánh</span>
          <span className="text-xs text-neutral-500">
            Gồm cả chi nhánh mở sau này. Bỏ chọn để chỉ định từng chi nhánh.
          </span>
        </span>
      </label>

      {!allBranches && (
        <div className="ml-7 flex flex-col gap-2">
          {isPending && <p className="text-sm text-neutral-500">Đang tải danh sách chi nhánh…</p>}
          {error && <p className="text-sm text-red-400">Không tải được danh sách chi nhánh</p>}
          {branches?.map((branch) => (
            <label key={branch.id} className="flex items-center gap-3 text-sm text-neutral-200">
              <input
                type="checkbox"
                value={String(branch.id)}
                className="size-4 accent-brand-500"
                {...register('branchIds')}
              />
              {branch.name}
              {!branch.isActive && <span className="text-xs text-neutral-500">(đang ẩn)</span>}
            </label>
          ))}
          {errors.branchIds?.message && (
            <p role="alert" className="text-sm text-red-400">
              {errors.branchIds.message}
            </p>
          )}
        </div>
      )}
    </fieldset>
  )
}
