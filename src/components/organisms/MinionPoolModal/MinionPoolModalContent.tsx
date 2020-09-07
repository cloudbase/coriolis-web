/*
Copyright (C) 2020  Cloudbase Solutions SRL
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

import * as React from 'react'
import styled from 'styled-components'

import LabelDictionary from '../../../utils/LabelDictionary'

import FieldInput from '../../molecules/FieldInput'
import type { Field } from '../../../@types/Field'

import StyleProps from '../../styleUtils/StyleProps'
import Palette from '../../styleUtils/Palette'
import EndpointLogos from '../../atoms/EndpointLogos/EndpointLogos'
import { Endpoint } from '../../../@types/Endpoint'

const Wrapper = styled.div<any>`
  display: flex;
  flex-direction: column;
  min-height: 0;
`
const Fields = styled.div<any>`
  display: flex;
  margin-top: 32px;
  padding: 0 32px;
  flex-direction: column;
  overflow: auto;
`
const FieldStyled = styled(FieldInput)`
  min-width: ${props => (props.useTextArea ? '100%' : '224px')};
  max-width: ${StyleProps.inputSizes.large.width}px;
  margin-bottom: 16px;
`
const Row = styled.div<any>`
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
`
const EndpointField = styled.div`
  min-width: ${StyleProps.inputSizes.large.width}px;
  max-width: ${StyleProps.inputSizes.large.width}px;
  margin-bottom: 16px;
`
const EndpointFieldLabel = styled.div<any>`
  font-weight: ${StyleProps.fontWeights.medium};
  flex-grow: 1;
  margin-bottom: 2px;
  font-size: 10px;
  color: ${Palette.grayscale[3]};
  text-transform: uppercase;
  display: flex;
  align-items: center;
`
const EndpointFieldLabelText = styled.span`
  margin-right: 24px;
`
const EndpointFieldValue = styled.div`
  display: flex;
  align-items: center;
`
const EndpointFieldValueText = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 8px;
  font-size: 12px;
  color: ${Palette.grayscale[4]};
`
const PoolPlatformFieldText = styled.div`
  text-transform: capitalize;
`
const EndpointFieldValueLogo = styled.div``
const Group = styled.div<any>`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`
const GroupName = styled.div<any>`
  display: flex;
  align-items: center;
  margin: 32px 0 24px 0;
`
const GroupNameText = styled.div<any>`
  margin: 0 32px;
  font-size: 16px;
`
const GroupNameBar = styled.div<any>`
  flex-grow: 1;
  background: ${Palette.grayscale[3]};
  height: 1px;
`
const GroupFields = styled.div<any>`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
`
type Props = {
  defaultSchema: Field[],
  envSchema: Field[],
  invalidFields: string[],
  endpoint: Endpoint
  getFieldValue: (field: Field | null | undefined) => any,
  onFieldChange: (field: Field | null, value: any) => void,
  disabled: boolean,
  cancelButtonText: string,
  onResizeUpdate: (scrollOffset: number) => void,
  scrollableRef: (ref: HTMLElement) => void,
  onCreateClick: () => void
  onCancelClick: () => void
}
class MinionPoolModalContent extends React.Component<Props> {
  renderEndpoint() {
    return (
      <EndpointField>
        <EndpointFieldLabel>
          <EndpointFieldLabelText>
            Endpoint
          </EndpointFieldLabelText>
        </EndpointFieldLabel>
        <EndpointFieldValue>
          <EndpointFieldValueLogo>
            <EndpointLogos
              endpoint={this.props.endpoint.type}
              height={32}
            />
          </EndpointFieldValueLogo>
          <EndpointFieldValueText title={this.props.endpoint.name}>
            ({this.props.endpoint.name})
          </EndpointFieldValueText>
        </EndpointFieldValue>
      </EndpointField>
    )
  }

  renderPoolPlatform() {
    return (
      <EndpointField>
        <EndpointFieldLabel>
          <EndpointFieldLabelText>
            Pool Platform
          </EndpointFieldLabelText>
        </EndpointFieldLabel>
        <EndpointFieldValue>
          <PoolPlatformFieldText>
            {this.props.getFieldValue(this.props.defaultSchema.find(f => f.name === 'pool_platform'))}
          </PoolPlatformFieldText>
        </EndpointFieldValue>
      </EndpointField>
    )
  }

  renderFieldSet(customFields: Field[]) {
    const rows: JSX.Element[] = []
    let lastField: JSX.Element
    let i = 0
    customFields.forEach((field, schemaIndex) => {
      let currentField
      if (field.name === 'endpoint_id') {
        currentField = this.renderEndpoint()
      } else if (field.name === 'pool_platform') {
        currentField = this.renderPoolPlatform()
      } else {
        currentField = (
          <FieldStyled
            {...field}
            label={field.title || LabelDictionary.get(field.name)}
            width={StyleProps.inputSizes.large.width}
            disabled={this.props.disabled}
            highlight={this.props.invalidFields.findIndex(fn => fn === field.name) > -1}
            value={this.props.getFieldValue(field)}
            onChange={value => { this.props.onFieldChange(field, value) }}
            nullableBoolean
          />
        )
      }

      const pushRow = (field1: React.ReactNode, field2?: React.ReactNode) => {
        rows.push((
          <Row key={field.name}>
            {field1}
            {field2}
          </Row>
        ))
      }
      if (field.useTextArea) {
        pushRow(currentField)
        i -= 1
      } else if (i % 2 !== 0) {
        pushRow(lastField, currentField)
      } else if (schemaIndex === customFields.length - 1) {
        pushRow(currentField)
        if (field.useTextArea) {
          i -= 1
        }
      } else {
        lastField = currentField
      }
      i += 1
    })

    return rows
  }

  renderFields() {
    return (
      <Fields ref={(ref: HTMLElement) => { this.props.scrollableRef(ref) }}>
        <Group>
          <GroupFields>
            {this.renderFieldSet(this.props.defaultSchema)}
          </GroupFields>
        </Group>
        <Group>
          <GroupName>
            <GroupNameBar />
            <GroupNameText>Environment Options</GroupNameText>
            <GroupNameBar />
          </GroupName>
          <GroupFields>
            {this.renderFieldSet(this.props.envSchema)}
          </GroupFields>
        </Group>
      </Fields>
    )
  }

  render() {
    return (
      <Wrapper>
        {this.renderFields()}
      </Wrapper>
    )
  }
}

export default MinionPoolModalContent
