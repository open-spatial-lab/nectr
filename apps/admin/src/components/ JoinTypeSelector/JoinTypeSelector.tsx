import React from "react";
import { JOIN_OPERATORS, JOIN_OPERATOR_TYPES, JoinQuery } from "../QueryBuilder/types";
import { ReactComponent as LeftJoin } from '../../assets/left-join.svg'
import { ReactComponent as RightJoin } from '../../assets/right-join.svg'
import { ReactComponent as InnerJoin } from '../../assets/inner-join.svg'
import { ReactComponent as OuterJoin } from '../../assets/full-join.svg'
import { ButtonPrimary, ButtonSecondary, ButtonIcon } from '@webiny/ui/Button'

type JoinTypeSelectorProps = {
  join: JoinQuery
  onChange: (joinOperation: JOIN_OPERATOR_TYPES) => void
}

const ICON_MAPPING = {
  left: LeftJoin,
  right: RightJoin,
  inner: InnerJoin,
  outer: OuterJoin
} as const

export const JoinTypeSelector = ({
  join,
  onChange
}: JoinTypeSelectorProps ) => {
return <div style={{ width: '100%' }}>
  {JOIN_OPERATORS.map(joinOp => {
    const Button = join.operator === joinOp ? ButtonPrimary : ButtonSecondary
    const Icon = ICON_MAPPING[joinOp as keyof typeof ICON_MAPPING]
    return (
      <Button
        key={joinOp}
        onClick={() => onChange(joinOp)}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignContent: 'center',
            justifyContent: 'center'
          }}
        >
          <ButtonIcon icon={<Icon />} />
          <div>{joinOp}</div>
        </div>
      </Button>
    )
  })}
</div>
}