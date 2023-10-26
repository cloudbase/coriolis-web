import { Endpoint } from "@src/@types/Endpoint";

export const OPENSTACK_ENDPOINT_MOCK: Endpoint = {
  id: "openstack",
  name: "OpenStack",
  description: "Openstack endpoint",
  type: "openstack",
  created_at: "2023-11-26T12:00:00Z",
  mapped_regions: ["us-east-1"],
  connection_info: {
    host: "https://api.example.com:1234/path",
    username: "admin",
    password: "password",
    project_name: "admin",
    project_domain_name: "Default",
    user_domain_name: "Default",
  },
};

export const VMWARE_ENDPOINT_MOCK: Endpoint = {
  id: "vmware",
  name: "VMware",
  description: "VMware endpoint",
  type: "vmware_vsphere",
  created_at: "2023-11-26T12:00:00Z",
  mapped_regions: ["us-east-1"],
  connection_info: {
    host: "https://api.example.com:1234/path",
    username: "admin",
    password: "password",
  },
};
