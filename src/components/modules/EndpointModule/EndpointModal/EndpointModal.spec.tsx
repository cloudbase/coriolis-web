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

import React from "react";
import { runInAction } from "mobx";

import type { Endpoint, Validation } from "@src/@types/Endpoint";
import endpointStore from "@src/stores/EndpointStore";
import notificationStore from "@src/stores/NotificationStore";
import providerStore from "@src/stores/ProviderStore";
import { act, fireEvent, render, waitFor } from "@testing-library/react";

import EndpointModal from "./EndpointModal";

const ORIGINAL_HOST = "192.0.2.10";
const FAILING_HOST = "192.0.2.20";
const WORKING_HOST = "192.0.2.30";

const VALID: Validation = { valid: true, message: "Endpoint is valid" };
const INVALID: Validation = {
  valid: false,
  message: `Connection to ${FAILING_HOST} timed out`,
};

const ENDPOINT: Endpoint = {
  id: "endpoint-1",
  name: "Endpoint",
  description: "Endpoint description",
  type: "openstack",
  created_at: new Date().toISOString(),
  mapped_regions: [],
  connection_info: {},
};

let mockInvalidFields: string[] = [];

jest.mock("@src/components/modules/EndpointModule/EndpointLogos", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@src/stores/NotificationStore", () => ({
  alert: jest.fn(),
}));

jest.mock("@src/plugins", () => {
  const MockReact = require("react");
  class MockContentPlugin extends MockReact.Component {
    componentDidMount() {
      this.props.onRef(this);
    }

    findInvalidFields() {
      return mockInvalidFields;
    }

    render() {
      const field = { name: "host" };
      return MockReact.createElement(
        "div",
        null,
        MockReact.createElement("input", {
          "data-testid": "host",
          defaultValue: this.props.getFieldValue(field),
          disabled: this.props.disabled,
          onChange: (e: any) =>
            this.props.handleFieldChange(field, e.target.value),
        }),
        MockReact.createElement(
          "button",
          { onClick: () => this.props.handleValidateClick() },
          "Plugin validate",
        ),
      );
    }
  }
  return { ContentPlugin: { for: () => MockContentPlugin } };
});

const setValidation = (validation: Validation) => {
  runInAction(() => {
    endpointStore.validation = validation;
  });
};

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(r => {
    resolve = r;
  });
  return { promise, resolve };
};

describe("EndpointModal", () => {
  let validateAndSave: jest.SpyInstance;

  const renderModal = async (element: React.ReactElement) => {
    const result = render(element);
    await act(async () => {});
    return result;
  };

  const renderEditModal = (onCancelClick = jest.fn()) =>
    renderModal(
      <EndpointModal endpoint={ENDPOINT} onCancelClick={onCancelClick} />,
    );

  const renderCreateModal = () =>
    renderModal(
      <EndpointModal
        type="openstack"
        isNewEndpoint
        onCancelClick={jest.fn()}
      />,
    );

  const submit = (getByText: (text: string) => HTMLElement) => {
    fireEvent.click(getByText("Validate and save"));
  };

  beforeEach(() => {
    mockInvalidFields = [];
    runInAction(() => {
      endpointStore.endpoints = [{ ...ENDPOINT }];
      endpointStore.connectionInfo = { host: ORIGINAL_HOST };
      endpointStore.validation = null;
      endpointStore.adding = false;
      endpointStore.updating = false;
    });
    jest
      .spyOn(providerStore, "getConnectionInfoSchema")
      .mockResolvedValue(undefined);
    validateAndSave = jest.spyOn(endpointStore, "validateAndSave");
  });

  afterEach(() => {
    jest.restoreAllMocks();
    (notificationStore.alert as jest.Mock).mockClear();
  });

  describe("editing an endpoint", () => {
    it("submits the current form values", async () => {
      validateAndSave.mockImplementation(async () => {
        setValidation(VALID);
        return VALID;
      });
      const { getByTestId, getByText } = await renderEditModal();

      fireEvent.change(getByTestId("host"), {
        target: { value: WORKING_HOST },
      });
      submit(getByText);

      await waitFor(() => expect(getByText("Endpoint is Valid")).toBeTruthy());
      expect(validateAndSave).toHaveBeenCalledTimes(1);
      expect(validateAndSave).toHaveBeenCalledWith({
        endpoint: expect.objectContaining({
          id: ENDPOINT.id,
          host: WORKING_HOST,
        }),
        isNew: false,
      });
    });

    it("stays open with the user's values and the error when validation fails", async () => {
      validateAndSave.mockImplementation(async () => {
        runInAction(() => {
          endpointStore.connectionInfo = { host: ORIGINAL_HOST };
        });
        setValidation(INVALID);
        return INVALID;
      });
      const onCancelClick = jest.fn();
      const { getByTestId, getByText } = await renderEditModal(onCancelClick);

      fireEvent.change(getByTestId("host"), {
        target: { value: FAILING_HOST },
      });
      submit(getByText);

      await waitFor(() => expect(getByText("Validation failed")).toBeTruthy());
      fireEvent.click(getByText("Show Error"));
      expect(getByText(INVALID.message)).toBeTruthy();
      expect(getByText("Validate and save")).toBeTruthy();
      expect((getByTestId("host") as HTMLInputElement).disabled).toBe(false);
      expect(onCancelClick).not.toHaveBeenCalled();

      submit(getByText);
      await waitFor(() => expect(validateAndSave).toHaveBeenCalledTimes(2));
      expect(validateAndSave).toHaveBeenLastCalledWith(
        expect.objectContaining({
          endpoint: expect.objectContaining({ host: FAILING_HOST }),
        }),
      );
    });

    it("re-enables the form without another alert when saving fails", async () => {
      validateAndSave.mockRejectedValue({ status: 500 });
      const { getByTestId, getByText } = await renderEditModal();

      submit(getByText);

      await waitFor(() => expect(getByText("Validate and save")).toBeTruthy());
      expect((getByTestId("host") as HTMLInputElement).disabled).toBe(false);
      expect(notificationStore.alert).toHaveBeenCalledTimes(1);
      expect(notificationStore.alert).toHaveBeenCalledWith(
        "Validating endpoint ...",
      );
    });
  });

  describe("creating an endpoint", () => {
    it("submits a new endpoint", async () => {
      validateAndSave.mockImplementation(async () => {
        setValidation(VALID);
        return VALID;
      });
      const { getByTestId, getByText } = await renderCreateModal();

      fireEvent.change(getByTestId("host"), {
        target: { value: WORKING_HOST },
      });
      submit(getByText);

      await waitFor(() => expect(getByText("Endpoint is Valid")).toBeTruthy());
      expect(validateAndSave).toHaveBeenCalledWith({
        endpoint: expect.objectContaining({
          type: "openstack",
          host: WORKING_HOST,
        }),
        isNew: true,
      });
    });

    it("submits a retry as a new endpoint when validation fails", async () => {
      validateAndSave.mockImplementation(async () => {
        setValidation(INVALID);
        return INVALID;
      });
      const { getByText } = await renderCreateModal();

      submit(getByText);
      await waitFor(() => expect(getByText("Validation failed")).toBeTruthy());

      submit(getByText);
      await waitFor(() => expect(validateAndSave).toHaveBeenCalledTimes(2));
      expect(validateAndSave).toHaveBeenLastCalledWith(
        expect.objectContaining({ isNew: true }),
      );
    });
  });

  it("doesn't submit when required fields are missing", async () => {
    mockInvalidFields = ["host"];
    const { getByText } = await renderEditModal();

    submit(getByText);

    expect(validateAndSave).not.toHaveBeenCalled();
    expect(notificationStore.alert).toHaveBeenCalledWith(
      "Please fill all the required fields",
      "error",
    );
  });

  it("shows that the endpoint is being saved once it's valid", async () => {
    const attempt = deferred<Validation>();
    validateAndSave.mockImplementation(() => {
      runInAction(() => {
        endpointStore.updating = true;
      });
      return attempt.promise;
    });
    const { getByText, queryByText } = await renderEditModal();

    submit(getByText);

    await waitFor(() => expect(getByText("Saving ...")).toBeTruthy());
    expect(queryByText("Validate and save")).toBeNull();

    act(() => {
      runInAction(() => {
        endpointStore.updating = false;
      });
    });
    attempt.resolve(INVALID);
    await waitFor(() => expect(getByText("Validate and save")).toBeTruthy());
  });

  it("ignores submits while an attempt is in flight", async () => {
    const attempt = deferred<Validation>();
    validateAndSave.mockReturnValue(attempt.promise);
    const { getByText } = await renderEditModal();

    fireEvent.click(getByText("Plugin validate"));
    fireEvent.click(getByText("Plugin validate"));

    expect(validateAndSave).toHaveBeenCalledTimes(1);

    attempt.resolve(INVALID);
    await waitFor(() => expect(getByText("Validate and save")).toBeTruthy());
  });
});
