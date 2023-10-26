import { StorageBackend } from "@src/@types/Endpoint";
import { Disk } from "@src/@types/Instance";

export const DISK_MOCK: Disk = {
  id: "disk-id",
  name: "disk-name",
  storage_backend_identifier: "disk-storage-backend-identifier",
  format: "disk-format",
  guest_device: "disk-guest-device",
  size_bytes: 1024,
  disabled: {
    message: "disk-disabled-message",
    info: "disk-disabled-info",
  },
};

export const STORAGE_BACKEND_MOCK: StorageBackend = {
  id: "storage-backend-id",
  name: "storage-backend-name",
  additional_provider_properties: {
    supported_bus_types: ["storage-backend-supported-bus-types"],
  },
};
