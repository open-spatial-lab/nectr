import React from 'react'
// import { SplitView, LeftPanel, RightPanel } from "@webiny/app-admin/components/SplitView";
import ApiDataQueriesDataList from './ApiDataQueriesDataList'
import ApiDataQueriesForm from './ApiDataQueriesForm'
// import {
//   CollapsibleSplitView,
//   CollapsibleLeftPanel,
//   CollapsibleRightPanel
// } from '../../../../components/CollapsibleSplitView'
import { Drawer, DrawerContent } from '@webiny/ui/Drawer'
import styled from '@emotion/styled'
import { ButtonPrimary, ButtonIcon } from '@webiny/ui/Button'
import { ReactComponent as ShowIcon } from '../assets/show.svg'
const DrawerFormContainer = styled('div')`
  position: relative;
  width: 100%;
  height: calc(100vh - 67px);
  padding: 0;
  overflow-y:hidden;
  
`

const AbsoluteDrawerContainer = styled('div')<{drawerOpen: boolean}>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  pointer-events: ${props => props.drawerOpen ? 'auto' : 'none'};
`
const UnconstrainedDrawer = styled(Drawer)`
  width: fit-content;
`
const QueryListContainer = styled(DrawerContent)`
  /* padding: 0; */
  min-width: 50vw;
`

const OpenCloseDrawerButton = styled(ButtonPrimary)<{drawerOpen: boolean}>`
  position: absolute;
  z-index: ${props => props.drawerOpen ? 9 : 10};
  top: 1rem;
  left: 0rem;
  background: white;
  padding: 0 0.5rem;
  font-size:0.75rem;
  font-weight:bold;
`

const InnerFormContainer = styled('div')`
  height: 100%;
  overflow-y: auto;
  padding: 3rem 0;
  z-index:9;
`

const Spacer = styled('div')<{h: string}>`
  height: ${props => props.h};
`
/**
 * Main view component - renders data list and form.
 */

const ApiDataQueriesView: React.FC = () => {
  const [showDrawer, setShowDrawer] = React.useState(false)

  return (
    <DrawerFormContainer>
      <AbsoluteDrawerContainer drawerOpen={showDrawer}
      >
        <UnconstrainedDrawer open={showDrawer} modal={true}
          onClose={() => setShowDrawer(false)}
        >
          <QueryListContainer>
            <ApiDataQueriesDataList onHide={() => setShowDrawer(false)} />
          </QueryListContainer>
        </UnconstrainedDrawer>
      </AbsoluteDrawerContainer>
      <InnerFormContainer>
        <ApiDataQueriesForm />
        <Spacer h={'3rem'} />
      </InnerFormContainer>
      <OpenCloseDrawerButton onClick={() => setShowDrawer(curr => !curr)} drawerOpen={showDrawer}>
        <ButtonIcon icon={<ShowIcon />} />
        Data Views
      </OpenCloseDrawerButton>
    </DrawerFormContainer>
  )
}

export default ApiDataQueriesView
