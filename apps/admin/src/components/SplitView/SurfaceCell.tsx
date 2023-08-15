import { Cell } from '@webiny/ui/Grid'
import styled from '@emotion/styled'

export const SurfaceCell = styled(Cell)({
  backgroundColor: 'var(--mdc-theme-surface)',
  borderRadius: 'var(--mdc-shape-small)',
  padding: 'var(--mdc-layout-grid-gutter-mobile)',
  boxShadow: 'var(--mdc-elevation-z2)',
  overflow: 'auto'
})
