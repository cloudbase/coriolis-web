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

import Dropdown from '../../molecules/Dropdown'

import Palette from '../../styleUtils/Palette'
import StyleProps from '../../styleUtils/StyleProps'
import type { Instance, Disk } from '../../../types/Instance'
import type { Storage, StorageMap } from '../../../types/Endpoint'

import backendImage from './images/backend.svg'
import diskImage from './images/disk.svg'
import bigStorageImage from './images/storage-big.svg'
import arrowImage from './images/arrow.svg'

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`
const Mapping = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`
const StorageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 32px;
  max-height: 100%;
  min-height: 100px;

  &:last-child {
    margin-bottom: 0;
  }
`
const StorageSection = styled.div`
  margin-bottom: 16px;
  font-size: 24px;
  font-weight: ${StyleProps.fontWeights.light};
`
const StorageItems = styled.div`
  display: flex;
  flex-direction: column;
  overflow: auto;
`
const StorageItem = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  border-top: 1px solid ${Palette.grayscale[1]};
  padding: 8px 0;

  &:last-child {
    border-bottom: 1px solid ${Palette.grayscale[1]};
  }
`
const StorageImage = styled.div`
  width: 48px;
  height: 48px;
  background: url('${props => props.backend ? backendImage : diskImage}') center no-repeat;
  margin-right: 16px;
`
const StorageTitle = styled.div`
  width: 320px;
`
const StorageName = styled.div`
  font-size: 16px;
`
const StorageSubtitle = styled.div`
  font-size: 12px;
  color: ${Palette.grayscale[5]};
  margin-top: 1px;
`
const ArrowImage = styled.div`
  width: 32px;
  height: 16px;
  background: url('${arrowImage}') center no-repeat;
  flex-grow: 1;
  margin-right: 16px;
`
const NoStorageMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 64px;
  width: 440px;
`
const BigStorageImage = styled.div`
  margin-bottom: 46px;
  ${StyleProps.exactSize('96px')}
  background: url('${bigStorageImage}') center no-repeat;
`
const NoStorageTitle = styled.div`
  margin-bottom: 10px;
  font-size: 18px;
`
const NoStorageSubtitle = styled.div`
  color: ${Palette.grayscale[4]};
  text-align: center;
`

export const getDisks = (instancesDetails: Instance[], type: 'backend' | 'disk'): Disk[] => {
  let fieldName = type === 'backend' ? 'storage_backend_identifier' : 'id'

  let disks = []
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
  return disks
}

type Props = {
  storage: Storage[],
  instancesDetails: Instance[],
  storageMap: ?StorageMap[],
  defaultStorage: ?string,
  onChange: (sourceStorage: Disk, targetStorage: Storage, type: 'backend' | 'disk') => void,
}
@observer
class WizardStorage extends React.Component<Props> {
  renderNoStorage() {
    return (
      <NoStorageMessage>
        <BigStorageImage />
        <NoStorageTitle>No storage backends were found</NoStorageTitle>
        <NoStorageSubtitle>We could not find any storage backends. Coriolis will skip this step.</NoStorageSubtitle>
      </NoStorageMessage>
    )
  }

  renderStorageWrapper(disks: Disk[], type: 'backend' | 'disk') {
    let title = type === 'backend' ? 'Storage Backend Mapping' : 'Disk Mapping'
    let diskFieldName = type === 'backend' ? 'storage_backend_identifier' : 'id'
    let storageMap = this.props.storageMap
    let storageItems = [
      { name: 'Default', id: null },
      ...this.props.storage,
    ]

    disks = disks.filter(d => d[diskFieldName])
    disks.sort((d1, d2) => String(d1[diskFieldName]).localeCompare(String(d2[diskFieldName])))

    return (
      <StorageWrapper>
        <StorageSection>{title}</StorageSection>
        <StorageItems>
          {disks.map(disk => {
            let connectedTo = this.props.instancesDetails.filter(i => {
              if (!i.devices || !i.devices.disks) {
                return false
              }
              if (i.devices.disks.find(d => d[diskFieldName] === disk[diskFieldName])) {
                return true
              }
              return false
            }).map(i => i.instance_name)
            let selectedItem = storageMap && storageMap.find(s => s.type === type && s.source[diskFieldName] === disk[diskFieldName])
            selectedItem = selectedItem ? selectedItem.target : storageItems.find(i => i.name === this.props.defaultStorage)
            return (
              <StorageItem key={disk[diskFieldName]}>
                <StorageImage backend={type === 'backend'} />
                <StorageTitle>
                  <StorageName>{disk[diskFieldName]}</StorageName>
                  <StorageSubtitle>{`Connected to ${connectedTo.join(', ')}`}</StorageSubtitle>
                </StorageTitle>
                <ArrowImage />
                <Dropdown
                  large
                  centered
                  noSelectionMessage="Default"
                  noItemsMessage="No storage found"
                  selectedItem={selectedItem}
                  items={storageItems}
                  labelField="name"
                  valueField="id"
                  onChange={(item: Storage) => { this.props.onChange(disk, item, type) }}
                />
              </StorageItem>
            )
          })}
        </StorageItems>
      </StorageWrapper>
    )
  }

  renderBackendMapping() {
    let disks = getDisks(this.props.instancesDetails, 'backend')

    if (disks.length === 0 || this.props.storage.length === 0) {
      return null
    }

    return this.renderStorageWrapper(disks, 'backend')
  }

  renderDiskMapping() {
    let disks = getDisks(this.props.instancesDetails, 'disk')

    if (disks.length === 0 || this.props.storage.length === 0) {
      return this.renderNoStorage()
    }

    return this.renderStorageWrapper(disks, 'disk')
  }

  render() {
    return (
      <Wrapper>
        <Mapping>
          {this.renderBackendMapping()}
          {this.renderDiskMapping()}
        </Mapping>
      </Wrapper>
    )
  }
}

export default WizardStorage
