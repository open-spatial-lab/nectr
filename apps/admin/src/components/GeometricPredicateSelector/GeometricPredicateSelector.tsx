import React from 'react'
import { ButtonPrimary, ButtonSecondary, ButtonIcon } from '@webiny/ui/Button'
import { ReactComponent as IntersectsIcon } from '../../assets/intersects.svg'
import { ReactComponent as ContainsIcon } from '../../assets/contains.svg'
import { ReactComponent as WithinIcon } from '../../assets/within.svg'
import { ReactComponent as TouchesIcon } from '../../assets/touches.svg'

const geometricPredicates = [
  {
    name: 'Intersects',
    icon: <IntersectsIcon />,
    predicate: 'ST_Intersects',
    description:
      'Any intersection between two geometries, including one geometry completely containing the other, touching, overlapping, or intersecting at a single point.'
  },
  {
    name: 'Contains',
    icon: <ContainsIcon />,
    predicate: 'ST_Contains',
    description: 'The main data source geometry completely contains the other geometry.'
  },
  {
    name: 'Within',
    icon: <WithinIcon />,
    predicate: 'ST_Within',
    description: 'The main data source geometry is completely contained by the other geometry.'
  },
  {
    name: 'Touches',
    icon: <TouchesIcon />,
    predicate: 'ST_Touches',
    description:
      'The geometries have at least one point in common, but their interiors do not intersect.'
  }
] as const

type PredicatesSpecs = (typeof geometricPredicates)[number]
type Predicates = PredicatesSpecs['predicate']

type GeometricPredicateSelectorProps = {
  value?: string
  onChange: (predicate: Predicates) => void
}

export const GeometricPredicateSelector = ({ value, onChange }: GeometricPredicateSelectorProps) => {
  return (
    <>
      {geometricPredicates.map((predicate: PredicatesSpecs) => {
        const Button = value === predicate.predicate ? ButtonPrimary : ButtonSecondary
        return (
          <Button
            key={predicate.predicate}
            onClick={() => onChange(predicate.predicate)}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignContent: 'center',
                justifyContent: 'center'
              }}
            >
              <ButtonIcon icon={predicate.icon} />
              <div>{predicate.name}</div>
            </div>
          </Button>
        )
      })}
    </>
  )
}
