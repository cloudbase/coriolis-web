/*
Copyright (C) 2020 Cloudbase Solutions SRL
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

import type { Endpoint, MultiValidationItem } from '@src/@types/Endpoint'

import StatusIcon from '@src/components/ui/StatusComponents/StatusIcon/StatusIcon'
import Button from '@src/components/ui/Button/Button'
import EndpointLogos from '@src/components/modules/EndpointModule/EndpointLogos/EndpointLogos'
import LoadingButton from '@src/components/ui/LoadingButton/LoadingButton'

import DomUtils from '@src/utils/DomUtils'
import notificationStore from '@src/stores/NotificationStore'
import DropdownLink from '@src/components/ui/Dropdowns/DropdownLink/DropdownLink'
import { Region } from '@src/@types/Region'
import deleteHoverImage from './images/delete-hover.svg'
import deleteImage from './images/delete.svg'

const Wrapper = styled.div`
  width: 100%;
  min-height: 0;
`
const Buttons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 32px;
  flex-shrink: 0;
  padding: 0 32px;
`
const DeleteButton = styled.div`
  width: 16px;
  height: 16px;
  background: url('${deleteImage}') center no-repeat;
  cursor: pointer;

  &:hover {
    background: url('${deleteHoverImage}') center no-repeat;
  }
`
const Content = styled.div`
  overflow: auto;
  display: flex;
  flex-direction: column;
  margin: 0 32px;
  min-height: 200px;
  max-height: 384px;
  text-align: left;
`
const InvalidEndpoint = styled.div`
  margin-bottom: 8px;
`
const EndpointItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`
const EndpointLogoWrapper = styled.div`
  min-width: 110px;
`
const EndpointData = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-grow: 1;
  overflow: hidden;
`
const EndpointName = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
`
const EndpointOptions = styled.div`
  display: flex;
  align-items: center;
`
const EndpointStatus = styled.div`
  display: flex;
  margin-right: 8px;
  > div {
    margin-left:  8px;
  }
`
type Props = {
  endpoints: (Endpoint | string)[],
  regions: Region[],
  invalidRegionsEndpointIds: { id: string, regions: string[] }[]
  multiValidation: MultiValidationItem[],
  validating: boolean,
  onRegionsChange: (endpoint: Endpoint, newRegions: string[]) => void
  onBackClick: () => void,
  onRemove: (endpoint: Endpoint, isAdded: boolean) => void,
  onValidateClick: () => void,
  onDone: () => void,
}
type State = {
  validationDone: boolean,
}
@observer
class MultipleUploadedEndpoints extends React.Component<Props, State> {
  state = {
    validationDone: false,
  }

  UNSAFE_componentWillReceiveProps(prevProps: Props) {
    if (prevProps.validating && !this.props.validating) {
      this.setState({ validationDone: true })
    }
  }

  handleRemove(uploadedEndpoint: Endpoint) {
    const multiEndpoint = this.props.multiValidation
      .find(mv => mv.endpoint.name === uploadedEndpoint.name
      && mv.endpoint.type === uploadedEndpoint.type)
    if (multiEndpoint) {
      this.props.onRemove(multiEndpoint.endpoint, true)
    } else {
      this.props.onRemove(uploadedEndpoint, false)
    }
  }

  copyErrorMessae(e: React.MouseEvent<HTMLDivElement>, message: string) {
    if (e && e.stopPropagation) e.stopPropagation()

    const succesful = DomUtils.copyTextToClipboard(message)

    if (succesful) {
      notificationStore.alert('The message has been copied to clipboard.')
    } else {
      notificationStore.alert('The message couldn\'t be copied', 'error')
    }
  }

  renderButtons() {
    let actionButton = null

    if (this.props.validating) {
      actionButton = <LoadingButton large>Validate and save</LoadingButton>
    } else if (this.state.validationDone) {
      actionButton = (
        <Button
          large
          primary
          onClick={this.props.onDone}
        >Done
        </Button>
      )
    } else {
      actionButton = (
        <Button
          large
          primary
          onClick={this.props.onValidateClick}
        >Validate and save
        </Button>
      )
    }

    return (
      <Buttons>
        <Button
          large
          secondary
          onClick={this.props.onBackClick}
        >Back
        </Button>
        {actionButton}
      </Buttons>
    )
  }

  renderStatus(endpoint: Endpoint) {
    const validationItem = this.props.multiValidation.find(v => v.endpoint.name === endpoint.name && v.endpoint.type === endpoint.type)
    if (!validationItem) {
      const invalidRegions = this.props.invalidRegionsEndpointIds.find(e => e.id === `${endpoint.type}${endpoint.name}`)?.regions
      if (!invalidRegions?.length) {
        return null
      }
      return (
        <>
          <DropdownLink
            width="200px"
            listWidth="120px"
            getLabel={() => 'Coriolis Regions'}
            multipleSelection
            selectedItems={endpoint.mapped_regions}
            items={this.props.regions.map(r => ({
              label: r.name,
              value: r.id,
            }))}
            onChange={item => {
              if (endpoint.mapped_regions.find(r => r === item.value)) {
                this.props.onRegionsChange(endpoint, endpoint.mapped_regions.filter(r => r !== item.value))
              } else {
                this.props.onRegionsChange(endpoint, [...endpoint.mapped_regions, item.value])
              }
            }}
          />
          <StatusIcon
            status="INFO"
            data-tip={`${invalidRegions.length} Coriolis Region${invalidRegions.length > 1 ? 's' : ''} couldn't be mapped for this endpoint. Use the Coriolis Regions dropdown to view and update the current mapping.`}
          />
        </>
      )
    }

    if (validationItem.validating) {
      return (
        <StatusIcon status="RUNNING" />
      )
    }
    const validation = validationItem.validation
    if (validation) {
      if (validation.valid) {
        return (
          <StatusIcon status="COMPLETED" />
        )
      }
      return (
        <StatusIcon
          status="WARNING"
          onClick={e => { this.copyErrorMessae(e, validation.message) }}
          data-tip={validation.message}
          style={{ cursor: 'pointer' }}
        />
      )
    }

    return null
  }

  renderContent() {
    return (
      <Content>
        {this.props.endpoints.map((endpoint, i) => {
          if (typeof endpoint === 'string') {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <InvalidEndpoint key={i}>
                File may contain an unsupported provider type: {endpoint}
              </InvalidEndpoint>
            )
          }
          return (
            <EndpointItem key={`${endpoint.name}${String(endpoint.type)}`}>
              <EndpointLogoWrapper>
                <EndpointLogos
                  endpoint={endpoint.type}
                  height={32}
                />
              </EndpointLogoWrapper>
              <EndpointData>
                <EndpointName>{endpoint.name}</EndpointName>
                <EndpointOptions>
                  <EndpointStatus>
                    {this.renderStatus(endpoint)}
                  </EndpointStatus>
                  <DeleteButton onClick={() => { this.handleRemove(endpoint) }} />
                </EndpointOptions>
              </EndpointData>
            </EndpointItem>
          )
        })}
      </Content>
    )
  }

  render() {
    return (
      <Wrapper>
        {this.renderContent()}
        {this.renderButtons()}
      </Wrapper>
    )
  }
}

export default MultipleUploadedEndpoints
