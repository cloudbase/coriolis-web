/*
Copyright (C) 2021  Cloudbase Solutions SRL
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
import styled, { css } from 'styled-components'
import { ThemePalette, ThemeProps } from '@src/components/Theme'

import FileUtils from '@src/utils/FileUtils'
import requiredImage from './images/required.svg'

const getInputWidth = (props: any) => {
  if (props.width) {
    return typeof props.width === 'number' ? `${props.width - 8}px` : props.width
  }

  if (props.large) {
    return `${ThemeProps.inputSizes.large.width - 8}px`
  }

  return `${ThemeProps.inputSizes.regular.width - 8}px`
}

const Wrapper = styled.div<any>`
  position: relative;
  ${props => ThemeProps.exactWidth(getInputWidth(props))}
  height: ${props => props.height || `${ThemeProps.inputSizes.regular.height}px`};
  border-radius: ${ThemeProps.borderRadius};
  border: 1px solid ${props => (props.highlight ? ThemePalette.alert : 'transparent')};
  ${props => (props.highlight ? css`padding-left: 8px;` : '')}
`
const Required = styled.div<any>`
  position: absolute;
  width: 8px;
  height: 8px;
  right: ${props => (props.highlight ? -15 : -22)}px;
  top: 11px;
  background: url('${requiredImage}') center no-repeat;
`
const Prompt = styled.div<any>`
  color: ${ThemePalette.primary};
  flex-shrink: 0;
  margin-right: 4px;
  ${props => (!props.disabled ? css`
    cursor: pointer;
    :hover {
      text-decoration: underline;
    }
  ` : '')}
`
const FileName = styled.div<any>`
  max-width: 124px;
  text-overflow: ellipsis;
  overflow: hidden;
  margin-right: 16px;
  white-space: nowrap;
`
const Content = styled.div<any>`
  display: flex;
  height: 100%;
  align-items: center;
  ${props => (props.disabledLoading
    ? ThemeProps.animations.disabledLoading
    : props.disabled ? css`opacity: 0.6;` : '')}
`
const FakeFileInput = styled.input`
  position: absolute;
  opacity: 0;
  top: -99999px;
`
type Props = {
  required?: boolean,
  disabledLoading?: boolean,
  disabled?: boolean,
  width?: string | number,
  large?: boolean,
  style?: any,
  className?: string,
  highlight?: boolean,
  onUpload?: (content: string | null) => void,
}
type State = {
  fileName: string | null
}
@observer
class FileInput extends React.Component<Props, State> {
  state = {
    fileName: null,
  }

  inputRef: HTMLElement | null | undefined

  handleFileInputClick() {
    if (this.props.disabled || this.props.disabledLoading || !this.inputRef) {
      return
    }
    this.inputRef.click()
  }

  async handleFileUpload(files: FileList | null) {
    if (!files?.length) {
      return
    }
    const fileName = files[0].name
    const content = await FileUtils.readTextFromFirstFile(files)
    this.setState({ fileName })
    if (this.props.onUpload) {
      this.props.onUpload(content)
    }
  }

  render() {
    return (
      <Wrapper
        width={this.props.width}
        large={this.props.large}
        style={this.props.style}
        className={this.props.className}
        highlight={this.props.highlight}
      >
        <Content
          disabledLoading={this.props.disabledLoading}
          disabled={this.props.disabled}
        >
          {this.state.fileName ? <FileName>{this.state.fileName}</FileName> : null}
          <Prompt
            onClick={() => { this.handleFileInputClick() }}
            disabled={this.props.disabled || this.props.disabledLoading}
          >Choose File ...
          </Prompt>
        </Content>
        <FakeFileInput
          type="file"
          ref={r => { this.inputRef = r }}
          onChange={e => { this.handleFileUpload(e.target.files) }}
        />
        {this.props.required ? <Required highlight={this.props.highlight} /> : null}
      </Wrapper>
    )
  }
}

export default FileInput
