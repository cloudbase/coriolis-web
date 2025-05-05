/*
Copyright (C) 2023  Cloudbase Solutions SRL
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

import React from "react";

import { Endpoint } from "@src/@types/Endpoint";
import { ThemePalette } from "@src/components/Theme";
import notificationStore from "@src/stores/NotificationStore";
import FileUtils from "@src/utils/FileUtils";
import { fireEvent, render, waitFor } from "@testing-library/react";
import TestUtils from "@tests/TestUtils";

import ChooseProvider from "./ChooseProvider";

const OPENSTACK_ENDPOINT: Endpoint = {
  name: "Openstack",
  type: "openstack",
  id: "1",
  description: "",
  created_at: new Date().toISOString(),
  mapped_regions: ["region_1"],
  connection_info: {},
};

const mockDataTransfer = (files: any[]) => ({
  dataTransfer: {
    dropEffect: "none",
    files,
    items: files.map(file => ({
      kind: "file",
      type: file.type,
      getAsFile: () => file,
    })),
    types: ["Files"],
  },
});

jest.mock("react-router", () => ({ Link: "a" }));

jest.mock("@src/stores/NotificationStore", () => ({
  alert: jest.fn(),
}));

jest.mock("@src/utils/Config", () => ({
  config: {
    providerSortPriority: {},
    providerNames: {
      openstack: "OpenStack",
      vmware_vsphere: "VMware vSphere",
    },
  },
}));

describe("ChooseProvider", () => {
  let defaultProps: ChooseProvider["props"];
  let readContentFromFileListMock: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();

    readContentFromFileListMock = jest.spyOn(
      FileUtils,
      "readContentFromFileList"
    );
    readContentFromFileListMock.mockResolvedValue([
      {
        name: "openstack.endpoint",
        content: JSON.stringify(OPENSTACK_ENDPOINT),
      },
    ]);

    defaultProps = {
      providers: ["openstack", "vmware_vsphere"],
      regions: [
        {
          id: "region_1",
          name: "Region 1",
          description: "",
          enabled: true,
          mapped_endpoints: [],
        },
      ],
      onCancelClick: jest.fn(),
      onProviderClick: jest.fn(),
      onUploadEndpoint: jest.fn(),
      loading: false,
      onValidateMultipleEndpoints: jest.fn(),
      multiValidating: false,
      multiValidation: [],
      onRemoveEndpoint: jest.fn(),
      onResetValidation: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it("renders without crashing", () => {
    render(<ChooseProvider {...defaultProps} />);
    expect(TestUtils.select("Button__")?.textContent).toBe("Cancel");
  });

  it('calls "onProviderClick" when a provider logo is clicked', () => {
    render(<ChooseProvider {...defaultProps} />);

    const providerButton = TestUtils.select("EndpointLogos__Wrapper")!;
    fireEvent.click(providerButton);
    expect(defaultProps.onProviderClick).toHaveBeenCalledWith("openstack");
  });

  it("shows loading state when loading is true", () => {
    render(<ChooseProvider {...defaultProps} loading />);
    expect(TestUtils.select("ChooseProvider__LoadingWrapper")).toBeTruthy();
  });

  it("handles file uploads and parses single files", async () => {
    const onUploadEndpointMock = jest.fn();
    render(
      <ChooseProvider
        {...defaultProps}
        onUploadEndpoint={onUploadEndpointMock}
      />
    );
    const fileInput = document.querySelector('input[type="file"]')!;

    const file = new File(
      [JSON.stringify(OPENSTACK_ENDPOINT)],
      "openstack.endpoint",
      {
        type: "application/json",
      }
    );

    expect(fileInput).toBeTruthy();
    expect(defaultProps.onUploadEndpoint).not.toHaveBeenCalled();

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => expect(onUploadEndpointMock).toHaveBeenCalled());
  });

  it("highlights dropzone on drag enter", () => {
    render(<ChooseProvider {...defaultProps} />);
    jest.advanceTimersByTime(1000);
    const uploadArea = TestUtils.select("ChooseProvider__Upload")!;
    const style = () => window.getComputedStyle(uploadArea);

    expect(style().border).toBe(`1px dashed white`);
    fireEvent.dragEnter(window, mockDataTransfer([]));
    expect(style().border).toBe(
      `1px dashed ${ThemePalette.primary.toLowerCase()}`
    );
  });

  it("removes highlight from dropzone on drag leave", () => {
    render(<ChooseProvider {...defaultProps} />);
    jest.advanceTimersByTime(1000);
    const uploadArea = TestUtils.select("ChooseProvider__Upload")!;
    const style = () => window.getComputedStyle(uploadArea);

    fireEvent.dragLeave(window, mockDataTransfer([]));
    expect(style().border).toBe(`1px dashed white`);
  });

  it("processes file on drop", async () => {
    render(<ChooseProvider {...defaultProps} />);
    jest.advanceTimersByTime(1000);
    const file = new File(["endpoint content"], "openstack.endpoint", {
      type: "application/json",
    });
    fireEvent.drop(window, mockDataTransfer([file]));

    await waitFor(() =>
      expect(FileUtils.readContentFromFileList).toHaveBeenCalled()
    );
  });

  it("displays error notification for invalid file content", async () => {
    readContentFromFileListMock.mockResolvedValue([
      {
        name: "invalid.endpoint",
        content: "invalid content",
      },
    ]);
    render(<ChooseProvider {...defaultProps} />);
    jest.advanceTimersByTime(1000);
    const file = new File(["invalid content"], "invalid.endpoint", {
      type: "application/json",
    });
    fireEvent.drop(window, mockDataTransfer([file]));

    await waitFor(() =>
      expect(notificationStore.alert).toHaveBeenCalledWith(
        "Invalid .endpoint file",
        "error"
      )
    );
  });

  it("displays error notification if endpoint has no name", async () => {
    readContentFromFileListMock.mockResolvedValue([
      {
        name: "invalid.endpoint",
        content: JSON.stringify({
          OPENSTACK_ENDPOINT,
          name: "",
        }),
      },
    ]);
    render(<ChooseProvider {...defaultProps} />);
    jest.advanceTimersByTime(1000);
    const file = new File(["invalid content"], "invalid.endpoint", {
      type: "application/json",
    });
    fireEvent.drop(window, mockDataTransfer([file]));

    await waitFor(() =>
      expect(notificationStore.alert).toHaveBeenCalledWith(
        "Invalid .endpoint file",
        "error"
      )
    );
  });

  it("processes multiple files and handles unique names", async () => {
    const multipleFilesMeta = [
      {
        name: "file1.endpoint",
        content: JSON.stringify(OPENSTACK_ENDPOINT),
      },
      {
        name: "file2.endpoint",
        content: JSON.stringify(OPENSTACK_ENDPOINT),
      },
    ];
    const multipleFiles = multipleFilesMeta.map(
      ({ name, content }) =>
        new File([content], name, {
          type: "application/json",
        })
    );

    readContentFromFileListMock.mockResolvedValue(multipleFilesMeta);

    let setStateObj: any = {};
    jest
      .spyOn(ChooseProvider.prototype, "setState")
      .mockImplementationOnce((obj: any) => {
        setStateObj = obj;
      });

    render(<ChooseProvider {...defaultProps} />);
    const fileInput = document.querySelector('input[type="file"]')!;
    fireEvent.change(fileInput, { target: { files: multipleFiles } });

    await waitFor(() => {
      expect(defaultProps.onResetValidation).toHaveBeenCalledTimes(1);
      expect(setStateObj.multipleUploadedEndpoints[0].name).toBe(
        OPENSTACK_ENDPOINT.name
      );
      expect(setStateObj.multipleUploadedEndpoints[1].name).toBe(
        `${OPENSTACK_ENDPOINT.name} (1)`
      );
    });
  });

  it("fires onresizeupdate when multipleUploadedEndpoints changes", async () => {
    const onResizeUpdateMock = jest.fn();
    const multipleFilesMeta = [
      {
        name: "file1.endpoint",
        content: JSON.stringify(OPENSTACK_ENDPOINT),
      },
      {
        name: "file2.endpoint",
        content: JSON.stringify(OPENSTACK_ENDPOINT),
      },
    ];
    const multipleFiles = multipleFilesMeta.map(
      ({ name, content }) =>
        new File([content], name, {
          type: "application/json",
        })
    );
    readContentFromFileListMock.mockResolvedValue(multipleFilesMeta);

    render(
      <ChooseProvider {...defaultProps} onResizeUpdate={onResizeUpdateMock} />
    );
    const fileInput = document.querySelector('input[type="file"]')!;
    fireEvent.change(fileInput, { target: { files: multipleFiles } });

    await waitFor(() => {
      expect(onResizeUpdateMock).toHaveBeenCalled();
    });
  });

  it("adds drop effect on drag over", async () => {
    render(<ChooseProvider {...defaultProps} />);
    jest.advanceTimersByTime(1000);

    const transfer = mockDataTransfer([]);
    fireEvent.dragOver(window, transfer);

    await waitFor(() => {
      expect(transfer.dataTransfer.dropEffect).toBe("copy");
    });
  });

  it("shows warning for unindetified regions", async () => {
    readContentFromFileListMock.mockResolvedValue([
      {
        name: "openstack.endpoint",
        content: JSON.stringify({
          ...OPENSTACK_ENDPOINT,
          mapped_regions: ["region_2"],
        }),
      },
    ]);
    render(<ChooseProvider {...defaultProps} />);
    jest.advanceTimersByTime(1000);
    const file = new File(["invalid content"], "openstack.endpoint", {
      type: "application/json",
    });
    fireEvent.drop(window, mockDataTransfer([file]));

    await waitFor(() =>
      expect(notificationStore.alert).toHaveBeenCalledWith(
        "1 Coriolis Region couldn't be mapped",
        "warning"
      )
    );
  });

  it("processes remove endpoint", () => {
    const chooseProviderInstance = new ChooseProvider(defaultProps);
    jest
      .spyOn(chooseProviderInstance, "setState")
      .mockImplementation((callback: any) => {
        callback({ multipleUploadedEndpoints: [OPENSTACK_ENDPOINT] });
      });

    chooseProviderInstance.handleRemoveUploadedEndpoint(
      OPENSTACK_ENDPOINT,
      true
    );

    expect(defaultProps.onRemoveEndpoint).toHaveBeenCalledWith(
      OPENSTACK_ENDPOINT
    );
  });

  it("handles regions change", () => {
    const chooseProviderInstance = new ChooseProvider(defaultProps);
    let nextState: any = {};
    jest
      .spyOn(chooseProviderInstance, "setState")
      .mockImplementation((callback: any) => {
        nextState = callback({
          multipleUploadedEndpoints: [OPENSTACK_ENDPOINT],
        });
      });

    chooseProviderInstance.handleRegionsChange(OPENSTACK_ENDPOINT, [
      "region_2",
    ]);
    expect(nextState.multipleUploadedEndpoints[0].mapped_regions).toEqual([
      "region_2",
    ]);
  });
});
