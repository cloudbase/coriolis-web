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

import notificationStore from '../../../stores/NotificationStore'

import EndpointLogos from '../../atoms/EndpointLogos'
import Button from '../../atoms/Button'
import StatusImage from '../../atoms/StatusImage'

import StyleProps from '../../styleUtils/StyleProps'
import Palette from '../../styleUtils/Palette'
import ObjectUtils from '../../../utils/ObjectUtils'

import type { Endpoint } from '../../../types/Endpoint'

const Wrapper = styled.div`
  padding: 22px 0 32px 0;
  text-align: center;
`
const Providers = styled.div``
const Logos = styled.div`
  display: flex;
  flex-wrap: wrap;
`
const Upload = styled.div`
  border: 1px dashed ${props => props.highlight ? Palette.primary : 'white'};
  margin: 0 32px 16px 32px;
  padding: 16px;
`
const UploadMessage = styled.div`
  color: ${Palette.grayscale[3]};
`
const UploadMessageButton = styled.span`
  color: ${Palette.primary};
  cursor: pointer;
`
const FakeFileInput = styled.input`
  position: absolute;
  opacity: 0;
  top: -99999px;
`
const EndpointLogosStyled = styled(EndpointLogos)`
  transform: scale(0.67);
  transition: all ${StyleProps.animations.swift};
  cursor: pointer;
  &:hover {
    transform: scale(0.7);
  }
`
const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 32px 0;
`
const LoadingText = styled.div`
  font-size: 18px;
  margin-top: 32px;
`

type Props = {
  providers: string[],
  onCancelClick: () => void,
  onProviderClick: (provider: string) => void,
  onUploadEndpoint: (endpoint: Endpoint) => void,
  loading: boolean,
}
type State = {
  highlightDropzone: boolean,
}
@observer
class ChooseProvider extends React.Component<Props, State> {
  state = {
    highlightDropzone: false,
  }

  fileInput: HTMLElement
  dragDropListeners: { type: string, listener: (e: any) => any }[] = []

  componentWillMount() {
    setTimeout(() => { this.addDragAndDrop() }, 1000)
  }

  componentWillUnmount() {
    this.removeDragDrop()
  }

  addDragAndDrop() {
    this.dragDropListeners = [{
      type: 'dragenter',
      listener: e => {
        this.setState({ highlightDropzone: true })
        e.dataTransfer.dropEffect = 'copy'
        e.preventDefault()
      },
    }, {
      type: 'dragover',
      listener: e => {
        e.dataTransfer.dropEffect = 'copy'
        e.preventDefault()
      },
    }, {
      type: 'dragleave',
      listener: e => {
        if (!e.clientX && !e.clientY) {
          this.setState({ highlightDropzone: false })
        }
      },
    }, {
      type: 'drop',
      listener: async e => {
        e.preventDefault()
        this.setState({ highlightDropzone: false })
        let text = await ObjectUtils.readFromFileList(e.dataTransfer.files)
        this.processFileContent(text)
      },
    }]

    this.dragDropListeners.forEach(l => {
      window.addEventListener(l.type, l.listener)
    })
  }

  removeDragDrop() {
    this.dragDropListeners.forEach(l => {
      window.removeEventListener(l.type, l.listener)
    })
    this.dragDropListeners = []
  }

  processFileContent(content: ?string) {
    if (!content) {
      return
    }
    try {
      let endpoint: Endpoint = JSON.parse(content)
      if (!endpoint.name || !endpoint.type) {
        throw new Error('Invalid endpoint')
      }
      delete endpoint.id
      this.chooseEndpoint(endpoint)
    } catch (err) {
      notificationStore.alert('The endpoint could not be parsed', 'error')
    }
  }

  chooseEndpoint(endpoint: Endpoint) {
    this.props.onUploadEndpoint(endpoint)
  }

  async handleFileUpload(files: FileList) {
    let text = await ObjectUtils.readFromFileList(files)
    this.processFileContent(text)
  }

  renderLoading() {
    if (!this.props.loading) {
      return null
    }

    return (
      <LoadingWrapper>
        <StatusImage loading />
        <LoadingText>Loading providers ...</LoadingText>
      </LoadingWrapper>
    )
  }

  renderProviders() {
    if (this.props.loading) {
      return null
    }

    return (
      <Providers>
        <Logos>
          {this.props.providers.map(k => {
            return (
              <EndpointLogosStyled
                height={128}
                key={k}
                endpoint={k}
                data-test-id={`cProvider-endpointLogo-${k}`}
                onClick={() => { this.props.onProviderClick(k) }}
              />
            )
          })}
        </Logos>
        <Upload highlight={this.state.highlightDropzone}>
          <UploadMessage>
            You can
            &nbsp;<UploadMessageButton onClick={() => { this.fileInput.click() }}>upload</UploadMessageButton>&nbsp;
            or drop a .endpoint file.
          </UploadMessage>
        </Upload>
        <FakeFileInput
          type="file"
          innerRef={r => { this.fileInput = r }}
          accept=".endpoint"
          onChange={e => { this.handleFileUpload(e.target.files) }}
        />
        <Button secondary onClick={this.props.onCancelClick} data-test-id="cProvider-cancelButton">Cancel</Button>
      </Providers>
    )
  }

  render() {
    return (
      <Wrapper>
        {this.renderProviders()}
        {this.renderLoading()}
      </Wrapper>
    )
  }
}

export default ChooseProvider
