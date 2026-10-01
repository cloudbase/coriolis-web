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

import type { Endpoint, Validation } from "@src/@types/Endpoint";
import EndpointSource from "@src/sources/EndpointSource";
import endpointStore from "@src/stores/EndpointStore";
import { waitFor } from "@testing-library/react";
import { OPENSTACK_ENDPOINT_MOCK } from "@tests/mocks/EndpointsMock";

const ORIGINAL_HOST = "192.0.2.10";
const FAILING_HOST = "192.0.2.20";
const WORKING_HOST = "192.0.2.30";

const VALID: Validation = { valid: true, message: "Endpoint is valid" };
const invalid = (host: string): Validation => ({
  valid: false,
  message: `Connection to ${host} timed out`,
});

const formValues = (values: { [prop: string]: any }): Endpoint => ({
  id: OPENSTACK_ENDPOINT_MOCK.id,
  name: OPENSTACK_ENDPOINT_MOCK.name,
  description: OPENSTACK_ENDPOINT_MOCK.description,
  type: OPENSTACK_ENDPOINT_MOCK.type,
  created_at: OPENSTACK_ENDPOINT_MOCK.created_at,
  mapped_regions: OPENSTACK_ENDPOINT_MOCK.mapped_regions,
  connection_info: {},
  username: "admin",
  secret_ref: "http://barbican/v1/secrets/original",
  ...values,
});

const savedEndpoint = (host: string): Endpoint => ({
  ...OPENSTACK_ENDPOINT_MOCK,
  connection_info: { ...OPENSTACK_ENDPOINT_MOCK.connection_info, host },
});

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe("EndpointStore", () => {
  let sourceSpies: {
    add: jest.SpyInstance;
    update: jest.SpyInstance;
    validate: jest.SpyInstance;
  };

  beforeEach(() => {
    endpointStore.endpoints = [];
    endpointStore.connectionInfo = null;
    endpointStore.clearValidation();

    sourceSpies = {
      add: jest.spyOn(EndpointSource, "add"),
      update: jest.spyOn(EndpointSource, "update"),
      validate: jest.spyOn(EndpointSource, "validate"),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("validateAndSave, editing an endpoint", () => {
    beforeEach(() => {
      endpointStore.endpoints = [savedEndpoint(ORIGINAL_HOST)];
    });

    it("validates the proposed values before updating the endpoint", async () => {
      const edited = formValues({ host: WORKING_HOST });
      sourceSpies.validate.mockResolvedValue(VALID);
      sourceSpies.update.mockResolvedValue(savedEndpoint(WORKING_HOST));

      const result = await endpointStore.validateAndSave({
        endpoint: edited,
        isNew: false,
      });

      expect(sourceSpies.validate).toHaveBeenCalledWith(edited, true);
      expect(sourceSpies.update).toHaveBeenCalledWith(edited);
      expect(sourceSpies.validate.mock.invocationCallOrder[0]).toBeLessThan(
        sourceSpies.update.mock.invocationCallOrder[0],
      );
      expect(result).toEqual(VALID);
      expect(endpointStore.validation).toEqual(VALID);
      expect(endpointStore.endpoints[0].connection_info.host).toBe(
        WORKING_HOST,
      );
    });

    it("doesn't update the endpoint when the validation fails", async () => {
      sourceSpies.validate.mockResolvedValue(invalid(FAILING_HOST));

      const result = await endpointStore.validateAndSave({
        endpoint: formValues({ host: FAILING_HOST }),
        isNew: false,
      });

      expect(result).toEqual(invalid(FAILING_HOST));
      expect(endpointStore.validation).toEqual(invalid(FAILING_HOST));
      expect(endpointStore.validating).toBe(false);
      expect(sourceSpies.update).not.toHaveBeenCalled();
      expect(endpointStore.endpoints[0].connection_info.host).toBe(
        ORIGINAL_HOST,
      );
    });

    it("doesn't update the endpoint when the validation request fails", async () => {
      sourceSpies.validate.mockRejectedValue({ status: 500 });

      await expect(
        endpointStore.validateAndSave({
          endpoint: formValues({ host: WORKING_HOST }),
          isNew: false,
        }),
      ).rejects.toEqual({ status: 500 });

      expect(sourceSpies.update).not.toHaveBeenCalled();
      expect(endpointStore.validation?.valid).toBe(false);
      expect(endpointStore.validating).toBe(false);
    });

    it("doesn't report a valid endpoint and restores the store when the update fails", async () => {
      const connectionInfo = { host: ORIGINAL_HOST };
      endpointStore.connectionInfo = connectionInfo;
      sourceSpies.validate.mockResolvedValue(VALID);
      sourceSpies.update.mockRejectedValue({ status: 500 });

      await expect(
        endpointStore.validateAndSave({
          endpoint: formValues({ host: WORKING_HOST }),
          isNew: false,
        }),
      ).rejects.toEqual({ status: 500 });

      expect(endpointStore.validation).toBeNull();
      expect(endpointStore.validating).toBe(false);
      expect(endpointStore.updating).toBe(false);
      expect(endpointStore.endpoints[0].connection_info.host).toBe(
        ORIGINAL_HOST,
      );
      expect(endpointStore.connectionInfo).toEqual(connectionInfo);
    });

    it("reports the endpoint as valid only once it's saved", async () => {
      const update = deferred<Endpoint>();
      sourceSpies.validate.mockResolvedValue(VALID);
      sourceSpies.update.mockReturnValue(update.promise);

      const attempt = endpointStore.validateAndSave({
        endpoint: formValues({ host: WORKING_HOST }),
        isNew: false,
      });
      await waitFor(() => expect(sourceSpies.update).toHaveBeenCalled());

      expect(endpointStore.validation).toBeNull();
      expect(endpointStore.validating).toBe(true);
      expect(endpointStore.updating).toBe(true);

      update.resolve(savedEndpoint(WORKING_HOST));
      expect(await attempt).toEqual(VALID);
      expect(endpointStore.validation).toEqual(VALID);
      expect(endpointStore.validating).toBe(false);
    });

    it("passes missing optional values through without turning them into empty strings", async () => {
      const edited = formValues({ host: WORKING_HOST, description: null });
      sourceSpies.validate.mockResolvedValue(VALID);
      sourceSpies.update.mockResolvedValue(savedEndpoint(WORKING_HOST));

      await endpointStore.validateAndSave({ endpoint: edited, isNew: false });

      const submitted = sourceSpies.update.mock.calls[0][0];
      expect(submitted.description).toBeNull();
      expect(Object.values(submitted)).not.toContain("");
    });

    it("saves the corrected values after a failed validation", async () => {
      sourceSpies.validate.mockResolvedValueOnce(invalid(FAILING_HOST));
      await endpointStore.validateAndSave({
        endpoint: formValues({ host: FAILING_HOST }),
        isNew: false,
      });

      sourceSpies.validate.mockResolvedValueOnce(VALID);
      sourceSpies.update.mockResolvedValue(savedEndpoint(WORKING_HOST));
      const result = await endpointStore.validateAndSave({
        endpoint: formValues({ host: WORKING_HOST }),
        isNew: false,
      });

      expect(result).toEqual(VALID);
      expect(sourceSpies.update).toHaveBeenCalledTimes(1);
      expect(sourceSpies.update).toHaveBeenCalledWith(
        expect.objectContaining({ host: WORKING_HOST }),
      );
    });
  });

  describe("validateAndSave, creating an endpoint", () => {
    it("validates the proposed values before creating the endpoint", async () => {
      const form = formValues({ host: WORKING_HOST });
      const added = savedEndpoint(WORKING_HOST);
      sourceSpies.validate.mockResolvedValue(VALID);
      sourceSpies.add.mockResolvedValue(added);

      const result = await endpointStore.validateAndSave({
        endpoint: form,
        isNew: true,
      });

      expect(sourceSpies.validate).toHaveBeenCalledWith(form, true);
      expect(sourceSpies.add).toHaveBeenCalledWith(form);
      expect(sourceSpies.validate.mock.invocationCallOrder[0]).toBeLessThan(
        sourceSpies.add.mock.invocationCallOrder[0],
      );
      expect(result).toEqual(VALID);
      expect(endpointStore.validation).toEqual(VALID);
      expect(endpointStore.endpoints).toEqual([added]);
    });

    it("doesn't create the endpoint when the validation fails", async () => {
      sourceSpies.validate.mockResolvedValue(invalid(FAILING_HOST));

      const result = await endpointStore.validateAndSave({
        endpoint: formValues({ host: FAILING_HOST }),
        isNew: true,
      });

      expect(result).toEqual(invalid(FAILING_HOST));
      expect(endpointStore.validation).toEqual(invalid(FAILING_HOST));
      expect(sourceSpies.add).not.toHaveBeenCalled();
      expect(endpointStore.endpoints).toEqual([]);
    });

    it("doesn't create the endpoint when the validation request fails", async () => {
      sourceSpies.validate.mockRejectedValue({ status: 500 });

      await expect(
        endpointStore.validateAndSave({
          endpoint: formValues({ host: WORKING_HOST }),
          isNew: true,
        }),
      ).rejects.toEqual({ status: 500 });

      expect(sourceSpies.add).not.toHaveBeenCalled();
      expect(endpointStore.endpoints).toEqual([]);
      expect(endpointStore.validating).toBe(false);
    });

    it("doesn't report a valid endpoint when it can't be created", async () => {
      sourceSpies.validate.mockResolvedValue(VALID);
      sourceSpies.add.mockRejectedValue({ status: 500 });

      await expect(
        endpointStore.validateAndSave({
          endpoint: formValues({ host: WORKING_HOST }),
          isNew: true,
        }),
      ).rejects.toEqual({ status: 500 });

      expect(endpointStore.validation).toBeNull();
      expect(endpointStore.validating).toBe(false);
      expect(endpointStore.adding).toBe(false);
      expect(endpointStore.endpoints).toEqual([]);
    });
  });

  describe("stale validation responses", () => {
    beforeEach(() => {
      endpointStore.endpoints = [savedEndpoint(ORIGINAL_HOST)];
    });

    it("doesn't let an older attempt overwrite the state of a newer one", async () => {
      const failingValidation = deferred<Validation>();
      const workingValidation = deferred<Validation>();
      sourceSpies.validate
        .mockReturnValueOnce(failingValidation.promise)
        .mockReturnValueOnce(workingValidation.promise);
      sourceSpies.update.mockResolvedValue(savedEndpoint(WORKING_HOST));

      const failingAttempt = endpointStore.validateAndSave({
        endpoint: formValues({ host: FAILING_HOST }),
        isNew: false,
      });
      const workingAttempt = endpointStore.validateAndSave({
        endpoint: formValues({ host: WORKING_HOST }),
        isNew: false,
      });

      workingValidation.resolve(VALID);
      expect(await workingAttempt).toEqual(VALID);

      failingValidation.resolve(invalid(FAILING_HOST));
      expect(await failingAttempt).toBeNull();

      expect(endpointStore.validation).toEqual(VALID);
      expect(sourceSpies.update).toHaveBeenCalledTimes(1);
      expect(sourceSpies.update).toHaveBeenCalledWith(
        expect.objectContaining({ host: WORKING_HOST }),
      );
    });

    it("doesn't save the values of an older attempt which is valid", async () => {
      const olderValidation = deferred<Validation>();
      sourceSpies.validate
        .mockReturnValueOnce(olderValidation.promise)
        .mockResolvedValueOnce(invalid(FAILING_HOST));

      const olderAttempt = endpointStore.validateAndSave({
        endpoint: formValues({ host: WORKING_HOST }),
        isNew: false,
      });
      await endpointStore.validateAndSave({
        endpoint: formValues({ host: FAILING_HOST }),
        isNew: false,
      });

      olderValidation.resolve(VALID);
      expect(await olderAttempt).toBeNull();

      expect(sourceSpies.update).not.toHaveBeenCalled();
      expect(endpointStore.validation).toEqual(invalid(FAILING_HOST));
    });

    it("displays the error which belongs to the values of the current attempt", async () => {
      sourceSpies.validate.mockResolvedValueOnce(invalid(FAILING_HOST));
      await endpointStore.validateAndSave({
        endpoint: formValues({ host: FAILING_HOST }),
        isNew: false,
      });
      expect(endpointStore.validation?.message).toContain(FAILING_HOST);

      sourceSpies.validate.mockResolvedValueOnce(invalid(WORKING_HOST));
      await endpointStore.validateAndSave({
        endpoint: formValues({ host: WORKING_HOST }),
        isNew: false,
      });
      expect(endpointStore.validation?.message).toContain(WORKING_HOST);
      expect(endpointStore.validation?.message).not.toContain(FAILING_HOST);
    });

    it("doesn't save an attempt whose validation has been cleared", async () => {
      const validation = deferred<Validation>();
      sourceSpies.validate.mockReturnValueOnce(validation.promise);

      const attempt = endpointStore.validateAndSave({
        endpoint: formValues({ host: WORKING_HOST }),
        isNew: false,
      });
      expect(endpointStore.validating).toBe(true);

      endpointStore.clearValidation();
      validation.resolve(VALID);
      expect(await attempt).toBeNull();

      expect(sourceSpies.update).not.toHaveBeenCalled();
      expect(endpointStore.validation).toBeNull();
      expect(endpointStore.validating).toBe(false);
    });

    it("ignores the failure of a validation which has been cleared", async () => {
      const validation = deferred<Validation>();
      sourceSpies.validate.mockReturnValueOnce(validation.promise);

      const attempt = endpointStore.validateAndSave({
        endpoint: formValues({ host: WORKING_HOST }),
        isNew: false,
      });

      endpointStore.clearValidation();
      validation.reject({ status: 500 });
      await expect(attempt).rejects.toEqual({ status: 500 });

      expect(endpointStore.validation).toBeNull();
      expect(endpointStore.validating).toBe(false);
    });
  });
});
