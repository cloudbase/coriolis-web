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

import React from 'react'
import { observer } from 'mobx-react'
import styled, { css } from 'styled-components'

import InfoIcon from '../../../ui/InfoIcon/InfoIcon'
import { Close as InputClose } from '../../../ui/TextInput/TextInput'
import { Image as InstanceImage } from '../WizardInstances/WizardInstances'
import StatusIcon from '../../../ui/StatusComponents/StatusIcon/StatusIcon'

import StyleProps from '../../../styleUtils/StyleProps'
import Palette from '../../../styleUtils/Palette'
import FileUtils from '../../../../utils/FileUtils'

import scriptItemImage from './images/script-item.svg'

import type { Instance, InstanceScript } from '../../../../@types/Instance'
import { UserScriptData } from '../../../../@types/MainItem'
import DomUtils from '../../../../utils/DomUtils'

const Wrapper = styled.div<any>`
  width: 100%;
  display: flex;
  overflow: auto;
  flex-direction: column;
  min-height: 0;
`
const Group = styled.div<any>`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
`
const Heading = styled.div<any>`
  margin-bottom: 16px;
  font-size: ${props => (props.layout === 'modal' ? '16px' : '24px')};
  font-weight: ${props => (props.layout === 'modal' ? StyleProps.fontWeights.medium : StyleProps.fontWeights.light)};
  display: flex;
`
const InfoIconStyled = styled(InfoIcon)<any>`
  margin-top: ${props => (props.layout === 'modal' ? '1px' : '5px')};
  margin-left: 8px;
`
const Scripts = styled.div<any>`
  width: 100%;
  display: flex;
  flex-direction: column;
`
const Script = styled.div<any>`
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
const Name = styled.div<any>`
  display: flex;
  align-items: center;
`
const OsImage = styled.div<any>`
  ${StyleProps.exactSize('48px')}
  background: url('${scriptItemImage}') center no-repeat;
`
const NameLabel = styled.div<any>`
  display: flex;
  flex-direction: column;
  margin-left: 16px;
`
const NameLabelTitle = styled.div<any>`
  font-size: 16px;
  word-break: break-word;
`
const NameLabelSubtitle = styled.div<any>`
  font-size: 12px;
  color: ${Palette.grayscale[5]};
  margin-top: 1px;
  word-break: break-word;
`
const LinkButton = styled.div<any>`
  color: ${Palette.primary};
  flex-shrink: 0;
  margin: 0 8px 0 16px;
  cursor: pointer;
  :hover {
    text-decoration: underline;
  }
`
const UploadedScript = styled.div<any>`
  display: flex;
  position: relative;
`
const UploadedScriptFileName = styled.div<any>`
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
const ScriptDataActions = styled.div`
  display: flex;
  margin-left: -8px;
  margin-top: 8px;
  > div {
    margin-left: 8px;
  }
`
const ScriptDataAction = styled.div<{ red?: boolean, disabled?: boolean }>`
  color: ${props => (props.red ? Palette.alert : Palette.primary)};
  cursor: pointer;
  ${props => (props.disabled ? css`
    opacity: 0.6;
    cursor: default;
  ` : '')}
  font-size: 12px;
`

type Props = {
  instances: Instance[],
  uploadedScripts: InstanceScript[],
  removedScripts: InstanceScript[],
  layout?: 'modal' | 'page',
  loadingInstances?: boolean,
  userScriptData: UserScriptData | null | undefined
  style?: React.CSSProperties
  onScriptUpload: (instanceScript: InstanceScript) => void,
  onCancelScript: (global: 'windows' | 'linux' | null, instanceName: string | null) => void,
  onScrollableRef?: (ref: HTMLElement) => void,
  scrollableRef?: (r: HTMLElement) => void
  onScriptDataRemove: (script: InstanceScript) => void
}
type FileInputRefs = {
  [prop: string]: {
    inputRef: HTMLInputElement,
  }
}
@observer
class WizardScripts extends React.Component<Props> {
  fileInputRefs: FileInputRefs = {}

  async handleFileUpload(
    files: FileList | null,
    global: 'windows' | 'linux' | null,
    instanceId: string | null,
  ) {
    if (!files || !files.length) {
      return
    }
    const fileName = files[0].name
    const scriptContent = await FileUtils.readTextFromFirstFile(files)
    this.props.onScriptUpload({
      instanceId,
      global,
      fileName,
      scriptContent: scriptContent || '',
    })
  }

  handleScriptDataDownload(scriptData: string, fileName: string) {
    DomUtils.download(scriptData, fileName)
  }

  renderScriptItem(
    global: 'windows' | 'linux' | null,
    instanceId: string | null,
    title: string,
    subtitle?: string,
  ) {
    const uploadedScript = this.props.uploadedScripts.find(
      s => (s.instanceId
        ? s.instanceId === instanceId : s.global ? s.global === global : false),
    )
    let scriptData: string | null | undefined = null
    if (global) {
      scriptData = this.props.userScriptData?.global?.[global]
    } else if (instanceId) {
      scriptData = this.props.userScriptData?.instances?.[instanceId]
    }
    const isRemoved: boolean = Boolean(this.props.removedScripts
      .find(s => (global ? s.global === global : s.instanceId === instanceId)))

    return (
      <Script key={title}>
        <Name>
          {global ? <OsImage /> : <InstanceImage />}
          <NameLabel>
            <NameLabelTitle>{title}</NameLabelTitle>
            {subtitle ? <NameLabelSubtitle>{subtitle}</NameLabelSubtitle> : null}
            {scriptData ? (
              <ScriptDataActions>
                <ScriptDataAction
                  title="Downloads the currently uploaded script"
                  onClick={() => {
                    this.handleScriptDataDownload(scriptData as string, title.toLowerCase().replaceAll(' ', '_'))
                  }}
                >Download
                </ScriptDataAction>
                <ScriptDataAction
                  title={isRemoved ? 'The currently uploaded script will be removed' : 'Removes the currently uploaded script'}
                  red
                  disabled={isRemoved}
                  onClick={() => {
                    if (isRemoved) {
                      return
                    }
                    this.props.onScriptDataRemove({
                      global, instanceId, scriptContent: null, fileName: null,
                    })
                  }}
                >{isRemoved ? 'To be removed' : 'Remove'}
                </ScriptDataAction>
              </ScriptDataActions>
            ) : null}
          </NameLabel>
        </Name>
        {uploadedScript ? (
          <UploadedScript>
            <UploadedScriptFileName
              title={uploadedScript.fileName}
            >{uploadedScript.fileName}
            </UploadedScriptFileName>
            <InputCloseStyled
              show
              onClick={() => {
                this.props.onCancelScript(global, instanceId)
                const ref = this.fileInputRefs[title]
                if (ref) {
                  ref.inputRef.value = ''
                }
              }}
            />
          </UploadedScript>
        )
          : (
            <LinkButton
              onClick={() => {
                const ref = this.fileInputRefs[title]
                if (ref) {
                  ref.inputRef.click()
                }
              }}
            >Choose File...
            </LinkButton>
          )}
        <FakeFileInput
          type="file"
          ref={(r: HTMLInputElement) => { this.fileInputRefs[title] = { inputRef: r } }}
          onChange={e => { this.handleFileUpload(e.target.files, global, instanceId) }}
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
              text="Specify user scripts that will run during OS morphing for a particular instance. These override the uploaded global scripts."
            />
          ) : null}
          {this.props.loadingInstances ? (
            <StatusIcon style={{ marginTop: '1px', marginLeft: '8px' }} status="RUNNING" />
          ) : null}
        </Heading>
        <Scripts>
          {this.props.instances.map(instance => {
            const id = instance.instance_name || instance.id
            const title = instance.name
            const osLabel = instance.os_type ? instance.os_type === 'windows' ? 'Windows' : instance.os_type === 'linux' ? 'Linux' : instance.os_type : ''
            const osType = osLabel ? `${osLabel} OS | ` : ''
            const subtitle = `${osType}${instance.num_cpu} vCPU | ${instance.memory_mb} MB RAM`

            return this.renderScriptItem(null, id, title, subtitle)
          })}
        </Scripts>
      </Group>
    )
  }

  render() {
    return (
      <Wrapper
        style={this.props.style}
        ref={(r: HTMLElement) => {
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
