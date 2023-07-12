import React, { useEffect } from "react";
import { Input } from "@webiny/ui/Input";
import { Chips, Chip } from "@webiny/ui/Chips";
import { WhereBuilderInput } from "./types";

export const WhereParamInput: React.FC<WhereBuilderInput> = ({ type, value, handleInputChange }) => {
  const [inputText, setInputText] = React.useState<string>("");

  useEffect(() => {
      if (type === "chips" && ((value || []) as string[]).includes(inputText)) {
          setInputText("");
      }
  }, [JSON.stringify(value)]);

  switch (type) {
      case "text":
          return (
              <Input
                  type="text"
                  value={value as string}
                  onChange={value => handleInputChange("update", value)}
              />
          );
      case "number":
          return (
              <Input
                  type="number"
                  value={value as number}
                  onChange={value => handleInputChange("update", value)}
              />
          );
      case "chips":
          const handleRemoveChip = (removeValue: string) => {
              const newValue = Array.isArray(value)
                  ? value.filter((v: string) => v !== removeValue)
                  : [];

              handleInputChange("update", newValue);
          };
          const chips = (value || []) as string[];

          return (
              <div>
                  {!!chips.length && (
                      <Chips>
                          {((value || []) as string[]).map((v, i) => (
                              <Chip
                                  key={i}
                                  label={<span>{v} &times;</span>}
                                  // @ts-ignore
                                  onClick={() => handleRemoveChip(v)}
                              />
                          ))}
                      </Chips>
                  )}
                  <Input
                      type="text"
                      value={inputText}
                      placeholder="Add a new option"
                      // @ts-ignore
                      onKeyPress={e => {
                          const event = e as any;
                          const key = event.key;
                          const value = event?.target?.value;
                          if (key === "Enter" && value.length) {
                              handleInputChange("add", value);
                          }
                      }}
                      onChange={value => setInputText(value)}
                  />
              </div>
          );
      default:
          return null;
  }
};