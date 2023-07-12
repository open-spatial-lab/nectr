export const operatorConfig: {
  [key: string]: {
      label: string;
      inputs: ("text" | "number" | "chips")[];
      explanation: string;
  };
} = {
  "=": {
      label: "Equals",
      inputs: ["text"],
      explanation: "a number or text"
  },
  "!=": {
      label: "Not Equals",
      inputs: ["text"],
      explanation: "a number or text"
  },
  ">": {
      label: "Greater than",
      inputs: ["number"],
      explanation: "a number"
  },
  ">=": {
      label: "Greater than or equal to",
      inputs: ["number"],
      explanation: "a number"
  },
  "<": {
      label: "Less than",
      inputs: ["number"],
      explanation: "a number"
  },
  "<=": {
      label: "Less than or equal to",
      inputs: ["number"],
      explanation: "a number"
  },
  In: {
      label: "One of",
      inputs: ["chips"],
      explanation: "a list of numbers of text, separated by commas (eg. value=1,2,3)"
  },
  NotIn: {
      label: "Not one of",
      inputs: ["chips"],
      explanation: "a list of numbers of text, separated by commas (eg. value=1,2,3)"
  },
  Null: {
      label: "Missing",
      inputs: [],
      explanation: ""
  },
  NotNull: {
      label: "Not Missing",
      inputs: [],
      explanation: ""
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
      label: "Between",
      inputs: ["number", "number"],
      explanation: "two numbers separated by a comma (eg. value=1,2)"
  },
  NotBetween: {
      label: "Not Between",
      inputs: ["number", "number"],
      explanation: "two numbers separated by a comma (eg. value=1,2)"
  },
  Like: {
      label: "Contains",
      inputs: ["text"],
      explanation: "text"
  },
  ILike: {
      label: "Contains (case insensitive)",
      inputs: ["text"],
      explanation: "text"
  },
  NotLike: {
      label: "Does not contain",
      inputs: ["text"],
      explanation: "text"
  },
  NotILike: {
      label: "Does not contain (case insensitive)",
      inputs: ["text"],
      explanation: "text"
  }
};