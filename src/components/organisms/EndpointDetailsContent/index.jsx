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
import { observer } from 'mobx-react'
import styled from 'styled-components'

import EndpointLogos from '../../atoms/EndpointLogos'
import PasswordValue from '../../atoms/PasswordValue'
import Button from '../../atoms/Button'
import CopyValue from '../../atoms/CopyValue'
import StatusImage from '../../atoms/StatusImage'

import type { Endpoint } from '../../../types/Endpoint'
import StyleProps from '../../styleUtils/StyleProps'
import Palette from '../../styleUtils/Palette'
import DateUtils from '../../../utils/DateUtils'
import LabelDictionary from '../../../utils/LabelDictionary'

const Wrapper = styled.div`
  min-width: 656px;
  max-width: 656px;
  margin: 0 auto;
`
const Info = styled.div`
  margin-top: 32px;
  display: flex;
  flex-wrap: wrap;
`
const Field = styled.div`
  margin-bottom: 32px;
  min-width: 50%;
  max-width: 50%;
`
const Label = styled.div`
  font-size: 10px;
  font-weight: ${StyleProps.fontWeights.medium};
  color: ${Palette.grayscale[3]};
  text-transform: uppercase;
  margin-bottom: 3px;
`
const Value = styled.div``
const Buttons = styled.div`
  display: flex;
  justify-content: space-between;
`
const MainButtons = styled.div`
  display: flex;
  flex-direction: column;
  button {
    margin-bottom: 16px;
  }
`
const DeleteButton = styled.div``
const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin: 32px 0 64px 0;
`

type Props = {
  item: ?Endpoint,
  connectionInfo: ?$PropertyType<Endpoint, 'connection_info'>,
  loading: boolean,
  onDeleteClick: () => void,
  onValidateClick: () => void,
  onEditClick: () => void,
}
@observer
class EndpointDetailsContent extends React.Component<Props> {
  renderedKeys: { [string]: boolean }

  renderConnectionInfoLoading() {
    if (!this.props.loading) {
      return null
    }

    return (
      <LoadingWrapper>
        <StatusImage loading />
      </LoadingWrapper>
    )
  }

  renderConnectionInfo(connectionInfo: any) {
    if (!connectionInfo) {
      return null
    }

    return Object.keys(connectionInfo).map(key => {
      let value = connectionInfo[key]

      if (key === 'secret_ref') {
        return null
      }

      if (typeof connectionInfo[key] === 'object') {
        return this.renderConnectionInfo(connectionInfo[key])
      }

      if (this.renderedKeys[key]) {
        return null
      }

      this.renderedKeys[key] = true

      if (value === true) {
        value = 'Yes'
      } else if (value === false) {
        value = 'No'
      } else if (!value) {
        value = '-'
      }

      let valueClass = null

      if (key === 'password') {
        valueClass = <PasswordValue value={value} />
      } else {
        valueClass = this.renderValue(value)
      }

      return (
        <Field key={key}>
          <Label>{LabelDictionary.get(key)}</Label>
          {valueClass}
        </Field>
      )
    })
  }

  renderButtons() {
    return (
      <Buttons>
        <MainButtons>
          <Button secondary onClick={this.props.onEditClick}>Edit Endpoint</Button>
          <Button onClick={this.props.onValidateClick}>Validate Endpoint</Button>
        </MainButtons>
        <DeleteButton>
          <Button hollow alert onClick={this.props.onDeleteClick}>Delete Endpoint</Button>
        </DeleteButton>
      </Buttons>
    )
  }

  renderValue(value: string) {
    return <CopyValue value={value} maxWidth="90%" />
  }

  render() {
    this.renderedKeys = {}
    const { type, name, description, created_at } = this.props.item || {}
    return (
      <Wrapper>
        <EndpointLogos endpoint={type} />
        <Info>
          <Field>
            <Label>Name</Label>
            {this.renderValue(name)}
          </Field>
          <Field>
            <Label>Type</Label>
            {this.renderValue(type)}
          </Field>
          <Field>
            <Label>Description</Label>
            {description ? this.renderValue(description) : <Value>-</Value>}
          </Field>
          <Field>
            <Label>Created</Label>
            {this.renderValue(DateUtils.getLocalTime(created_at).format('DD/MM/YYYY HH:mm'))}
          </Field>
          {this.renderConnectionInfoLoading()}
          {this.renderConnectionInfo(this.props.connectionInfo)}
        </Info>
        {this.renderButtons()}
      </Wrapper>
    )
  }
}

export default EndpointDetailsContent
