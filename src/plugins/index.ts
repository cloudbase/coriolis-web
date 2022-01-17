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

import { ProviderTypes } from '@src/@types/Providers'
import DefaultConnectionSchemaPlugin from './default/ConnectionSchemaPlugin'
import AzureConnectionSchemaPlugin from './azure/ConnectionSchemaPlugin'
import OpenstackConnectionSchemaPlugin from './openstack/ConnectionSchemaPlugin'
import OciConnectionSchemaPlugin from './oci/ConnectionSchemaPlugin'
import KubevirtConnectionSchemaPlugin from './kubevirt/ConnectionSchemaPlugin'

import DefaultContentPlugin from './default/ContentPlugin'
import AzureContentPlugin from './azure/ContentPlugin'
import OpenstackContentPlugin from './openstack/ContentPlugin'

import DefaultOptionsSchemaPlugin from './default/OptionsSchemaPlugin'
import OvmOptionsSchemaPlugin from './ovm/OptionsSchemaPlugin'
import VmwareOptionsSchemaPlugin from './vmware_vsphere/OptionsSchemaPlugin'
import OpenstackOptionsSchemaPlugin from './openstack/OptionsSchemaPlugin'
import OvirtOptionsSchemaPlugin from './ovirt/OptionsSchemaPlugin'

import DefaultInstanceInfoPlugin from './default/InstanceInfoPlugin'
import OciInstanceInfoPlugin from './oci/InstanceInfoPlugin'

import DefaultMinionPoolSchemaPlugin from './default/MinionPoolSchemaPlugin'
import OpenstackMinionPoolSchemaPlugin from './openstack/MinionPoolSchemaPlugin'

const hasKey = <O>(obj: O, key: keyof any): key is keyof O => key in obj

export const ConnectionSchemaPlugin = {
  for: (provider: ProviderTypes) => {
    const map = {
      default: DefaultConnectionSchemaPlugin,
      azure: AzureConnectionSchemaPlugin,
      openstack: OpenstackConnectionSchemaPlugin,
      oci: OciConnectionSchemaPlugin,
      kubevirt: KubevirtConnectionSchemaPlugin,
    }
    if (hasKey(map, provider)) {
      return map[provider]
    }
    return map.default
  },
}

export const OptionsSchemaPlugin = {
  for: (provider: ProviderTypes) => {
    const map = {
      default: DefaultOptionsSchemaPlugin,
      oracle_vm: OvmOptionsSchemaPlugin,
      openstack: OpenstackOptionsSchemaPlugin,
      vmware_vsphere: VmwareOptionsSchemaPlugin,
      ovirt: OvirtOptionsSchemaPlugin,
    }
    if (hasKey(map, provider)) {
      return map[provider]
    }
    return map.default
  },
}

export const ContentPlugin = {
  for: (provider: ProviderTypes) => {
    const map = {
      default: DefaultContentPlugin,
      azure: AzureContentPlugin,
      openstack: OpenstackContentPlugin,
    }
    if (hasKey(map, provider)) {
      return map[provider]
    }
    return map.default
  },
}

export const InstanceInfoPlugin = {
  for: (provider: ProviderTypes) => {
    const map = {
      default: DefaultInstanceInfoPlugin,
      oci: OciInstanceInfoPlugin,
    }
    if (hasKey(map, provider)) {
      return map[provider]
    }
    return map.default
  },
}

export const MinionPoolSchemaPlugin = {
  for: (provider: ProviderTypes) => {
    const map = {
      default: DefaultMinionPoolSchemaPlugin,
      openstack: OpenstackMinionPoolSchemaPlugin,
    }
    if (hasKey(map, provider)) {
      return map[provider]
    }
    return map.default
  },
}
