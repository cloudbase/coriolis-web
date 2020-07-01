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

import Button from '../../atoms/Button'
import FieldInput from '../../molecules/FieldInput'
import ToggleButtonBar from '../../atoms/ToggleButtonBar'
import WizardScripts from '../WizardScripts'

import LabelDictionary from '../../../utils/LabelDictionary'
import KeyboardManager from '../../../utils/KeyboardManager'
import StyleProps from '../../styleUtils/StyleProps'

import replicaMigrationImage from './images/replica-migration.svg'
import replicaMigrationFields from './replicaMigrationFields'

import type { Field } from '../../../@types/Field'
import type { Instance, InstanceScript } from '../../../@types/Instance'

const Wrapper = styled.div<any>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 32px 32px 32px;
  min-height: 0;
`
const Image = styled.div<any>`
  ${StyleProps.exactWidth('288px')}
  ${StyleProps.exactHeight('96px')}
  background: url('${replicaMigrationImage}') center no-repeat;
  margin: 80px 0;
`
const OptionsBody = styled.div<any>`
  display: flex;
  flex-direction: column;
`
const ScriptsBody = styled.div<any>`
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: auto;
  min-height: 0;
  margin-bottom: 32px;
`
const Form = styled.div<any>`
  display: flex;
  flex-wrap: wrap;
  margin-left: -64px;
  justify-content: space-between;
  margin: 0 auto 46px auto;
`
const Buttons = styled.div<any>`
  display: flex;
  justify-content: space-between;
  width: 100%;
`
const FieldInputStyled = styled(FieldInput)`
  width: 224px;
  justify-content: space-between;
  margin-bottom: 32px;
`

type Props = {
  instances: Instance[],
  loadingInstances: boolean,
  defaultSkipOsMorphing?: boolean | null,
  onCancelClick: () => void,
  onMigrateClick: (fields: Field[], uploadedScripts: InstanceScript[]) => void,
  onResizeUpdate?: (scrollableRef: HTMLElement, scrollOffset?: number) => void,
}
type State = {
  fields: Field[],
  selectedBarButton: string,
  uploadedScripts: InstanceScript[],
}

@observer
class ReplicaMigrationOptions extends React.Component<Props, State> {
  state: State = {
    fields: [],
    selectedBarButton: 'options',
    uploadedScripts: [],
  }

  scrollableRef!: HTMLElement

  UNSAFE_componentWillMount() {
    this.setState({
      fields: replicaMigrationFields.map(f => (f.name === 'skip_os_morphing' ? (
        { ...f, value: this.props.defaultSkipOsMorphing || null }
      ) : f)),
    })
  }

  componentDidMount() {
    KeyboardManager.onEnter('migration-options', () => { this.migrate() }, 2)
  }

  componentDidUpdate(_: Props, prevState: State) {
    if (prevState.selectedBarButton !== this.state.selectedBarButton) {
      if (this.props.onResizeUpdate) {
        this.props.onResizeUpdate(this.scrollableRef, 0)
      }
    }
  }

  componentWillUnmount() {
    KeyboardManager.removeKeyDown('migration-options')
  }

  migrate() {
    this.props.onMigrateClick(this.state.fields, this.state.uploadedScripts)
  }

  handleValueChange(field: Field, value: boolean) {
    this.setState(prevState => {
      const fields = prevState.fields.map(f => {
        const newField = { ...f }
        if (f.name === field.name) {
          newField.value = value
        }
        return newField
      })

      return { fields }
    })
  }

  handleCanceScript(global: string | null, instanceName: string | null) {
    this.setState(prevState => ({
      uploadedScripts: prevState.uploadedScripts
        .filter(s => (global ? s.global !== global : s.instanceName !== instanceName)),
    }))
  }

  handleScriptUpload(script: InstanceScript) {
    this.setState(prevState => ({
      uploadedScripts: [
        ...prevState.uploadedScripts,
        script,
      ],
    }))
  }

  renderOptions() {
    return (
      <Form>
        {this.state.fields.map(field => (
          <FieldInputStyled
            width={224}
            key={field.name}
            name={field.name}
            type={field.type}
            value={field.value || field.default}
            minimum={field.minimum}
            maximum={field.maximum}
            layout="page"
            label={LabelDictionary.get(field.name)}
            onChange={value => this.handleValueChange(field, value)}
            description={LabelDictionary.getDescription(field.name)}
          />
        ))}
      </Form>
    )
  }

  renderScripts() {
    return (
      <WizardScripts
        instances={this.props.instances}
        loadingInstances={this.props.loadingInstances}
        onScriptUpload={s => { this.handleScriptUpload(s) }}
        onCancelScript={(g, i) => { this.handleCanceScript(g, i) }}
        uploadedScripts={this.state.uploadedScripts}
        scrollableRef={(r: HTMLElement) => { this.scrollableRef = r }}
        layout="modal"
      />
    )
  }

  renderBody() {
    const Body = this.state.selectedBarButton === 'options' ? OptionsBody : ScriptsBody

    return (
      <Body>
        <ToggleButtonBar
          items={[{ label: 'Options', value: 'options' }, { label: 'User Scripts', value: 'script' }]}
          selectedValue={this.state.selectedBarButton}
          onChange={item => { this.setState({ selectedBarButton: item.value }) }}
          style={{ marginBottom: '32px' }}
        />
        {this.state.selectedBarButton === 'options' ? this.renderOptions() : this.renderScripts()}
      </Body>
    )
  }

  render() {
    return (
      <Wrapper>
        <Image />
        {this.renderBody()}
        <Buttons>
          <Button secondary onClick={this.props.onCancelClick} data-test-id="rmOptions-cancelButton">Cancel</Button>
          <Button onClick={() => { this.migrate() }} data-test-id="rmOptions-execButton">Migrate</Button>
        </Buttons>
      </Wrapper>
    )
  }
}

export default ReplicaMigrationOptions
