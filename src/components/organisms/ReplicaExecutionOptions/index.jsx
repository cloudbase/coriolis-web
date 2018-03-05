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
import styled from 'styled-components'

import Button from '../../atoms/Button'
import WizardOptionsField from '../../molecules/WizardOptionsField'

import LabelDictionary from '../../../utils/LabelDictionary'
import KeyboardManager from '../../../utils/KeyboardManager'
import { executionOptions } from '../../../config'
import type { Field } from '../../../types/Field'

import executionImage from './images/execution.svg'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 32px 32px 32px;
`
const ExecutionImage = styled.div`
  margin-top: 48px;
  margin-bottom: 96px;
  width: 96px;
  height: 96px;
  background: url('${executionImage}') no-repeat center;
`
const Form = styled.div`
  height: 120px;
`
const Buttons = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`
const WizardOptionsFieldStyled = styled(WizardOptionsField) `
  width: 319px;
  justify-content: space-between;
`
type Props = {
  options: ?{ [string]: mixed },
  onChange: (fieldName: string, fieldValue: string) => void,
  executionLabel: string,
  onCancelClick: () => void,
  onExecuteClick: (options: Field[]) => void,
}
type State = {
  fields: Field[],
}
class ReplicaExecutionOptions extends React.Component<Props, State> {
  static defaultProps: $Shape<Props> = {
    executionLabel: 'Execute',
  }

  constructor() {
    super()

    this.state = {
      fields: [...executionOptions],
    }
  }

  componentDidMount() {
    KeyboardManager.onEnter('execution-options', () => { this.props.onExecuteClick(this.state.fields) }, 2)
  }

  componentWillUnmount() {
    KeyboardManager.removeKeyDown('execution-options')
  }

  getFieldValue(field: Field) {
    if (!this.props.options || this.props.options[field.name] === null || this.props.options[field.name] === undefined) {
      return field.value
    }

    return this.props.options[field.name]
  }

  handleValueChange(field: Field, value: string) {
    let fields = this.state.fields.map(f => {
      if (f.name === field.name) {
        return { ...f, value }
      }
      return { ...f }
    })
    this.setState({ fields })

    if (this.props.onChange) {
      this.props.onChange(field.name, value)
    }
  }

  render() {
    return (
      <Wrapper>
        <ExecutionImage />
        <Form>
          {this.state.fields.map(field => {
            return (
              <WizardOptionsFieldStyled
                key={field.name}
                name={field.name}
                type="strict-boolean"
                value={this.getFieldValue(field)}
                label={LabelDictionary.get(field.name)}
                onChange={value => this.handleValueChange(field, value)}
              />
            )
          })}
        </Form>
        <Buttons>
          <Button secondary onClick={this.props.onCancelClick}>Cancel</Button>
          <Button onClick={() => { this.props.onExecuteClick(this.state.fields) }}>{this.props.executionLabel}</Button>
        </Buttons>
      </Wrapper>
    )
  }
}

export default ReplicaExecutionOptions
