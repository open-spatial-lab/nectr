import styled from '@emotion/styled'
import { Grid } from '@webiny/ui/Grid'

export const NoPaddingGrid = styled(Grid)({
  padding: 0
})

export const CompactGrid = styled(NoPaddingGrid)`
  * {
    row-gap: 0px;
  }
`