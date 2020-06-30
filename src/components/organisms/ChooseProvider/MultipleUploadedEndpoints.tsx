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

import type { Endpoint, MultiValidationItem } from '../../../@types/Endpoint'

import StatusIcon from '../../atoms/StatusIcon'
import Button from '../../atoms/Button'
import EndpointLogos from '../../atoms/EndpointLogos'
import LoadingButton from '../../molecules/LoadingButton'

import deleteImage from './images/delete.svg'
import deleteHoverImage from './images/delete-hover.svg'
import DomUtils from '../../../utils/DomUtils'
import notificationStore from '../../../stores/NotificationStore'

const Wrapper = styled.div<any>`
  min-height: 0;
`
const Buttons = styled.div<any>`
  display: flex;
  justify-content: space-between;
  margin-top: 32px;
  flex-shrink: 0;
  padding: 0 32px;
`
const DeleteButton = styled.div<any>`
  width: 16px;
  height: 16px;
  background: url('${deleteImage}') center no-repeat;
  cursor: pointer;

  &:hover {
    background: url('${deleteHoverImage}') center no-repeat;
  }
`
const Content = styled.div<any>`
  overflow: auto;
  display: flex;
  flex-direction: column;
  margin: 0 32px;
  min-height: 200px;
  max-height: 384px;
  text-align: left;
`
const InvalidEndpoint = styled.div<any>`
  margin-bottom: 8px;
`
const EndpointItem = styled.div<any>`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`
const EndpointLogoWrapper = styled.div<any>`
  min-width: 110px;
`
const EndpointData = styled.div<any>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-grow: 1;
  overflow: hidden;
`
const EndpointName = styled.div<any>`
  overflow: hidden;
  text-overflow: ellipsis;
`
const EndpointOptions = styled.div<any>`
  display: flex;
  align-items: center;
`
const EndpointStatus = styled.div<any>`
  margin: 0 8px;
`
type Props = {
  endpoints: (Endpoint | string)[],
  multiValidation: MultiValidationItem[],
  validating: boolean,
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
    const validationItem = this.props.multiValidation.find(v => v.endpoint.name === endpoint.name
      && v.endpoint.type === endpoint.type)

    if (!validationItem) {
      return null
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
