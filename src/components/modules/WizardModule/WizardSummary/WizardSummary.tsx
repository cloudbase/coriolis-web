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

import { Info } from "luxon";
import { observer } from "mobx-react";
import React from "react";
import styled from "styled-components";

import fieldHelper from "@src/@types/Field";
import { MinionPool } from "@src/@types/MinionPool";
import { ProviderTypes } from "@src/@types/Providers";
import { INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS } from "@src/components/modules/WizardModule/WizardOptions";
import { getDisks } from "@src/components/modules/WizardModule/WizardStorage";
import { ThemePalette, ThemeProps } from "@src/components/Theme";
import StatusPill from "@src/components/ui/StatusComponents/StatusPill";
import { migrationFields } from "@src/constants";
import configLoader from "@src/utils/Config";
import DateUtils from "@src/utils/DateUtils";
import LabelDictionary from "@src/utils/LabelDictionary";

import networkArrowImage from "./images/network-arrow.svg";

import type { Schedule } from "@src/@types/Schedule";
import type { WizardData } from "@src/@types/WizardData";
import type { StorageMap, StorageBackend } from "@src/@types/Endpoint";
import type { Instance, Disk, InstanceScript } from "@src/@types/Instance";
import type { Field } from "@src/@types/Field";

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;
const Column = styled.div`
  ${ThemeProps.exactWidth("calc(50% - 80px)")}
`;
const Section = styled.div<any>`
  margin-bottom: 42px;

  &:last-child {
    margin-bottom: 0;
  }
`;
const SectionTitle = styled.div<any>`
  font-size: 24px;
  font-weight: ${ThemeProps.fontWeights.light};
  margin-bottom: 16px;
`;
const Overview = styled.div<any>``;
const OverviewLabel = styled.div<any>`
  font-size: 10px;
  font-weight: ${ThemeProps.fontWeights.medium};
  text-transform: uppercase;
  color: ${ThemePalette.grayscale[5]};
  margin-bottom: 4px;
`;
const OverviewRow = styled.div<any>`
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
`;
const OverviewRowData = styled.div<any>`
  display: flex;
`;
const OverviewRowLabel = styled.div<any>`
  margin-left: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const Table = styled.div<any>``;
const Row = styled.div<any>`
  display: flex;
  flex-direction: ${props => props.direction || "column"};
  padding: 8px 0;
  border-top: 1px solid ${ThemePalette.grayscale[1]};
  color: ${ThemePalette.grayscale[4]};

  &:last-child {
    border-bottom: 1px solid ${ThemePalette.grayscale[1]};
  }
`;
const ScriptFileName = styled.div<any>`
  max-width: 124px;
  text-overflow: ellipsis;
  overflow: hidden;
  margin-left: 16px;
  white-space: nowrap;
  flex-shrink: 0;
`;
const InstanceRowTitle = styled.div<any>`
  margin-bottom: 4px;
`;
const InstanceRowSubtitle = styled.div<any>`
  font-size: 10px;
  color: ${ThemePalette.grayscale[5]};
  margin-bottom: 4px;
  &:last-child {
    margin-bottom: 0;
  }
`;
const SourceNetwork = styled.div<any>`
  width: 50%;
  margin-right: 16px;
  overflow-wrap: break-word;
`;
const NetworkArrow = styled.div<any>`
  width: 32px;
  height: 16px;
  background: url("${networkArrowImage}") center no-repeat;
`;
const TargetNetwork = styled.div<any>`
  width: 50%;
  text-align: right;
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  margin-top: -16px;
`;
const TargetNetworkName = styled.div<any>`
  width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  margin-top: 8px;
  &:first-child {
    margin-top: 16px;
  }
`;
const OptionsList = styled.div<any>``;
const Option = styled.div<any>`
  display: flex;
  margin-bottom: 8px;
`;
const OptionLabel = styled.div<any>`
  color: ${ThemePalette.grayscale[4]};
  ${ThemeProps.exactWidth("50%")}
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const OptionValue = styled.div<any>`
  text-align: right;
  ${ThemeProps.exactWidth("50%")}
  text-overflow: ellipsis;
  overflow: hidden;
`;
const ObjectTable = styled.div`
  margin-top: 24px;
`;
const ObjectTableTitle = styled.div`
  margin-bottom: 8px;
`;

type Props = {
  data: WizardData;
  wizardType: "replica" | "migration";
  schedules: Schedule[];
  minionPools: MinionPool[];
  defaultStorage: { value: string | null; busType?: string | null } | undefined;
  storageMap: StorageMap[];
  instancesDetails: Instance[];
  sourceSchema: Field[];
  destinationSchema: Field[];
  uploadedUserScripts: InstanceScript[];
};
@observer
class WizardSummary extends React.Component<Props> {
  getDefaultBooleanOption(fieldName: string, defaultValue: boolean): boolean {
    if (!this.props.data.destOptions) {
      return defaultValue;
    }

    if (this.props.data.destOptions[fieldName] != null) {
      return this.props.data.destOptions[fieldName];
    }

    return defaultValue;
  }

  renderScheduleLabel(schedule: Schedule) {
    const scheduleInfo = schedule.schedule;
    let monthLabel;
    if (!scheduleInfo) {
      return null;
    }

    if (scheduleInfo.month == null) {
      monthLabel = "Every month";
    } else {
      monthLabel = `Every ${
        Info.months()[scheduleInfo.month ? scheduleInfo.month - 1 : 0]
      }`;
    }

    let dayOfMonthLabel;
    if (scheduleInfo.dom == null) {
      dayOfMonthLabel = "every day";
    } else {
      dayOfMonthLabel = `every ${DateUtils.getOrdinalDay(scheduleInfo.dom)}`;
    }

    let dayOfWeekLabel;
    if (scheduleInfo.dow == null) {
      dayOfWeekLabel = "every weekday";
    } else {
      dayOfWeekLabel = `every ${Info.weekdays()[scheduleInfo.dow]}`;
    }

    const padNumber = (number: number) =>
      (number || 0) < 10 ? `0${number || 0}` : (number || 0).toString();
    let timeLabel;
    if (scheduleInfo.minute == null) {
      if (scheduleInfo.hour == null) {
        timeLabel = "every hour, every minute";
      } else {
        timeLabel = `at ${padNumber(
          scheduleInfo.hour
        )} o'clock, every minute UTC`;
      }
    } else if (scheduleInfo.hour == null) {
      timeLabel = `every hour, at minute ${padNumber(scheduleInfo.minute)} UTC`;
    } else {
      timeLabel = `at ${padNumber(scheduleInfo.hour)}:${padNumber(
        scheduleInfo.minute
      )} UTC`;
    }

    return `${monthLabel}, ${dayOfMonthLabel}, ${dayOfWeekLabel}, ${timeLabel}`;
  }

  renderScheduleSection() {
    const schedules = this.props.schedules;
    if (
      this.props.wizardType !== "replica" ||
      !schedules ||
      schedules.length === 0
    ) {
      return null;
    }

    return (
      <Section>
        <SectionTitle>Schedule</SectionTitle>
        <Table>
          {schedules.map(schedule => (
            <Row key={schedule.id} schedule>
              {this.renderScheduleLabel(schedule)}
            </Row>
          ))}
        </Table>
      </Section>
    );
  }

  renderSourceOptionsSection() {
    const data = this.props.data;
    const type =
      this.props.wizardType.charAt(0).toUpperCase() +
      this.props.wizardType.substr(1);
    const provider =
      this.props.data && this.props.data.source && this.props.data.source.type;

    if (!data.sourceOptions) {
      return null;
    }
    return (
      <Section>
        <SectionTitle>{type} Source Options</SectionTitle>
        <OptionsList>
          {data.sourceOptions
            ? Object.keys(data.sourceOptions).map(optionName => {
                if (
                  !data.sourceOptions ||
                  data.sourceOptions[optionName] == null ||
                  data.sourceOptions[optionName] === "" ||
                  typeof data.sourceOptions[optionName] === "object"
                ) {
                  return null;
                }
                const optionLabel = optionName
                  .split("/")
                  .map(n =>
                    LabelDictionary.get(
                      n,
                      `${data.source ? data.source.type : ""}-source`
                    )
                  )
                  .join(" - ");
                const optionValue = fieldHelper.getValueAlias({
                  name: optionName,
                  value: data.sourceOptions?.[optionName],
                  fields: this.props.sourceSchema,
                  targetProvider: provider,
                });
                return (
                  <Option key={optionName}>
                    <OptionLabel title={optionLabel}>{optionLabel}</OptionLabel>
                    <OptionValue title={optionValue}>{optionValue}</OptionValue>
                  </Option>
                );
              })
            : null}
          {this.renderObjectTable(
            data.sourceOptions,
            this.props.sourceSchema,
            provider
          )}
        </OptionsList>
      </Section>
    );
  }

  renderObjectTable(
    options: any,
    schema: Field[],
    provider?: ProviderTypes | null
  ) {
    if (!options) {
      return null;
    }
    const objectKeys: string[] = Object.keys(options).filter(
      key =>
        typeof options[key] === "object" &&
        key !== INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS
    );

    return objectKeys.map(key =>
      options[key] != null ? (
        <ObjectTable key={key}>
          <ObjectTableTitle>{LabelDictionary.get(key)}</ObjectTableTitle>
          {Object.keys(options[key]).map(propertyName => {
            const value = options[key][propertyName];
            if (value == null || value === "") {
              return null;
            }

            let optionValue;
            if (
              key.indexOf("password") > -1 ||
              propertyName.indexOf("password") > -1
            ) {
              optionValue = "•••••••••";
            } else {
              optionValue = fieldHelper.getValueAlias({
                name: propertyName,
                value,
                fields: schema,
                targetProvider: provider,
              });
            }

            return (
              <Option key={propertyName}>
                <OptionLabel title={propertyName}>
                  {LabelDictionary.get(propertyName)}
                </OptionLabel>
                <OptionValue title={options[key][propertyName]}>
                  {optionValue}
                </OptionValue>
              </Option>
            );
          })}
        </ObjectTable>
      ) : null
    );
  }

  renderMinionPoolMapping() {
    const allMappings =
      this.props.data.destOptions?.[INSTANCE_OSMORPHING_MINION_POOL_MAPPINGS];
    if (!allMappings) {
      return null;
    }
    const mappings: any = {};
    Object.keys(allMappings).forEach(map => {
      if (allMappings[map]) {
        mappings[map] = allMappings[map];
      }
    });

    if (!Object.keys(mappings).length) {
      return null;
    }

    const getMinionPoolName = (id: string) => {
      const minionPool = this.props.minionPools.find(m => m.id === id);
      return minionPool?.name || id;
    };

    return (
      <ObjectTable>
        <ObjectTableTitle>
          Instance OSMorphing Minion Pool Mappings
        </ObjectTableTitle>
        {Object.keys(mappings).map(instanceId => {
          const instanceName =
            this.props.instancesDetails.find(
              i => i.instance_name === instanceId || i.id === instanceId
            )?.name || instanceId;
          return (
            <Option key={instanceId}>
              <OptionLabel title={instanceName}>{instanceName}</OptionLabel>
              <OptionValue title={mappings[instanceId]}>
                {getMinionPoolName(mappings[instanceId])}
              </OptionValue>
            </Option>
          );
        })}
      </ObjectTable>
    );
  }

  renderTargetOptionsSection() {
    const data = this.props.data;
    const provider = data?.target?.type;
    const type =
      this.props.wizardType.charAt(0).toUpperCase() +
      this.props.wizardType.substr(1);

    const executeNowOption = (
      <Option>
        <OptionLabel>Execute now?</OptionLabel>
        <OptionValue>
          {this.getDefaultBooleanOption("execute_now", true) ? "Yes" : "No"}
        </OptionValue>
      </Option>
    );

    const separateVmOption = (
      <Option>
        <OptionLabel>Separate {type}/VM?</OptionLabel>
        <OptionValue>
          {this.getDefaultBooleanOption("separate_vm", true) ? "Yes" : "No"}
        </OptionValue>
      </Option>
    );

    const migrationOptions = [
      <Option key="shutdown">
        <OptionLabel>Shutdown Instances</OptionLabel>
        <OptionValue>
          {this.getDefaultBooleanOption("shutdown_instances", false)
            ? "Yes"
            : "No"}
        </OptionValue>
      </Option>,
      <Option key="count">
        <OptionLabel>Replication Count</OptionLabel>
        <OptionValue>
          {(this.props.data.destOptions &&
            this.props.data.destOptions.replication_count) ||
            2}
        </OptionValue>
      </Option>,
    ];

    const renderDefaultStorageOption = () => (
      <Option>
        <OptionLabel>Default Storage</OptionLabel>
        <OptionValue>
          {this.props.defaultStorage!.value}
          {this.props.defaultStorage!.busType ? (
            <>
              <br />
              Bus Type: {this.props.defaultStorage!.busType}
            </>
          ) : null}
        </OptionValue>
      </Option>
    );

    return (
      <Section>
        <SectionTitle>{type} Target Options</SectionTitle>
        <OptionsList>
          {this.props.wizardType === "replica" ? executeNowOption : null}
          {this.props.wizardType === "migration" ? migrationOptions : null}
          {this.props.data.selectedInstances &&
          this.props.data.selectedInstances.length > 1
            ? separateVmOption
            : null}
          {this.props.defaultStorage ? renderDefaultStorageOption() : null}
          {data.destOptions
            ? Object.keys(data.destOptions).map(optionName => {
                if (
                  optionName === "execute_now" ||
                  optionName === "separate_vm" ||
                  migrationFields.find(f => f.name === optionName) ||
                  !data.destOptions ||
                  data.destOptions[optionName] == null ||
                  data.destOptions[optionName] === "" ||
                  typeof data.destOptions[optionName] === "object"
                ) {
                  return null;
                }

                const optionLabel = optionName
                  .split("/")
                  .map(n =>
                    LabelDictionary.get(
                      n,
                      `${data.target ? data.target.type : ""}-destination`
                    )
                  )
                  .join(" - ");

                const optionValue = fieldHelper.getValueAlias({
                  name: optionName,
                  value: data.destOptions?.[optionName],
                  fields: this.props.destinationSchema,
                  targetProvider: provider,
                });

                return (
                  <Option key={optionName}>
                    <OptionLabel title={optionLabel}>{optionLabel}</OptionLabel>
                    <OptionValue title={optionValue}>{optionValue}</OptionValue>
                  </Option>
                );
              })
            : null}
          {this.renderMinionPoolMapping()}
          {this.renderObjectTable(
            data.destOptions,
            this.props.destinationSchema,
            provider
          )}
        </OptionsList>
      </Section>
    );
  }

  renderStorageSection(type: "backend" | "disk") {
    const storageMap = this.props.storageMap.filter(
      mapping => mapping.type === type
    );
    const disks = getDisks(this.props.instancesDetails, type);

    if (disks.length === 0 || storageMap.length === 0) {
      return null;
    }
    const fieldName = type === "backend" ? "storage_backend_identifier" : "id";

    let fullStorageMap: {
      source: Disk;
      target: StorageBackend | null;
      busType?: string | null;
    }[] = disks
      .filter(d => d[fieldName])
      .map(disk => {
        const diskMapped = storageMap.find(
          s => s.source[fieldName] === disk[fieldName]
        );
        if (diskMapped) {
          return {
            source: diskMapped.source,
            target: diskMapped.target,
            busType: diskMapped.targetBusType,
          };
        }
        return { source: disk, target: null };
      });

    fullStorageMap.sort((m1, m2) =>
      String(m1.source[fieldName]).localeCompare(String(m2.source[fieldName]))
    );
    fullStorageMap = fullStorageMap.filter(fsm => fsm.target && fsm.target.id);
    const title =
      type === "backend" ? "Storage Backend Mapping" : "Disk Mapping";

    if (fullStorageMap.length === 0) {
      return null;
    }

    return (
      <Section>
        <SectionTitle>{title}</SectionTitle>
        <Table>
          {fullStorageMap
            .filter(m => m.target)
            .map(mapping => (
              <Row
                key={`${type}-${mapping.source[fieldName] || ""}-${
                  mapping.target ? mapping.target.name : ""
                }`}
                direction="row"
              >
                <SourceNetwork>{mapping.source[fieldName]}</SourceNetwork>
                <NetworkArrow />
                <TargetNetwork>
                  <TargetNetworkName>
                    {mapping.target ? mapping.target.name : "Default"}
                  </TargetNetworkName>
                  {mapping.busType ? (
                    <TargetNetworkName>
                      Bus Type: {mapping.busType}
                    </TargetNetworkName>
                  ) : null}
                </TargetNetwork>
              </Row>
            ))}
        </Table>
      </Section>
    );
  }

  renderNetworksSection() {
    const data = this.props.data;

    if (data.networks == null) {
      return null;
    }

    return (
      <Section>
        <SectionTitle>Networks</SectionTitle>
        <Table>
          {data.networks.map(mapping => (
            <Row key={mapping.sourceNic.network_name} direction="row">
              <SourceNetwork>{mapping.sourceNic.network_name}</SourceNetwork>
              <NetworkArrow />
              <TargetNetwork>
                <TargetNetworkName>
                  {mapping.targetNetwork!.name}
                </TargetNetworkName>
                {mapping.targetSecurityGroups?.length ? (
                  <TargetNetworkName>
                    Security Groups:{" "}
                    {mapping.targetSecurityGroups
                      .map(s => (typeof s === "string" ? s : s.name))
                      .join(", ")}
                  </TargetNetworkName>
                ) : null}
                {mapping.targetPortKey ? (
                  <TargetNetworkName>
                    Port Key: {mapping.targetPortKey}
                  </TargetNetworkName>
                ) : null}
              </TargetNetwork>
            </Row>
          ))}
        </Table>
      </Section>
    );
  }

  renderInstancesSection() {
    const data = this.props.data;

    return (
      <Section>
        <SectionTitle>Instances</SectionTitle>
        <Table>
          {data.selectedInstances
            ? data.selectedInstances.map(instance => {
                const flavorName = instance.flavor_name
                  ? `/${instance.flavor_name}`
                  : "";
                return (
                  <Row key={instance.id}>
                    <InstanceRowTitle>{instance.name}</InstanceRowTitle>
                    <InstanceRowSubtitle>
                      {instance.instance_name || instance.id}
                    </InstanceRowSubtitle>
                    <InstanceRowSubtitle>{`${instance.num_cpu}vCPU/${instance.memory_mb}MB${flavorName}`}</InstanceRowSubtitle>
                  </Row>
                );
              })
            : null}
        </Table>
      </Section>
    );
  }

  renderUserScripts() {
    if (this.props.uploadedUserScripts.length === 0) {
      return null;
    }

    return (
      <Section>
        <SectionTitle>Uploaded User Scripts</SectionTitle>
        <Table>
          {this.props.uploadedUserScripts.map(s => (
            <Row
              key={s.instanceId || s.global || undefined}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                flexShrink: 0,
                alignItems: "center",
              }}
            >
              <InstanceRowTitle>
                {s.global
                  ? s.global === "windows"
                    ? "Global Windows Script"
                    : "Global Linux Script"
                  : s.instanceId}
              </InstanceRowTitle>
              <ScriptFileName title={s.fileName}>{s.fileName}</ScriptFileName>
            </Row>
          ))}
        </Table>
      </Section>
    );
  }

  renderOverviewSection() {
    const data = this.props.data;
    const type =
      this.props.wizardType.charAt(0).toUpperCase() +
      this.props.wizardType.substr(1);
    return (
      <Section>
        <SectionTitle>Overview</SectionTitle>
        <Overview>
          <OverviewRow>
            <OverviewLabel>Source</OverviewLabel>
            <OverviewRowData>
              <StatusPill
                secondary
                small
                label={configLoader.config.providerNames[data.source!.type]}
              />
              <OverviewRowLabel>
                {data.source ? data.source.name : ""}
              </OverviewRowLabel>
            </OverviewRowData>
          </OverviewRow>
          <OverviewRow>
            <OverviewLabel>Target</OverviewLabel>
            <OverviewRowData>
              <StatusPill
                secondary
                small
                label={configLoader.config.providerNames[data.target!.type]}
              />
              <OverviewRowLabel>
                {data.target && data.target.name}
              </OverviewRowLabel>
            </OverviewRowData>
          </OverviewRow>
          <OverviewRow>
            <OverviewLabel>Type</OverviewLabel>
            <OverviewRowData>
              <StatusPill
                alert={type === "Replica"}
                small
                label={this.props.wizardType.toUpperCase()}
              />
              <OverviewRowLabel>Coriolis {type}</OverviewRowLabel>
            </OverviewRowData>
          </OverviewRow>
        </Overview>
      </Section>
    );
  }

  render() {
    return (
      <Wrapper>
        <Column>
          {this.renderOverviewSection()}
          {this.renderInstancesSection()}
          {this.renderNetworksSection()}
          {this.renderUserScripts()}
        </Column>
        <Column>
          {this.renderSourceOptionsSection()}
          {this.renderTargetOptionsSection()}
          {this.renderStorageSection("backend")}
          {this.renderStorageSection("disk")}
          {this.renderScheduleSection()}
        </Column>
      </Wrapper>
    );
  }
}

export default WizardSummary;
