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

import type { Project } from '@src/@types/Project'
import type { Field as FieldType } from '@src/@types/Field'
import Button from '@src/components/ui/Button'
import Modal from '@src/components/ui/Modal'
import FieldInput from '@src/components/ui/FieldInput'

import LabelDictionary from '@src/utils/LabelDictionary'
import KeyboardManager from '@src/utils/KeyboardManager'
import { ThemeProps } from '@src/components/Theme'
import projectImage from './images/project.svg'

const Wrapper = styled.div<any>`
  padding: 48px 32px 32px 32px;
`
const Image = styled.div<any>`
  width: 96px;
  height: 96px;
  background: url('${projectImage}') center no-repeat;
  margin: 0 auto;
`
const Form = styled.div<any>`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-top: 64px;

  > div {
    margin-top: 16px;
  }
`
const Buttons = styled.div<any>`
  margin-top: 32px;
  display: flex;
  justify-content: space-between;
`

type Props = {
  project?: Project | null,
  isNewProject?: boolean,
  loading: boolean,
  onRequestClose: () => void,
  onUpdateClick: (project: Project) => void,
}

type State = {
  name: string,
  enabled?: boolean,
  highlightFieldNames: string[],
  description?: string,
}
const testName = 'projectModal'
@observer
class ProjectModal extends React.Component<Props, State> {
  UNSAFE_componentWillMount() {
    this.setState({
      name: this.props.project ? this.props.project.name : '',
      description: this.props.project ? this.props.project.description : '',
      enabled: this.props.project ? this.props.project.enabled : true,
      highlightFieldNames: [],
    })
  }

  componentDidMount() {
    KeyboardManager.onEnter('projectModal', () => {
      this.handleUpdateClick()
    }, 2)
  }

  componentWillUnmount() {
    KeyboardManager.removeKeyDown('projectModal')
  }

  handleUpdateClick() {
    if (this.highlightFields()) {
      return
    }

    this.props.onUpdateClick({
      id: '',
      name: this.state.name,
      description: this.state.description,
      enabled: this.state.enabled,
    })
  }

  highlightFields() {
    const highlightFieldNames = []
    if (!this.state.name) {
      highlightFieldNames.push('project_name')
    }
    if (highlightFieldNames.length > 0) {
      this.setState({ highlightFieldNames })
      return true
    }
    this.setState({ highlightFieldNames: [] })
    return false
  }

  renderField(field: FieldType, value: any, onChange: (value: any) => void) {
    return (
      <FieldInput
        layout="modal"
        data-test-id={`${testName}-field-${field.name}`}
        key={field.name}
        name={field.name}
        type={field.type || 'string'}
        value={value}
        label={LabelDictionary.get(field.name)}
        onChange={onChange}
        width={ThemeProps.inputSizes.large.width}
        disabled={this.props.loading}
        required={field.required}
        highlight={Boolean(this.state.highlightFieldNames.find(n => n === field.name))}
      />
    )
  }

  renderForm() {
    const fields = [
      this.renderField(
        { name: 'project_name', required: true },
        this.state.name,
        name => { this.setState({ name }) },
      ),
      this.renderField(
        { name: 'description' },
        this.state.description,
        description => { this.setState({ description }) },
      ),
      this.renderField(
        { name: 'Enabled', type: 'boolean' },
        this.state.enabled,
        enabled => { this.setState({ enabled }) },
      ),
    ]

    return (
      <Form>
        {fields}
      </Form>
    )
  }

  render() {
    const label = this.props.isNewProject ? 'New Project' : 'Update Project'

    return (
      <Modal
        isOpen
        title={label}
        onRequestClose={this.props.onRequestClose}
      >
        <Wrapper>
          <Image />
          {this.renderForm()}
          <Buttons>
            <Button
              secondary
              large
              onClick={this.props.onRequestClose}
            >Cancel
            </Button>
            <Button
              data-test-id={`${testName}-updateButton`}
              large
              disabled={this.props.loading}
              onClick={() => { this.handleUpdateClick() }}
            >{label}
            </Button>
          </Buttons>
        </Wrapper>
      </Modal>
    )
  }
}

export default ProjectModal
