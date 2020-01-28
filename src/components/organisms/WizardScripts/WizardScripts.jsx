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
import styled from 'styled-components'

import InfoIcon from '../../atoms/InfoIcon'
import { Close as InputClose } from '../../atoms/TextInput'
import { Image as InstanceImage } from '../WizardInstances'
import StatusIcon from '../../atoms/StatusIcon'

import StyleProps from '../../styleUtils/StyleProps'
import Palette from '../../styleUtils/Palette'
import FileUtils from '../../../utils/FileUtils'

import scriptItemImage from './images/script-item.svg'

import type { Instance, InstanceScript } from '../../../types/Instance'

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  overflow: auto;
  flex-direction: column;
  min-height: 0;
`
const Group = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
`
const Heading = styled.div`
  margin-bottom: 16px;
  font-size: ${props => props.layout === 'modal' ? '16px' : '24px'};
  font-weight: ${props => props.layout === 'modal' ? StyleProps.fontWeights.medium : StyleProps.fontWeights.light};
  display: flex;
`
const InfoIconStyled = styled(InfoIcon)`
  margin-top: ${props => props.layout === 'modal' ? '1px' : '5px'};
  margin-left: 8px;
`
const Scripts = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`
const Script = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  border-top: 1px solid ${Palette.grayscale[1]};
  padding: 8px 0;

  &:last-child {
    border-bottom: 1px solid ${Palette.grayscale[1]};
  }
`
const Name = styled.div`
  display: flex;
  align-items: center;
`
const OsImage = styled.div`
  ${StyleProps.exactSize('48px')}
  background: url('${scriptItemImage}') center no-repeat;
`
const NameLabel = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 16px;
`
const NameLabelTitle = styled.div`
  font-size: 16px;
  word-break: break-word;
`
const NameLabelSubtitle = styled.div`
  font-size: 12px;
  color: ${Palette.grayscale[5]};
  margin-top: 1px;
  word-break: break-word;
`
const Link = styled.div`
  color: ${Palette.primary};
  flex-shrink: 0;
  margin: 0 8px 0 16px;
  cursor: pointer;
  :hover {
    text-decoration: underline;
  }
`
const UploadedScript = styled.div`
  display: flex;
  position: relative;
`
const UploadedScriptFileName = styled.div`
  max-width: 124px;
  text-overflow: ellipsis;
  overflow: hidden;
  margin-right: 32px;
  white-space: nowrap;
`
const InputCloseStyled = styled(InputClose)`
  top: 0px;
`
const FakeFileInput = styled.input`
  position: absolute;
  opacity: 0;
  top: -99999px;
`

type Props = {
  instances: Instance[],
  uploadedScripts: InstanceScript[],
  layout?: 'modal' | 'page',
  loadingInstances?: boolean,
  onScriptUpload: (instanceScript: InstanceScript) => void,
  onCancelScript: (global: ?string, instanceName: ?string) => void,
  onScrollableRef?: (ref: HTMLElement) => void,
}
type FileInputRefs = {
  [string]: {
    inputRef: HTMLInputElement,
  }
}
@observer
class WizardScripts extends React.Component<Props> {
  fileInputRefs: FileInputRefs = {}

  async handleFileUpload(files: FileList, global: ?string, instanceName: ?string) {
    if (!files.length) {
      return
    }
    let fileName = files[0].name
    let scriptContent = await FileUtils.readTextFromFirstFile(files)
    this.props.onScriptUpload({
      instanceName,
      global,
      fileName,
      scriptContent: scriptContent || '',
    })
  }

  renderScriptItem(
    global: ?string,
    instanceName: ?string,
    title: string,
    subtitle?: string
  ) {
    let uploadedScript = this.props.uploadedScripts.find(
      s => s.instanceName ? s.instanceName === instanceName : s.global ? s.global === global : false)

    return (
      <Script key={title}>
        <Name>
          {global ? <OsImage /> : <InstanceImage />}
          <NameLabel>
            <NameLabelTitle>{title}</NameLabelTitle>
            {subtitle ? <NameLabelSubtitle>{subtitle}</NameLabelSubtitle> : null}
          </NameLabel>
        </Name>
        {uploadedScript ? (
          <UploadedScript>
            <UploadedScriptFileName title={uploadedScript.fileName}>{uploadedScript.fileName}</UploadedScriptFileName>
            <InputCloseStyled
              show
              onClick={() => {
                this.props.onCancelScript(global, instanceName)
                let ref = this.fileInputRefs[title]
                if (ref) {
                  ref.inputRef.value = ''
                }
              }
              }
            />
          </UploadedScript>
        ) :
          (
            <Link onClick={() => {
              let ref = this.fileInputRefs[title]
              if (ref) {
                ref.inputRef.click()
              }
            }}
            >Choose File...</Link>
          )}
        <FakeFileInput
          type="file"
          innerRef={r => { this.fileInputRefs[title] = { inputRef: r } }}
          onChange={e => { this.handleFileUpload(e.target.files, global, instanceName) }}
        />
      </Script>
    )
  }

  renderScriptGroup(group: 'global' | 'instance') {
    if (group === 'global') {
      return (
        <Group>
          <Heading
            layout={this.props.layout}
          >
            Global Scripts
            <InfoIconStyled
              layout={this.props.layout}
              text="Specify user scripts that will run during OS morphing for a particular OS type"
            />
          </Heading>
          <Scripts>
            {this.renderScriptItem('windows', null, 'Windows Script File')}
            {this.renderScriptItem('linux', null, 'Linux Script File')}
          </Scripts>
        </Group>
      )
    }

    if (this.props.instances.length === 0 && !this.props.loadingInstances) {
      return null
    }

    return (
      <Group layout={this.props.layout}>
        <Heading
          layout={this.props.layout}
        >
          Instance Scripts
          {!this.props.loadingInstances ? (
            <InfoIconStyled
              layout={this.props.layout}
              text="Specify user scripts that will run during OS morphing for a particular instance"
            />
          ) : null}
          {this.props.loadingInstances ? (
            <StatusIcon style={{ marginTop: '1px', marginLeft: '8px' }} status="RUNNING" />
          ) : null}
        </Heading>
        <Scripts>
          {this.props.instances.map(instance => {
            let title = instance.instance_name || instance.name
            let osLabel = instance.os_type ? instance.os_type === 'windows' ? 'Windows' : instance.os_type === 'linux' ? 'Linux' : instance.os_type : ''
            let osType = osLabel ? `${osLabel} OS | ` : ''
            let subtitle = `${osType}${instance.num_cpu} vCPU | ${instance.memory_mb} MB RAM`

            return this.renderScriptItem(null, title, title, subtitle)
          })}
        </Scripts>
      </Group>
    )
  }

  render() {
    return (
      <Wrapper innerRef={r => {
        if (this.props.onScrollableRef) {
          this.props.onScrollableRef(r)
        }
      }}
      >
        {this.renderScriptGroup('global')}
        {this.renderScriptGroup('instance')}
      </Wrapper>
    )
  }
}

export default WizardScripts
