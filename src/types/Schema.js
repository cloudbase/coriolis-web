/*
Copyright (C) 2017  Cloudbase Solutions SRL
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.
You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// @flow

// export type Schema = {
//   properties: {
//     [string]: {
//       name: string,
//     }
//   },
//   required: string[],
//   oneOf: Schema[],
// }

export type SchemaProperties = {
  properties: {
    [string]: {
      type: 'array',
      items: {
        type: string,
      },
    } | {
      type: string,
      enum?: string[],
      default?: string,
    } | {
      $ref: string,
    },
  },
  required: string[],
  type?: string,
}

export type SchemaDefinitions = {
  [string]: SchemaProperties,
}

export type Schema = {
  oneOf: SchemaProperties[],
  definitions?: SchemaDefinitions,
}
