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

import React from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'
import moment from 'moment'

import StatusPill from '../../atoms/StatusPill'

import StyleProps from '../../styleUtils/StyleProps'
import Palette from '../../styleUtils/Palette'
import LabelDictionary from '../../../utils/LabelDictionary'
import DateUtils from '../../../utils/DateUtils'
import { migrationFields } from '../../../constants'
import type { Schedule } from '../../../@types/Schedule'
import type { WizardData } from '../../../@types/WizardData'
import type { StorageMap, StorageBackend } from '../../../@types/Endpoint'
import type { Instance, Disk, InstanceScript } from '../../../@types/Instance'
import type { Field } from '../../../@types/Field'

import fieldHelper from '../../../@types/Field'
import { getDisks } from '../WizardStorage'

import networkArrowImage from './images/network-arrow.svg'

const Wrapper = styled.div<any>`
  width: 100%;
  display: flex;
`
const Column = styled.div<any>`
  width: 50%;

  &:first-child {
    margin-right: 160px;
  }
  &:last-child {
    max-width: calc(50% - 160px);
  }
`
const Section = styled.div<any>`
  margin-bottom: 42px;

  &:last-child {
    margin-bottom: 0;
  }
`
const SectionTitle = styled.div<any>`
  font-size: 24px;
  font-weight: ${StyleProps.fontWeights.light};
  margin-bottom: 16px;
`
const Overview = styled.div<any>``
const OverviewLabel = styled.div<any>`
  font-size: 10px;
  font-weight: ${StyleProps.fontWeights.medium};
  text-transform: uppercase;
  color: ${Palette.grayscale[5]};
  margin-bottom: 4px;
`
const OverviewRow = styled.div<any>`
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
`
const OverviewRowData = styled.div<any>`
  display: flex;
`
const OverviewRowLabel = styled.div<any>`
  margin-left: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
const Table = styled.div<any>``
const Row = styled.div<any>`
  display: flex;
  flex-direction: ${props => props.direction || 'column'};
  padding: 8px 0;
  border-top: 1px solid ${Palette.grayscale[1]};
  color: ${Palette.grayscale[4]};

  &:last-child {
    border-bottom: 1px solid ${Palette.grayscale[1]};
  }
`
const ScriptFileName = styled.div<any>`
  max-width: 124px;
  text-overflow: ellipsis;
  overflow: hidden;
  margin-left: 16px;
  white-space: nowrap;
  flex-shrink: 0;
`
const InstanceRowTitle = styled.div<any>`
  margin-bottom: 4px;
`
const InstanceRowSubtitle = styled.div<any>`
  font-size: 10px;
  color: ${Palette.grayscale[5]};
`
const SourceNetwork = styled.div<any>`
  width: 50%;
  margin-right: 16px;
`
const NetworkArrow = styled.div<any>`
  width: 32px;
  height: 16px;
  background: url('${networkArrowImage}') center no-repeat;
`
const StorageTarget = styled.div<any>`
  width: 50%;
  text-align: right;
  margin-left: 20px;
  text-overflow: ellipsis;
  overflow: hidden;
`
const TargetNetwork = styled.div<any>`
  width: 50%;
  text-align: right;
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  margin-top: -16px;
`
const TargetNetworkName = styled.div<any>`
  width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  margin-top: 16px;
`
const OptionsList = styled.div<any>``
const Option = styled.div<any>`
  display: flex;
  margin-bottom: 8px;
`
const OptionLabel = styled.div<any>`
  color: ${Palette.grayscale[4]};
  ${StyleProps.exactWidth('50%')}
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`
const OptionValue = styled.div<any>`
  text-align: right;
  ${StyleProps.exactWidth('50%')}
  text-overflow: ellipsis;
  overflow: hidden;
`

type Props = {
  data: WizardData,
  wizardType: 'replica' | 'migration',
  schedules: Schedule[],
  defaultStorage: string | null,
  storageMap: StorageMap[],
  instancesDetails: Instance[],
  sourceSchema: Field[],
  destinationSchema: Field[],
  uploadedUserScripts: InstanceScript[],
}
@observer
class WizardSummary extends React.Component<Props> {
  getDefaultBooleanOption(fieldName: string, defaultValue: boolean): boolean {
    if (!this.props.data.destOptions) {
      return defaultValue
    }

    if (this.props.data.destOptions[fieldName] != null) {
      return this.props.data.destOptions[fieldName]
    }

    return defaultValue
  }

  renderScheduleLabel(schedule: Schedule) {
    const scheduleInfo = schedule.schedule
    let monthLabel
    if (!scheduleInfo) {
      return null
    }

    if (scheduleInfo.month == null) {
      monthLabel = 'Every month'
    } else {
      monthLabel = `Every ${moment.months()[scheduleInfo.month ? scheduleInfo.month - 1 : 0]}`
    }

    let dayOfMonthLabel
    if (scheduleInfo.dom == null) {
      dayOfMonthLabel = 'every day'
    } else {
      dayOfMonthLabel = `every ${DateUtils.getOrdinalDay(scheduleInfo.dom)}`
    }

    let dayOfWeekLabel
    if (scheduleInfo.dow == null) {
      dayOfWeekLabel = 'every weekday'
    } else {
      dayOfWeekLabel = `every ${moment.weekdays(true)[scheduleInfo.dow]}`
    }

    const padNumber = (number: number) => ((number || 0) < 10 ? `0${number || 0}` : (number || 0).toString())
    let timeLabel
    if (scheduleInfo.minute == null) {
      if (scheduleInfo.hour == null) {
        timeLabel = 'every hour, every minute'
      } else {
        timeLabel = `at ${padNumber(scheduleInfo.hour)} o'clock, every minute UTC`
      }
    } else if (scheduleInfo.hour == null) {
      timeLabel = `every hour, at minute ${padNumber(scheduleInfo.minute)} UTC`
    } else {
      timeLabel = `at ${padNumber(scheduleInfo.hour)}:${padNumber(scheduleInfo.minute)} UTC`
    }

    return `${monthLabel}, ${dayOfMonthLabel}, ${dayOfWeekLabel}, ${timeLabel}`
  }

  renderScheduleSection() {
    const schedules = this.props.schedules
    if (this.props.wizardType !== 'replica' || !schedules || schedules.length === 0) {
      return null
    }

    return (
      <Section>
        <SectionTitle>Schedule</SectionTitle>
        <Table>
          {schedules.map(schedule => (
            <Row key={schedule.id} schedule data-test-id={`wSummary-scheduleItem-${schedule.id || 0}`}>
              {this.renderScheduleLabel(schedule)}
            </Row>
          ))}
        </Table>
      </Section>
    )
  }

  renderSourceOptionsSection() {
    const data = this.props.data
    const type = this.props.wizardType.charAt(0).toUpperCase() + this.props.wizardType.substr(1)
    const provider = this.props.data && this.props.data.source && this.props.data.source.type

    if (!data.sourceOptions) {
      return null
    }
    return (
      <Section>
        <SectionTitle>{type} Source Options</SectionTitle>
        <OptionsList>
          {data.sourceOptions ? Object.keys(data.sourceOptions).map(optionName => {
            if (!data.sourceOptions || data.sourceOptions[optionName] == null || data.sourceOptions[optionName] === '') {
              return null
            }
            const optionLabel = optionName.split('/')
              .map(n => LabelDictionary.get(n, `${data.source ? data.source.type : ''}-source`)).join(' - ')
            const optionValue = fieldHelper
              .getValueAlias(optionName, data.sourceOptions
                && data.sourceOptions[optionName], this.props.sourceSchema, provider)
            return (
              <Option key={optionName}>
                <OptionLabel title={optionLabel}>
                  {optionLabel}
                </OptionLabel>
                <OptionValue title={optionValue}>
                  {optionValue}
                </OptionValue>
              </Option>
            )
          }) : null}
        </OptionsList>
      </Section>
    )
  }

  renderTargetOptionsSection() {
    const data = this.props.data
    const provider = this.props.data && this.props.data.target && this.props.data.target.type
    const type = this.props.wizardType.charAt(0).toUpperCase() + this.props.wizardType.substr(1)

    const executeNowOption = (
      <Option>
        <OptionLabel>Execute now?</OptionLabel>
        <OptionValue>{this.getDefaultBooleanOption('execute_now', true) ? 'Yes' : 'No'}</OptionValue>
      </Option>
    )

    const separateVmOption = (
      <Option>
        <OptionLabel>Separate {type}/VM?</OptionLabel>
        <OptionValue>{this.getDefaultBooleanOption('separate_vm', true) ? 'Yes' : 'No'}</OptionValue>
      </Option>
    )

    const migrationOptions = [
      (
        <Option>
          <OptionLabel>Shutdown Instances</OptionLabel>
          <OptionValue>{this.getDefaultBooleanOption('shutdown_instances', false) ? 'Yes' : 'No'}</OptionValue>
        </Option>
      ),
      (
        <Option>
          <OptionLabel>Replication Count</OptionLabel>
          <OptionValue>
            {(this.props.data.destOptions && this.props.data.destOptions.replication_count) || 2}
          </OptionValue>
        </Option>
      ),
    ]

    const defaultStorageOption = (
      <Option>
        <OptionLabel>Default Storage</OptionLabel>
        <OptionValue>{this.props.defaultStorage}</OptionValue>
      </Option>
    )

    return (
      <Section>
        <SectionTitle>{type} Target Options</SectionTitle>
        <OptionsList>
          {this.props.wizardType === 'replica' ? executeNowOption : null}
          {this.props.wizardType === 'migration' ? migrationOptions : null}
          {this.props.data.selectedInstances
            && this.props.data.selectedInstances.length > 1 ? separateVmOption : null}
          {this.props.defaultStorage ? defaultStorageOption : null}
          {data.destOptions ? Object.keys(data.destOptions).map(optionName => {
            if (
              optionName === 'execute_now'
              || optionName === 'separate_vm'
              || migrationFields.find(f => f.name === optionName)
              || !data.destOptions || data.destOptions[optionName] == null || data.destOptions[optionName] === ''
            ) {
              return null
            }

            const optionLabel = optionName.split('/')
              .map(n => LabelDictionary.get(n, `${data.target ? data.target.type : ''}-destination`)).join(' - ')
            const optionValue = fieldHelper.getValueAlias(optionName,
              data.destOptions && data.destOptions[optionName],
              this.props.destinationSchema, provider)
            return (
              <Option key={optionName}>
                <OptionLabel data-test-id={`wSummary-optionLabel-${optionName}`} title={optionLabel}>
                  {optionLabel}
                </OptionLabel>
                <OptionValue data-test-id={`wSummary-optionValue-${optionName}`} title={optionValue}>
                  {optionValue}
                </OptionValue>
              </Option>
            )
          }) : null}
        </OptionsList>
      </Section>
    )
  }

  renderStorageSection(type: 'backend' | 'disk') {
    const storageMap = this.props.storageMap.filter(mapping => mapping.type === type)
    const disks = getDisks(this.props.instancesDetails, type)

    if (disks.length === 0 || storageMap.length === 0) {
      return null
    }
    const fieldName = type === 'backend' ? 'storage_backend_identifier' : 'id'

    let fullStorageMap: { source: Disk, target: StorageBackend | null }[] = disks
      .filter(d => d[fieldName]).map(disk => {
        const diskMapped = storageMap.find(s => s.source[fieldName] === disk[fieldName])
        if (diskMapped) {
          return { source: diskMapped.source, target: diskMapped.target }
        }
        return { source: disk, target: null }
      })

    fullStorageMap.sort((m1, m2) => String(m1.source[fieldName])
      .localeCompare(String(m2.source[fieldName])))
    fullStorageMap = fullStorageMap.filter(fsm => fsm.target && fsm.target.id)
    const title = type === 'backend' ? 'Storage Backend Mapping' : 'Disk Mapping'

    if (fullStorageMap.length === 0) {
      return null
    }

    return (
      <Section>
        <SectionTitle>{title}</SectionTitle>
        <Table>
          {fullStorageMap.filter(m => m.target).map(mapping => (
            <Row
              key={`${type}-${mapping.source[fieldName] || ''}-${mapping.target ? mapping.target.name : ''}`}
              direction="row"
            >
              <SourceNetwork>{mapping.source[fieldName]}</SourceNetwork>
              <NetworkArrow />
              <StorageTarget>{mapping.target ? mapping.target.name : 'Default'}</StorageTarget>
            </Row>
          ))}
        </Table>
      </Section>
    )
  }

  renderNetworksSection() {
    const data = this.props.data

    if (data.networks == null) {
      return null
    }

    return (
      <Section>
        <SectionTitle>Networks</SectionTitle>
        <Table>
          {data.networks.map(mapping => (
            <Row key={mapping.sourceNic.network_name} direction="row">
              <SourceNetwork data-test-id="wSummary-networkSource">{mapping.sourceNic.network_name}</SourceNetwork>
              <NetworkArrow />
              <TargetNetwork>
                <TargetNetworkName data-test-id="wSummary-networkTarget">{mapping.targetNetwork.name}</TargetNetworkName>
                {mapping.targetSecurityGroups && mapping.targetSecurityGroups.length ? (
                  <TargetNetworkName>Security Groups: {mapping.targetSecurityGroups.map(s => (typeof s === 'string' ? s : s.name)).join(', ')}</TargetNetworkName>
                ) : null}
              </TargetNetwork>
            </Row>
          ))}
        </Table>
      </Section>
    )
  }

  renderInstancesSection() {
    const data = this.props.data

    return (
      <Section>
        <SectionTitle>Instances</SectionTitle>
        <Table>
          {data.selectedInstances ? data.selectedInstances.map(instance => {
            const flavorName = instance.flavor_name ? `/${instance.flavor_name}` : ''
            return (
              <Row key={instance.id}>
                <InstanceRowTitle data-test-id={`wSummary-instance-${instance.id}`}>{instance.name}</InstanceRowTitle>
                <InstanceRowSubtitle>{`${instance.num_cpu}vCPU/${instance.memory_mb}MB${flavorName}`}</InstanceRowSubtitle>
              </Row>
            )
          }) : null}
        </Table>
      </Section>
    )
  }

  renderUserScripts() {
    if (this.props.uploadedUserScripts.length === 0) {
      return null
    }

    return (
      <Section>
        <SectionTitle>Uploaded User Scripts</SectionTitle>
        <Table>
          {this.props.uploadedUserScripts.map(s => (
            <Row
              key={s.instanceName || s.global || undefined}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                flexShrink: 0,
                alignItems: 'center',
              }}
            >
              <InstanceRowTitle>{
                s.global ? s.global === 'windows' ? 'Global Windows Script' : 'Global Linux Script' : s.instanceName
              }
              </InstanceRowTitle>
              <ScriptFileName title={s.fileName}>{s.fileName}</ScriptFileName>
            </Row>
          ))}
        </Table>
      </Section>
    )
  }

  renderOverviewSection() {
    const data = this.props.data
    const type = this.props.wizardType.charAt(0).toUpperCase() + this.props.wizardType.substr(1)
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
                label={LabelDictionary.get(data.source && data.source.type).toUpperCase()}
                data-test-id="wSummary-sourcePill"
              />
              <OverviewRowLabel data-test-id="wSummary-source">{data.source ? data.source.name : ''}</OverviewRowLabel>
            </OverviewRowData>
          </OverviewRow>
          <OverviewRow>
            <OverviewLabel>Target</OverviewLabel>
            <OverviewRowData>
              <StatusPill
                secondary
                small
                label={LabelDictionary.get(data.target && data.target.type).toUpperCase()}
                data-test-id="wSummary-targetPill"
              />
              <OverviewRowLabel data-test-id="wSummary-target">{data.target && data.target.name}</OverviewRowLabel>
            </OverviewRowData>
          </OverviewRow>
          <OverviewRow>
            <OverviewLabel>Type</OverviewLabel>
            <OverviewRowData>
              <StatusPill
                alert={type === 'Replica'}
                small
                label={this.props.wizardType.toUpperCase()}
                data-test-id="wSummary-typePill"
              />
              <OverviewRowLabel>Coriolis {type}</OverviewRowLabel>
            </OverviewRowData>
          </OverviewRow>
        </Overview>
      </Section>
    )
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
          {this.renderStorageSection('backend')}
          {this.renderStorageSection('disk')}
          {this.renderScheduleSection()}
        </Column>
      </Wrapper>
    )
  }
}

export default WizardSummary
