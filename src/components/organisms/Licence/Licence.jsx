/*
Copyright (C) 2019  Cloudbase Solutions SRL
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
import styled, { css } from 'styled-components'
import moment from 'moment'

import Button from '../../atoms/Button'
import LoadingButton from '../../molecules/LoadingButton'
import StatusImage from '../../atoms/StatusImage'
import TextArea from '../../atoms/TextArea'

import StyleProps from '../../styleUtils/StyleProps'
import Palette from '../../styleUtils/Palette'

import type { Licence } from '../../../types/Licence'

import licenceImage from './images/licence'

const Wrapper = styled.div`
  min-height: 0;
  overflow: auto;
  width: 100%;
`
const TextAreaStyled = styled(TextArea)`
  ${props => props.dropzone ? css`
    border: 1px dashed ${Palette.primary};
  ` : ''}
`
const LicenceInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  padding: 0 32px;
`
const LicenceRow = styled.div`
  display: flex;
  margin-top: 16px;
`
const LicenceRowLabel = styled.div`
  display: flex;
  align-items: center;
  font-weight: ${StyleProps.fontWeights.medium};
  font-size: 10px;
  text-transform: uppercase;
  color: ${Palette.grayscale[3]};
`
const LicenceLink = styled.span`
  text-transform: initial;
  color: ${Palette.primary};
  font-weight: ${StyleProps.fontWeights.regular};
  cursor: pointer;
`
const LicenceRowContent = styled.div`
  ${props => props.width ? css`width: ${props.width};` : ''}
`
const LicenceRowDescription = styled.div`
  margin-top: 4px;
`
const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`
const LoadingText = styled.div`
  font-size: 18px;
  margin-top: 32px;
`
const ButtonsWrapper = styled.div`
  display: flex;
  margin-top: 48px;
  justify-content: ${props => props.spaceBetween ? 'space-between' : 'center'};
  padding: 0 32px;
`
const Logo = styled.div`
  width: 96px;
  height: 96px;
  margin: 0 auto;
  text-align: center;
`
const LicenceAddWrapper = styled.div`
  padding: 0 32px;
`
const Description = styled.div`
  color: ${Palette.grayscale[3]};
`
const FakeFileInput = styled.input`
  position: absolute;
  opacity: 0;
  top: -99999px;
`

type Props = {
  licenceInfo: ?Licence,
  loadingLicenceInfo: boolean,
  onRequestClose: () => void,
  onAddModeChange: (addMode: boolean) => void,
  addMode: boolean,
  onAddLicence: (licence: string) => void,
  addingLicence: boolean,
}
type State = {
  licence: string,
  isValid: boolean,
  highlightDropzone: boolean,
}

const readFromFileList = async (fileList: FileList): Promise<?string> => {
  if (!fileList.length) {
    return null
  }
  let file = fileList[0]
  let reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.onload = e => { resolve(e.target.result) }
    reader.onerror = e => { reject(e) }
    reader.readAsText(file)
  })
}

@observer
class LicenceC extends React.Component<Props, State> {
  state = {
    licence: '',
    isValid: false,
    highlightDropzone: false,
  }

  fileInput: HTMLElement

  dragDropListeners: { type: string, listener: (e: any) => any }[] = []

  componentWillReceiveProps(newProps: Props) {
    if (newProps.addMode === this.props.addMode) {
      return
    }

    if (newProps.addMode) {
      setTimeout(() => { this.addDragAndDrop() }, 1000)
    } else {
      this.setState({ licence: '' })
      this.removeDragDrop()
    }
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
        let text = await readFromFileList(e.dataTransfer.files)
        if (text) {
          this.handleLicenceChange(text)
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

  validate() {
    let isValid = true
    if (this.state.licence.indexOf('-----BEGIN CORIOLIS LICENCE-----') !== 0) {
      isValid = false
    }
    if (this.state.licence.indexOf('-----END CORIOLIS LICENCE-----') === -1) {
      isValid = false
    }
    this.setState({ isValid })
  }

  handleAddLicenceClick() {
    this.props.onAddModeChange(true)
  }

  handleAddButtonClick() {
    this.props.onAddLicence(this.state.licence)
  }

  handleLicenceChange(licence: string) {
    this.setState({ licence }, () => { this.validate() })
  }

  handleUploadClick() {
    this.fileInput.click()
  }

  async handleFileUpload(files: FileList) {
    let text = await readFromFileList(files)
    if (text) {
      this.handleLicenceChange(text)
    }
  }

  renderLicenceInfoLoading() {
    return (
      <LoadingWrapper>
        <StatusImage loading />
        <LoadingText>Loading licence info ...</LoadingText>
      </LoadingWrapper>
    )
  }

  renderLicenceInfo(info: Licence) {
    return (
      <LicenceInfoWrapper>
        <LicenceRow>
          <LicenceRowContent>
            <LicenceRowLabel>
              Licence
              <LicenceLink
                style={{ marginLeft: '8px' }}
                onClick={() => { this.handleAddLicenceClick() }}
              >Add Licence</LicenceLink>
            </LicenceRowLabel>
            <LicenceRowDescription>
              Coriolis® Licence is active until&nbsp;
              {moment(info.currentPeriodEnd).format('DD MMM YYYY')}
              &nbsp;({moment(info.currentPeriodEnd).diff(new Date(), 'days')} days from now).
            </LicenceRowDescription>
          </LicenceRowContent>
        </LicenceRow>
        <LicenceRow>
          <LicenceRowContent width="50%" style={{ marginRight: '32px' }}>
            <LicenceRowLabel>VM Replicas</LicenceRowLabel>
            <LicenceRowDescription>
              {info.totalReplicas - info.performedReplicas} VM Replicas remaining.
            </LicenceRowDescription>
          </LicenceRowContent>
          <LicenceRowContent width="50%">
            <LicenceRowLabel>VM Migrations</LicenceRowLabel>
            <LicenceRowDescription>
              {info.totalMigations - info.performedMigrations} VM Migrations remaining.
            </LicenceRowDescription>
          </LicenceRowContent>
        </LicenceRow>
      </LicenceInfoWrapper>
    )
  }

  renderButtons() {
    return (
      <ButtonsWrapper spaceBetween={this.props.addMode}>
        {this.props.addMode ? (
          <Button
            secondary
            large
            onClick={() => { this.props.onAddModeChange(false) }}
          >Back</Button>
        )
          : (
            <Button
              secondary
              large
              onClick={() => { this.props.onRequestClose() }}
            >Close</Button>
          )}
        {(this.props.addMode && !this.props.addingLicence) ? (
          <Button
            large
            onClick={() => { this.handleAddButtonClick() }}
            disabled={!this.state.isValid}
          >Add Licence</Button>
        ) :
          (this.props.addMode && this.props.addingLicence) ?
            <LoadingButton
              large
              onClick={() => { this.handleAddButtonClick() }}
            >Add Licence
            </LoadingButton>
            : null}
      </ButtonsWrapper>
    )
  }

  renderLicenceAdd() {
    return (
      <LicenceAddWrapper>
        <Logo
          dangerouslySetInnerHTML={
            { __html: licenceImage(this.state.isValid ? Palette.primary : Palette.grayscale[5]) }
          }
        />
        <LicenceRowLabel style={{ marginTop: '32px' }}>Licence</LicenceRowLabel>
        <TextAreaStyled
          placeholder="Paste/Drag Licence file here ..."
          dropzone={this.state.highlightDropzone}
          style={{
            width: '100%',
            marginTop: '4px',
          }}
          value={this.state.licence}
          onChange={e => { this.handleLicenceChange(e.target.value) }}
        />
        <Description>
          Drag the Licence file or paste the contents in box above.
          <br />Alternatively you can <LicenceLink
            onClick={() => { this.handleUploadClick() }}
          >upload</LicenceLink> the file.
        </Description>
        <FakeFileInput
          type="file"
          innerRef={r => { this.fileInput = r }}
          accept=".pem, .txt"
          onChange={e => { this.handleFileUpload(e.target.files) }}
        />
      </LicenceAddWrapper>
    )
  }

  render() {
    let showInfo = !this.props.loadingLicenceInfo && !this.props.addMode
    return (
      <Wrapper>
        {showInfo && this.props.licenceInfo ? this.renderLicenceInfo(this.props.licenceInfo) : null}
        {this.props.addMode ? this.renderLicenceAdd() : null}
        {this.props.loadingLicenceInfo ? this.renderLicenceInfoLoading() : null}
        {this.renderButtons()}
      </Wrapper>
    )
  }
}

export default LicenceC
