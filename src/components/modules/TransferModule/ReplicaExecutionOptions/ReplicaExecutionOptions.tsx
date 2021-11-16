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

import Button from '@src/components/ui/Button/Button'
import FieldInput from '@src/components/ui/FieldInput/FieldInput'

import LabelDictionary from '@src/utils/LabelDictionary'
import KeyboardManager from '@src/utils/KeyboardManager'
import { executionOptions } from '@src/constants'
import type { Field } from '@src/@types/Field'

import executionImage from './images/execution.svg'

const Wrapper = styled.div<any>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 32px 32px 32px;
`
const ExecutionImage = styled.div<any>`
  margin-top: 48px;
  margin-bottom: 96px;
  width: 96px;
  height: 96px;
  background: url('${executionImage}') no-repeat center;
`
const Form = styled.div<any>`
  height: 120px;
`
const Buttons = styled.div<any>`
  display: flex;
  justify-content: space-between;
  width: 100%;
`
const FieldInputStyled = styled(FieldInput)`
  width: 319px;
  justify-content: space-between;
`
type Props = {
  options?: { [prop: string]: any } | null,
  onChange?: (fieldName: string, fieldValue: string) => void,
  executionLabel: string,
  onCancelClick: () => void,
  onExecuteClick: (options: Field[]) => void,
}
type State = {
  fields: Field[],
}
@observer
class ReplicaExecutionOptions extends React.Component<Props, State> {
  static defaultProps = {
    executionLabel: 'Execute',
  }

  state: State = {
    fields: [...executionOptions],
  }

  componentDidMount() {
    KeyboardManager.onEnter('execution-options', () => { this.props.onExecuteClick(this.state.fields) }, 2)
  }

  componentWillUnmount() {
    KeyboardManager.removeKeyDown('execution-options')
  }

  getFieldValue(field: Field) {
    if (!this.props.options || this.props.options[field.name] == null) {
      return field.value
    }

    return this.props.options[field.name]
  }

  handleValueChange(field: Field, value: string) {
    this.setState(prevState => {
      const fields = prevState.fields.map(f => {
        if (f.name === field.name) {
          return { ...f, value }
        }
        return { ...f }
      })
      return { fields }
    })

    if (this.props.onChange) {
      this.props.onChange(field.name, value)
    }
  }

  render() {
    return (
      <Wrapper>
        <ExecutionImage />
        <Form>
          {this.state.fields.map(field => (
            <FieldInputStyled
              key={field.name}
              name={field.name}
              type="boolean"
              layout="page"
              value={this.getFieldValue(field)}
              label={LabelDictionary.get(field.name)}
              onChange={value => this.handleValueChange(field, value)}
              data-test-id={`reOptions-option-${field.name}`}
            />
          ))}
        </Form>
        <Buttons>
          <Button secondary onClick={this.props.onCancelClick} data-test-id="reOptions-cancelButton">Cancel</Button>
          <Button onClick={() => { this.props.onExecuteClick(this.state.fields) }} data-test-id="reOptions-execButton">{this.props.executionLabel}</Button>
        </Buttons>
      </Wrapper>
    )
  }
}

export default ReplicaExecutionOptions
