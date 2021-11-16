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

import LabelDictionary from '@src/utils/LabelDictionary'

import FieldInput from '@src/components/ui/FieldInput/FieldInput'
import type { Field } from '@src/@types/Field'

import { ThemePalette, ThemeProps } from '@src/components/Theme'
import EndpointLogos from '@src/components/modules/EndpointModule/EndpointLogos/EndpointLogos'
import { Endpoint } from '@src/@types/Endpoint'
import ToggleButtonBar from '@src/components/ui/ToggleButtonBar/ToggleButtonBar'

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
const ToggleButtonBarStyled = styled(ToggleButtonBar)`
  margin-top: 16px;
`
const FieldStyled = styled(FieldInput)`
  min-width: ${props => (props.useTextArea ? '100%' : '224px')};
  max-width: ${ThemeProps.inputSizes.large.width}px;
  margin-bottom: 16px;
`
const Row = styled.div<any>`
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
`
const EndpointField = styled.div`
  min-width: ${ThemeProps.inputSizes.large.width}px;
  max-width: ${ThemeProps.inputSizes.large.width}px;
  margin-bottom: 16px;
`
const EndpointFieldLabel = styled.div<any>`
  font-weight: ${ThemeProps.fontWeights.medium};
  flex-grow: 1;
  margin-bottom: 2px;
  font-size: 10px;
  color: ${ThemePalette.grayscale[3]};
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
  height: 29px;
`
const EndpointFieldValueText = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 8px;
  font-size: 12px;
  color: ${ThemePalette.grayscale[4]};
`
const EndpointFieldValueLabel = styled.div`
  text-transform: capitalize;
`
const EndpointFieldValueLogo = styled.div``
const Group = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
`
const GroupName = styled.div<any>`
  display: flex;
  align-items: center;
  margin: 32px 0 24px 0;
`
const DisabledMessage = styled.div`
  display: flex;
  align-items: center;
  width: 340px;
  margin: 0 auto 32px auto;
  text-align: center;
  font-size: 13px;
`
const GroupNameText = styled.div<any>`
  margin: 0 32px;
  font-size: 16px;
`
const GroupNameBar = styled.div<any>`
  flex-grow: 1;
  background: ${ThemePalette.grayscale[3]};
  height: 1px;
`
const GroupFields = styled.div<any>`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
`
type Props = {
  envOptionsDisabled: boolean
  defaultSchema: Field[],
  envSchema: Field[],
  invalidFields: string[],
  endpoint: Endpoint
  platform: 'source' | 'destination'
  optionsLoading: boolean
  optionsLoadingSkipFields: string[],
  getFieldValue: (field: Field | null | undefined) => any,
  onFieldChange: (field: Field | null, value: any) => void,
  disabled: boolean,
  cancelButtonText: string,
  onResizeUpdate: (scrollOffset: number) => void,
  scrollableRef: (ref: HTMLElement) => void,
  onCreateClick: () => void
  onCancelClick: () => void
}
type State = {
  useAdvancedOptions: boolean
}
class MinionPoolModalContent extends React.Component<Props, State> {
  state = {
    useAdvancedOptions: false,
  }

  componentDidUpdate(_: Props, prevState: State) {
    if (prevState.useAdvancedOptions !== this.state.useAdvancedOptions) {
      this.props.onResizeUpdate(0)
    }
  }

  filterBySimpleAdvanced(fields: Field[]): Field[] {
    if (this.state.useAdvancedOptions) {
      return fields
    }
    const exceptions = ['endpoint_id', 'platform', 'os_type']
    return fields.filter(f => (f.required && f.default == null) || exceptions.indexOf(f.name) > -1)
  }

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

  renderReadOnlyField(field: Field) {
    return (
      <EndpointField>
        <EndpointFieldLabel>
          <EndpointFieldLabelText>
            {field.title}
          </EndpointFieldLabelText>
        </EndpointFieldLabel>
        <EndpointFieldValue>
          <EndpointFieldValueLabel>
            {this.props.getFieldValue(field)}
          </EndpointFieldValueLabel>
        </EndpointFieldValue>
      </EndpointField>
    )
  }

  renderFieldSet(customFields: Field[], options?: { disabled?: boolean }) {
    const rows: JSX.Element[] = []
    let lastField: JSX.Element
    let i = 0
    customFields.forEach((field, schemaIndex) => {
      let currentField
      if (field.name === 'endpoint_id') {
        currentField = this.renderEndpoint()
      } else if (field.name === 'platform' || (field.name === 'os_type' && this.props.platform === 'source')) {
        currentField = this.renderReadOnlyField(field)
      } else {
        currentField = (
          <FieldStyled
            {...field}
            label={field.title || LabelDictionary.get(field.name)}
            width={ThemeProps.inputSizes.large.width}
            disabled={this.props.disabled || options?.disabled}
            highlight={this.props.invalidFields.findIndex(fn => fn === field.name) > -1}
            value={this.props.getFieldValue(field)}
            onChange={value => { this.props.onFieldChange(field, value) }}
            nullableBoolean={field.nullableBoolean != null ? field.nullableBoolean : true}
            disabledLoading={this.props.optionsLoading && !this.props.optionsLoadingSkipFields.find(fn => fn === field.name)}
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
            {this.renderFieldSet(this.filterBySimpleAdvanced(this.props.defaultSchema))}
          </GroupFields>
        </Group>
        <Group>
          <GroupName>
            <GroupNameBar />
            <GroupNameText>Environment Options</GroupNameText>
            <GroupNameBar />
          </GroupName>
          {this.props.envOptionsDisabled ? (
            <DisabledMessage>
              The environment options are disabled while the minion pool is not deallocated.
            </DisabledMessage>
          ) : null}
          <GroupFields>
            {this.renderFieldSet(
              this.filterBySimpleAdvanced(this.props.envSchema),
              { disabled: this.props.envOptionsDisabled },
            )}
          </GroupFields>
        </Group>
      </Fields>
    )
  }

  renderSimpleAdvancedToggle() {
    return (
      <ToggleButtonBarStyled
        items={[{ label: 'Simple', value: 'simple' }, { label: 'Advanced', value: 'advanced' }]}
        selectedValue={this.state.useAdvancedOptions ? 'advanced' : 'simple'}
        onChange={item => { this.setState({ useAdvancedOptions: item.value === 'advanced' }) }}
      />
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

export default MinionPoolModalContent
