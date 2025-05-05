/*
Copyright (C) 2017  Cloudbase Solutions SRL
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

import { observer } from "mobx-react";
import React from "react";
import styled from "styled-components";

import { Endpoint, EndpointUtils, StorageMap } from "@src/@types/Endpoint";
import { ProviderTypes } from "@src/@types/Providers";
import EndpointLogos from "@src/components/modules/EndpointModule/EndpointLogos";
import Schedule from "@src/components/modules/TransferModule/Schedule";
import WizardBreadcrumbs from "@src/components/modules/WizardModule/WizardBreadcrumbs";
import WizardEndpointList from "@src/components/modules/WizardModule/WizardEndpointList";
import WizardInstances from "@src/components/modules/WizardModule/WizardInstances";
import WizardNetworks, {
  WizardNetworksChangeObject,
} from "@src/components/modules/WizardModule/WizardNetworks";
import WizardOptions from "@src/components/modules/WizardModule/WizardOptions";
import WizardScripts from "@src/components/modules/WizardModule/WizardScripts";
import WizardStorage from "@src/components/modules/WizardModule/WizardStorage";
import WizardSummary from "@src/components/modules/WizardModule/WizardSummary";
import WizardExecuteOptions from "@src/components/modules/WizardModule/WizardExecuteOptions";
import WizardType from "@src/components/modules/WizardModule/WizardType";
import { ThemePalette, ThemeProps } from "@src/components/Theme";
import Button from "@src/components/ui/Button";
import InfoIcon from "@src/components/ui/InfoIcon";
import LoadingButton from "@src/components/ui/LoadingButton";
import {
  deploymentFields,
  executeOptionsWithExecuteNow,
  providerTypes,
  wizardPages,
} from "@src/constants";
import endpointStore from "@src/stores/EndpointStore";
import instanceStore from "@src/stores/InstanceStore";
import minionPoolStore from "@src/stores/MinionPoolStore";
import networkStore from "@src/stores/NetworkStore";
import notificationStore from "@src/stores/NotificationStore";
import providerStore from "@src/stores/ProviderStore";
import configLoader from "@src/utils/Config";

import transferItemIcon from "./images/transferItemIcon";

import type { WizardData, WizardPage } from "@src/@types/WizardData";
import type { Instance, InstanceScript } from "@src/@types/Instance";
import type { Field } from "@src/@types/Field";
import type { Schedule as ScheduleType } from "@src/@types/Schedule";

const Wrapper = styled.div<any>`
  ${ThemeProps.exactWidth(`${parseInt(ThemeProps.contentWidth, 10) + 64}px`)}
  margin: 64px auto 32px auto;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
`;
const Header = styled.div<any>`
  display: flex;
  position: relative;
  margin-bottom: 32px;
  align-items: center;
`;
const HeaderLabel = styled.div<any>`
  text-align: center;
  font-size: 32px;
  font-weight: ${ThemeProps.fontWeights.light};
  color: ${ThemePalette.primary};
  width: 100%;
`;
const HeaderReload = styled.div<any>`
  display: flex;
  align-items: center;
  position: absolute;
  right: 0;
`;
const HeaderReloadLabel = styled.div<any>`
  font-size: 10px;
  color: ${ThemePalette.grayscale[4]};
  &:hover {
    color: ${ThemePalette.primary};
  }
  cursor: pointer;
`;
const Body = styled.div<any>`
  flex-grow: 1;
  overflow: auto;
  display: flex;
  justify-content: center;
  padding: 0 32px;
`;
const Navigation = styled.div<any>`
  display: flex;
  justify-content: space-between;
  padding: 16px 32px 0 32px;
  margin-bottom: 80px;
`;
const IconRepresentation = styled.div<any>`
  display: flex;
  justify-content: center;
  flex-grow: 1;
  margin: 0 76px;
`;
const Footer = styled.div<any>``;
const WizardTypeIcon = styled.div<any>`
  width: 60px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 32px;
`;
type Props = {
  page: { id: string; title: string };
  type: "replica" | "migration";
  nextButtonDisabled: boolean;
  providerStore: typeof providerStore;
  instanceStore: typeof instanceStore;
  networkStore: typeof networkStore;
  endpointStore: typeof endpointStore;
  minionPoolStore: typeof minionPoolStore;
  wizardData: WizardData;
  schedules: ScheduleType[];
  storageMap: StorageMap[];
  onStorageReloadClick: () => void;
  defaultStorage: { value: string | null; busType?: string | null } | undefined;
  hasStorageMap: boolean;
  hasSourceOptions: boolean;
  pages: WizardPage[];
  uploadedUserScripts: InstanceScript[];
  showLoadingButton: boolean;
  onTypeChange: (isReplicaChecked: boolean | null) => void;
  onBackClick: () => void;
  onNextClick: () => void;
  onSourceEndpointChange: (endpoint: Endpoint) => void;
  onTargetEndpointChange: (endpoint: Endpoint) => void;
  onAddEndpoint: (provider: ProviderTypes, fromSource: boolean) => void;
  onInstancesSearchInputChange: (searchText: string) => void;
  onInstancesReloadClick: () => void;
  onInstanceClick: (instance: Instance) => void;
  onInstancePageClick: (page: number) => void;
  onDestOptionsChange: (
    field: Field,
    value: any,
    parentFieldName?: string,
  ) => void;
  onSourceOptionsChange: (
    field: Field,
    value: any,
    parentFieldName?: string,
  ) => void;
  onNetworkChange: (changeObject: WizardNetworksChangeObject) => void;
  onStorageChange: (mapping: StorageMap) => void;
  onDefaultStorageChange: (
    value: string | null,
    busType?: string | null,
  ) => void;
  onAddScheduleClick: (schedule: ScheduleType) => void;
  onScheduleChange: (scheduleId: string, schedule: ScheduleType) => void;
  onScheduleRemove: (scheudleId: string) => void;
  onContentRef: (ref: any) => void;
  onReloadOptionsClick: () => void;
  onReloadNetworksClick: () => void;
  onUserScriptUpload: (instanceScript: InstanceScript) => void;
  onCancelUploadedScript: (
    global: string | null,
    instanceName: string | null,
  ) => void;
  onTransferExecuteOptionsChange: (field: Field, value: any) => void;
};
type TimezoneValue = "local" | "utc";
type State = {
  useAdvancedOptions: boolean;
  timezone: TimezoneValue;
};
@observer
class WizardPageContent extends React.Component<Props, State> {
  state: State = {
    useAdvancedOptions: false,
    timezone: "local",
  };

  optionsRef?: WizardOptions | null;

  componentDidMount() {
    this.props.onContentRef(this);
  }

  componentWillUnmount() {
    this.props.onContentRef(null);
  }

  getProvidersType(type: string) {
    return type === "source"
      ? providerTypes.SOURCE_TRANSFER
      : providerTypes.TARGET_TRANSFER;
  }

  getProviders(direction: string): ProviderTypes[] {
    const validProviders: {
      [provider in ProviderTypes]: true;
    } = {} as { [provider in ProviderTypes]: true };
    const providerType = this.getProvidersType(direction);
    const providersObject = this.props.providerStore.providers;

    if (!providersObject) {
      return [];
    }

    Object.keys(providersObject).forEach(provider => {
      const usableProvider = provider as ProviderTypes;
      if (
        providersObject[usableProvider].types.findIndex(
          t => t === providerType,
        ) > -1
      ) {
        validProviders[usableProvider] = true;
      }
    });

    return this.props.providerStore.providerNames.filter(
      p => validProviders[p],
    );
  }

  areOptionsLoading(type: "source" | "destination"): boolean {
    if (type === "source") {
      return (
        this.props.providerStore.sourceSchemaLoading ||
        this.props.providerStore.sourceOptionsPrimaryLoading ||
        this.props.minionPoolStore.loadingMinionPools
      );
    }
    return (
      this.props.providerStore.destinationSchemaLoading ||
      this.props.providerStore.destinationOptionsPrimaryLoading ||
      this.props.minionPoolStore.loadingMinionPools
    );
  }

  isNetworksPageValid() {
    if (
      this.props.networkStore.loading ||
      this.props.instanceStore.loadingInstancesDetails
    ) {
      return false;
    }

    const instances = this.props.instanceStore.instancesDetails;
    if (instances.length === 0) {
      return true;
    }

    if (instances.find(i => i.devices)) {
      if (instances.find(i => i.devices.nics && i.devices.nics.length > 0)) {
        return (
          this.props.wizardData.networks &&
          this.props.wizardData.networks.length > 0
        );
      }
      return true;
    }

    return false;
  }

  handleAdvancedOptionsToggle(useAdvancedOptions: boolean) {
    this.setState({ useAdvancedOptions });
  }

  handleTimezoneChange(timezone: TimezoneValue) {
    this.setState({ timezone });
  }

  get nextButtonDisabled() {
    if (this.props.nextButtonDisabled) {
      return true;
    }

    switch (this.props.page.id) {
      case "source":
        return !this.props.wizardData.source;
      case "target":
        return !this.props.wizardData.target;
      case "vms":
        return (
          !this.props.wizardData.selectedInstances ||
          !this.props.wizardData.selectedInstances.length
        );
      case "networks":
        return !this.isNetworksPageValid();
      default:
        return false;
    }
  }

  handleNextClick() {
    let goNext = true;
    if (this.optionsRef?.highlightFields()) {
      goNext = false;
    }
    if (goNext) {
      this.props.onNextClick();
    } else {
      notificationStore.alert("Please fill the required fields", "error");
    }
  }

  renderHeader() {
    let title = this.props.page.title;
    const pageId = this.props.page.id;
    if (pageId === "type") {
      title += ` ${
        this.props.type.charAt(0).toUpperCase() + this.props.type.substr(1)
      }`;
    }
    const optionsReload = (type: "source" | "destination") => ({
      label: "Reload Options",
      action: () => {
        this.props.onReloadOptionsClick();
      },
      tip: "Options may be cached by the UI. Here you can reload them from the API.",
      visible: !this.areOptionsLoading(type),
    });
    const reloadPages: any = {
      "source-options": optionsReload("source"),
      "dest-options": optionsReload("destination"),
      networks: {
        label: "Reload Networks",
        action: () => {
          this.props.onReloadNetworksClick();
        },
        tip: "Networks and instances info may be cached by the UI. Here you can reload them from the API.",
        visible: !this.props.instanceStore.loadingInstancesDetails,
      },
    };
    return (
      <Header>
        <HeaderLabel>{title}</HeaderLabel>
        {reloadPages[pageId]?.visible ? (
          <HeaderReload>
            <HeaderReloadLabel
              onClick={() => {
                reloadPages[pageId].action();
              }}
            >
              {reloadPages[pageId].label}
            </HeaderReloadLabel>
            <InfoIcon
              text={reloadPages[pageId].tip}
              marginBottom={0}
              marginLeft={8}
              filled
            />
          </HeaderReload>
        ) : null}
      </Header>
    );
  }

  renderBody() {
    let body = null;

    const getOptionsLoadingSkipFields = (type: "source" | "destination") => {
      const extraOptionsConfig = configLoader.config.extraOptionsApiCalls.find(
        o => {
          const provider =
            type === "source"
              ? this.props.wizardData.source &&
                this.props.wizardData.source.type
              : this.props.wizardData.target &&
                this.props.wizardData.target.type;
          return o.name === provider && o.types.find(t => t === type);
        },
      );
      let optionsLoadingRequiredFields: string[] = [];
      if (extraOptionsConfig) {
        optionsLoadingRequiredFields = extraOptionsConfig.requiredFields;
      }
      return optionsLoadingRequiredFields;
    };

    const getDefaultStorage = (): {
      value: string | null;
      busType?: string | null;
    } => {
      if (this.props.defaultStorage) {
        return this.props.defaultStorage;
      }

      if (endpointStore.storageConfigDefault) {
        const busTypeInfo = EndpointUtils.getBusTypeStorageId(
          endpointStore.storageBackends,
          endpointStore.storageConfigDefault || null,
        );
        const defaultStorage: {
          value: string | null;
          busType?: string | null;
        } = {
          value: busTypeInfo.id,
        };
        if (busTypeInfo.busType) {
          defaultStorage.busType = busTypeInfo.busType;
        }
        return defaultStorage;
      }
      return { value: null };
    };

    switch (this.props.page.id) {
      case "type":
        body = (
          <WizardType
            selected={this.props.type}
            onChange={this.props.onTypeChange}
          />
        );
        break;
      case "source":
        body = (
          <WizardEndpointList
            providers={this.getProviders("source")}
            loading={this.props.providerStore.providersLoading}
            otherEndpoint={this.props.wizardData.target}
            selectedEndpoint={this.props.wizardData.source}
            endpoints={this.props.endpointStore.endpoints}
            onChange={this.props.onSourceEndpointChange}
            onAddEndpoint={type => {
              this.props.onAddEndpoint(type, true);
            }}
          />
        );
        break;
      case "target":
        body = (
          <WizardEndpointList
            providers={this.getProviders("target")}
            loading={this.props.providerStore.providersLoading}
            otherEndpoint={this.props.wizardData.source}
            selectedEndpoint={this.props.wizardData.target}
            endpoints={this.props.endpointStore.endpoints}
            onChange={this.props.onTargetEndpointChange}
            onAddEndpoint={type => {
              this.props.onAddEndpoint(type, false);
            }}
          />
        );
        break;
      case "execute":
        body = (
          <WizardExecuteOptions
            options={[...executeOptionsWithExecuteNow, ...deploymentFields]}
            wizardType={`${this.props.type}-execute`}
            layout="page"
            data={this.props.wizardData.executeOptions}
            onChange={this.props.onTransferExecuteOptionsChange}
          />
        );
        break;
      case "vms":
        body = (
          <WizardInstances
            instances={this.props.instanceStore.instances}
            instancesPerPage={this.props.instanceStore.instancesPerPage}
            chunksLoading={this.props.instanceStore.chunksLoading}
            currentPage={this.props.instanceStore.currentPage}
            searchText={this.props.instanceStore.searchText}
            loading={this.props.instanceStore.instancesLoading}
            searching={this.props.instanceStore.searching}
            searchNotFound={this.props.instanceStore.searchNotFound}
            reloading={this.props.instanceStore.reloading}
            onSearchInputChange={this.props.onInstancesSearchInputChange}
            onReloadClick={this.props.onInstancesReloadClick}
            onInstanceClick={this.props.onInstanceClick}
            onPageClick={this.props.onInstancePageClick}
            selectedInstances={this.props.wizardData.selectedInstances || []}
            hasSourceOptions={this.props.hasSourceOptions}
          />
        );
        break;
      case "source-options":
        body = (
          <WizardOptions
            ref={ref => {
              this.optionsRef = ref;
            }}
            loading={this.areOptionsLoading("source")}
            minionPools={this.props.minionPoolStore.minionPools.filter(
              m =>
                m.platform === "source" &&
                m.endpoint_id === this.props.wizardData.source?.id,
            )}
            optionsLoading={
              this.props.providerStore.sourceOptionsSecondaryLoading
            }
            optionsLoadingSkipFields={getOptionsLoadingSkipFields("source")}
            fields={this.props.providerStore.sourceSchema}
            onChange={this.props.onSourceOptionsChange}
            data={this.props.wizardData.sourceOptions}
            useAdvancedOptions
            hasStorageMap={false}
            wizardType={`${this.props.type}-source-options`}
            layout="page"
            isSource
            dictionaryKey={`${
              this.props.wizardData.source
                ? this.props.wizardData.source.type
                : ""
            }-source`}
          />
        );
        break;
      case "dest-options":
        body = (
          <WizardOptions
            ref={ref => {
              this.optionsRef = ref;
            }}
            loading={this.areOptionsLoading("destination")}
            minionPools={this.props.minionPoolStore.minionPools.filter(
              m =>
                m.platform === "destination" &&
                m.endpoint_id === this.props.wizardData.target?.id,
            )}
            optionsLoading={
              this.props.providerStore.destinationOptionsSecondaryLoading
            }
            optionsLoadingSkipFields={[
              ...getOptionsLoadingSkipFields("destination"),
              "title",
            ]}
            selectedInstances={this.props.wizardData.selectedInstances}
            showSeparatePerVm={Boolean(
              this.props.wizardData.selectedInstances &&
                this.props.wizardData.selectedInstances.length > 1,
            )}
            fields={this.props.providerStore.destinationSchema}
            onChange={this.props.onDestOptionsChange}
            data={this.props.wizardData.destOptions}
            useAdvancedOptions={this.state.useAdvancedOptions}
            hasStorageMap={this.props.hasStorageMap}
            storageBackends={this.props.endpointStore.storageBackends}
            wizardType={this.props.type}
            onAdvancedOptionsToggle={useAdvancedOptions => {
              this.handleAdvancedOptionsToggle(useAdvancedOptions);
            }}
            layout="page"
            dictionaryKey={`${
              this.props.wizardData.target
                ? this.props.wizardData.target.type
                : ""
            }-destination`}
            executeNowOptionsDisabled={
              !this.props.providerStore.hasExecuteNowOptions(
                this.props.wizardData.source!.type,
              )
            }
          />
        );
        break;
      case "networks":
        body = (
          <WizardNetworks
            networks={this.props.networkStore.networks}
            selectedNetworks={this.props.wizardData.networks}
            loading={this.props.networkStore.loading}
            instancesDetails={this.props.instanceStore.instancesDetails}
            loadingInstancesDetails={
              this.props.instanceStore.loadingInstancesDetails
            }
            onChange={this.props.onNetworkChange}
          />
        );
        break;
      case "storage":
        body = (
          <WizardStorage
            loading={endpointStore.storageLoading}
            onReloadClick={this.props.onStorageReloadClick}
            storageBackends={this.props.endpointStore.storageBackends}
            instancesDetails={this.props.instanceStore.instancesDetails}
            storageMap={this.props.storageMap}
            onChange={this.props.onStorageChange}
            defaultStorage={getDefaultStorage()}
            onDefaultStorageChange={this.props.onDefaultStorageChange}
            defaultStorageLayout="page"
          />
        );
        break;
      case "scripts":
        body = (
          <WizardScripts
            instances={this.props.instanceStore.instancesDetails}
            onScriptUpload={this.props.onUserScriptUpload}
            onCancelScript={this.props.onCancelUploadedScript}
            uploadedScripts={this.props.uploadedUserScripts}
            userScriptData={null}
            removedScripts={[]}
            onScriptDataRemove={() => {}}
          />
        );
        break;
      case "schedule":
        body = (
          <Schedule
            disableExecutionOptions={configLoader.config.providersDisabledExecuteOptions.some(
              p => p === this.props.wizardData.source?.type,
            )}
            schedules={this.props.schedules}
            onAddScheduleClick={this.props.onAddScheduleClick}
            onChange={this.props.onScheduleChange}
            onRemove={this.props.onScheduleRemove}
            timezone={this.state.timezone}
            onTimezoneChange={timezone => {
              this.handleTimezoneChange(timezone);
            }}
            secondaryEmpty
          />
        );
        break;
      case "summary":
        body = (
          <WizardSummary
            data={this.props.wizardData}
            schedules={this.props.schedules}
            defaultStorage={this.props.defaultStorage}
            storageMap={this.props.storageMap}
            wizardType={this.props.type}
            instancesDetails={this.props.instanceStore.instancesDetails}
            sourceSchema={this.props.providerStore.sourceSchema}
            destinationSchema={this.props.providerStore.destinationSchema}
            uploadedUserScripts={this.props.uploadedUserScripts}
            minionPools={this.props.minionPoolStore.minionPools}
            executionOptions={[
              ...executeOptionsWithExecuteNow,
              ...deploymentFields,
            ]}
          />
        );
        break;
      default:
    }

    return <Body>{body}</Body>;
  }

  renderNavigationActions() {
    const sourceEndpoint =
      this.props.wizardData.source && this.props.wizardData.source.type;
    const targetEndpoint =
      this.props.wizardData.target && this.props.wizardData.target.type;
    const currentPageIndex = wizardPages.findIndex(
      p => p.id === this.props.page.id,
    );
    const isLastPage = currentPageIndex === wizardPages.length - 1;

    return (
      <Navigation>
        <Button secondary onClick={this.props.onBackClick}>
          Back
        </Button>
        <IconRepresentation>
          <EndpointLogos height={32} endpoint={(sourceEndpoint || "") as any} />
          <WizardTypeIcon
            dangerouslySetInnerHTML={{
              __html:
                this.props.type === "replica"
                  ? transferItemIcon(ThemePalette.alert)
                  : transferItemIcon(ThemePalette.primary),
            }}
          />
          <EndpointLogos height={32} endpoint={targetEndpoint} />
        </IconRepresentation>
        {this.props.showLoadingButton ? (
          <LoadingButton>Loading ...</LoadingButton>
        ) : (
          <Button
            onClick={() => {
              this.handleNextClick();
            }}
            disabled={this.nextButtonDisabled}
          >
            {isLastPage ? "Finish" : "Next"}
          </Button>
        )}
      </Navigation>
    );
  }

  render() {
    if (!this.props.page) {
      return null;
    }

    return (
      <Wrapper>
        {this.renderHeader()}
        {this.renderBody()}
        <Footer>
          {this.renderNavigationActions()}
          <WizardBreadcrumbs
            selected={this.props.page}
            pages={this.props.pages}
          />
        </Footer>
      </Wrapper>
    );
  }
}

export default WizardPageContent;
