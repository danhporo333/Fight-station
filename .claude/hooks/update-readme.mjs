// Stop hook (chạy được cả tay: `node .claude/hooks/update-readme.mjs`): cập nhật README.md theo trạng thái
// thật của từng tính năng, lấy từ dòng đầu của `<backend|frontend>/src/features/<tên>/context.md`
// ("> ✅ **Đã cài đặt**" hoặc "> ⏳ **Chưa cài đặt**").
//
// README đánh dấu chỗ cần cập nhật bằng comment HTML (không hiện khi render), phần còn lại giữ nguyên:
//   - ô trạng thái trong bảng "Tính năng":  `| ... | ✅ Xong <!-- status:game --> |`
//   - dòng ở "Lộ trình":                    `- [x] Game (`game`) <!-- roadmap:game -->`
// Thêm tính năng mới: viết dòng/hàng mới kèm comment với tên thư mục tính năng, script lo phần còn lại.
// Không có gì đổi thì không ghi file và không in gì.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd()
const readmePath = join(root, 'README.md')
if (!existsSync(readmePath)) process.exit(0)

/** true nếu context.md của tính năng ghi "✅", false nếu "⏳" hoặc không có file/dòng trạng thái */
function isDone(side, feature) {
  const path = join(root, side, 'src', 'features', feature, 'context.md')
  if (!existsSync(path)) return false
  const line = readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .find((text) => /^>\s*(✅|⏳)/u.test(text))
  return line !== undefined && /^>\s*✅/u.test(line)
}

function statusLabel(feature) {
  const backend = isDone('backend', feature)
  const frontend = isDone('frontend', feature)
  if (backend && frontend) return '✅ Xong'
  if (backend) return '🔧 Backend xong, đang làm frontend'
  if (frontend) return '🔧 Frontend xong, backend chưa xong'
  return '⏳ Chưa làm'
}

const original = readFileSync(readmePath, 'utf8')

// `| ...ô cũ... <!-- status:<tên> -->` → thay ô cũ bằng nhãn mới
let updated = original.replace(
  /(\|\s*)[^|\n]*?(\s*<!-- status:([\w-]+) -->)/gu,
  (_, before, marker, feature) => `${before}${statusLabel(feature)}${marker}`,
)

// `- [ ] ... <!-- roadmap:<tên> -->` → tick khi cả backend và frontend đã xong
updated = updated.replace(
  /^(\s*- \[)[ xX](\] .*<!-- roadmap:([\w-]+) -->)/gmu,
  (_, before, after, feature) =>
    `${before}${isDone('backend', feature) && isDone('frontend', feature) ? 'x' : ' '}${after}`,
)

if (updated !== original) {
  writeFileSync(readmePath, updated)
  console.log('README.md: đã cập nhật trạng thái tính năng theo context.md')
}
