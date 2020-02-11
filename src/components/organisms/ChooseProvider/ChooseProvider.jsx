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
import FileUtils from '../../../utils/FileUtils'
import configLoader from '../../../utils/Config'

import type { FileContent } from '../../../utils/FileUtils'
import type { Endpoint, MultiValidationItem } from '../../../types/Endpoint'

import MultipleUploadedEndpoints from './MultipleUploadedEndpoints'

const Wrapper = styled.div`
  display: flex;
  min-height: 0;
  padding: 22px 0 32px 0;
  text-align: center;
`
const Providers = styled.div`
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`
const Logos = styled.div`
  display: flex;
  flex-wrap: wrap;
  overflow: auto;
  min-height: 0;
  flex-grow: 1;
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
  flex-grow: 1;
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
  onValidateMultipleEndpoints: (endpoints: Endpoint[]) => void,
  onResizeUpdate?: () => void,
  multiValidating: boolean,
  multiValidation: MultiValidationItem[],
  onRemoveEndpoint: (endpoint: Endpoint) => void,
  onResetValidation: () => void,
}
type State = {
  highlightDropzone: boolean,
  multipleUploadedEndpoints: (Endpoint | string)[],
}
@observer
class ChooseProvider extends React.Component<Props, State> {
  state = {
    highlightDropzone: false,
    multipleUploadedEndpoints: [],
  }

  fileInput: HTMLElement
  dragDropListeners: { type: string, listener: (e: any) => any }[] = []

  componentWillMount() {
    setTimeout(() => { this.addDragAndDrop() }, 1000)
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState.multipleUploadedEndpoints.length !== this.state.multipleUploadedEndpoints.length
      && this.props.onResizeUpdate) {
      this.props.onResizeUpdate()
    }
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
        let filesContents = await FileUtils.readContentFromFileList(e.dataTransfer.files)
        if (filesContents.length === 1) {
          this.processOneFileContent(filesContents[0].content)
        } else {
          this.processMultipleFilesContents(filesContents)
        }
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

  parseEndpoint(content: string): Endpoint {
    let endpoint: Endpoint = JSON.parse(content)
    if (!endpoint.name || !endpoint.type || !this.props.providers.find(p => p === endpoint.type)) {
      throw new Error()
    }
    delete endpoint.id
    return endpoint
  }

  processOneFileContent(content: string) {
    this.props.onResetValidation()
    try {
      let endpoint = this.parseEndpoint(content)
      this.chooseEndpoint(endpoint)
    } catch (err) {
      notificationStore.alert('Invalid .endpoint file', 'error')
    }
  }

  processMultipleFilesContents(filesContents: FileContent[]) {
    this.props.onResetValidation()
    let uniqueNames: { [string]: number } = {}
    let endpoints = filesContents.map(fileContent => {
      try {
        let endpoint = this.parseEndpoint(fileContent.content)
        let key = `${endpoint.type}${endpoint.name}`
        if (uniqueNames[key] === undefined) {
          uniqueNames[key] = 0
        } else {
          uniqueNames[key] += 1
          endpoint.name = `${endpoint.name} (${uniqueNames[key]})`
        }
        return endpoint
      } catch (err) {
        return fileContent.name
      }
    })

    let sortPriority = configLoader.config.providerSortPriority
    endpoints.sort((a, b) => {
      if (typeof a === 'string' && typeof b === 'string') {
        return a.localeCompare(b)
      }
      if (typeof a === 'string') {
        return 1
      }
      if (typeof b === 'string') {
        return -1
      }
      if (sortPriority[a.type] && sortPriority[b.type]) {
        return (sortPriority[a.type] - sortPriority[b.type]) || a.type.localeCompare(b.type)
      }
      if (sortPriority[a.type]) {
        return -1
      }
      if (sortPriority[b.type]) {
        return 1
      }
      return a.type.localeCompare(b.type)
    })

    this.setState({ multipleUploadedEndpoints: endpoints })
  }

  chooseEndpoint(endpoint: Endpoint) {
    this.props.onUploadEndpoint(endpoint)
  }

  async handleFileUpload(files: FileList) {
    let filesContents = await FileUtils.readContentFromFileList(files)
    if (filesContents.length === 1) {
      this.processOneFileContent(filesContents[0].content)
    } else {
      this.processMultipleFilesContents(filesContents)
    }
  }

  handleRemoveUploadedEndpoint(endpoint: Endpoint | string, isAdded: boolean) {
    let multipleUploadedEndpoints = this.state.multipleUploadedEndpoints.filter(e => {
      if (typeof e === 'string' && typeof endpoint === 'string') {
        return e !== endpoint
      }
      if (typeof e !== 'string' && typeof endpoint !== 'string') {
        return e.name !== endpoint.name || e.type !== endpoint.type
      }
      return true
    })
    if (isAdded && typeof endpoint !== 'string') {
      this.props.onRemoveEndpoint(endpoint)
    }
    this.setState({ multipleUploadedEndpoints })
  }

  renderMultipleUploadedEndpoints() {
    return (
      <MultipleUploadedEndpoints
        endpoints={this.state.multipleUploadedEndpoints}
        onBackClick={() => { this.setState({ multipleUploadedEndpoints: [] }) }}
        onRemove={(e, isAdded) => { this.handleRemoveUploadedEndpoint(e, isAdded) }}
        validating={this.props.multiValidating}
        multiValidation={this.props.multiValidation}
        onValidateClick={() => {
          // $FlowIgnore
          this.props.onValidateMultipleEndpoints(this.state.multipleUploadedEndpoints.filter(e => typeof e !== 'string'))
        }}
        onDone={this.props.onCancelClick}
      />
    )
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
            or drop multiple .endpoint and zipped .endpoint files.
          </UploadMessage>
        </Upload>
        <FakeFileInput
          type="file"
          innerRef={r => { this.fileInput = r }}
          accept=".endpoint,.zip"
          multiple
          onChange={e => { this.handleFileUpload(e.target.files) }}
        />
        <Button secondary onClick={this.props.onCancelClick} data-test-id="cProvider-cancelButton">Cancel</Button>
      </Providers>
    )
  }

  render() {
    return (
      <Wrapper>
        {this.state.multipleUploadedEndpoints.length === 0 ? this.renderProviders() : null}
        {this.renderLoading()}
        {this.state.multipleUploadedEndpoints.length > 0 ? this.renderMultipleUploadedEndpoints() : null}
      </Wrapper>
    )
  }
}

export default ChooseProvider
