export type MetalHubDisk = {
  id?: string;
  path: string;
  name?: string;
  size?: number;
  physical_sector_size?: number;
  partitions?: {
    name: string;
    path?: string;
    partition_uuid?: string;
    sectors: number;
    start_sector: number;
    end_sector?: number;
  }[];
};

export type MetalHubNic = {
  interface_type: string;
  ip_addresses: string[];
  mac_address: string;
  nic_name: string;
};

export type MetalHubServer = {
  id: number;
  active: boolean;
  hostname?: string;
  created_at: string;
  updated_at: string;
  api_endpoint: string;
  firmware_type?: string;
  memory?: number;
  os_info: {
    os_name: string;
    os_version: string;
  };
  disks?: MetalHubDisk[];
  nics?: MetalHubNic[];
  physical_cores?: number;
  logical_cores?: number;
};
