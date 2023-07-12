import * as React from "react";
import { Cell } from "@webiny/ui/Grid";
import { ButtonPrimary as Button } from "@webiny/ui/Button";
import { HandleWhereChangeArgs } from "./types";
import { WhereQuery } from "../QueryBuilder";
import { operatorConfig } from "./operatorConfig";
import { onlyUnique } from "../../utils/onlyUnique";
import { WhereParamInput } from "./WhereParamInput";
import { Dialog, DialogContent } from "@webiny/ui/Dialog";
import { Checkbox } from "@webiny/ui/Checkbox";
import { Input } from "@webiny/ui/Input";

export const WhereBuilderRow: React.FC<{
  clause: WhereQuery;
  index: number;
  handleWhereChange: (args: HandleWhereChangeArgs) => void;
}> = ({ clause, index, handleWhereChange }) => {
  const inputs = operatorConfig[clause.operator].inputs;
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const toggleDialog = () => setDialogOpen(p => !p);

  if (!inputs?.length) {
      return null;
  }
  const getHandleInputchange =
      (entryIndex: number) => (action: "remove" | "update" | "add", value: string | number) => {
          console.log("action", action, value);
          switch (action) {
              case "remove":
                  if (Array.isArray(value)) {
                      handleWhereChange({
                          action: "update",
                          index: index,
                          key: "value",
                          value: ((value as string[]) || []).filter(
                              (v: string | number) => v !== value
                          )
                      });
                  }
                  break;
              case "update": {
                  const newValue = [...clause.value];
                  newValue[entryIndex] = value;
                  handleWhereChange({
                      action: "update",
                      index: index,
                      key: "value",
                      value: newValue
                  });
                  break;
              }
              case "add": {
                  const oldValues = Array.isArray(clause.value[0]) ? clause.value[0] : [];
                  const newValue = [...oldValues, value];
                  console.log("newValue", newValue);
                  handleWhereChange({
                      action: "update",
                      index: index,
                      key: "value",
                      value: [newValue.filter(onlyUnique)]
                  });
                  break;
              }
              default:
                  break;
          }
      };
  return (
      <React.Fragment>
          {inputs.map((input, entryIndex) => {
              const columns = input === "chips" || inputs.length === 1 ? 4 : 2;
              return (
                  <Cell span={columns} tablet={columns} desktop={columns} key={entryIndex}>
                      <WhereParamInput
                          key={entryIndex}
                          type={input}
                          value={clause.value[entryIndex]}
                          handleInputChange={getHandleInputchange(entryIndex)}
                      />
                  </Cell>
              );
          })}
          <Cell span={1}>
              <Button onClick={toggleDialog}>...</Button>
          </Cell>
          <Cell span={1}>
              <Button
                  onClick={() => {
                      handleWhereChange({ action: "remove", index: index });
                  }}
              >
                  &times;
              </Button>
              <Dialog open={dialogOpen} onClose={toggleDialog}>
                  <DialogContent>
                      <h3>Advanced settings</h3>
                      <Checkbox
                          onClick={() => {
                              handleWhereChange({
                                  action: "update",
                                  index: index,
                                  key: "allowCustom",
                                  value: !clause.allowCustom
                              });
                          }}
                          label={"Allow custom API values"}
                          description={
                              "Allow data users to override your values with custom values. This may incur additional costs if large data queries are executed."
                          }
                          value={clause.allowCustom}
                      />
                      <br />
                      <p>You may provide a custom name. For more read docs here...[todo]</p>
                      <br />
                      <p>
                          To use a custom query values, data users should provide a URL query
                          parameter for{" "}
                          <u>
                              {clause.customAlias
                                  ? clause.customAlias
                                  : `${clause.column}${index + 1}`}
                          </u>
                          .
                          <br />
                          <br />
                          {operatorConfig[clause.operator].explanation.length > 0 && (
                              <span>
                                  Your data users should provide{" "}
                                  {operatorConfig[clause.operator].explanation} to change this
                                  data filter.
                              </span>
                          )}
                      </p>
                      <Input
                          type="text"
                          value={clause.customAlias}
                          disabled={!clause.allowCustom}
                          onChange={value => {
                              handleWhereChange({
                                  action: "update",
                                  index: index,
                                  key: "customAlias",
                                  value: value
                              });
                          }}
                          placeholder="Custom alias"
                      />
                  </DialogContent>
              </Dialog>
              {/* <Menu handle={<ButtonPrimary>...</ButtonPrimary>}>
                  <MenuItem onClick={() => handleWhereChange({ action: "remove", index: index })}>
                  &times; Remove
                  </MenuItem>
                  <MenuItem><input type="text"/></MenuItem>
              </Menu> */}
          </Cell>
      </React.Fragment>
  );
};
