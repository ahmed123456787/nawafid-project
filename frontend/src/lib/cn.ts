export function cn(
  ...inputs: (string | number | false | null | undefined)[]
): string {
  return inputs.filter(Boolean).join(' ')
}
