import { Security, SecurityContext, FullAccessPermission } from '@webiny/api-security/types'
import { Identity } from '@webiny/api-authentication/types'

type BasePermissions = {
  name: string
  rwd?: 'r' | 'rw' | 'rwd'
}
export class Authorize<TIdentity extends BasePermissions> {
  security: Security<Identity>
  featureName: string
  su: boolean = true

  constructor(security: Security<Identity>, featureName: string) {
    this.security = security
    this.featureName = featureName
  }

  async authorize(level: 'r' | 'rw' | 'rwd') {
    const permission = await this.security.getPermission<TIdentity>(this.featureName)
    if (!permission) {
      throw new Error('Not authorized.')
    }
    // means we are dealing with the super admin, who has unlimited access.
    let hasAccess = this.su && permission.name === '*'
    if (!hasAccess) {
      // If not super admin, let's check if we have the "r" in the `rwd` property.
      hasAccess =
        permission.name === this.featureName && !!permission?.rwd && permission?.rwd.includes(level)
    }
    if (!hasAccess) {
      throw new Error('Not authorized.')
    }
  }
  async authorizeR() {
    await this.authorize('r')
  }
  async authorizeRW() {
    await this.authorize('rw')
  }
  async authorizeRWD() {
    await this.authorize('rwd')
  }

  authorizeEntry<TEntry>(
    entry: TEntry extends { createdBy: any } ? TEntry : never,
    key: keyof TEntry
  ) {
    const id = this.security.getIdentity().id
    const entryId = entry[key] as any[]
    if (!entryId.includes(id)) {
      throw new Error(`Not authorized. Please contact ${entry.createdBy} to get access.`)
    }
  }

  authorizeList<TEntry>(
    entries: Array<TEntry extends { createdBy: any } ? TEntry : never>,
    key: keyof TEntry
  ) {
    const id = this.security.getIdentity().id
    return entries.filter(entry => (entry[key] as any[]).includes(id))
  }
}
