import React from "react";

export function stringifyProps(props: Record<string,any>){
  const newProps: Record<string, string> = {}
  Object.keys(props).forEach((key) => {
    const value = JSON.stringify(props[key]);
    const stringifiedValue = value[0] === '"' ? value : `'${value}'`;
    newProps[key] = stringifiedValue
  })
  return newProps;
}

export function generateStringifiedHtml(element:string, properties: Record<string,any>, children: string = ''){
  const keys = Object.keys(properties);
    const propertiesString = keys.map((key, i) => {
      const value = JSON.stringify(properties[key]);
      const stringifiedValue = value[0] === '"' ? value : `'${value}'`;
      let strOut = `\n ${key}=${stringifiedValue}`
      if (i === keys.length - 1) strOut += '\n';
      return strOut;
    }).join(' ');

    return `<${element} ${propertiesString}>\n${children}\n</${element}>`;
}

export const StringifiedHtml = ({element, properties, children}: {element: string, properties: Record<string,any>, children?: string}) => {
    const html = generateStringifiedHtml(element, properties, children);
    return <div dangerouslySetInnerHTML={{__html: html}} />
}