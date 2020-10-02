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
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react'
import styled, { css } from 'styled-components'

import EndpointLogos from '../../atoms/EndpointLogos'
import CopyValue from '../../atoms/CopyValue'
import StatusIcon from '../../atoms/StatusIcon'
import StatusImage from '../../atoms/StatusImage'
import CopyMultilineValue from '../../atoms/CopyMultilineValue'

import type { Endpoint } from '../../../@types/Endpoint'
import type { Field as FieldType } from '../../../@types/Field'
import fieldHelper from '../../../@types/Field'

import StyleProps from '../../styleUtils/StyleProps'
import Palette from '../../styleUtils/Palette'
import DateUtils from '../../../utils/DateUtils'
import LabelDictionary from '../../../utils/LabelDictionary'
import { OptionsSchemaPlugin } from '../../../plugins/endpoint'

import { MinionPoolDetails } from '../../../@types/MinionPool'
import StatusPill from '../../atoms/StatusPill/StatusPill'
import { TransferItem, ReplicaItem, MigrationItem } from '../../../@types/MainItem'

const Wrapper = styled.div<any>`
  display: flex;
  flex-direction: column;
  padding-bottom: 48px;
`
const ColumnsLayout = styled.div<any>`
  display: flex;
`
const Column = styled.div<any>`
  ${props => StyleProps.exactWidth(props.width)}
`
const Row = styled.div<any>`
  margin-bottom: 32px;
  &:last-child {
    margin-bottom: 16px;
  }
`
const Field = styled.div<any>`
  display: flex;
  flex-direction: column;
`
const Label = styled.div<any>`
  font-size: 10px;
  color: ${Palette.grayscale[3]};
  font-weight: ${StyleProps.fontWeights.medium};
  text-transform: uppercase;
  display: flex;
  align-items: center;
`
const StatusIconStub = styled.div<any>`
  ${StyleProps.exactSize('16px')}
`
const Value = styled.div<any>`
  display: ${props => (props.flex ? 'flex' : props.block ? 'block' : 'inline-table')};
  margin-top: 3px;
  ${props => (props.capitalize ? 'text-transform: capitalize;' : '')}
`
const ValueLink = styled(Link)`
  display: flex;
  margin-top: 3px;
  color: ${Palette.primary};
  text-decoration: none;
  cursor: pointer;
`
const Loading = styled.div<any>`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`
const PropertiesTable = styled.div<any>``
const PropertyRow = styled.div<any>`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
`
const PropertyText = css``
const PropertyName = styled.div<any>`
  ${PropertyText}
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 50%;
`
const PropertyValue = styled.div<any>`
  ${PropertyText}
  color: ${Palette.grayscale[4]};
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(50% + 16px);
  margin-right: -16px;
`

type Props = {
  item?: MinionPoolDetails | null,
  replicas: ReplicaItem[]
  migrations: MigrationItem[]
  schema: FieldType[],
  schemaLoading: boolean,
  endpoints: Endpoint[],
  bottomControls: React.ReactNode,
  loading: boolean,
}
@observer
class MinionPoolMainDetails extends React.Component<Props> {
  getEndpoint(): Endpoint | undefined {
    const endpoint = this.props.endpoints
      .find(e => e.id === this.props.item?.endpoint_id)
    return endpoint
  }

  renderLastExecutionTime() {
    return this.props.item?.updated_at ? this.renderValue(DateUtils.getLocalTime(this.props.item.updated_at).format('YYYY-MM-DD HH:mm:ss')) : '-'
  }

  renderValue(value: string, capitalize?: boolean) {
    return <CopyValue value={value} maxWidth="90%" capitalize={capitalize} />
  }

  renderEndpointLink(): React.ReactNode {
    const endpointIsMissing = (
      <Value flex>
        <StatusIcon style={{ marginRight: '8px' }} status="ERROR" />Endpoint is missing
      </Value>
    )

    const endpoint = this.getEndpoint()

    if (endpoint) {
      return <ValueLink to={`/endpoints/${endpoint.id}`}>{endpoint.name}</ValueLink>
    }

    return endpointIsMissing
  }

  renderPropertiesTable(propertyNames: string[]) {
    const endpoint = this.getEndpoint()

    const getValue = (name: string, value: any) => {
      if (value.join && value.length && value[0].destination && value[0].source) {
        return value.map((v: { source: any; destination: any }) => `${v.source}=${v.destination}`).join(', ')
      }
      const schema = this.props.schema
      return fieldHelper.getValueAlias(name, value, schema, endpoint && endpoint.type)
    }

    let properties: any[] = []
    const plugin = endpoint && OptionsSchemaPlugin.for(endpoint.type)
    const migrationImageMapFieldName = plugin && plugin.migrationImageMapFieldName
    let dictionaryKey = ''
    if (endpoint) {
      dictionaryKey = `${endpoint.type}-minion-pool`
    }
    const environment = this.props.item?.environment_options
    propertyNames.forEach(pn => {
      const value = environment ? environment[pn] : ''
      const label = LabelDictionary.get(pn, dictionaryKey)

      if (value && value.join) {
        value.forEach((v: any, i: number) => {
          const useLabel = i === 0 ? label : ''
          properties.push({ label: useLabel, value: v })
        })
      } else if (value && typeof value === 'object') {
        properties = properties.concat(Object.keys(value).map(p => {
          if (p === 'disk_mappings') {
            return null
          }
          let fieldName = pn
          if (migrationImageMapFieldName && fieldName === migrationImageMapFieldName) {
            fieldName = p
          }
          return {
            label: `${label} - ${LabelDictionary.get(p)}`,
            value: getValue(fieldName, value[p]),
          }
        }))
      } else {
        properties.push({ label, value: getValue(pn, value) })
      }
    })

    return (
      <PropertiesTable>
        {properties.filter(Boolean).filter(p => p.value != null && p.value !== '').map(prop => (
          <PropertyRow key={prop.label}>
            <PropertyName>{prop.label}</PropertyName>
            <PropertyValue>
              <CopyValue value={prop.value} />
            </PropertyValue>
          </PropertyRow>
        ))}
      </PropertiesTable>
    )
  }

  renderUsage(items: TransferItem[]) {
    return items.map(item => (
      <span>
        <ValueLink
          key={item.id}
          to={`/${item.type}s/${item.id}`}
        >
          {item.instances[0]}
        </ValueLink>
        <br />
      </span>
    ))
  }

  renderTable() {
    if (this.props.loading) {
      return null
    }
    const endpoint = this.getEndpoint()
    const lastUpdated = this.renderLastExecutionTime()

    const getPropertyNames = () => {
      const env = this.props.item?.environment_options
      return env ? Object.keys(env).filter(k => k !== 'network_map' && (
        k !== 'storage_mappings'
        || (env[k] != null && typeof env[k] === 'object' && Object.keys(env[k]).length > 0)
      )) : []
    }

    const usage: TransferItem[] = this.props.replicas
      .concat(this.props.migrations as any[])

    return (
      <ColumnsLayout>
        <Column width="42.5%">
          <Row>
            <Field>
              <Label>Endpoint</Label>
              {this.renderEndpointLink()}
            </Field>
          </Row>
          <Row>
            <EndpointLogos
              endpoint={(endpoint ? endpoint.type : '') as any}
            />
          </Row>
          <Row>
            <Field>
              <Label>Id</Label>
              {this.renderValue(this.props.item?.id || '-')}
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>Pool Platform</Label>
              {this.renderValue(this.props.item?.pool_platform || '-', true)}
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>Created</Label>
              {this.props.item?.created_at ? this.renderValue(DateUtils.getLocalTime(this.props.item.created_at).format('YYYY-MM-DD HH:mm:ss')) : <Value>-</Value>}
            </Field>
          </Row>
          {this.props.item?.notes
            ? (
              <Row>
                <Field>
                  <Label>Notes</Label>
                  <CopyMultilineValue value={this.props.item.notes} />
                </Field>
              </Row>
            )
            : null}
          {lastUpdated ? (
            <Row>
              <Field>
                <Label>Last Updated</Label>
                <Value>{lastUpdated}</Value>
              </Field>
            </Row>
          ) : null}
          <Row>
            <Field>
              <Label>Used in Replicas/Migrations ({usage.length})</Label>
              {usage.length > 0 ? this.renderUsage(usage) : <Value>-</Value>}
            </Field>
          </Row>
        </Column>
        <Column width="9.5%" />
        <Column width="48%" style={{ flexGrow: 1 }}>
          <Row>
            <Field>
              <Label>Last Execution Status</Label>
              <Value>{this.props.item?.last_execution_status ? <StatusPill status={this.props.item.last_execution_status} /> : '-'}</Value>
            </Field>
          </Row>
          {getPropertyNames().length > 0 ? (
            <Row>
              <Field>
                <Label>Environment options {this.props.schemaLoading ? (
                  <StatusIcon status="RUNNING" style={{ marginLeft: '8px' }} />
                ) : <StatusIconStub />}
                </Label>
                <Value block>{this.renderPropertiesTable(getPropertyNames())}</Value>
              </Field>
            </Row>
          ) : null}
        </Column>
      </ColumnsLayout>
    )
  }

  renderBottomControls() {
    if (this.props.loading) {
      return null
    }

    return this.props.bottomControls
  }

  renderLoading() {
    if (!this.props.loading) {
      return null
    }

    return (
      <Loading>
        <StatusImage loading />
      </Loading>
    )
  }

  render() {
    return (
      <Wrapper>
        {this.renderTable()}
        {this.renderLoading()}
        {this.renderBottomControls()}
      </Wrapper>
    )
  }
}

export default MinionPoolMainDetails
