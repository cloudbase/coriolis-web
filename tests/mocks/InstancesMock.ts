import { Instance } from "@src/@types/Instance";
import { DISK_MOCK } from "@tests/mocks/StoragesMock";

export const INSTANCE_MOCK: Instance = {
  id: "instance-id",
  name: "instance-name",
  flavor_name: "instance-flavor-name",
  instance_name: "instance-instance-name",
  num_cpu: 1,
  memory_mb: 1024,
  os_type: "instance-os-type",
  devices: {
    nics: [
      {
        id: "nic-id",
        network_name: "network-name",
        ip_addresses: ["nic-ip-addresses"],
        mac_address: "nic-mac-address",
        network_id: "network-id",
      },
    ],
    disks: [DISK_MOCK],
  },
};
