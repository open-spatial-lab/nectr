import React from "react";
import { SelectQuery, WhereQuery } from "../QueryBuilder";
import { WhereBuilderRow } from "./WhereBuilderRow";
import { operatorConfig } from "./operatorConfig";
import { HandleWhereChangeArgs } from "./types";
import { Grid, Cell } from "@webiny/ui/Grid";
import { Select } from "@webiny/ui/Select";
import { ButtonDefault as Button } from "@webiny/ui/Button";

export const WhereBuilder: React.FC<{
  template: SelectQuery;
  handleTemplateChange: (key: keyof SelectQuery, value: SelectQuery[keyof SelectQuery]) => void;
  columns: string[];
}> = ({ template, handleTemplateChange, columns }) => {
  const handleWhereChange = ({ action, index, key, value }: HandleWhereChangeArgs) => {
      switch (action) {
          case "add":
              handleTemplateChange("where", [
                  ...(template.where || []),
                  {
                      column: "",
                      operator: "=",
                      value: [""]
                  }
              ] as WhereQuery[]);
              break;
          case "remove":
              handleTemplateChange(
                  "where",
                  (template.where || []).filter((_, i) => i !== index)
              );
              break;
          case "update":
              if (index == undefined || key === undefined || !template?.where?.[index]) {
                  return;
              }
              const clause = {
                  ...template.where[index],
                  [key]: value
              };
              const newWhereTemplate = template.where.map((item, i) =>
                  i === index ? clause : item
              );
              handleTemplateChange("where", newWhereTemplate);
              break;
          default:
              break;
      }
  };
  return (
      <div>
          {template.where?.map((clause, index) => (
              <Grid style={{ padding: "1rem 0" }} key={index}>
                  <Cell span={3} desktop={3} tablet={3}>
                      <Select
                          label={"Column"}
                          description={"Choose your column"}
                          value={clause.column}
                          options={columns}
                          onChange={val =>
                              handleWhereChange({
                                  action: "update",
                                  index,
                                  key: "column",
                                  value: val
                              })
                          }
                      />
                  </Cell>
                  <Cell span={3} desktop={3} tablet={6}>
                      <Select
                          label={"Constraint"}
                          description={"Choose a constraint"}
                          value={operatorConfig[clause.operator]?.label}
                          options={Object.values(operatorConfig).map(item => item.label)}
                          onChange={val =>
                              handleWhereChange({
                                  action: "update",
                                  index,
                                  key: "operator",
                                  value: Object.entries(operatorConfig).find(
                                      ([, value]) => value.label === val
                                  )?.[0]
                              })
                          }
                      />
                  </Cell>

                  <WhereBuilderRow
                      clause={clause}
                      index={index}
                      handleWhereChange={handleWhereChange}
                  />
              </Grid>
          ))}
          <Button onClick={() => handleWhereChange({ action: "add" })}>Add New Filter</Button>
      </div>
  );
};