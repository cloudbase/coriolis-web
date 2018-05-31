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
  static dictionary = {
    username: 'Username',
    password: 'Password',
    host: 'Host',
    port: 'Port',
    api_endpoint: 'API Endpoint',
    allow_untrusted: 'Allow Untrusted',
    identity_api_version: 'Identity Version',
    identity_domain: 'Identity Domain',
    auth_url: 'Auth URL',
    storage_api_endpoint: 'Storage Api Endpoint',
    storage_auth_endpoint: 'Storage Authentication Endpoint',
    user_domain_name: 'User Domain Name',
    project_name: 'Project Name',
    project_domain_name: 'Project Domain Name',
    flavor_name: 'Flavor Name',
    hypervisor_type: 'Hypervisor Type',
    container_format: 'Container Format',
    disk_format: 'Disk Format',
    glance_upload: 'Glance Upload',
    keypair_name: 'Keypair Name',
    fip_pool_name: 'Floating IP Pool',
    migr_fip_pool_name: 'Migration Floating IP Pool',
    migr_flavor_name: 'Migration Flavor Name',
    migr_image: 'Migration Image Name or Id',
    migr_image_map: 'Migration Image Map',
    migr_network: 'Migration Network Name or ID',
    migr_worker_boot_from_volume: 'Boot Migration Workers from Volume',
    volumes_are_zeroed: 'Volumes on destination are created zeroed',
    port_reuse_policy: 'Port Reuse Policy',
    keep_mac: 'Keep MAC address',
    reuse_ports: 'Reuse Existing Ports',
    replace_mac: 'Replace MAC address',
    migr_image_name: 'Migration Image Name',
    migr_image_name_map: 'Migration Image Name Map',
    migr_image_id: 'Migration Image ID',
    migr_worker_use_config_drive: 'Migration Worker use ConfigDrive',
    migr_worker_use_fip: 'Migration Worker use FIP',
    delete_disks_on_vm_termination: 'Delete Disks on VM termination',
    set_dhcp: 'Set DHCP',
    vm_size: 'VM Size',
    location: 'Location',
    resource_group: 'Resource Group',
    worker_size: 'Worker Size',
    subscription_id: 'Subscription ID',
    user_credentials: 'User Credentials',
    service_principal_credentials: 'Service Principal Credentials',
    region_name: 'Region Name',
    nova_region_name: 'Nova Region Name',
    neutron_region_name: 'Neutron Region Name',
    glance_region_name: 'Glance Region Name',
    cinder_region_name: 'Cinder Region Name',
    swift_region_name: 'Swift Region Name',
    list_all_destination_networks: 'List All Destination Networks',
    tenant_id: 'Tenant ID',
    client_id: 'Client ID',
    client_secret: 'Client Secret',
    server_pool_name: 'Server Pool Name',
    migr_template_name: 'Migration Template Name',
    migr_template_username: 'Migration Template Username',
    migr_template_password: 'Migration Template Password',
    repository_name: 'Repository Name',
    shape_name: 'Shape Name',
    migr_shape_name: 'Migration Shape Name',
    allow_untrusted_swift: 'Allow Untrusted Swift',
    glance_api_version: 'Glance API Version',
    region: 'Region',
    access_key_id: 'Access Key ID',
    secret_access_key: 'Secret Access Key',
    session_token: 'Session Token',
    clone_disks: 'Clone Disks',
    force: 'Force',
    skip_os_morphing: 'Skip OS Morphing',
    shutdown_instances: 'Shutdown Instances',
    aws: 'Amazon',
    openstack: 'OpenStack',
    oracle_vm: 'Oracle VM',
    opc: 'Oracle Cloud',
    azure: 'Azure',
    vmware_vsphere: 'VMware',
    oci: 'OCI',
    migr_subnet_id: 'Migration Subnet ID',
    separate_vm: 'Separate Migration/VM?',
    use_replica: 'Use replica',
    windows_migr_image: { label: 'Windows Migration Image', description: 'The Windows Migration Image information found on the Azure page' },
    linux_migr_image: { label: 'Linux Migration Image', description: 'The Linux Migration Image information found on the Azure page' },
    user_domain_id: 'User Domain ID',
    project_domain_id: 'Project Domain ID',
    duplicate_to_project: { label: 'Project', description: 'Duplicate endpoint to selected project' },
  }

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
    words = words.map(word => word.charAt(0).toUpperCase() + word.substr(1))
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
