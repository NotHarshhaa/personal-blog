import notharshhaa from '@notharshhaa/eslint-config'

export default [
  notharshhaa({
    project: './tsconfig.json',
    tsconfigRootDir: import.meta.dirname,
    react: true,
    next: true,
  }),
  {
    rules: {
      'prettier/prettier': 'off',
    },
  },
]
