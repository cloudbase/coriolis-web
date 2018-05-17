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

export type Field = {
  name: string,
  type?: string,
  value?: any,
  enum?: string[],
  required?: boolean,
  default?: any,
  items?: Field[],
  fields?: Field[],
  minimum?: number,
  maximum?: number,
  parent?: string,
  properties?: Field[],
  isBasic?: boolean | (value: any) => boolean, // show this field in simple view even if is not 'required'
}
