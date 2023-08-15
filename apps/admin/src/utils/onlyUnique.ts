export const onlyUnique = <T>(value: T, index: number, self: Array<T>): boolean => {
  return self.indexOf(value) === index
}
