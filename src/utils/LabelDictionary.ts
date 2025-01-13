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

import type { Field } from "@src/@types/Field";

// The word will be uppercased
const acronyms = [
  "id",
  "api",
  "url",
  "vm",
  "os",
  "dhcp",
  "sql",
  "oci",
  "aws",
  "vcn",
  "ca",
];

// The word will be replaced
const abbreviations = {
  migr: "Migration",
  auth: "Authentication",
  fip: "Floating IP",
};

const dictionary = {
  migr_image: "Migration Image Name or Id",
  migr_network: "Migration Network Name or ID",
  migr_worker_boot_from_volume: "Boot Migration Workers from Volume",
  volumes_are_zeroed: "Volumes on destination are created zeroed",
  keep_mac: "Keep MAC address",
  reuse_ports: "Reuse Existing Ports",
  replace_mac: "Replace MAC Address",
  migr_worker_use_config_drive: "Migration Worker use ConfigDrive",
  migr_worker_use_fip: "Migration Worker use FIP",
  separate_vm: "Separate Migration/VM?",
  windows_migr_image: {
    description:
      "The Windows Migration Image information found on the Azure page",
  },
  linux_migr_image: {
    description:
      "The Linux Migration Image information found on the Azure page",
  },
  duplicate_to_project: {
    label: "Project",
    description: "Duplicate endpoint to selected project",
  },
  // AzureStack suffixes
  azure_datalake_analytics_catalog_and_job_endpoint:
    "Azure Datalake Analytics Catalog And Job Endpoint Suffix",
  azure_datalake_store_file_system_endpoint:
    "Azure Datalake Store File System Endpoint Suffix",
  keyvault_dns: "Keyvault DNS Suffix",
  sql_server_hostname: "SQL Server Hostname Suffix",
  storage_endpoint: "Storage Endpoint Suffix",
  preserve_nic_ips: "Preserve NIC IPs",
  openstack_use_current_user:
    "Use Current User/Project/Domain for Authentication",
  windows_os_image: "Windows OS",
  linux_os_image: "Linux OS",
  skip_os_morphing: {
    description: `Whether or not to skip the OSMorphing process.
    This process is recommended when migrating VMs between platforms with different underlying virtualization technologies or initialization agents, as Coriolis will adapt the offline OS installation by automatically installing any additional drivers/configurations required by the destination platform.
    This can be safely skipped if the source and destination platforms are identical (e.g: migrating between two separate regions of the same Public Cloud), or if the two platforms share the same virtualization technology.
    (e.g: migrating between two KVM-based OpenStacks from different vendors)`,
  },
  force: {
    description: `Whether or not Coriolis should forcibly attempt the Deployment process despite the Transfer not having any successful Executions.
    This is only recommended if it is known that the Transfer disks were successfully synced but some latter cleanup steps failed (e.g: deleting source-side temporary resources).
    This will not help if the Transfer disks were never successfully synced.`,
  },
  clone_disks: {
    description: `Whether or not Coriolis should clone the Transfer disks on the destination platforms before optionally performing the OSMorphing process and booting the final VM.
    Skipping disk cloning leads to a shorter deployment time, but means that the Transfer disks will be allocated to the new VM, and thus the next Transfer Execution will have to sync the disks from scratch.`,
  },
  shutdown_instances: {
    label: "Shutdown Instance(s)",
    description:
      "This option can be used before completing the Deployment on the target cloud. After the source instance(s) shutdown, a last snapshot will be executed, in order to transfer the last bits of data to the target cloud, and the source instance(s) will be left stopped.",
  },
};

const cache: {
  name: string;
  label: string | null | undefined;
  description: string | null | undefined;
  key: string;
}[] = [];

class LabelDictionary {
  // Fields which have enums for which dictionary labels should be used.
  // If a field has enums and is not in this array, their values will be used as labels
  static enumFields = [
    "port_reuse_policy",
    "replica_export_mechanism",
    "virtual_disk_clone_type",
  ];

  /**
   *
   * @param {string} fieldName The name of the field
   * @param {string} dictionaryKey Optional key to more uniquely
   * identify the field added to schema cache.
   * The `dictionaryKey` is composed by `${provider}-${direction}.
   * Direction is 'destination' or 'source'.
   */
  static get(
    fieldName: string | null | undefined,
    dictionaryKey?: string
  ): string {
    if (!fieldName) {
      return "";
    }
    const cachItem = cache.find(
      i => i.key === dictionaryKey && i.name === fieldName
    );
    if (cachItem && cachItem.label) {
      return cachItem.label;
    }
    const dict: any = dictionary;
    const labelInfo = dict[fieldName];
    if (labelInfo) {
      if (typeof labelInfo === "string") {
        return labelInfo;
      }
      if (labelInfo.label) {
        return labelInfo.label;
      }
    }

    let words = fieldName.split("_");
    words = words.map(word => {
      const acronym = acronyms.find(a => a === word);
      const abb: any = abbreviations;
      const newWord = acronym
        ? acronym.toUpperCase()
        : abb[word] || word.toLowerCase();
      return newWord.charAt(0).toUpperCase() + newWord.substr(1);
    });
    return words.join(" ");
  }

  static getDescription(fieldName: string, dictionaryKey?: string): string {
    const cachItem = cache.find(
      i => i.key === dictionaryKey && i.name === fieldName
    );
    if (cachItem && cachItem.description) {
      return cachItem.description;
    }

    const dict: any = dictionary;
    const labelInfo = dict[fieldName];

    if (labelInfo && typeof labelInfo === "object") {
      return labelInfo.description || "";
    }

    return "";
  }

  static pushToCache(field: Field, dictionaryKey: string) {
    if (
      (field.title || field.description) &&
      !cache.find(i => i.key === dictionaryKey && i.name === field.name)
    ) {
      cache.push({
        label: field.title,
        description: field.description,
        name: field.name,
        key: dictionaryKey,
      });
    }
  }
}

export default LabelDictionary;
