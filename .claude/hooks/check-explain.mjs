// SessionStart hook: tìm bài giải thích (docs/explain/{code,flow}/<feature>.md) có thể đã cũ.
// Bài "cũ" khi thư mục feature (src/features/<feature>/) thay đổi SAU "Ngày viết" ghi trong bài:
// - commit gần nhất chạm vào thư mục feature (git log), hoặc
// - thư mục feature đang có thay đổi chưa commit (tính là hôm nay).
// Chỉ nhắc, không tự sửa bài. Không có bài nào cũ thì không in gì.
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd()
const SIDES = ['backend', 'frontend']
const MODES = ['code', 'flow']

function git(args) {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return ''
  }
}

const today = new Date().toLocaleDateString('sv-SE') // YYYY-MM-DD theo giờ máy

/** Ngày thay đổi gần nhất của thư mục feature (YYYY-MM-DD), hoặc null nếu không xác định được */
function lastChange(featureDir) {
  const relative = featureDir.replaceAll('\\', '/')
  if (git(['status', '--porcelain', '--', relative])) return today
  return git(['log', '-1', '--format=%cs', '--', relative]) || null
}

function writtenDate(content) {
  const match = content.match(/Ngày viết\**\s*[|:]\s*(\d{4}-\d{2}-\d{2})/)
  return match ? match[1] : null
}

const stale = []
for (const side of SIDES) {
  for (const mode of MODES) {
    const dir = join(root, side, 'docs', 'explain', mode)
    if (!existsSync(dir)) continue
    for (const file of readdirSync(dir).filter((name) => name.endsWith('.md'))) {
      const feature = file.replace(/(-v\d+)?\.md$/, '')
      const featureDir = join(side, 'src', 'features', feature)
      if (!existsSync(join(root, featureDir))) continue

      const written = writtenDate(readFileSync(join(dir, file), 'utf8'))
      const changed = lastChange(featureDir)
      if (!written) {
        stale.push(`- ${side}/docs/explain/${mode}/${file}: không có "Ngày viết", không xác định được bài cũ hay mới`)
      } else if (changed && changed > written) {
        stale.push(`- ${side}/docs/explain/${mode}/${file}: viết ${written}, nhưng ${featureDir.replaceAll('\\', '/')} đổi ${changed}`)
      }
    }
  }
}

if (stale.length > 0) {
  const message = `Bài giải thích có thể đã cũ (code đổi sau ngày viết):\n${stale.join('\n')}`
  process.stdout.write(
    JSON.stringify({
      systemMessage: message,
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: `${message}\nKhi phù hợp, nhắc user chạy lại "/explain <code|flow> <feature>" (ghi đè). Không tự viết lại bài khi user chưa yêu cầu.`,
      },
    }),
  )
}
