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

import type { Field } from '../types/Field'

// The word will be uppercased
const acronyms = ['id', 'api', 'url', 'vm', 'os', 'dhcp', 'sql', 'oci', 'aws']

// The word will be replaced
const abbreviations = {
  migr: 'Migration',
  auth: 'Authentication',
  fip: 'Floating IP',
}

const dictionary = {
  migr_image: 'Migration Image Name or Id',
  migr_network: 'Migration Network Name or ID',
  migr_worker_boot_from_volume: 'Boot Migration Workers from Volume',
  volumes_are_zeroed: 'Volumes on destination are created zeroed',
  keep_mac: 'Keep MAC address',
  reuse_ports: 'Reuse Existing Ports',
  replace_mac: 'Replace MAC Address',
  migr_worker_use_config_drive: 'Migration Worker use ConfigDrive',
  migr_worker_use_fip: 'Migration Worker use FIP',
  openstack: 'OpenStack',
  opc: 'Oracle Cloud',
  vmware_vsphere: 'VMware',
  separate_vm: 'Separate Migration/VM?',
  windows_migr_image: { description: 'The Windows Migration Image information found on the Azure page' },
  linux_migr_image: { description: 'The Linux Migration Image information found on the Azure page' },
  duplicate_to_project: { label: 'Project', description: 'Duplicate endpoint to selected project' },
  // AzureStack suffixes
  azure_datalake_analytics_catalog_and_job_endpoint: 'Azure Datalake Analytics Catalog And Job Endpoint Suffix',
  azure_datalake_store_file_system_endpoint: 'Azure Datalake Store File System Endpoint Suffix',
  keyvault_dns: 'Keyvault DNS Suffix',
  sql_server_hostname: 'SQL Server Hostname Suffix',
  storage_endpoint: 'Storage Endpoint Suffix',
  preserve_nic_ips: 'Preserve NIC IPs',
  openstack_use_current_user: 'Use Current User/Project/Domain for Authentification',
  windows_os_image: 'Windows OS',
  linux_os_image: 'Linux OS',
}

const cache: { name: string, label: ?string, description: ?string }[] = []

class LabelDictionary {
  // Fields which have enums for which dictionary labels should be used.
  // If a field has enums and is not in this array, their values will be used as labels
  static enumFields = ['port_reuse_policy']

  static get(fieldName: ?string): string {
    if (!fieldName) {
      return ''
    }

    let cachItem = cache.find(i => i.name === fieldName)
    if (cachItem && cachItem.label) {
      return cachItem.label
    }

    let labelInfo = dictionary[fieldName]
    if (labelInfo) {
      if (typeof labelInfo === 'string') {
        return labelInfo
      }
      if (labelInfo.label) {
        return labelInfo.label
      }
    }

    let words = fieldName.split('_')
    words = words.map(word => {
      let acronym = acronyms.find(a => a === word)
      let newWord = acronym ? acronym.toUpperCase() : (abbreviations[word] || word)
      return newWord.charAt(0).toUpperCase() + newWord.substr(1)
    })
    return words.join(' ')
  }

  static getDescription(fieldName: string): string {
    let cachItem = cache.find(i => i.name === fieldName)
    if (cachItem && cachItem.description) {
      return cachItem.description
    }

    let labelInfo = dictionary[fieldName]

    if (labelInfo && typeof labelInfo === 'object') {
      return labelInfo.description || ''
    }

    return ''
  }

  static pushToCache(field: Field) {
    if ((field.title || field.description) && !cache.find(i => i.name === field.name)) {
      cache.push({ label: field.title, description: field.description, name: field.name })
    }
  }
}

export default LabelDictionary
