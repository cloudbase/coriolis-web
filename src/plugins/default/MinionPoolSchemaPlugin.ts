import { Field } from '@src/@types/Field'
import DomUtils from '@src/utils/DomUtils'

export default class MinionPoolSchemaPlugin {
  static getMinionPoolToOptionsQuery(envData?: any) {
    let envString = ''
    if (envData) {
      envString = `?env=${DomUtils.encodeToBase64Url(envData)}`
    }
    return envString
  }

  static minionPoolTransformOptionsFields(fields: Field[]) {
    return fields
  }

  static getMinionPoolEnv(schema: Field[], data: any) {
    const payload: any = {}
    schema.forEach(field => {
      if (data[field.name] === null || data[field.name] === undefined || data[field.name] === '') {
        if (field.default !== null) {
          payload[field.name] = field.default
        }
      } else {
        payload[field.name] = data[field.name]
      }
    })
    return payload
  }
}
