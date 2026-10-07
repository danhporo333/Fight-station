// SessionStart hook: so sánh skill trong .claude/skills/ (gốc, backend/, frontend/) với mục
// "## Available Skills" của CLAUDE.md. Lệch thì báo cho Claude (additionalContext) và cho user
// (systemMessage). Khớp thì không in gì.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd()
const skillsDirs = ['', 'backend', 'frontend'].map((part) => join(root, part, '.claude', 'skills'))
const claudeMdPath = join(root, 'CLAUDE.md')

// SKILL.md rỗng hoặc chưa có thì coi như skill chưa tồn tại
function readSkillName(skillsDir, dir) {
  const file = join(skillsDir, dir, 'SKILL.md')
  if (!existsSync(file)) return null
  const content = readFileSync(file, 'utf8')
  if (!content.trim()) return null
  const match = content.match(/^name:\s*["']?([^"'\r\n]+)["']?\s*$/m)
  return (match ? match[1] : dir).trim()
}

const existing = skillsDirs.flatMap((skillsDir) =>
  existsSync(skillsDir)
    ? readdirSync(skillsDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => readSkillName(skillsDir, entry.name))
        .filter(Boolean)
    : [],
)

// Lấy các dòng bullet của mục "## Available Skills" (dừng ở heading kế tiếp, kể cả ###)
const lines = existsSync(claudeMdPath) ? readFileSync(claudeMdPath, 'utf8').split(/\r?\n/) : []
const start = lines.findIndex((line) => /^##\s+Available Skills\b/i.test(line))
const listed = new Map() // tên skill → true nếu đánh dấu "(chưa có)"
if (start !== -1) {
  for (const line of lines.slice(start + 1)) {
    if (/^#{1,6}\s/.test(line)) break
    if (!/^\s*[-*]\s/.test(line)) continue
    const planned = /chưa có/i.test(line)
    for (const [, name] of line.matchAll(/(?:^|[\s`(,])\/([a-z0-9][a-z0-9-]*)/gi)) {
      listed.set(name, planned)
    }
  }
}

const problems = []
for (const name of existing) {
  if (!listed.has(name)) problems.push(`- /${name}: có trong .claude/skills/ nhưng chưa ghi trong "Available Skills"`)
  else if (listed.get(name)) problems.push(`- /${name}: đã có skill nhưng CLAUDE.md vẫn ghi "(chưa có)"`)
}
for (const [name, planned] of listed) {
  if (!planned && !existing.includes(name)) {
    problems.push(`- /${name}: ghi trong CLAUDE.md nhưng không có .claude/skills/${name}/SKILL.md (xóa hoặc đánh dấu "(chưa có)")`)
  }
}

if (problems.length > 0) {
  const message = `CLAUDE.md lệch với .claude/skills/:\n${problems.join('\n')}`
  process.stdout.write(
    JSON.stringify({
      systemMessage: message,
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: `${message}\nHãy cập nhật mục "Available Skills" và "Skill Routing" trong CLAUDE.md cho khớp, hoặc hỏi user trước nếu chưa rõ mô tả skill.`,
      },
    }),
  )
}
