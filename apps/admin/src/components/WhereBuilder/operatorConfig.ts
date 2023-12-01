export const operatorConfig: {
  [key: string]: {
    label: string
    inputs: ('text' | 'number' | 'chips')[]
    explanation: string
  }
} = {
  '=': {
    label: 'Equals',
    inputs: ['text'],
    explanation: 'a number or text'
  },
  '!=': {
    label: 'Not Equals',
    inputs: ['text'],
    explanation: 'a number or text'
  },
  '>': {
    label: 'Greater than',
    inputs: ['number'],
    explanation: 'a number'
  },
  '>=': {
    label: 'Greater than or equal to',
    inputs: ['number'],
    explanation: 'a number'
  },
  '<': {
    label: 'Less than',
    inputs: ['number'],
    explanation: 'a number'
  },
  '<=': {
    label: 'Less than or equal to',
    inputs: ['number'],
    explanation: 'a number'
  },
  Not: {
    label: 'Is Not',
    inputs: ['text'],
    explanation: 'a number or text'
  },
  In: {
    label: 'Matches one of several values',
    inputs: ['chips'],
    explanation: 'a list of numbers of text, separated by commas (eg. value=1,2,3)'
  },
  NotIn: {
    label: 'Not one of',
    inputs: ['chips'],
    explanation: 'a list of numbers of text, separated by commas (eg. value=1,2,3)'
  },
  Null: {
    label: 'Missing values',
    inputs: [],
    explanation: ''
  },
  NotNull: {
    label: 'Not Missing values',
    inputs: [],
    explanation: ''
  },
  //   // "Exists": {
  //     label: "",
  //     inputs:[]

  //   },
  //   // "NotExists": {
  //     label: "",
  //     inputs:[]

  //   },
  Between: {
    label: 'Value is Between',
    inputs: ['number', 'number'],
    explanation: 'two numbers separated by a comma (eg. value=1,2)'
  },
  NotBetween: {
    label: 'Value is Not Between',
    inputs: ['number', 'number'],
    explanation: 'two numbers separated by a comma (eg. value=1,2)'
  },
  Like: {
    label: 'Contains text',
    inputs: ['text'],
    explanation: 'text'
  },
  ILike: {
    label: 'Contains text (case insensitive)',
    inputs: ['text'],
    explanation: 'text'
  },
  NotLike: {
    label: 'Does not contain text',
    inputs: ['text'],
    explanation: 'text'
  },
  NotILike: {
    label: 'Does not contain text (case insensitive)',
    inputs: ['text'],
    explanation: 'text'
  },
  ILikeOneOf: {
    label: 'Contains one of multiple text options (case insensitive)',
    inputs: ['text'],
    explanation: 'a list of text, separated by commas (eg. value=1,2,3)'
  },
  LikeOneOf: {
    label: 'Contains one of multiple text options',
    inputs: ['text'],
    explanation: 'a list of text, separated by commas (eg. value=1,2,3)'
  },
}
