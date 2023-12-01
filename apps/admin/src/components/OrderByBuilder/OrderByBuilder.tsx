import React from "react"
import { OrderByBuilderProps } from "./types"
import { NoPaddingGrid } from "../SplitView"
import { Cell } from "@webiny/ui/Grid"
// import { ColumnSchema } from "../../plugins/scaffolds/dataUploads/types"
import { OrderByQuery, SourceMeta } from "../QueryBuilder/types"
import { ButtonPrimary, IconButton } from "@webiny/ui/Button"
import { ReactComponent as TrashIcon } from "../../assets/trash.svg"
import { ColumnExplorer } from "../ColumnSelector"
import { Radio, RadioGroup } from "@webiny/ui/Radio"

export const OrderByBuilder: React.FC<OrderByBuilderProps> = ({
  orderbys,
  sources,
  onChange,
}) => {
  const handleChange =
    (index: number) =>
    (sourceId: string, column: string, direction: "asc" | "desc") => {
      orderbys[index] = { sourceId, column, direction }
      onChange([...orderbys])
    }

  const handleAdd = () => {
    orderbys.push({
      sourceId: sources[0].id,
      column: sources[0]?.columns?.[0]?.name || "",
      direction: "asc",
    })
    onChange([...orderbys])
  }

  const handleRemove = (index: number) => () => {
    orderbys.splice(index, 1)
    onChange([...orderbys])
  }

  return (
    <div>
      <NoPaddingGrid>
        {orderbys.map((orderby, idx) => (
          <OrderByRow
            key={idx}
            onRemove={handleRemove(idx)}
            onChange={handleChange(idx)}
            sources={sources}
            orderby={orderby}
          ></OrderByRow>
        ))}
        <Cell span={12} style={{ padding: "1rem 0" }}>
          <ButtonPrimary style={{ width: "100%" }} onClick={handleAdd}>
            Add Data Order / Sort
          </ButtonPrimary>
        </Cell>
      </NoPaddingGrid>
    </div>
  )
}

const OrderByRow: React.FC<{
  onRemove: () => void
  onChange: (
    sourceId: string,
    column: string,
    direction: "asc" | "desc"
  ) => void
  sources: SourceMeta[]
  orderby: OrderByQuery
}> = ({ onRemove, onChange, sources, orderby }) => {
  // const currentSource = sources.find((source) => source.id === orderby.sourceId)

  return (
    <>
      <Cell span={7}>
        <ColumnExplorer
          sources={sources}
          showDerived={true}
          onClick={(column, source) => {
            onChange(
              source?.id || orderby.sourceId,
              column.name,
              orderby.direction
            )
          }}
          currentColumn={orderby.column}
          currentSourceId={orderby.sourceId}
        />
      </Cell>
      <Cell span={3}>
        <RadioGroup label="Order Direction" value={orderby.direction}>
          {() => (
            <>
              <Radio
                label={"Ascending"}
                value={orderby.direction === "asc"}
                
                
                onChange={() =>
                  onChange(orderby.sourceId, orderby.column, "asc")
                }
                />
              <Radio
                label={"Descending"}
                value={orderby.direction === "desc"}
                onChange={() =>
                  onChange(orderby.sourceId, orderby.column, "desc")
                }
              />
            </>
          )}
        </RadioGroup>
      </Cell>
      <Cell span={2}>
        <IconButton
          icon={<TrashIcon />}
          label="Delete column order / sort"
          onClick={onRemove}
        />
      </Cell>
    </>
  )
}
