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

import { Disk, Instance, InstanceUtils } from "@src/@types/Instance";
import { ThemePalette, ThemeProps } from "@src/components/Theme";
import Button from "@src/components/ui/Button";
import AutocompleteDropdown from "@src/components/ui/Dropdowns/AutocompleteDropdown";
import Dropdown from "@src/components/ui/Dropdowns/Dropdown";
import InfoIcon from "@src/components/ui/InfoIcon";
import StatusImage from "@src/components/ui/StatusComponents/StatusImage";

import arrowImage from "./images/arrow.svg";
import backendImage from "./images/backend.svg";
import diskImage from "./images/disk.svg";
import bigStorageImage from "./images/storage-big.svg";

import type { StorageBackend, StorageMap } from "@src/@types/Endpoint";

const Wrapper = styled.div<any>`
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
`;
const Mapping = styled.div<any>`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;
const StorageWrapper = styled.div<any>`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
`;
const StorageSection = styled.div<any>`
  margin-bottom: 16px;
  font-size: 24px;
  font-weight: ${ThemeProps.fontWeights.light};
`;
const StorageItems = styled.div<any>`
  display: flex;
  flex-direction: column;
`;
const StorageItem = styled.div<any>`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  border-top: 1px solid ${ThemePalette.grayscale[1]};
  padding: 8px 0;

  &:last-child {
    border-bottom: 1px solid ${ThemePalette.grayscale[1]};
  }
`;
const StorageImage = styled.div<any>`
  ${ThemeProps.exactSize("48px")}
  background: url('
    ${props => (props.backend ? backendImage : diskImage)}
  ') center no-repeat;
  margin-right: 16px;
`;
const StorageTitle = styled.div<any>`
  width: ${props => props.width}px;
`;
const StorageName = styled.div<any>`
  font-size: 16px;
  word-break: break-word;
`;
const StorageSubtitle = styled.div<any>`
  font-size: 12px;
  color: ${ThemePalette.grayscale[5]};
  margin-top: 1px;
  word-break: break-word;
`;
const ArrowImage = styled.div<any>`
  min-width: 32px;
  ${ThemeProps.exactHeight("16px")}
  background: url('${arrowImage}') center no-repeat;
  flex-grow: 1;
  margin-right: 16px;
`;
const Dropdowns = styled.div<any>`
  > div {
    margin-bottom: 16px;
    &:last-child {
      margin-bottom: 0;
    }
  }
`;
const DefaultDropdowns = styled.div<any>`
  display: flex;
  margin-bottom: 0;
  margin-left: -16px;
  > div {
    margin-left: 16px;
  }
`;
const NoStorageMessage = styled.div<any>`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 64px;
  width: 440px;
`;
const BigStorageImage = styled.div<any>`
  margin-bottom: 46px;
  ${ThemeProps.exactSize("96px")}
  background: url('${bigStorageImage}') center no-repeat;
`;
const NoStorageTitle = styled.div<any>`
  margin-bottom: 10px;
  font-size: 18px;
`;
const NoStorageSubtitle = styled.div`
  color: ${ThemePalette.grayscale[4]};
  text-align: center;
  margin-bottom: 42px;
`;
const DiskDisabledMessage = styled.div<any>`
  width: 224px;
  text-align: center;
  color: gray;
`;
const LoadingWrapper = styled.div`
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const LoadingText = styled.div`
  margin-top: 38px;
  font-size: 18px;
`;

export const getDisks = (
  instancesDetails: Instance[],
  type: "backend" | "disk",
  storageMap?: StorageMap[] | null
): Disk[] => {
  const fieldName = type === "backend" ? "storage_backend_identifier" : "id";

  let disks: Disk[] = [];
  instancesDetails.forEach(instance => {
    if (!instance.devices || !instance.devices.disks) {
      return;
    }
    instance.devices.disks.forEach(disk => {
      if (disks.find(d => d[fieldName] === disk[fieldName])) {
        return;
      }
      disks.push(disk);
    });
  });
  if (disks.length === 0 && storageMap && storageMap.length) {
    disks = storageMap.map(sm => sm.source);
  }
  return disks;
};

export type Props = {
  storageBackends: StorageBackend[];
  loading: boolean;
  onReloadClick?: () => void;
  instancesDetails: Instance[];
  storageMap: StorageMap[] | null | undefined;
  defaultStorageLayout: "modal" | "page";
  defaultStorage: { value: string | null; busType?: string | null };
  onDefaultStorageChange: (
    value: string | null,
    busType?: string | null
  ) => void;
  onChange: (newMapping: StorageMap) => void;
  onScrollableRef?: (ref: HTMLElement) => void;
  style?: any;
  titleWidth?: number;
};
@observer
class WizardStorage extends React.Component<Props> {
  renderNoStorage() {
    return (
      <NoStorageMessage>
        <BigStorageImage />
        <NoStorageTitle>No storage backends were found</NoStorageTitle>
        <NoStorageSubtitle>
          We could not find any storage backends. Coriolis will skip this step.
        </NoStorageSubtitle>
        {this.props.onReloadClick ? (
          <Button hollow onClick={this.props.onReloadClick}>
            Try again
          </Button>
        ) : null}
      </NoStorageMessage>
    );
  }

  renderDisabledDisk(disk: Disk) {
    return (
      <DiskDisabledMessage>
        {disk.disabled!.message}
        {disk.disabled!.info ? <InfoIcon text={disk.disabled!.info} /> : null}
      </DiskDisabledMessage>
    );
  }

  renderStorageDropdown(opts: {
    storageItems: Array<StorageBackend>;
    selectedItem: StorageBackend | null | undefined;
    disk: Disk;
    type: "backend" | "disk";
  }) {
    const { storageItems, selectedItem, disk, type } = opts;
    return storageItems.length > 10 ? (
      <AutocompleteDropdown
        width={ThemeProps.inputSizes.large.width}
        selectedItem={selectedItem}
        items={storageItems}
        onChange={(item: StorageBackend) => {
          this.props.onChange({ source: disk, target: item, type });
        }}
        labelField="name"
        valueField="id"
      />
    ) : (
      <Dropdown
        width={ThemeProps.inputSizes.large.width}
        centered
        noSelectionMessage="Default"
        noItemsMessage="No storage found"
        selectedItem={selectedItem}
        items={storageItems}
        labelField="name"
        valueField="id"
        onChange={(item: StorageBackend) => {
          this.props.onChange({ source: disk, target: item, type });
        }}
      />
    );
  }

  renderStorageWrapper(disks: Disk[], type: "backend" | "disk") {
    const title =
      type === "backend" ? "Storage Backend Mapping" : "Disk Mapping";
    const diskFieldName =
      type === "backend" ? "storage_backend_identifier" : "id";
    const storageMap = this.props.storageMap;
    const storageItems = [
      { name: "Default", id: null },
      ...this.props.storageBackends,
    ];

    const usableDisks = disks.filter(d => d[diskFieldName]);

    const parseDiskName = (name?: string | null): [string | null, boolean] => {
      if (!name) {
        return [null, false];
      }
      const slashPaths = name.split("/");
      const dashPaths = name.split("-");
      if (slashPaths.length < 4 && dashPaths.length < 4) {
        return [name, false];
      }
      if (slashPaths.length >= 4) {
        return [
          `.../${slashPaths
            .filter((_, i) => i > slashPaths.length - 4)
            .join("/")}`,
          true,
        ];
      }
      return [`${dashPaths[0]}-...-${dashPaths[dashPaths.length - 1]}`, true];
    };

    return (
      <StorageWrapper>
        <StorageSection>{title}</StorageSection>
        <StorageItems>
          {usableDisks.map(disk => {
            const connectedToInstances = this.props.instancesDetails
              .filter(i => {
                if (!i.devices || !i.devices.disks) {
                  return false;
                }
                if (
                  i.devices.disks.find(
                    d => d[diskFieldName] === disk[diskFieldName]
                  )
                ) {
                  return true;
                }
                return false;
              })
              .map(
                instance =>
                  `${instance.name} (${InstanceUtils.shortenId(
                    instance.instance_name || instance.id
                  )})`
              );

            const selectedStorageMapping = storageMap?.find(
              s =>
                s.type === type &&
                String(s.source[diskFieldName]) === String(disk[diskFieldName])
            );
            const diskNameParsed = parseDiskName(disk[diskFieldName]);
            return (
              <StorageItem key={disk[diskFieldName]}>
                <StorageImage backend={type === "backend"} />
                <StorageTitle width={this.props.titleWidth || 320}>
                  <StorageName
                    title={diskNameParsed[1] ? disk[diskFieldName] : null}
                  >
                    {diskNameParsed[0]}
                  </StorageName>
                  {connectedToInstances.length ? (
                    <StorageSubtitle>
                      {`Connected to ${connectedToInstances.join(", ")}`}
                    </StorageSubtitle>
                  ) : null}
                </StorageTitle>
                <ArrowImage />
                <Dropdowns>
                  {disk.disabled && type === "disk" ? (
                    this.renderDisabledDisk(disk)
                  ) : (
                    <>
                      {this.renderStorageDropdown({
                        storageItems,
                        selectedItem: selectedStorageMapping?.target,
                        disk,
                        type,
                      })}
                      {/* {this.renderBusTypeDropdown(selectedStorageMapping)} */}
                    </>
                  )}
                </Dropdowns>
              </StorageItem>
            );
          })}
        </StorageItems>
      </StorageWrapper>
    );
  }

  renderBackendMapping() {
    const disks = getDisks(
      this.props.instancesDetails,
      "backend",
      this.props.storageMap
    );

    if (disks.length === 0 || this.props.storageBackends.length === 0) {
      return null;
    }

    return this.renderStorageWrapper(disks, "backend");
  }

  renderDiskMapping() {
    const disks = getDisks(
      this.props.instancesDetails,
      "disk",
      this.props.storageMap
    );

    if (disks.length === 0 || this.props.storageBackends.length === 0) {
      return this.renderNoStorage();
    }

    return this.renderStorageWrapper(disks, "disk");
  }

  renderDefaultStorage() {
    const disks = getDisks(
      this.props.instancesDetails,
      "disk",
      this.props.storageMap
    );

    if (disks.length === 0 || this.props.storageBackends.length === 0) {
      return null;
    }

    const renderDropdown = () => {
      let items: { label: string; value: string | null }[] =
        this.props.storageBackends.map(s => ({
          label: s.name,
          value: s.name,
        }));
      items = [{ label: "Choose a value", value: null }, ...items];
      const selectedItem = items.find(
        i => i.value === this.props.defaultStorage.value
      );
      const commonProps = {
        width: ThemeProps.inputSizes.regular.width,
        selectedItem,
        items,
        onChange: (item: { value: string | null }) =>
          this.props.onDefaultStorageChange(item.value),
      };
      return items.length > 10 ? (
        <AutocompleteDropdown
          {...commonProps}
          dimNullValue
        />
      ) : (
        <Dropdown
          {...commonProps}
          noSelectionMessage="Choose a value"
          dimFirstItem
        />
      );
    };

    return (
      <StorageWrapper>
        <StorageSection>
          Default Storage
          <InfoIcon
            text="Storage type on the destination to default to"
            marginLeft={8}
            marginBottom={0}
          />
        </StorageSection>
        <StorageItems>
          <StorageItem>
            <StorageImage backend="backend" />
            <StorageTitle width={this.props.titleWidth || 320}>
              <StorageName>
                <DefaultDropdowns>
                  {renderDropdown()}
                  {/* {renderDefaultBusTypeDropdown()} */}
                </DefaultDropdowns>
              </StorageName>
            </StorageTitle>
          </StorageItem>
        </StorageItems>
      </StorageWrapper>
    );
  }

  renderLoading() {
    return (
      <LoadingWrapper>
        <StatusImage loading />
        <LoadingText>Loading storage...</LoadingText>
      </LoadingWrapper>
    );
  }

  render() {
    return (
      <Wrapper style={this.props.style} ref={this.props.onScrollableRef}>
        {this.props.loading ? (
          this.renderLoading()
        ) : (
          <Mapping>
            {this.renderDefaultStorage()}
            {this.renderBackendMapping()}
            {this.renderDiskMapping()}
          </Mapping>
        )}
      </Wrapper>
    );
  }
}

export default WizardStorage;
