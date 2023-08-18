import React from 'react'
import { ReactComponent as Icon } from './assets/round-ballot-24px.svg'
import { MenuPlugin } from '@webiny/app-admin/plugins/MenuPlugin'
import { useSecurity } from '@webiny/app-security'
import { FullAccessPermission } from '@webiny/app-security/types'
import { DataUploadsPermission } from '../datasets/types'

// We need a component which will perform security checks, and conditionally render menu items.
const DataUploadsMenu: React.FC<{ Menu: any; Item: any }> = ({ Menu, Item }) => {
  const { identity } = useSecurity()
  if (!identity?.getPermission) {
    return null
  }
  // We get the "car-manufacturers" permission from current identity (logged-in user).
  const permission = identity.getPermission<DataUploadsPermission | FullAccessPermission>(
    'data-uploads'
  )

  if (!permission) {
    return null
  }

  // Note that the received permission object can also be `{ name: "*" }`. If so, that
  // means we are dealing with the super admin, who has unlimited access.
  let hasAccess = permission.name === '*'
  if (!hasAccess) {
    // If not super admin, let's check if we have the "r" in the `rwd` property.
    hasAccess = Boolean(
      permission.name === 'data-uploads' && permission.rwd && permission.rwd.includes('r')
    )
  }

  // Finally, if current identity doesn't have access, we immediately exit.
  if (!hasAccess) {
    return null
  }

  return (
    <Menu name="menu-data-uploads" label={'Data'} icon={<Icon />}>
      <Item label={'Data Uploads'} path={'/data-uploads'} />
      <Item label={'Data Views'} path={'/adata-views'} />
    </Menu>
  )
}

/**
 * Registers "Data Uploads" main menu item.
 */
export default new MenuPlugin({
  render(props) {
    return <DataUploadsMenu {...props} />
  }
})
