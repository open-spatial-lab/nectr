export type WhereBuilderInput = {
  type: 'text' | 'number' | 'chips'
  value: string | number | string[]
  handleInputChange: (action: 'add' | 'remove' | 'update', value?: any) => void
}

export type HandleWhereChangeArgs = {
  action: 'add' | 'remove' | 'update'
  index?: number
  key?: string
  value?: any
}
