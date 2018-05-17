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

import ToggleButtonBar from '../../../components/atoms/ToggleButtonBar'
import type { Field } from '../../../types/Field'
import { Wrapper, Fields, FieldStyled, Row } from '../default/ContentPlugin'

const ToggleButtonBarStyled = styled(ToggleButtonBar) `
  margin-top: 16px;
`

type Props = {
  connectionInfoSchema: Field[],
  validation: { valid: boolean, validation: { message: string } },
  invalidFields: string[],
  getFieldValue: (field: ?Field) => any,
  handleFieldChange: (field: ?Field, value: any) => void,
  disabled: boolean,
  cancelButtonText: string,
  validating: boolean,
  onRef: (contentPlugin: any) => void,
  onResizeUpdate: (scrollOfset: number) => void,
  scrollableRef: (ref: HTMLElement) => void,
}
type State = {
  useAdvancedOptions: boolean,
}
class ContentPlugin extends React.Component<Props, State> {
  constructor() {
    super()
    this.state = {
      useAdvancedOptions: false,
    }
  }

  componentDidMount() {
    this.props.onRef(this)
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState.useAdvancedOptions !== this.state.useAdvancedOptions) {
      this.props.onResizeUpdate(0)
    }
  }

  componentWillUnmount() {
    this.props.onRef(undefined)
  }

  getApiVersion(): number {
    return this.props.getFieldValue(this.props.connectionInfoSchema.find(n => n.name === 'identity_api_version'))
  }

  handleAdvancedOptionsToggle(useAdvancedOptions: boolean) {
    this.setState({ useAdvancedOptions })
  }

  findInvalidFields = () => {
    let inputChoices = ['user_domain', 'project_domain']

    const invalidFields = this.props.connectionInfoSchema.filter(field => {
      if (field.required) {
        let value = this.props.getFieldValue(field)
        return !value
      }
      let inputChoice = inputChoices.find(c => c === field.name)
      if (inputChoice && this.getApiVersion() > 2) {
        let selectionValue = this.props.getFieldValue(this.props.connectionInfoSchema.find(f => f.name === inputChoice))
        let itemValue = this.props.getFieldValue(this.props.connectionInfoSchema.find(f => f.name === selectionValue))
        return !itemValue
      }

      return false
    }).map(f => f.name)

    return invalidFields
  }

  filterSimpleAdvanced(): Field[] {
    let extraAdvancedFields = ['description', 'glance_api_version', 'identity_api_version']
    if (this.getApiVersion() > 2) {
      extraAdvancedFields = extraAdvancedFields.concat(['user_domain', 'project_domain'])
    }
    let ignoreFields = ['user_domain_id', 'project_domain_id', 'user_domain_name', 'project_domain_name']
    return this.props.connectionInfoSchema.filter(f => !ignoreFields.find(i => i === f.name)).filter(field => {
      if (this.state.useAdvancedOptions) {
        return true
      }
      return field.required || extraAdvancedFields.find(fieldName => field.name === fieldName)
    })
  }

  renderSimpleAdvancedToggle() {
    return (
      <ToggleButtonBarStyled
        items={[{ label: 'Simple', value: 'simple' }, { label: 'Advanced', value: 'advanced' }]}
        selectedValue={this.state.useAdvancedOptions ? 'advanced' : 'simple'}
        onChange={item => { this.handleAdvancedOptionsToggle(item.value === 'advanced') }}
      />
    )
  }

  renderFields() {
    const rows = []
    let lastField
    let fields = this.filterSimpleAdvanced()

    fields.forEach((field, i) => {
      const currentField = (
        <FieldStyled
          {...field}
          required={field.required || (this.getApiVersion() > 2 ? field.name === 'user_domain' || field.name === 'project_domain' : false)}
          large
          disabled={this.props.disabled}
          password={field.name === 'password'}
          highlight={this.props.invalidFields.findIndex(fn => fn === field.name) > -1}
          value={this.props.getFieldValue(field)}
          onChange={value => { this.props.handleFieldChange(field, value) }}
          getFieldValue={fieldName => this.props.getFieldValue(this.props.connectionInfoSchema.find(n => n.name === fieldName))}
          onFieldChange={(fieldName, fieldValue) => { this.props.handleFieldChange(this.props.connectionInfoSchema.find(n => n.name === fieldName), fieldValue) }}
        />
      )
      if (i % 2 !== 0) {
        rows.push((
          <Row key={field.name}>
            {lastField}
            {currentField}
          </Row>
        ))
      } else if (i === this.props.connectionInfoSchema.length - 1) {
        rows.push((
          <Row key={field.name}>
            {currentField}
          </Row>
        ))
      }
      lastField = currentField
    })

    return (
      <Fields innerRef={ref => { this.props.scrollableRef(ref) }}>
        {rows}
      </Fields>
    )
  }

  render() {
    return (
      <Wrapper>
        {this.renderSimpleAdvancedToggle()}
        {this.renderFields()}
      </Wrapper>
    )
  }
}

export default ContentPlugin
