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

class LabelDictionary {
  // The word will be uppercased
  static acronyms = ['id', 'api', 'url', 'vm', 'os', 'dhcp', 'sql', 'oci']

  // The word will be replaced
  static abbreviations = {
    migr: 'Migration',
    auth: 'Authentication',
    fip: 'Floating IP',
  }

  static dictionary = {
    auth_url: 'Auth URL',
    migr_image: 'Migration Image Name or Id',
    migr_network: 'Migration Network Name or ID',
    migr_worker_boot_from_volume: 'Boot Migration Workers from Volume',
    volumes_are_zeroed: 'Volumes on destination are created zeroed',
    keep_mac: 'Keep MAC address',
    reuse_ports: 'Reuse Existing Ports',
    replace_mac: 'Replace MAC Address',
    migr_worker_use_config_drive: 'Migration Worker use ConfigDrive',
    migr_worker_use_fip: 'Migration Worker use FIP',
    aws: 'Amazon',
    openstack: 'OpenStack',
    opc: 'Oracle Cloud',
    vmware_vsphere: 'VMware',
    migr_subnet_id: 'Migration Subnet ID',
    separate_vm: 'Separate Migration/VM?',
    windows_migr_image: { label: 'Windows Migration Image', description: 'The Windows Migration Image information found on the Azure page' },
    linux_migr_image: { label: 'Linux Migration Image', description: 'The Linux Migration Image information found on the Azure page' },
    duplicate_to_project: { label: 'Project', description: 'Duplicate endpoint to selected project' },
  }

  // Fields which have enums for which dictionary labels should be used.
  // If a field has enums and is not in this array, their values will be used as labels
  static enumFields = ['port_reuse_policy']

  static get(fieldName: ?string): string {
    let labelInfo = fieldName ? this.dictionary[fieldName] : null
    if (labelInfo) {
      if (typeof labelInfo === 'string') {
        return labelInfo
      }
      if (labelInfo.label) {
        return labelInfo.label
      }
    }

    let words = fieldName ? fieldName.split('_') : []
    words = words.map(word => {
      let acronym = this.acronyms.find(a => a === word)
      let newWord = acronym ? acronym.toUpperCase() : (this.abbreviations[word] || word)
      return newWord.charAt(0).toUpperCase() + newWord.substr(1)
    })
    return words.join(' ')
  }

  static getDescription(fieldName: string): string {
    let labelInfo = this.dictionary[fieldName]

    if (labelInfo && typeof labelInfo === 'object') {
      return labelInfo.description || ''
    }

    return ''
  }
}

export default LabelDictionary
