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
import CopyMultilineValue from '../../atoms/CopyMultilineValue'
import StatusImage from '../../atoms/StatusImage'

import type { Endpoint } from '../../../types/Endpoint'
import type { MainItem } from '../../../types/MainItem'
import StyleProps from '../../styleUtils/StyleProps'
import Palette from '../../styleUtils/Palette'
import DateUtils from '../../../utils/DateUtils'
import LabelDictionary from '../../../utils/LabelDictionary'

const Wrapper = styled.div`
  ${StyleProps.exactWidth(StyleProps.contentWidth)}
  margin: 0 auto;
  padding-left: 126px;
`
const Info = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 32px;
  margin-left: -32px;  
`
const Field = styled.div`
  ${StyleProps.exactWidth('calc(50% - 32px)')}
  margin-bottom: 32px;
  margin-left: 32px;  
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
const Link = styled.a`
  color: ${Palette.primary};
  text-decoration: none;
  cursor: pointer;
`

type Props = {
  item: ?Endpoint,
  connectionInfo: ?$PropertyType<Endpoint, 'connection_info'>,
  loading: boolean,
  usage: { migrations: MainItem[], replicas: MainItem[] },
  onDeleteClick: () => void,
  onValidateClick: () => void,
  onEditClick: () => void,
  passwordFields?: string[],
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
        <StatusImage loading data-test-id="edContent-connLoading" />
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

      if (this.props.passwordFields && this.props.passwordFields.find(fn => fn === key)) {
        valueClass = <PasswordValue value={value} data-test-id="edContent-connPassword" />
      } else {
        valueClass = this.renderValue(value, `connValue-${key}`)
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
          <Button secondary onClick={this.props.onEditClick} data-test-id="edContent-editButton">Edit Endpoint</Button>
          <Button onClick={this.props.onValidateClick} data-test-id="edContent-validateButton">Validate Endpoint</Button>
        </MainButtons>
        <DeleteButton>
          <Button hollow alert onClick={this.props.onDeleteClick} data-test-id="edContent-deleteButton">Delete Endpoint</Button>
        </DeleteButton>
      </Buttons>
    )
  }

  renderValue(value: string, dataTestId?: string) {
    return <CopyValue data-test-id={dataTestId ? `edContent-${dataTestId}` : undefined} value={value} maxWidth="90%" />
  }

  renderUsage(items: MainItem[]) {
    return items.map((item, i) => (
      <span>
        <Link
          key={item.id}
          href={`#/${item.type}/${item.id}`}
        >
          {item.instances.join(', ')}
        </Link>
        {i < items.length - 1 ? ', ' : ''}
      </span>
    ))
  }

  render() {
    this.renderedKeys = {}
    const { type, name, description, created_at, id } = this.props.item || {}
    const usage = this.props.usage.replicas.concat(this.props.usage.migrations)

    return (
      <Wrapper>
        <EndpointLogos endpoint={type} />
        <Info>
          <Field>
            <Label>Id</Label>
            {this.renderValue(id)}
          </Field>
          <Field>
            <Label>Name</Label>
            {this.renderValue(name, 'name')}
          </Field>
          <Field>
            <Label>Type</Label>
            {this.renderValue(type, 'type')}
          </Field>
          <Field>
            <Label>Description</Label>
            {description ? <CopyMultilineValue data-test-id="edContent-description" value={description} /> : <Value>-</Value>}
          </Field>
          <Field>
            <Label>Created</Label>
            {this.renderValue(DateUtils.getLocalTime(created_at).format('DD/MM/YYYY HH:mm'), 'created')}
          </Field>
          <Field>
            <Label>Used in replicas/migrations ({usage.length})</Label>
            {usage.length > 0 ? this.renderUsage(usage) : <Value>-</Value>}
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
