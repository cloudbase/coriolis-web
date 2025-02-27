/*
Copyright (C) 2019  Cloudbase Solutions SRL
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
import { observer } from "mobx-react";
import styled from "styled-components";

import providerStore, {
  getFieldChangeOptions,
} from "@src/stores/ProviderStore";
import transferStore from "@src/stores/TransferStore";
import endpointStore from "@src/stores/EndpointStore";
import { OptionsSchemaPlugin } from "@src/plugins";

import Button from "@src/components/ui/Button";
import StatusImage from "@src/components/ui/StatusComponents/StatusImage";
import Modal from "@src/components/ui/Modal";
import Panel from "@src/components/ui/Panel";
import WizardNetworks, {
  WizardNetworksChangeObject,
} from "@src/components/modules/WizardModule/WizardNetworks";
import WizardOptions, {
  findInvalidFields,
  INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS,
} from "@src/components/modules/WizardModule/WizardOptions";
import WizardStorage from "@src/components/modules/WizardModule/WizardStorage";
import WizardScripts from "@src/components/modules/WizardModule/WizardScripts";
import WizardExecuteOptions from "@src/components/modules/WizardModule/WizardExecuteOptions";

import type { UpdateData, ActionItemDetails } from "@src/@types/MainItem";
import {
  Endpoint,
  EndpointUtils,
  StorageBackend,
  StorageMap,
} from "@src/@types/Endpoint";
import type { Field } from "@src/@types/Field";
import type { Instance, InstanceScript } from "@src/@types/Instance";
import {
  Network,
  NetworkMap,
  NetworkUtils,
  SecurityGroup,
} from "@src/@types/Network";

import { deploymentFields, providerTypes } from "@src/constants";
import configLoader from "@src/utils/Config";
import LoadingButton from "@src/components/ui/LoadingButton";
import minionPoolStore from "@src/stores/MinionPoolStore";
import networkStore from "@src/stores/NetworkStore";
import { ThemeProps } from "@src/components/Theme";
import ObjectUtils from "@src/utils/ObjectUtils";

const PanelContent = styled.div<any>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
  min-height: 0;
`;
const LoadingWrapper = styled.div<any>`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 32px 0;
`;
const LoadingText = styled.div<any>`
  font-size: 18px;
  margin-top: 32px;
`;
const ErrorWrapper = styled.div<any>`
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: center;
  justify-content: center;
  padding: 32px;
`;
const ErrorMessage = styled.div<any>`
  margin-top: 16px;
  text-align: center;
`;
const Buttons = styled.div<any>`
  padding: 32px;
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
`;

type Width = "normal" | "wide";

type Props = {
  type?: "transfer" | "deployment";
  isOpen: boolean;
  onRequestClose: () => void;
  onUpdateComplete: (redirectTo: string) => void;
  transfer: ActionItemDetails;
  destinationEndpoint: Endpoint;
  sourceEndpoint: Endpoint;
  instancesDetails: Instance[];
  instancesDetailsLoading: boolean;
  networks: Network[];
  networksLoading: boolean;
  onReloadClick: () => void;
};
type State = {
  selectedPanel: string | null;
  destinationData: any;
  sourceData: any;
  deployData: any;
  updateDisabled: boolean;
  updating: boolean;
  selectedNetworks: NetworkMap[];
  defaultStorage: { value: string | null; busType?: string | null } | undefined;
  storageMap: StorageMap[];
  sourceFailed: boolean;
  destinationFailedMessage: string | null;
  uploadedScripts: InstanceScript[];
  removedScripts: InstanceScript[];
  width: Width;
};

@observer
class TransferItemModal extends React.Component<Props, State> {
  state: State = {
    selectedPanel: "source_options",
    destinationData: {},
    sourceData: {},
    deployData: {},
    updateDisabled: false,
    updating: false,
    selectedNetworks: [],
    defaultStorage: undefined,
    storageMap: [],
    uploadedScripts: [],
    sourceFailed: false,
    destinationFailedMessage: null,
    removedScripts: [],
    width: "normal",
  };

  scrollableRef: HTMLElement | null | undefined;

  UNSAFE_componentWillMount() {
    this.loadData(true);

    this.updateAvailableWidth();
    window.addEventListener("resize", this.handleResize.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize.bind(this));
  }

  handleResize() {
    this.updateAvailableWidth();
  }

  updateAvailableWidth() {
    const RESIZE_BREAKPOINT = 1100;
    if (window.innerWidth < RESIZE_BREAKPOINT && this.state.width === "wide") {
      this.setState({ width: "normal" });
    } else if (
      window.innerWidth >= RESIZE_BREAKPOINT &&
      this.state.width === "normal"
    ) {
      this.setState({ width: "wide" });
    }
  }

  get requiresWindowsImage() {
    return this.props.instancesDetails.some(i => i.os_type === "windows");
  }

  getStorageMap(storageBackends: StorageBackend[]): StorageMap[] {
    const storageMap: StorageMap[] = [];
    const currentStorage = this.props.transfer.storage_mappings;
    const buildStorageMap = (
      type: "backend" | "disk",
      mapping: any
    ): StorageMap => {
      const busTypeInfo = EndpointUtils.getBusTypeStorageId(
        storageBackends,
        mapping.destination
      );
      const backend = storageBackends.find(b => b.name === busTypeInfo.id);
      const newStorageMap: StorageMap = {
        type,
        source: {
          storage_backend_identifier: mapping.source,
          id: mapping.disk_id,
        },
        target: {
          name: busTypeInfo.id!,
          id: backend ? backend.id : busTypeInfo.id,
        },
      };
      if (busTypeInfo.busType) {
        newStorageMap.targetBusType = busTypeInfo.busType;
      }
      return newStorageMap;
    };
    const backendMappings = currentStorage?.backend_mappings || [];
    backendMappings.forEach(mapping => {
      storageMap.push(buildStorageMap("backend", mapping));
    });

    const diskMappings = currentStorage?.disk_mappings || [];
    diskMappings.forEach(mapping => {
      storageMap.push(buildStorageMap("disk", mapping));
    });

    this.state.storageMap.forEach(mapping => {
      const fieldName =
        mapping.type === "backend" ? "storage_backend_identifier" : "id";
      const existingMapping = storageMap.find(
        m =>
          m.type === mapping.type &&
          m.source[fieldName] === String(mapping.source[fieldName])
      );
      if (existingMapping) {
        existingMapping.target = mapping.target;
        if (mapping.targetBusType !== undefined) {
          existingMapping.targetBusType = mapping.targetBusType;
        }
      } else {
        storageMap.push(mapping);
      }
    });

    return storageMap;
  }

  getSelectedNetworks(): NetworkMap[] {
    const selectedNetworks: NetworkMap[] = [];
    const networkMap: any = this.props.transfer.network_map;

    if (networkMap) {
      Object.keys(networkMap).forEach(sourceNetworkName => {
        // if the network mapping was updated, just use the new mapping instead of the old one
        const updatedMapping = this.state.selectedNetworks.find(
          m => m.sourceNic.network_name === sourceNetworkName
        );
        if (updatedMapping) {
          selectedNetworks.push(updatedMapping);
          return;
        }

        // add extra information to the current network mapping
        const destNetObj: any = networkMap[sourceNetworkName];
        const portKeyInfo = NetworkUtils.getPortKeyNetworkId(
          this.props.networks,
          destNetObj
        );
        const destNetId = String(
          typeof destNetObj === "string" || !destNetObj || !destNetObj.id
            ? portKeyInfo.id
            : destNetObj.id
        );

        const network =
          this.props.networks.find(
            n => n.name === destNetId || n.id === destNetId
          ) || null;
        const mapping: NetworkMap = {
          sourceNic: {
            id: "",
            network_name: sourceNetworkName,
            mac_address: "",
            network_id: "",
          },
          targetNetwork: network,
        };
        if (destNetObj.security_groups) {
          const destSecGroupsInfo = network?.security_groups || [];
          const secInfo = destNetObj.security_groups.map((s: SecurityGroup) => {
            const foundSecGroupInfo = destSecGroupsInfo.find((si: any) =>
              si.id ? si.id === s : si === s
            );
            return foundSecGroupInfo || { id: s, name: s };
          });
          mapping.targetSecurityGroups = secInfo;
        }
        if (portKeyInfo.portKey) {
          mapping.targetPortKey = portKeyInfo.portKey;
        }
        selectedNetworks.push(mapping);
      });
    }

    // add any new networks mappings that were not in the original network mappings
    this.state.selectedNetworks.forEach(mapping => {
      if (
        !selectedNetworks.find(
          m => m.sourceNic.network_name === mapping.sourceNic.network_name
        )
      ) {
        selectedNetworks.push(mapping);
      }
    });
    return selectedNetworks;
  }

  getDefaultStorage(): { value: string | null; busType?: string | null } {
    if (this.state.defaultStorage) {
      return this.state.defaultStorage;
    }

    const buildDefaultStorage = (defaultValue: string | null | undefined) => {
      const busTypeInfo = EndpointUtils.getBusTypeStorageId(
        endpointStore.storageBackends,
        defaultValue || null
      );
      const defaultStorage: { value: string | null; busType?: string | null } =
        {
          value: busTypeInfo.id,
        };
      if (busTypeInfo.busType) {
        defaultStorage.busType = busTypeInfo.busType;
      }
      return defaultStorage;
    };

    if (this.props.transfer.storage_mappings?.default) {
      return buildDefaultStorage(this.props.transfer.storage_mappings.default);
    }

    if (endpointStore.storageConfigDefault) {
      return buildDefaultStorage(endpointStore.storageConfigDefault);
    }
    return { value: null };
  }

  getDeployFieldValue(fieldName: string, defaultValue: any) {
    const currentData = this.state.deployData;
    if (fieldName === "clone_disks") {
      if (currentData[fieldName] !== undefined) {
        return currentData[fieldName];
      }

      return this.props.transfer.clone_disks !== undefined
        ? this.props.transfer.clone_disks
        : defaultValue;
    }

    if (fieldName === "skip_os_morphing") {
      if (currentData[fieldName] !== undefined) {
        return currentData[fieldName];
      }
      return this.props.transfer.skip_os_morphing !== undefined
        ? this.props.transfer.skip_os_morphing
        : defaultValue;
    }
  }

  getFieldValue(opts: {
    type: "source" | "destination";
    fieldName: string;
    defaultValue: any;
    parentFieldName?: string;
  }) {
    const { type, fieldName, defaultValue, parentFieldName } = opts;
    const currentData =
      type === "source" ? this.state.sourceData : this.state.destinationData;

    const transferMinionMappings =
      this.props.transfer[INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS];

    if (parentFieldName) {
      if (
        currentData[parentFieldName] &&
        currentData[parentFieldName][fieldName] !== undefined
      ) {
        return currentData[parentFieldName][fieldName];
      }
      if (
        parentFieldName === INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS &&
        transferMinionMappings &&
        transferMinionMappings[fieldName] !== undefined
      ) {
        return transferMinionMappings[fieldName];
      }
    }

    if (currentData[fieldName] !== undefined) {
      return currentData[fieldName];
    }

    if (fieldName === "title") {
      if (this.props.transfer.notes) {
        return this.props.transfer.notes;
      }
      let title = this.props.instancesDetails?.[0]?.name;
      if (
        this.props.instancesDetails &&
        this.props.instancesDetails.length > 1
      ) {
        title += ` (+${this.props.instancesDetails.length - 1} more)`;
      }
      return title;
    }

    if (fieldName === "minion_pool_id") {
      return type === "source"
        ? this.props.transfer.origin_minion_pool_id
        : this.props.transfer.destination_minion_pool_id;
    }

    const transferData: any =
      type === "source"
        ? this.props.transfer.source_environment
        : this.props.transfer.destination_environment;

    if (parentFieldName) {
      if (transferData[parentFieldName]?.[fieldName] !== undefined) {
        return transferData[parentFieldName][fieldName];
      }
    }
    if (transferData[fieldName] !== undefined) {
      return transferData[fieldName];
    }
    const endpoint =
      type === "source"
        ? this.props.sourceEndpoint
        : this.props.destinationEndpoint;
    const plugin = OptionsSchemaPlugin.for(endpoint.type);

    const osMapping = /^(windows|linux)/.exec(fieldName);
    if (osMapping) {
      const osData =
        transferData[`${plugin.migrationImageMapFieldName}/${osMapping[0]}`];
      return osData;
    }

    return defaultValue;
  }

  async loadData(useCache: boolean) {
    minionPoolStore.loadMinionPools();
    await providerStore.loadProviders();

    const loadAllOptions = async (type: "source" | "destination") => {
      const endpoint =
        type === "source"
          ? this.props.sourceEndpoint
          : this.props.destinationEndpoint;
      try {
        await this.loadOptions(endpoint, type, useCache);
        this.loadExtraOptions({ type, useCache });
      } catch (err) {
        if (type === "source") {
          this.setState(prevState => {
            let selectedPanel = prevState.selectedPanel;
            if (selectedPanel === "source_options") {
              selectedPanel = "dest_options";
            }
            return { sourceFailed: true, selectedPanel };
          });
        }
      }
    };

    loadAllOptions("source");
    loadAllOptions("destination");
  }

  async loadOptions(
    endpoint: Endpoint,
    optionsType: "source" | "destination",
    useCache: boolean
  ) {
    try {
      await providerStore.loadOptionsSchema({
        providerName: endpoint.type,
        requiresWindowsImage: this.requiresWindowsImage,
        optionsType,
        useCache,
      });
    } catch (err) {
      if (optionsType === "destination") {
        const destinationFailedMessage =
          "An error has occurred during the loading of the Transfer's options for editing. There could be connection issues with the destination platform. Please retry the operation.";
        this.setState({ destinationFailedMessage });
      }
      throw err;
    }
    await providerStore.getOptionsValues({
      optionsType,
      endpointId: endpoint.id,
      providerName: endpoint.type,
      useCache,
      requiresWindowsImage: this.requiresWindowsImage,
    });
  }

  loadExtraOptions(opts: {
    field?: Field;
    type: "source" | "destination";
    useCache?: boolean;
    parentFieldName?: string;
  }) {
    const { field, type, useCache, parentFieldName } = opts;
    const endpoint =
      type === "source"
        ? this.props.sourceEndpoint
        : this.props.destinationEndpoint;
    const env = ObjectUtils.clone(
      type === "source"
        ? this.props.transfer.source_environment
        : this.props.transfer.destination_environment
    );
    const stateEnv =
      type === "source" ? this.state.sourceData : this.state.destinationData;

    const envData = ObjectUtils.mergeDeep(env, stateEnv);
    const changedEnvData = getFieldChangeOptions({
      providerName: endpoint.type,
      schema:
        type === "source"
          ? providerStore.sourceSchema
          : providerStore.destinationSchema,
      data: envData,
      field: field || null,
      type,
      parentFieldName,
    });

    if (!changedEnvData) {
      return;
    }
    providerStore.getOptionsValues({
      optionsType: type,
      endpointId: endpoint.id,
      providerName: endpoint.type,
      useCache,
      envData,
      requiresWindowsImage: this.requiresWindowsImage,
    });
    if (type === "destination") {
      networkStore.loadNetworks(endpoint.id, envData, { cache: true });
      if (this.hasStorageMap()) {
        endpointStore.loadStorage(this.props.destinationEndpoint.id, envData, {
          cache: true,
        });
      }
    }
  }

  hasStorageMap(): boolean {
    return providerStore.providers?.[this.props.destinationEndpoint.type]
      ? !!providerStore.providers[
          this.props.destinationEndpoint.type
        ].types.find(t => t === providerTypes.STORAGE)
      : false;
  }

  isUpdateDisabled() {
    const isDestFailed =
      this.props.type === "transfer" && this.state.destinationFailedMessage;
    return this.state.updateDisabled || isDestFailed;
  }

  isLoadingDestOptions() {
    return (
      providerStore.destinationSchemaLoading ||
      providerStore.destinationOptionsPrimaryLoading
    );
  }

  isLoadingSourceOptions() {
    return (
      providerStore.sourceSchemaLoading ||
      providerStore.sourceOptionsPrimaryLoading
    );
  }

  isLoadingNetwork() {
    return this.props.instancesDetailsLoading;
  }

  isLoadingStorage() {
    return this.props.instancesDetailsLoading || endpointStore.storageLoading;
  }

  isLoading() {
    return (
      this.isLoadingSourceOptions() ||
      this.isLoadingDestOptions() ||
      this.isLoadingNetwork() ||
      this.isLoadingStorage()
    );
  }

  validateOptions(type: "source" | "destination") {
    const env = ObjectUtils.clone(
      type === "source"
        ? this.props.transfer.source_environment
        : this.props.transfer.destination_environment
    );

    const data =
      type === "source" ? this.state.sourceData : this.state.destinationData;
    const schema =
      type === "source"
        ? providerStore.sourceSchema
        : providerStore.destinationSchema;
    const invalidFields = findInvalidFields(
      ObjectUtils.mergeDeep(env, data),
      schema
    );

    this.setState({ updateDisabled: invalidFields.length > 0 });
  }

  handlePanelChange(panel: string) {
    this.setState({ selectedPanel: panel });
  }

  handleReload() {
    this.props.onReloadClick();
    this.loadData(false);
  }

  handleFieldChange(opts: {
    type: "source" | "destination";
    field: Field;
    value: any;
    parentFieldName?: string;
  }) {
    const { type, field, value, parentFieldName } = opts;
    const data =
      type === "source"
        ? { ...this.state.sourceData }
        : { ...this.state.destinationData };

    const transferData: any =
      type === "source"
        ? this.props.transfer.source_environment
        : this.props.transfer.destination_environment;
    if (field.type === "array") {
      const currentValues: string[] = data[field.name] || [];
      const oldValues: string[] = transferData[field.name] || [];
      let values: string[] = currentValues;
      if (!currentValues.length) {
        values = [...oldValues];
      }
      if (values.find(v => v === value)) {
        data[field.name] = values.filter(v => v !== value);
      } else {
        data[field.name] = [...values, value];
      }
    } else if (field.groupName) {
      if (!data[field.groupName]) {
        data[field.groupName] = {};
      }
      data[field.groupName][field.name] = value;
    } else if (parentFieldName) {
      // NOTE(aznashwan): in order to prevent accidentally un-setting any
      // existing fields from Object options from the previous Migration/Replica,
      // we always re-merge all the values on an object field update.
      data[parentFieldName] =
        data[parentFieldName] || transferData[parentFieldName] || {};
      data[parentFieldName][field.name] = value;
    } else {
      data[field.name] = value;
    }

    if (field.subFields) {
      field.subFields.forEach(subField => {
        const subFieldKeys = Object.keys(data).filter(
          k => k.indexOf(subField.name) > -1
        );
        subFieldKeys.forEach(k => {
          delete data[k];
        });
      });
    }

    const handleStateUpdate = () => {
      if (field.type !== "string" || field.enum) {
        this.loadExtraOptions({ field, type, parentFieldName });
      }
      this.validateOptions(type);
    };
    if (type === "source") {
      this.setState({ sourceData: data }, () => {
        handleStateUpdate();
      });
    } else {
      this.setState({ destinationData: data }, () => {
        handleStateUpdate();
      });
    }
  }

  handleDeployFieldChange(field: Field, value: any) {
    const data = this.state.deployData;
    data[field.name] = value;
    this.setState({ deployData: { ...this.state.deployData, ...data } });
  }

  async handleUpdateClick() {
    this.setState({ updating: true });

    const updateData: UpdateData = {
      source: this.state.sourceData,
      destination: this.state.destinationData,
      deploy: this.state.deployData,
      network:
        this.state.selectedNetworks.length > 0
          ? this.getSelectedNetworks()
          : [],
      storage: this.state.storageMap,
      uploadedScripts: this.state.uploadedScripts,
      removedScripts: this.state.removedScripts,
    };
    try {
      await transferStore.update({
        transfer: this.props.transfer as any,
        sourceEndpoint: this.props.sourceEndpoint,
        destinationEndpoint: this.props.destinationEndpoint,
        updateData,
        defaultStorage: this.getDefaultStorage(),
        storageConfigDefault: endpointStore.storageConfigDefault,
      });
      this.props.onRequestClose();
      this.props.onUpdateComplete(
        `/transfers/${this.props.transfer.id}/executions`
      );
    } catch (err) {
      this.setState({ updating: false });
    }
  }

  handleNetworkChange(changeObject: WizardNetworksChangeObject) {
    const networkMap = this.state.selectedNetworks.filter(
      n => n.sourceNic.network_name !== changeObject.nic.network_name
    );
    this.setState({
      selectedNetworks: [
        ...networkMap,
        {
          sourceNic: changeObject.nic,
          targetNetwork: changeObject.network,
          targetSecurityGroups: changeObject.securityGroups,
          targetPortKey: changeObject.portKey,
        },
      ],
    });
  }

  handleCancelScript(
    global: "windows" | "linux" | null,
    instanceName: string | null
  ) {
    this.setState(prevState => ({
      uploadedScripts: prevState.uploadedScripts.filter(s =>
        global ? s.global !== global : s.instanceId !== instanceName
      ),
    }));
  }

  handleScriptUpload(script: InstanceScript) {
    this.setState(prevState => ({
      uploadedScripts: [...prevState.uploadedScripts, script],
    }));
  }

  handleScriptDataRemove(script: InstanceScript) {
    this.setState(prevState => ({
      removedScripts: [...prevState.removedScripts, script],
    }));
  }

  handleStorageChange(mapping: StorageMap) {
    this.setState(prevState => {
      const diskFieldName =
        mapping.type === "backend" ? "storage_backend_identifier" : "id";
      const storageMap = prevState.storageMap.filter(
        n =>
          n.type !== mapping.type ||
          n.source[diskFieldName] !== mapping.source[diskFieldName]
      );
      storageMap.push(mapping);

      return { storageMap };
    });
  }

  renderDestinationFailedMessage() {
    return (
      <ErrorWrapper>
        <StatusImage status="ERROR" />
        <ErrorMessage>{this.state.destinationFailedMessage}</ErrorMessage>
      </ErrorWrapper>
    );
  }

  renderOptions(type: "source" | "destination") {
    const loading =
      type === "source"
        ? providerStore.sourceSchemaLoading ||
          providerStore.sourceOptionsPrimaryLoading
        : providerStore.destinationSchemaLoading ||
          providerStore.destinationOptionsPrimaryLoading;
    if (this.state.destinationFailedMessage) {
      return this.renderDestinationFailedMessage();
    }
    if (loading) {
      return this.renderLoading(
        `Loading ${type === "source" ? "source" : "target"} options ...`
      );
    }
    const optionsLoading =
      type === "source"
        ? providerStore.sourceOptionsSecondaryLoading
        : providerStore.destinationOptionsSecondaryLoading;
    const schema =
      type === "source"
        ? providerStore.sourceSchema
        : providerStore.destinationSchema;
    const fields =
      this.props.type === "transfer" ? schema.filter(f => !f.readOnly) : schema;
    const extraOptionsConfig = configLoader.config.extraOptionsApiCalls.find(
      o => {
        const provider =
          type === "source"
            ? this.props.sourceEndpoint.type
            : this.props.destinationEndpoint.type;
        return o.name === provider && o.types.find(t => t === type);
      }
    );
    let optionsLoadingSkipFields: string[] = [];
    if (extraOptionsConfig) {
      optionsLoadingSkipFields = extraOptionsConfig.requiredFields;
    }
    const endpoint =
      type === "source"
        ? this.props.sourceEndpoint
        : this.props.destinationEndpoint;
    let dictionaryKey = "";
    if (endpoint) {
      dictionaryKey = `${endpoint.type}-${type}`;
    }
    const minionPools = minionPoolStore.minionPools.filter(
      m => m.platform === type && m.endpoint_id === endpoint.id
    );
    return (
      <WizardOptions
        minionPools={minionPools}
        wizardType={`${this.props.type || "transfer"}-${type}-options-edit`}
        getFieldValue={(f, d, pf) =>
          this.getFieldValue({
            type,
            fieldName: f,
            defaultValue: d,
            parentFieldName: pf,
          })
        }
        fields={fields}
        selectedInstances={
          type === "destination" ? this.props.instancesDetails : null
        }
        hasStorageMap={type === "source" ? false : this.hasStorageMap()}
        storageBackends={endpointStore.storageBackends}
        onChange={(f, v, fp) => {
          this.handleFieldChange({
            type,
            field: f,
            value: v,
            parentFieldName: fp,
          });
        }}
        oneColumnStyle={{
          marginTop: "-16px",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          alignItems: "center",
        }}
        fieldWidth={
          this.state.width === "wide"
            ? ThemeProps.inputSizes.wizard.width
            : ThemeProps.inputSizes.large.width
        }
        onScrollableRef={ref => {
          this.scrollableRef = ref;
        }}
        availableHeight={384}
        useAdvancedOptions
        layout="modal"
        isSource={type === "source"}
        optionsLoading={optionsLoading}
        optionsLoadingSkipFields={[...optionsLoadingSkipFields, "description"]}
        dictionaryKey={dictionaryKey}
        executeNowOptionsDisabled={
          !providerStore.hasExecuteNowOptions(this.props.sourceEndpoint.type)
        }
      />
    );
  }

  renderStorageMapping() {
    if (this.props.instancesDetailsLoading) {
      return this.renderLoading("Loading instances details ...");
    }

    return (
      <WizardStorage
        loading={endpointStore.storageLoading}
        defaultStorage={this.getDefaultStorage()}
        onDefaultStorageChange={(value, busType) => {
          this.setState({ defaultStorage: { value, busType } });
        }}
        defaultStorageLayout="modal"
        storageBackends={endpointStore.storageBackends}
        instancesDetails={this.props.instancesDetails}
        storageMap={this.getStorageMap(endpointStore.storageBackends)}
        onChange={mapping => {
          this.handleStorageChange(mapping);
        }}
        style={{ padding: "32px 32px 0 32px", width: "calc(100% - 64px)" }}
        titleWidth={this.state.width === "normal" ? 160 : 320}
        onScrollableRef={ref => {
          this.scrollableRef = ref;
        }}
      />
    );
  }

  renderNetworkMapping() {
    return (
      <WizardNetworks
        instancesDetails={this.props.instancesDetails}
        loadingInstancesDetails={this.props.instancesDetailsLoading}
        networks={this.props.networks}
        loading={this.props.networksLoading}
        onChange={change => {
          this.handleNetworkChange(change);
        }}
        selectedNetworks={this.getSelectedNetworks()}
        style={{ padding: "32px 32px 0 32px", width: "calc(100% - 64px)" }}
        titleWidth={this.state.width === "normal" ? 160 : 320}
      />
    );
  }

  renderUserScripts() {
    return (
      <WizardScripts
        instances={this.props.instancesDetails}
        loadingInstances={this.props.instancesDetailsLoading}
        onScriptUpload={s => {
          this.handleScriptUpload(s);
        }}
        onScriptDataRemove={s => {
          this.handleScriptDataRemove(s);
        }}
        onCancelScript={(g, i) => {
          this.handleCancelScript(g, i);
        }}
        uploadedScripts={this.state.uploadedScripts}
        removedScripts={this.state.removedScripts}
        userScriptData={this.props.transfer?.user_scripts}
        scrollableRef={(r: HTMLElement) => {
          this.scrollableRef = r;
        }}
        style={{ padding: "32px 32px 0 32px", width: "calc(100% - 64px)" }}
      />
    );
  }

  renderDeployOptions() {
    return (
      <WizardExecuteOptions
        options={[...deploymentFields]}
        wizardType={"edit-deploy"}
        layout={"modal"}
        onChange={(f, v) => {
          this.handleDeployFieldChange(f, v);
        }}
        data={this.state.deployData}
        getFieldValue={(f, d) => this.getDeployFieldValue(f, d)}
      />
    );
  }

  renderContent() {
    let content = null;
    switch (this.state.selectedPanel) {
      case "source_options":
        content = this.renderOptions("source");
        break;
      case "dest_options":
        content = this.renderOptions("destination");
        break;
      case "network_mapping":
        content = this.renderNetworkMapping();
        break;
      case "user_scripts":
        content = this.renderUserScripts();
        break;
      case "storage_mapping":
        content = this.renderStorageMapping();
        break;
      case "deploy_options":
        content = this.renderDeployOptions();
        break;
      default:
        content = null;
    }
    return (
      <PanelContent>
        {content}
        <Buttons>
          <Button large onClick={this.props.onRequestClose} secondary>
            Close
          </Button>
          {this.isLoading() ? (
            <LoadingButton large>Loading ...</LoadingButton>
          ) : this.state.updating ? (
            <LoadingButton large>
              {this.props.type === "transfer" ? "Updating" : "Creating"} ...
            </LoadingButton>
          ) : (
            <Button
              large
              onClick={() => {
                this.handleUpdateClick();
              }}
              disabled={this.isUpdateDisabled()}
            >
              {this.props.type === "transfer" ? "Update" : "Create"}
            </Button>
          )}
        </Buttons>
      </PanelContent>
    );
  }

  renderLoading(message: string) {
    const loadingMessage = message || "Loading ...";

    return (
      <LoadingWrapper>
        <StatusImage loading />
        <LoadingText>{loadingMessage}</LoadingText>
      </LoadingWrapper>
    );
  }

  render() {
    const navigationItems: Panel["props"]["navigationItems"] = [
      {
        value: "source_options",
        label: "Source Options",
        disabled: this.state.sourceFailed,
        title: this.state.sourceFailed
          ? "There are source platform errors, source options can't be updated"
          : "",
        loading: this.isLoadingSourceOptions(),
      },
      {
        value: "dest_options",
        label: "Target Options",
        loading: this.isLoadingDestOptions(),
      },
      {
        value: "network_mapping",
        label: "Network Mapping",
        loading: this.isLoadingNetwork(),
      },
      {
        value: "user_scripts",
        label: "User Scripts",
        loading: this.props.instancesDetailsLoading,
      },
    ];

    if (this.hasStorageMap()) {
      navigationItems.push({
        value: "storage_mapping",
        label: "Storage Mapping",
        loading: this.isLoadingStorage(),
      });
    }

    navigationItems.push({
      value: "deploy_options",
      label: "Deploy Options",
    });

    return (
      <Modal
        isOpen={this.props.isOpen}
        title="Edit Transfer"
        onRequestClose={this.props.onRequestClose}
        contentWidth={this.state.width === "normal" ? "800px" : "1074px"}
        onScrollableRef={() => this.scrollableRef}
        fixedHeight={512}
      >
        <Panel
          contentWidth={this.state.width}
          navigationItems={navigationItems}
          content={this.renderContent()}
          onChange={navItem => {
            this.handlePanelChange(navItem.value);
          }}
          selectedValue={this.state.selectedPanel}
          onReloadClick={() => {
            this.handleReload();
          }}
          reloadLabel="Reload All Options"
        />
      </Modal>
    );
  }
}

export default TransferItemModal;
