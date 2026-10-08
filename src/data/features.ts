import type { CodeToken } from './demo'

export type FeatureId = 'context' | 'refactor' | 'bugs' | 'tests'

export type Feature = {
  id: FeatureId
  lines: CodeToken[][]
}

const kw = (text: string): CodeToken => ({ text, kind: 'keyword' })
const str = (text: string): CodeToken => ({ text, kind: 'string' })
const cm = (text: string): CodeToken => ({ text, kind: 'comment' })
const fn = (text: string): CodeToken => ({ text, kind: 'function' })
const ty = (text: string): CodeToken => ({ text, kind: 'type' })
const t = (text: string): CodeToken => ({ text, kind: 'plain' })

export const features: Feature[] = [
  {
    id: 'context',
    lines: [
      [cm('// Open files feeding this change')],
      [t('auth/'), fn('LoginForm.tsx')],
      [t('auth/'), fn('session.ts')],
      [t('lib/'), fn('validators.ts')],
      [],
      [cm('// Proposed edit respects existing helpers')],
      [kw('import'), t(' { '), fn('isValidEmail'), t(' } '), kw('from'), t(' '), str("'../lib/validators'"), t(';')],
      [kw('import'), t(' { '), fn('createSession'), t(' } '), kw('from'), t(' '), str("'./session'"), t(';')],
    ],
  },
  {
    id: 'refactor',
    lines: [
      [cm('// Before: duplicated parsing')],
      [t('const id = raw.split('), str("'/'"), t(').pop()!;')],
      [],
      [cm('// After: shared utility + updated call sites')],
      [kw('export function'), t(' '), fn('parseResourceId'), t('(path: '), ty('string'), t(') {')],
      [t('  '), kw('return'), t(' path.split('), str("'/'"), t(').'), fn('at'), t('(-'), t('1'), t(') ?? '), str("''"), t(';')],
      [t('}')],
    ],
  },
  {
    id: 'bugs',
    lines: [
      [cm('// Warning: response may apply after unmount')],
      [fn('fetchUser'), t('(id).then(setUser);')],
      [],
      [cm('// Suggested fix')],
      [kw('const'), t(' controller = '), kw('new'), t(' '), ty('AbortController'), t('();')],
      [fn('fetchUser'), t('(id, { signal: controller.signal })')],
      [t('  .then(setUser);')],
      [kw('return'), t(' () => controller.abort();')],
    ],
  },
  {
    id: 'tests',
    lines: [
      [fn('it'), t('('), str("'keeps cents for zero'"), t(', () => {')],
      [t('  '), fn('expect'), t('('), fn('formatPrice'), t('(0)).'), fn('toBe'), t('('), str("'$0.00'"), t(');')],
      [t('});')],
      [],
      [fn('it'), t('('), str("'rejects unknown currency'"), t(', () => {')],
      [t('  '), fn('expect'), t('(() => '), fn('formatPrice'), t('(10, '), str("'ZZZ'"), t('))')],
      [t('    .'), fn('toThrow'), t('(/currency/i);')],
      [t('});')],
    ],
  },
]

export const featureOrder: FeatureId[] = ['context', 'refactor', 'bugs', 'tests']
