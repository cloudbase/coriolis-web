/*
Copyright (C) 2026  Cloudbase Solutions SRL
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

import React, { act } from "react";

import { render } from "@testing-library/react";
import {
  OPENSTACK_ENDPOINT_MOCK,
  VMWARE_ENDPOINT_MOCK,
} from "@tests/mocks/EndpointsMock";
import { INSTANCE_MOCK } from "@tests/mocks/InstancesMock";
import { NETWORK_MOCK } from "@tests/mocks/NetworksMock";
import { TRANSFER_ITEM_DETAILS_MOCK } from "@tests/mocks/TransferMock";
import TestUtils from "@tests/TestUtils";

import { Instance } from "@src/@types/Instance";
import { UpdateData } from "@src/@types/MainItem";
import transferStore from "@src/stores/TransferStore";

import TransferItemModal from "./TransferItemModal";

jest.mock("@src/stores/ProviderStore", () => ({
  __esModule: true,
  default: {
    providers: {},
    sourceSchema: [],
    destinationSchema: [],
    sourceSchemaLoading: false,
    destinationSchemaLoading: false,
    sourceOptionsPrimaryLoading: false,
    sourceOptionsSecondaryLoading: false,
    destinationOptionsPrimaryLoading: false,
    destinationOptionsSecondaryLoading: false,
    loadProviders: jest.fn(),
    loadOptionsSchema: jest.fn(),
    getOptionsValues: jest.fn(),
    hasExecuteNowOptions: jest.fn(() => true),
  },
  getFieldChangeOptions: jest.fn(() => null),
}));
jest.mock("@src/stores/TransferStore", () => ({
  __esModule: true,
  default: { update: jest.fn() },
}));
jest.mock("@src/stores/EndpointStore", () => ({
  __esModule: true,
  default: {
    storageBackends: [],
    storageConfigDefault: "storage-config-default",
    storageLoading: false,
    loadStorage: jest.fn(),
  },
}));
jest.mock("@src/stores/MinionPoolStore", () => ({
  __esModule: true,
  default: { minionPools: [], loadMinionPools: jest.fn() },
}));
jest.mock("@src/stores/NetworkStore", () => ({
  __esModule: true,
  default: { loadNetworks: jest.fn() },
}));
jest.mock("@src/utils/Config", () => ({
  __esModule: true,
  default: {
    config: {
      extraOptionsApiCalls: [],
      passwordFields: [],
    },
  },
}));

// the network which `TRANSFER_ITEM_DETAILS_MOCK.network_map` is mapping
const MAPPED_NETWORK_NAME = "network-name";
const NEW_NETWORK_NAME = "new-network-name";

const buildInstance = (networkName: string): Instance => ({
  ...INSTANCE_MOCK,
  devices: {
    ...INSTANCE_MOCK.devices,
    nics: [{ ...INSTANCE_MOCK.devices.nics[0], network_name: networkName }],
  },
});

const openNetworkMapping = async () => {
  const navigationItem = Array.from(
    TestUtils.selectAll("Panel__NavigationItem"),
  ).find(item => item.textContent === "Network Mapping");
  await act(async () => {
    navigationItem!.click();
  });
};

const selectFirstNetwork = async () => {
  await act(async () => {
    TestUtils.selectAll("DropdownButton__Wrapper")[0].click();
  });
  await act(async () => {
    TestUtils.selectAll("Dropdown__ListItem-")[0].click();
  });
};

const getSourceNicNames = () =>
  Array.from(TestUtils.selectAll("WizardNetworks__NetworkName")).map(
    nic => nic.textContent,
  );

const getSelectedNetworkLabel = () =>
  TestUtils.select("DropdownButton__Label")!.textContent;

const getSentUpdateData = (): UpdateData =>
  jest.mocked(transferStore.update).mock.calls[0][0].updateData;

describe("TransferItemModal", () => {
  let defaultProps: TransferItemModal["props"];

  beforeEach(() => {
    jest.clearAllMocks();

    defaultProps = {
      type: "transfer",
      isOpen: true,
      transfer: TRANSFER_ITEM_DETAILS_MOCK,
      sourceEndpoint: VMWARE_ENDPOINT_MOCK,
      destinationEndpoint: OPENSTACK_ENDPOINT_MOCK,
      instancesDetails: [buildInstance(MAPPED_NETWORK_NAME)],
      instancesDetailsLoading: false,
      networks: [NETWORK_MOCK],
      networksLoading: false,
      onRequestClose: jest.fn(),
      onUpdateComplete: jest.fn(),
      onReloadClick: jest.fn(),
    };
  });

  it("renders without crashing", () => {
    const { getByText } = render(<TransferItemModal {...defaultProps} />);
    expect(getByText("Edit Transfer")).toBeTruthy();
  });

  it("renders the mapping of the source NIC", async () => {
    render(<TransferItemModal {...defaultProps} />);
    await openNetworkMapping();

    expect(getSourceNicNames()).toEqual([MAPPED_NETWORK_NAME]);
    expect(getSelectedNetworkLabel()).toBe(NETWORK_MOCK.name);
  });

  it("renders the NIC which was attached to another network on the source", async () => {
    render(
      <TransferItemModal
        {...defaultProps}
        instancesDetails={[buildInstance(NEW_NETWORK_NAME)]}
      />,
    );
    await openNetworkMapping();

    expect(getSourceNicNames()).toEqual([NEW_NETWORK_NAME]);
    expect(getSelectedNetworkLabel()).toBe("Select Network");
  });

  it("keeps the existing mappings when there are no instances details", async () => {
    render(<TransferItemModal {...defaultProps} instancesDetails={[]} />);
    await openNetworkMapping();

    expect(getSourceNicNames()).toEqual([MAPPED_NETWORK_NAME]);
  });

  it("sends the mapping of the source NIC on update", async () => {
    const { getByText } = render(<TransferItemModal {...defaultProps} />);
    await openNetworkMapping();
    await selectFirstNetwork();
    await act(async () => {
      getByText("Update").click();
    });

    expect(
      getSentUpdateData().network.map(
        mapping => mapping.sourceNic.network_name,
      ),
    ).toEqual([MAPPED_NETWORK_NAME]);
  });

  it("doesn't send the mappings of the networks removed from the source NICs", async () => {
    const { getByText } = render(
      <TransferItemModal
        {...defaultProps}
        instancesDetails={[buildInstance(NEW_NETWORK_NAME)]}
      />,
    );
    await openNetworkMapping();
    await selectFirstNetwork();
    await act(async () => {
      getByText("Update").click();
    });

    expect(
      getSentUpdateData().network.map(
        mapping => mapping.sourceNic.network_name,
      ),
    ).toEqual([NEW_NETWORK_NAME]);
  });

  it("fires onReloadClick on reload", async () => {
    render(<TransferItemModal {...defaultProps} />);
    await act(async () => {
      TestUtils.select("Panel__ReloadButton")!.click();
    });

    expect(defaultProps.onReloadClick).toHaveBeenCalled();
  });
});
