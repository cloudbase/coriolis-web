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

import AutocompleteDropdown from '../../molecules/AutocompleteDropdown'
import Dropdown from '../../molecules/Dropdown'
import InfoIcon from '../../atoms/InfoIcon'

import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'
import type { Instance, Disk } from '../../../@types/Instance'
import type { StorageBackend, StorageMap } from '../../../@types/Endpoint'

import backendImage from './images/backend.svg'
import diskImage from './images/disk.svg'
import bigStorageImage from './images/storage-big.svg'
import arrowImage from './images/arrow.svg'

const Wrapper = styled.div<any>`
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
`
const Mapping = styled.div<any>`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`
const StorageWrapper = styled.div<any>`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
`
const StorageSection = styled.div<any>`
  margin-bottom: 16px;
  font-size: 24px;
  font-weight: ${StyleProps.fontWeights.light};
`
const StorageItems = styled.div<any>`
  display: flex;
  flex-direction: column;
`
const StorageItem = styled.div<any>`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  border-top: 1px solid ${Palette.grayscale[1]};
  padding: 8px 0;

  &:last-child {
    border-bottom: 1px solid ${Palette.grayscale[1]};
  }
`
const StorageImage = styled.div<any>`
  ${StyleProps.exactSize('48px')}
  background: url('${props => (props.backend ? backendImage : diskImage)}') center no-repeat;
  margin-right: 16px;
`
const StorageTitle = styled.div<any>`
  width: ${props => props.width}px;
`
const StorageName = styled.div<any>`
  font-size: 16px;
  word-break: break-word;
`
const StorageSubtitle = styled.div<any>`
  font-size: 12px;
  color: ${Palette.grayscale[5]};
  margin-top: 1px;
  word-break: break-word;
`
const ArrowImage = styled.div<any>`
  min-width: 32px;
  ${StyleProps.exactHeight('16px')}
  background: url('${arrowImage}') center no-repeat;
  flex-grow: 1;
  margin-right: 16px;
`
const NoStorageMessage = styled.div<any>`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 64px;
  width: 440px;
`
const BigStorageImage = styled.div<any>`
  margin-bottom: 46px;
  ${StyleProps.exactSize('96px')}
  background: url('${bigStorageImage}') center no-repeat;
`
const NoStorageTitle = styled.div<any>`
  margin-bottom: 10px;
  font-size: 18px;
`
const NoStorageSubtitle = styled.div<any>`
  color: ${Palette.grayscale[4]};
  text-align: center;
`
const DiskDisabledMessage = styled.div<any>`
  width: 224px;
  text-align: center;
  color: gray;
`

export const getDisks = (instancesDetails: Instance[], type: 'backend' | 'disk', storageMap?: StorageMap[] | null): Disk[] => {
  const fieldName = type === 'backend' ? 'storage_backend_identifier' : 'id'

  let disks: Disk[] = []
  instancesDetails.forEach(instance => {
    if (!instance.devices || !instance.devices.disks) {
      return
    }
    instance.devices.disks.forEach(disk => {
      if (disks.find(d => d[fieldName] === disk[fieldName])) {
        return
      }
      disks.push(disk)
    })
  })
  if (disks.length === 0 && storageMap && storageMap.length) {
    disks = storageMap.map(sm => sm.source)
  }
  return disks
}

export const TEST_ID = 'wizardStorage'

export type Props = {
  storageBackends: StorageBackend[],
  instancesDetails: Instance[],
  storageMap: StorageMap[] | null | undefined,
  defaultStorageLayout: 'modal' | 'page',
  defaultStorage: string | null | undefined,
  storageConfigDefault: string | null | undefined,
  onDefaultStorageChange: (value: string | null) => void,
  onChange: (sourceStorage: Disk, targetStorage: StorageBackend, type: 'backend' | 'disk') => void,
  onScrollableRef?: (ref: HTMLElement) => void,
  style?: any,
  titleWidth?: number,
}
@observer
class WizardStorage extends React.Component<Props> {
  renderNoStorage() {
    return (
      <NoStorageMessage data-test-id={`${TEST_ID}-noStorage`}>
        <BigStorageImage />
        <NoStorageTitle>No storage backends were found</NoStorageTitle>
        <NoStorageSubtitle>
          We could not find any storage backends. Coriolis will skip this step.
        </NoStorageSubtitle>
      </NoStorageMessage>
    )
  }

  renderStorageDropdown(
    storageItems: Array<StorageBackend | { id: string | null, name: string }>,
    selectedItem: StorageBackend | null,
    disk: Disk,
    type: 'backend' | 'disk',
  ) {
    if (disk.disabled && type === 'disk') {
      return (
        <DiskDisabledMessage>
          {disk.disabled.message}{disk.disabled.info
            ? <InfoIcon text={disk.disabled.info} /> : null}
        </DiskDisabledMessage>
      )
    }

    return storageItems.length > 10 ? (
      <AutocompleteDropdown
        width={StyleProps.inputSizes.large.width}
        selectedItem={selectedItem}
        items={storageItems}
        onChange={(item: StorageBackend) => { this.props.onChange(disk, item, type) }}
        labelField="name"
        valueField="id"
      />
    )
      : (
        <Dropdown
          width={StyleProps.inputSizes.large.width}
          centered
          noSelectionMessage="Default"
          noItemsMessage="No storage found"
          selectedItem={selectedItem}
          items={storageItems}
          labelField="name"
          valueField="id"
          onChange={(item: StorageBackend) => { this.props.onChange(disk, item, type) }}
          data-test-id={`${TEST_ID}-${type}-destination`}
        />
      )
  }

  renderStorageWrapper(disks: Disk[], type: 'backend' | 'disk') {
    const title = type === 'backend' ? 'Storage Backend Mapping' : 'Disk Mapping'
    const diskFieldName = type === 'backend' ? 'storage_backend_identifier' : 'id'
    const storageMap = this.props.storageMap
    const storageItems = [
      { name: 'Default', id: null },
      ...this.props.storageBackends,
    ]

    const usableDisks = disks.filter(d => d[diskFieldName])

    const parseDiskName = (name?: string | null): [string | null, boolean] => {
      if (!name) {
        return [null, false]
      }
      const slashPaths = name.split('/')
      const dashPaths = name.split('-')
      if (slashPaths.length < 4 && dashPaths.length < 4) {
        return [name, false]
      }
      if (slashPaths.length >= 4) {
        return [`.../${slashPaths.filter((_, i) => i > slashPaths.length - 4).join('/')}`, true]
      }
      return [`${dashPaths[0]}-...-${dashPaths[1]}`, true]
    }

    return (
      <StorageWrapper>
        <StorageSection>{title}</StorageSection>
        <StorageItems>
          {usableDisks.map(disk => {
            const connectedTo = this.props.instancesDetails.filter(i => {
              if (!i.devices || !i.devices.disks) {
                return false
              }
              if (i.devices.disks.find(d => d[diskFieldName] === disk[diskFieldName])) {
                return true
              }
              return false
            }).map(i => i.instance_name || i.name)
            const selectedStorage = storageMap && storageMap.find(s => s.type === type
                && String(s.source[diskFieldName]) === String(disk[diskFieldName]))
            const selectedItem = selectedStorage ? selectedStorage.target : null
            const diskNameParsed = parseDiskName(disk[diskFieldName])
            return (
              <StorageItem key={disk[diskFieldName]}>
                <StorageImage backend={type === 'backend'} />
                <StorageTitle width={this.props.titleWidth || 320}>
                  <StorageName
                    data-test-id={`${TEST_ID}-${type}-source`}
                    title={diskNameParsed[1] ? disk[diskFieldName] : null}
                  >
                    {diskNameParsed[0]}
                  </StorageName>
                  {connectedTo.length ? (
                    <StorageSubtitle
                      data-test-id={`${TEST_ID}-${type}-connectedTo`}
                    >
                      {`Connected to ${connectedTo.join(', ')}`}
                    </StorageSubtitle>
                  ) : null}
                </StorageTitle>
                <ArrowImage />
                {this.renderStorageDropdown(storageItems, selectedItem, disk, type)}
              </StorageItem>
            )
          })}
        </StorageItems>
      </StorageWrapper>
    )
  }

  renderBackendMapping() {
    const disks = getDisks(this.props.instancesDetails, 'backend', this.props.storageMap)

    if (disks.length === 0 || this.props.storageBackends.length === 0) {
      return null
    }

    return this.renderStorageWrapper(disks, 'backend')
  }

  renderDiskMapping() {
    const disks = getDisks(this.props.instancesDetails, 'disk', this.props.storageMap)

    if (disks.length === 0 || this.props.storageBackends.length === 0) {
      return this.renderNoStorage()
    }

    return this.renderStorageWrapper(disks, 'disk')
  }

  renderDefaultStorage() {
    const disks = getDisks(this.props.instancesDetails, 'disk', this.props.storageMap)

    if (disks.length === 0 || this.props.storageBackends.length === 0) {
      return null
    }

    const renderDropdown = () => {
      let items: {label: string, value: string | null}[] = this.props.storageBackends.map(s => ({
        label: s.name,
        value: s.name,
      }))
      items = [
        { label: 'Choose a value', value: null },
        ...items,
      ]
      const selectedItem = items.find(i => i.value === (
        this.props.defaultStorage !== undefined
          ? this.props.defaultStorage : this.props.storageConfigDefault
      ))
      const commonProps = {
        width: StyleProps.inputSizes.regular.width,
        selectedItem,
        items,
        onChange: (item: { value: string | null }) => this.props.onDefaultStorageChange(item.value),
      }
      return items.length > 10 ? (
        <AutocompleteDropdown
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...commonProps}
          dimNullValue
        />
      )
        : (
          <Dropdown
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...commonProps}
            noSelectionMessage="Choose a value"
            dimFirstItem
          />
        )
    }

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
                {renderDropdown()}
              </StorageName>
            </StorageTitle>
          </StorageItem>
        </StorageItems>
      </StorageWrapper>
    )
  }

  render() {
    return (
      <Wrapper style={this.props.style} ref={this.props.onScrollableRef}>
        <Mapping>
          {this.renderDefaultStorage()}
          {this.renderBackendMapping()}
          {this.renderDiskMapping()}
        </Mapping>
      </Wrapper>
    )
  }
}

export default WizardStorage
