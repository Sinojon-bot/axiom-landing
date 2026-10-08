export type DemoExampleId = 'login' | 'async' | 'tests'

export type TokenKind =
  | 'plain'
  | 'keyword'
  | 'string'
  | 'comment'
  | 'function'
  | 'type'
  | 'number'
  | 'operator'
  | 'diff-add'
  | 'diff-remove'

export type CodeToken = { text: string; kind: TokenKind }

export type DemoExample = {
  id: DemoExampleId
  files: string[]
  activeFile: string
  tabs: string[]
  beforeLines?: CodeToken[][]
  afterLines: CodeToken[][]
}

const kw = (text: string): CodeToken => ({ text, kind: 'keyword' })
const str = (text: string): CodeToken => ({ text, kind: 'string' })
const fn = (text: string): CodeToken => ({ text, kind: 'function' })
const ty = (text: string): CodeToken => ({ text, kind: 'type' })
const num = (text: string): CodeToken => ({ text, kind: 'number' })
const t = (text: string): CodeToken => ({ text, kind: 'plain' })
const add = (text: string): CodeToken => ({ text, kind: 'diff-add' })
const rem = (text: string): CodeToken => ({ text, kind: 'diff-remove' })

export const demoExamples: DemoExample[] = [
  {
    id: 'login',
    files: ['src/components/LoginForm.tsx', 'src/lib/auth.ts', 'src/styles/form.css'],
    activeFile: 'LoginForm.tsx',
    tabs: ['LoginForm.tsx', 'auth.ts'],
    afterLines: [
      [kw('import'), t(' { useState } '), kw('from'), t(' '), str("'react'"), t(';')],
      [],
      [kw('type'), t(' '), ty('LoginFormProps'), t(' = {')],
      [t('  onSubmit: (email: '), ty('string'), t(', password: '), ty('string'), t(') => '), ty('Promise'), t('<'), ty('void'), t('>;')],
      [t('};')],
      [],
      [kw('export function'), t(' '), fn('LoginForm'), t('({ onSubmit }: '), ty('LoginFormProps'), t(') {')],
      [t('  '), kw('const'), t(' [email, setEmail] = '), fn('useState'), t('('), str("''"), t(');')],
      [t('  '), kw('const'), t(' [password, setPassword] = '), fn('useState'), t('('), str("''"), t(');')],
      [t('  '), kw('const'), t(' [error, setError] = '), fn('useState'), t('<'), ty('string'), t(' | '), kw('null'), t('>('), kw('null'), t(');')],
      [],
      [t('  '), kw('async function'), t(' '), fn('handleSubmit'), t('(e: '), ty('FormEvent'), t(') {')],
      [t('    e.'), fn('preventDefault'), t('();')],
      [t('    '), kw('if'), t(' (!'), fn('isValidEmail'), t('(email)) {')],
      [t('      '), fn('setError'), t('('), str("'Enter a valid email address.'"), t(');')],
      [t('      '), kw('return'), t(';')],
      [t('    }')],
      [t('    '), fn('setError'), t('('), kw('null'), t(');')],
      [t('    '), kw('await'), t(' '), fn('onSubmit'), t('(email, password);')],
      [t('  }')],
      [],
      [t('  '), kw('return'), t(' (')],
      [t('    <'), fn('form'), t(' onSubmit={handleSubmit} '), fn('noValidate'), t('>')],
      [t('      {/* fields + aria-describedby wired to error */}')],
      [t('    </'), fn('form'), t('>')],
      [t('  );')],
      [t('}')],
    ],
  },
  {
    id: 'async',
    files: ['src/hooks/useProfile.ts', 'src/api/users.ts', 'src/pages/Profile.tsx'],
    activeFile: 'useProfile.ts',
    tabs: ['useProfile.ts', 'users.ts'],
    beforeLines: [
      [kw('export function'), t(' '), fn('useProfile'), t('(userId: '), ty('string'), t(') {')],
      [t('  '), kw('const'), t(' [profile, setProfile] = '), fn('useState'), t('<'), ty('Profile'), t(' | '), kw('null'), t('>('), kw('null'), t(');')],
      [],
      [t('  '), fn('useEffect'), t('(() => {')],
      [rem('    fetchProfile(userId).then(setProfile);')],
      [t('  }, [userId]);')],
      [],
      [t('  '), kw('return'), t(' profile;')],
      [t('}')],
    ],
    afterLines: [
      [kw('export function'), t(' '), fn('useProfile'), t('(userId: '), ty('string'), t(') {')],
      [t('  '), kw('const'), t(' [profile, setProfile] = '), fn('useState'), t('<'), ty('Profile'), t(' | '), kw('null'), t('>('), kw('null'), t(');')],
      [],
      [t('  '), fn('useEffect'), t('(() => {')],
      [add('    const controller = new AbortController();')],
      [],
      [add('    fetchProfile(userId, { signal: controller.signal })')],
      [add('      .then(setProfile)')],
      [add('      .catch((err) => {')],
      [add("        if (err.name !== 'AbortError') throw err;")],
      [add('      });')],
      [],
      [add('    return () => controller.abort();')],
      [t('  }, [userId]);')],
      [],
      [t('  '), kw('return'), t(' profile;')],
      [t('}')],
    ],
  },
  {
    id: 'tests',
    files: ['src/lib/formatPrice.ts', 'src/lib/formatPrice.test.ts', 'vitest.config.ts'],
    activeFile: 'formatPrice.test.ts',
    tabs: ['formatPrice.test.ts', 'formatPrice.ts'],
    afterLines: [
      [kw('import'), t(' { '), fn('describe'), t(', '), fn('it'), t(', '), fn('expect'), t(' } '), kw('from'), t(' '), str("'vitest'"), t(';')],
      [kw('import'), t(' { '), fn('formatPrice'), t(' } '), kw('from'), t(' '), str("'./formatPrice'"), t(';')],
      [],
      [fn('describe'), t('('), str("'formatPrice'"), t(', () => {')],
      [t('  '), fn('it'), t('('), str("'formats USD with two decimals'"), t(', () => {')],
      [t('    '), fn('expect'), t('('), fn('formatPrice'), t('('), num('19.5'), t(', '), str("'USD'"), t(')).'), fn('toBe'), t('('), str("'$19.50'"), t(');')],
      [t('  });')],
      [],
      [t('  '), fn('it'), t('('), str("'handles zero without dropping cents'"), t(', () => {')],
      [t('    '), fn('expect'), t('('), fn('formatPrice'), t('('), num('0'), t(', '), str("'USD'"), t(')).'), fn('toBe'), t('('), str("'$0.00'"), t(');')],
      [t('  });')],
      [],
      [t('  '), fn('it'), t('('), str("'rounds half-up for display'"), t(', () => {')],
      [t('    '), fn('expect'), t('('), fn('formatPrice'), t('('), num('1.005'), t(', '), str("'USD'"), t(')).'), fn('toBe'), t('('), str("'$1.01'"), t(');')],
      [t('  });')],
      [t('});')],
    ],
  },
]

export function tokensToPlainText(lines: CodeToken[][]): string {
  return lines.map((line) => line.map((tok) => tok.text).join('')).join('\n')
}
