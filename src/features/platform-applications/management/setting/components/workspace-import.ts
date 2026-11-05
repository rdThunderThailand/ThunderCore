import { WorkspaceImportItem } from '@/types'

// Parses the import box: one workspace per line, either "Name" (code derived from the name) or
// "code | Name". Blank lines are skipped; a repeated code keeps its last line.

const CODE_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

export type ParsedWorkspaceLine = WorkspaceImportItem & { line: number; error: string | null }

/** "Media Workspace" -> "media-workspace" — the code Thunder One uses as its App id. */
export const toWorkspaceCode = (name: string) =>
    name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

export const parseWorkspaceImport = (text: string): ParsedWorkspaceLine[] => {
    const byCode = new Map<string, ParsedWorkspaceLine>()
    text.split('\n').forEach((raw, index) => {
        const trimmed = raw.trim()
        if (!trimmed) return
        const [left, right] = trimmed.includes('|') ? trimmed.split('|', 2).map((s) => s.trim()) : [null, trimmed]
        const name = right ?? ''
        const code = (left ?? toWorkspaceCode(name)).toLowerCase()
        const error = !name ? 'Name is required' : CODE_PATTERN.test(code) ? null : 'Code must be lowercase kebab-case'
        byCode.set(code, { code, name, sort_order: (index + 1) * 10, line: index + 1, error })
    })
    return [...byCode.values()]
}
