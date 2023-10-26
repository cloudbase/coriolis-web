import { MetalHubServer } from "@src/@types/MetalHub";

export const METALHUB_SERVER_MOCK: MetalHubServer = {
  id: 12345,
  active: true,
  hostname: "server01.example.com",
  created_at: "2023-11-26T12:00:00Z",
  updated_at: "2023-11-26T12:00:00Z",
  api_endpoint: "https://api.example.com:1234/path",
  firmware_type: "UEFI",
  memory: 32768, // in MB
  os_info: {
    os_name: "Ubuntu",
    os_version: "20.04",
  },
  disks: [
    {
      id: "disk1",
      path: "/dev/sda",
      name: "Main Disk",
      size: 1024000, // in MB
      physical_sector_size: 512,
      partitions: [
        {
          name: "boot",
          path: "/dev/sda1",
          partition_uuid: "uuid-boot",
          sectors: 2048,
          start_sector: 0,
          end_sector: 2047,
        },
        {
          name: "root",
          path: "/dev/sda2",
          sectors: 1021952,
          start_sector: 2048,
          end_sector: 1024000,
        },
      ],
    },
  ],
  nics: [
    {
      interface_type: "Ethernet",
      ip_addresses: ["192.168.1.10", "192.168.1.11"],
      mac_address: "00:1B:44:11:3A:B7",
      nic_name: "eth0",
    },
  ],
  physical_cores: 8,
  logical_cores: 16,
};
