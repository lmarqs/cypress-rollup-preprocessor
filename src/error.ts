import { EOL } from 'os'

export function wrapRollupError (rollupError: any): any {
  const message = [
    rollupError.message,
    rollupError.frame,
    [rollupError.loc?.file, rollupError.loc?.line, rollupError.loc?.column]
    .filter(Boolean)
    .join(':'),
  ]
  .filter(Boolean)
  .join(EOL)

  return new Error(message)
}
