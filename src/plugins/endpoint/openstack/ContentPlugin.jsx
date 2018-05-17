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
  handleFieldChange: (field: Field, value: any) => void,
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

  handleAdvancedOptionsToggle(useAdvancedOptions: boolean) {
    this.setState({ useAdvancedOptions })
  }

  findInvalidFields = () => {
    const apiVersion = this.props.getFieldValue(this.props.connectionInfoSchema.find(n => n.name === 'identity_api_version'))
    const invalidFields = this.props.connectionInfoSchema.filter(field => {
      let required
      if (typeof field.required === 'function') {
        required = field.required(apiVersion)
      } else {
        required = field.required
      }
      if (required) {
        let value = this.props.getFieldValue(field)
        return !value
      }
      return false
    }).map(f => f.name)

    return invalidFields
  }

  filterSimpleAdvanced(): Field[] {
    const apiVersion = this.props.getFieldValue(this.props.connectionInfoSchema.find(n => n.name === 'identity_api_version'))
    const extraAdvancedFields = ['description']
    return this.props.connectionInfoSchema.filter(field => {
      if (this.state.useAdvancedOptions) {
        return true
      }
      let isBasic
      if (typeof field.isBasic === 'function') {
        isBasic = field.isBasic(apiVersion)
      } else {
        isBasic = field.isBasic
      }
      return field.required || isBasic || extraAdvancedFields.find(fieldName => field.name === fieldName)
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
    let apiVersion = this.props.getFieldValue(this.props.connectionInfoSchema.find(n => n.name === 'identity_api_version'))

    let fields = this.filterSimpleAdvanced()

    fields.forEach((field, i) => {
      const currentField = (
        <FieldStyled
          {...field}
          required={typeof field.required === 'function' ? field.required(apiVersion) : field.required}
          large
          disabled={this.props.disabled}
          password={field.name === 'password'}
          highlight={this.props.invalidFields.findIndex(fn => fn === field.name) > -1}
          value={this.props.getFieldValue(field)}
          onChange={value => { this.props.handleFieldChange(field, value) }}
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
