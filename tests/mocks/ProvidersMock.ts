import { Providers } from "@src/@types/Providers";
import { providerTypes } from "@src/constants";

export const PROVIDERS_MOCK: Providers = {
  aws: {
    types: [],
  },
  azure: {
    types: [],
  },
  openstack: {
    types: [providerTypes.DESTINATION_MINION_POOL],
  },
  opc: {
    types: [],
  },
  opca: {
    types: [],
  },
  oracle_vm: {
    types: [],
  },
  vmware_vsphere: {
    types: [providerTypes.SOURCE_MINION_POOL],
  },
  oci: {
    types: [],
  },
  "hyper-v": {
    types: [],
  },
  scvmm: {
    types: [],
  },
  olvm: {
    types: [],
  },
  kubevirt: {
    types: [],
  },
  metal: {
    types: [],
  },
  rhev: {
    types: [],
  },
  lxd: {
    types: [],
  },
};
