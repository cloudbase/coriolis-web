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

import { EndpointField, Button, LoadingButton } from '../../../components'

const Wrapper = styled.div``
const Fields = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-left: -64px;
  margin-top: 32px;
`
const FieldStyled = styled(EndpointField)`
  margin-left: 64px;
  min-width: 224px;
  max-width: 224px;
  margin-bottom: 16px;
`
const Buttons = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 32px;
`

class ContentPlugin extends React.Component {
  static propTypes = {
    connectionInfoSchema: PropTypes.array,
    validation: PropTypes.object,
    invalidFields: PropTypes.array,
    getFieldValue: PropTypes.func,
    handleFieldChange: PropTypes.func,
    disabled: PropTypes.bool,
    cancelButtonText: PropTypes.string,
    validating: PropTypes.bool,
    handleValidateClick: PropTypes.func,
    handleCancelClick: PropTypes.func,
    onRef: PropTypes.func,
  }

  componentDidMount() {
    this.props.onRef(this)
  }
  componentWillUnmount() {
    this.props.onRef(undefined)
  }

  findInvalidFields = () => {
    const invalidFields = this.props.connectionInfoSchema.filter(field => {
      if (field.required) {
        let value = this.props.getFieldValue(field)
        return !value
      }
      return false
    }).map(f => f.name)

    return invalidFields
  }

  renderFields() {
    const renderedFields = this.props.connectionInfoSchema.map(field => (
      <FieldStyled
        {...field}
        large
        disabled={this.props.disabled}
        key={field.name}
        password={field.name === 'password'}
        highlight={this.props.invalidFields.findIndex(fn => fn === field.name) > -1}
        value={this.props.getFieldValue(field)}
        onChange={value => { this.props.handleFieldChange(field, value) }}
      />
    ))

    return (
      <Fields>
        {renderedFields}
      </Fields>
    )
  }

  renderButtons() {
    let actionButton = <Button large onClick={() => this.props.handleValidateClick()}>Validate and save</Button>

    let message = 'Validating Endpoint ...'
    if (this.props.validating || (this.props.validation && this.props.validation.valid)) {
      if (this.props.validation && this.props.validation.valid) {
        message = 'Saving ...'
      }

      actionButton = <LoadingButton large>{message}</LoadingButton>
    }

    return (
      <Buttons>
        <Button large secondary onClick={() => { this.props.handleCancelClick() }}>{this.props.cancelButtonText}</Button>
        {actionButton}
      </Buttons>
    )
  }

  render() {
    return (
      <Wrapper>
        {this.renderFields()}
        {this.renderButtons()}
      </Wrapper>
    )
  }
}

export default ContentPlugin
