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
import styled from 'styled-components'
import PropTypes from 'prop-types'

import { WizardOptionsField, Button } from 'components'

import LabelDictionary from '../../../utils/LabelDictionary'

import executionImage from './images/execution.svg'

import { executionOptions } from '../../../config'

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

class ReplicaExecutionOptions extends React.Component {
  static propTypes = {
    options: PropTypes.object,
    onChange: PropTypes.func,
    executionLabel: PropTypes.string,
    onCancelClick: PropTypes.func,
    onExecuteClick: PropTypes.func,
  }

  static defaultProps = {
    executionLabel: 'Execute',
  }

  constructor() {
    super()

    this.state = {
      fields: [...executionOptions],
    }
  }

  getFieldValue(field) {
    if (!this.props.options || this.props.options[field.name] === null || this.props.options[field.name] === undefined) {
      return field.value
    }

    return this.props.options[field.name]
  }

  handleValueChange(field, value) {
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
