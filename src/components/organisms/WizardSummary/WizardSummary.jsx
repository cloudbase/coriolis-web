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

// @flow

import React from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'
import moment from 'moment'

import StatusPill from '../../atoms/StatusPill'

import StyleProps from '../../styleUtils/StyleProps'
import Palette from '../../styleUtils/Palette'
import LabelDictionary from '../../../utils/LabelDictionary'
import DateUtils from '../../../utils/DateUtils'
import type { Schedule } from '../../../types/Schedule'
import type { WizardData } from '../../../types/WizardData'
import type { StorageMap, Storage } from '../../../types/Endpoint'
import type { Instance, Disk } from '../../../types/Instance'

import { getDisks } from '../WizardStorage'

import networkArrowImage from './images/network-arrow.svg'

const Wrapper = styled.div`
  width: 100%;
  display: flex;
`
const Column = styled.div`
  width: 50%;

  &:first-child {
    margin-right: 160px;
  }
  &:last-child {
    max-width: calc(50% - 160px);
  }
`
const Section = styled.div`
  margin-bottom: 42px;

  &:last-child {
    margin-bottom: 0;
  }
`
const SectionTitle = styled.div`
  font-size: 24px;
  font-weight: ${StyleProps.fontWeights.light};
  margin-bottom: 16px;
`
const Overview = styled.div``
const OverviewLabel = styled.div`
  font-size: 10px;
  font-weight: ${StyleProps.fontWeights.medium};
  text-transform: uppercase;
  color: ${Palette.grayscale[5]};
  margin-bottom: 4px;
`
const OverviewRow = styled.div`
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
`
const OverviewRowData = styled.div`
  display: flex;
`
const OverviewRowLabel = styled.div`
  margin-left: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
const Table = styled.div``
const Row = styled.div`
  display: flex;
  flex-direction: ${props => props.direction || 'column'};
  padding: 8px 0;
  border-top: 1px solid ${Palette.grayscale[1]};
  color: ${Palette.grayscale[4]};

  &:last-child {
    border-bottom: 1px solid ${Palette.grayscale[1]};
  }
`
const InstanceRowTitle = styled.div`
  margin-bottom: 4px;
`
const InstanceRowSubtitle = styled.div`
  font-size: 10px;
  color: ${Palette.grayscale[5]};
`
const SourceNetwork = styled.div`
  width: 50%;
  margin-right: 16px;
`
const NetworkArrow = styled.div`
  width: 32px;
  height: 16px;
  background: url('${networkArrowImage}') center no-repeat;
`
const TargetNetwork = styled.div`
  width: 50%;
  text-align: right;
  margin-left: 20px;
  text-overflow: ellipsis;
  overflow: hidden;
`
const OptionsList = styled.div``
const Option = styled.div`
  display: flex;
  margin-bottom: 8px;
`
const OptionLabel = styled.div`
  color: ${Palette.grayscale[4]};
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`
const OptionValue = styled.div`
  text-align: right;
  max-width: 50%;
  text-overflow: ellipsis;
  overflow: hidden;
`

type Props = {
  data: WizardData,
  wizardType: 'replica' | 'migration',
  schedules: Schedule[],
  storageMap: StorageMap[],
  instancesDetails: Instance[],
  defaultStorage: ?Storage,
}
@observer
class WizardSummary extends React.Component<Props> {
  getDefaultOption(fieldName: string) {
    if (this.props.data.options && this.props.data.options[fieldName] === false) {
      return false
    }

    return true
  }

  renderScheduleLabel(schedule: Schedule) {
    let scheduleInfo = schedule.schedule
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
      // $FlowIssue
      dayOfWeekLabel = `every ${moment.weekdays(true)[scheduleInfo.dow]}`
    }


    let padNumber = number => (number || 0) < 10 ? `0${number || 0}` : (number || 0).toString()
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
    let schedules = this.props.schedules
    if (this.props.wizardType !== 'replica' || !schedules || schedules.length === 0) {
      return null
    }

    return (
      <Section>
        <SectionTitle>Schedule</SectionTitle>
        <Table>
          {schedules.map(schedule => {
            return (
              <Row key={schedule.id} schedule data-test-id={`wSummary-scheduleItem-${schedule.id || 0}`}>
                {this.renderScheduleLabel(schedule)}
              </Row>
            )
          })}
        </Table>
      </Section>
    )
  }

  renderOptionValue(value: any) {
    if (value === true) {
      return 'Yes'
    }
    if (value === false) {
      return 'No'
    }
    if (value.join) {
      return value.join(', ')
    }
    return value
  }

  renderOptionsSection() {
    let data = this.props.data
    let type = this.props.wizardType.charAt(0).toUpperCase() + this.props.wizardType.substr(1)

    let executeNowOption = (
      <Option>
        <OptionLabel>Execute now?</OptionLabel>
        <OptionValue>{this.renderOptionValue(this.getDefaultOption('execute_now'))}</OptionValue>
      </Option>
    )

    let separateVmOption = (
      <Option>
        <OptionLabel>Separate {type}/VM?</OptionLabel>
        <OptionValue>{this.renderOptionValue(this.getDefaultOption('separate_vm'))}</OptionValue>
      </Option>
    )

    return (
      <Section>
        <SectionTitle>{type} Options</SectionTitle>
        <OptionsList>
          {this.props.wizardType === 'replica' ? executeNowOption : null}
          {this.props.data.selectedInstances && this.props.data.selectedInstances.length > 1 ? separateVmOption : null}
          {data.options ? Object.keys(data.options).map(optionName => {
            if (
              optionName === 'execute_now' ||
              optionName === 'separate_vm' ||
              optionName === 'default_stoage' ||
              !data.options || data.options[optionName] == null
            ) {
              return null
            }

            return (
              <Option key={optionName}>
                <OptionLabel data-test-id={`wSummary-optionLabel-${optionName}`}>
                  {optionName.split('/').map(n => LabelDictionary.get(n)).join(' - ')}
                </OptionLabel>
                <OptionValue data-test-id={`wSummary-optionValue-${optionName}`}>{
                  // $FlowIssue
                  this.renderOptionValue(data.options[optionName])
                }</OptionValue>
              </Option>
            )
          }) : null}
        </OptionsList>
      </Section>
    )
  }

  renderStorageSection(type: 'backend' | 'disk') {
    let storageMap = this.props.storageMap.filter(mapping => mapping.type === type)
    let disks = getDisks(this.props.instancesDetails, type)

    if (disks.length === 0 || (storageMap.length === 0 && !this.props.defaultStorage)) {
      return null
    }
    let fieldName = type === 'backend' ? 'storage_backend_identifier' : 'id'

    let fullStorageMap: { source: Disk, target: ?Storage }[] = disks.filter(d => d[fieldName]).map(disk => {
      let diskMapped = storageMap.find(s => s.source[fieldName] === disk[fieldName])
      if (diskMapped) {
        return { source: diskMapped.source, target: diskMapped.target }
      }
      return { source: disk, target: this.props.defaultStorage }
    })

    fullStorageMap.sort((m1, m2) => String(m1.source[fieldName]).localeCompare(String(m2.source[fieldName])))
    let title = type === 'backend' ? 'Storage Backend Mapping' : 'Disk Mapping'

    return (
      <Section>
        <SectionTitle>{title}</SectionTitle>
        <Table>
          {fullStorageMap.filter(m => m.target).map(mapping => {
            return (
              <Row
                key={`${type}-${mapping.source[fieldName] || ''}-${mapping.target ? mapping.target.name : ''}`}
                direction="row"
              >
                <SourceNetwork>{mapping.source[fieldName]}</SourceNetwork>
                <NetworkArrow />
                <TargetNetwork>{mapping.target ? mapping.target.name : 'Default'}</TargetNetwork>
              </Row>
            )
          })}
        </Table>
      </Section>
    )
  }

  renderNetworksSection() {
    let data = this.props.data

    if (data.networks == null) {
      return null
    }

    return (
      <Section>
        <SectionTitle>Networks</SectionTitle>
        <Table>
          {data.networks.map(mapping => {
            return (
              <Row key={mapping.sourceNic.network_name} direction="row">
                <SourceNetwork data-test-id="wSummary-networkSource">{mapping.sourceNic.network_name}</SourceNetwork>
                <NetworkArrow />
                <TargetNetwork data-test-id="wSummary-networkTarget">{mapping.targetNetwork.name}</TargetNetwork>
              </Row>
            )
          })}
        </Table>
      </Section>
    )
  }

  renderInstancesSection() {
    let data = this.props.data

    return (
      <Section>
        <SectionTitle>Instances</SectionTitle>
        <Table>
          {data.selectedInstances ? data.selectedInstances.map(instance => {
            let flavorName = instance.flavor_name ? `/${instance.flavor_name}` : ''
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

  renderOverviewSection() {
    let data = this.props.data
    let type = this.props.wizardType.charAt(0).toUpperCase() + this.props.wizardType.substr(1)
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
        </Column>
        <Column>
          {this.renderOptionsSection()}
          {this.renderStorageSection('backend')}
          {this.renderStorageSection('disk')}
          {this.renderScheduleSection()}
        </Column>
      </Wrapper>
    )
  }
}

export default WizardSummary
