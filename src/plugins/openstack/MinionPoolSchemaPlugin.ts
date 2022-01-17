import DefaultMinionPoolSchemaPlugin from '@src/plugins/default/MinionPoolSchemaPlugin'
import { Field } from '@src/@types/Field'
import DomUtils from '@src/utils/DomUtils'

export default class MinionPoolSchemaPlugin {
  static getMinionPoolToOptionsQuery(envData: any) {
    return `?env=${DomUtils.encodeToBase64Url({ ...envData, list_all_destination_networks: true })}`
  }

  static minionPoolTransformOptionsFields(fields: Field[]) {
    // Remove this field, as all networks are always listed
    fields = fields.filter(f => f.name !== 'list_all_destination_networks')
    return fields
  }

  static getMinionPoolEnv(schema: Field[], data: any) {
    const payload: any = DefaultMinionPoolSchemaPlugin.getMinionPoolEnv(schema, data)
    return { ...payload, list_all_destination_networks: true }
  }
}
