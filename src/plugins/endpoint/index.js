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

import DefaultConnectionSchemaPlugin from './default/ConnectionSchemaPlugin'
import AzureConnectionSchemaPlugin from './azure/ConnectionSchemaPlugin'
import OpenstackConnectionSchemaPlugin from './openstack/ConnectionSchemaPlugin'
import OciConnectionSchemaPlugin from './oci/ConnectionSchemaPlugin'
import DefaultContentPlugin from './default/ContentPlugin'
import AzureContentPlugin from './azure/ContentPlugin'
import OpenstackContentPlugin from './openstack/ContentPlugin'

import DefaultOptionsSchemaPlugin from './default/OptionsSchemaPlugin'
import OvmOptionsSchemaPlugin from './ovm/OptionsSchemaPlugin'

export const ConnectionSchemaPlugin = {
  default: DefaultConnectionSchemaPlugin,
  azure: AzureConnectionSchemaPlugin,
  openstack: OpenstackConnectionSchemaPlugin,
  oci: OciConnectionSchemaPlugin,
}

export const OptionsSchemaPlugin = {
  default: DefaultOptionsSchemaPlugin,
  oracle_vm: OvmOptionsSchemaPlugin,
}

export const ContentPlugin = {
  default: DefaultContentPlugin,
  azure: AzureContentPlugin,
  openstack: OpenstackContentPlugin,
}
