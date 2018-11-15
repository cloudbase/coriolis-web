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

import * as React from 'react'
import { observer } from 'mobx-react'
import styled, { css } from 'styled-components'

import EndpointLogos from '../../atoms/EndpointLogos'
import CopyValue from '../../atoms/CopyValue'
import StatusIcon from '../../atoms/StatusIcon'
import StatusImage from '../../atoms/StatusImage'
import Table from '../../molecules/Table'
import CopyMultilineValue from '../../atoms/CopyMultilineValue'

import type { Instance } from '../../../types/Instance'
import type { MainItem } from '../../../types/MainItem'
import type { Endpoint } from '../../../types/Endpoint'
import StyleProps from '../../styleUtils/StyleProps'
import Palette from '../../styleUtils/Palette'
import DateUtils from '../../../utils/DateUtils'
import LabelDictionary from '../../../utils/LabelDictionary'

import arrowImage from './images/arrow.svg'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 48px;
`
const ColumnsLayout = styled.div`
  display: flex;
`
const Column = styled.div`
  ${props => StyleProps.exactWidth(props.width)}
`
const Arrow = styled.div`
  width: 34px;
  height: 24px;
  background: url('${arrowImage}') center no-repeat;
  margin-top: 84px;
`
const Row = styled.div`
  margin-bottom: 32px;
  &:last-child {
    margin-bottom: 16px;
  }
`
const Field = styled.div`
  display: flex;
  flex-direction: column;
`
const Label = styled.div`
  font-size: 10px;
  color: ${Palette.grayscale[3]};
  font-weight: ${StyleProps.fontWeights.medium};
  text-transform: uppercase;
`
const Value = styled.div`
  display: ${props => props.flex ? 'flex' : props.block ? 'block' : 'inline-table'};
  margin-top: 3px;
  ${props => props.capitalize ? 'text-transform: capitalize;' : ''}
`
const ValueLink = styled.a`
  display: flex;
  margin-top: 3px;
  color: ${Palette.primary};
  text-decoration: none;
  cursor: pointer;
`
const TableStyled = styled(Table)`
  margin-top: 89px;
  margin-bottom: 48px;
`
const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`
const PropertiesTable = styled.div``
const PropertyRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
`
const PropertyText = css``
const PropertyName = styled.div`
  ${PropertyText}
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 50%;
`
const PropertyValue = styled.div`
  ${PropertyText}
  color: ${Palette.grayscale[4]};
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 50%;
`

type Props = {
  item: ?MainItem,
  instancesDetails: Instance[],
  instancesDetailsLoading: boolean,
  endpoints: Endpoint[],
  bottomControls: React.Node,
  loading: boolean,
}
@observer
class MainDetails extends React.Component<Props> {
  getSourceEndpoint(): ?Endpoint {
    let endpoint = this.props.endpoints.find(e => this.props.item && e.id === this.props.item.origin_endpoint_id)
    return endpoint
  }

  getDestinationEndpoint(): ?Endpoint {
    let endpoint = this.props.endpoints.find(e => this.props.item && e.id === this.props.item.destination_endpoint_id)
    return endpoint
  }

  getLastExecution() {
    if (this.props.item && this.props.item.executions && this.props.item.executions.length) {
      return this.props.item.executions[this.props.item.executions.length - 1]
    }

    return {}
  }

  getConnectedVms(networkId: string) {
    if (this.props.instancesDetailsLoading) {
      return 'Loading...'
    }

    if (!this.props.item) {
      return '-'
    }

    let vms: string[] = []

    this.props.instancesDetails.forEach(instanceDet => {
      if (
        instanceDet.devices && instanceDet.devices.nics && instanceDet.devices.nics.find &&
        instanceDet.devices.nics.find(n => n.network_name === networkId)
      ) {
        vms.push(instanceDet.instance_name)
      }
    })

    return vms.length === 0 ? 'Failed to read network configuration for the original instance' : vms.map(vm => <div data-test-id={`vm-${vm}`} style={{ marginBottom: '8px' }}>{vm}<br /></div>)
  }

  getNetworks() {
    if (!this.props.item || !this.props.item.destination_environment || !this.props.item.destination_environment.network_map) {
      return null
    }
    let networks = []
    Object.keys(this.props.item.destination_environment.network_map).forEach(key => {
      let newItem
      if (this.props.item && typeof this.props.item.destination_environment.network_map[key] === 'object') {
        newItem = [
          this.props.item.destination_environment.network_map[key].source_network,
          this.getConnectedVms(key),
          // $FlowIssue
          this.props.item.destination_environment.network_map[key].destination_network,
          'Existing network',
        ]
      } else {
        newItem = [
          key,
          this.getConnectedVms(key),
          this.props.item ? this.props.item.destination_environment.network_map[key] : '-',
          'Existing network',
        ]
      }
      networks.push(newItem)
    })

    return networks
  }

  renderLastExecutionTime() {
    let lastExecution = this.getLastExecution()
    if (lastExecution.updated_at || lastExecution.created_at) {
      return this.renderValue(DateUtils.getLocalTime(lastExecution.updated_at || lastExecution.created_at).format('YYYY-MM-DD HH:mm:ss'))
    }

    return <Value>-</Value>
  }

  renderValue(value: string, dateTestId?: string) {
    return <CopyValue value={value} maxWidth="90%" data-test-id={dateTestId ? `mainDetails-${dateTestId}` : undefined} />
  }

  renderNetworksTable() {
    if (this.props.loading) {
      return null
    }

    let items = this.getNetworks()

    if (!items || !items.length) {
      return null
    }

    return (
      <TableStyled
        header={['Source Network', 'Connected VMs', 'Destination Network', 'Destination Type']}
        items={items}
        columnsStyle={[css`color: ${Palette.black};`]}
        data-test-id="mainDetails-networksTable"
      />
    )
  }

  renderEndpointLink(type: string): React.Node {
    let endpointIsMissing = (
      <Value flex data-test-id={`mainDetails-missing-${type}`}>
        <StatusIcon style={{ marginRight: '8px' }} status="ERROR" />Endpoint is missing
      </Value>
    )

    let endpoint = type === 'source' ? this.getSourceEndpoint() : this.getDestinationEndpoint()

    if (endpoint) {
      return <ValueLink data-test-id={`mainDetails-name-${type}`} href={`/#/endpoint/${endpoint.id}`}>{endpoint.name}</ValueLink>
    }

    return endpointIsMissing
  }

  renderPropertiesTable(propertyNames: string[]) {
    let getValue = (value: any) => {
      if (value === true) {
        return 'Yes'
      }
      if (value === false) {
        return 'No'
      }
      if (value.join && value.length && value[0].destination && (value[0].source || value[0].disk_id)) {
        return value.map(v => `${v.source || v.disk_id}=${v.destination}`).join(', ')
      }
      return value.toString()
    }

    let properties = []
    propertyNames.forEach(pn => {
      let value = this.props.item ? this.props.item.destination_environment[pn] : ''
      let label = LabelDictionary.get(pn)

      if (value && value.join) {
        // $FlowIgnore
        value.forEach((v, i) => {
          let useLabel = i === 0 ? label : ''
          properties.push({ label: useLabel, value: v })
        })
      } else if (value && typeof value === 'object') {
        properties = properties.concat(Object.keys(value).map(p => {
          return {
            label: `${label} - ${LabelDictionary.get(p)}`,
            value: getValue(value[p]),
          }
        }))
      } else {
        properties.push({ label, value: getValue(value) })
      }
    })

    return (
      <PropertiesTable>
        {properties.map(prop => {
          return (
            <PropertyRow key={prop.label}>
              <PropertyName>{prop.label}</PropertyName>
              <PropertyValue><CopyValue value={prop.value} /></PropertyValue>
            </PropertyRow>
          )
        })}
      </PropertiesTable>
    )
  }

  renderTable() {
    if (this.props.loading) {
      return null
    }
    const sourceEndpoint = this.getSourceEndpoint()
    const destinationEndpoint = this.getDestinationEndpoint()

    const propertyNames = this.props.item && this.props.item.destination_environment ? Object.keys(this.props.item.destination_environment).filter(k => k !== 'description' && k !== 'network_map') : []

    return (
      <ColumnsLayout>
        <Column width="34.5%">
          <Row>
            <Field>
              <Label>Source</Label>
              {this.renderEndpointLink('source')}
            </Field>
          </Row>
          <Row>
            <EndpointLogos
              endpoint={sourceEndpoint ? sourceEndpoint.type : ''}
              data-test-id="mainDetails-sourceLogo"
            />
          </Row>
          <Row>
            <Field>
              <Label>Id</Label>
              {this.renderValue(this.props.item ? this.props.item.id || '-' : '-', 'id')}
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>Created</Label>
              {this.props.item && this.props.item.created_at ? this.renderValue(DateUtils.getLocalTime(this.props.item.created_at).format('YYYY-MM-DD HH:mm:ss'), 'created') : <Value>-</Value>}
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>Description</Label>
              {this.props.item && this.props.item.destination_environment
                && this.props.item.destination_environment.description
                ? <CopyMultilineValue value={this.props.item.destination_environment.description} data-test-id="mainDetails-description" />
                : <Value>-</Value>}
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>Type</Label>
              <Value capitalize data-test-id="mainDetails-type">Coriolis {this.props.item && this.props.item.type}</Value>
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>Last Updated</Label>
              <Value data-test-id="mainDetails-updated">{this.renderLastExecutionTime()}</Value>
            </Field>
          </Row>
        </Column>
        <Column width="17.5%">
          <Arrow />
        </Column>
        <Column width="48%" style={{ flexGrow: 1 }}>
          <Row>
            <Field>
              <Label>Target</Label>
              {this.renderEndpointLink('target')}
            </Field>
          </Row>
          <Row>
            <EndpointLogos
              endpoint={destinationEndpoint ? destinationEndpoint.type : ''}
              data-test-id="mainDetails-targetLogo"
            />
          </Row>
          {propertyNames.length > 0 ? (
            <Row>
              <Field>
                <Label>Properties</Label>
                <Value block>{this.renderPropertiesTable(propertyNames)}</Value>
              </Field>
            </Row>
          ) : null}
          {this.props.item && this.props.item.instances ? (
            <Row>
              <Field>
                <Label>Instances</Label>
                <CopyMultilineValue value={this.props.item.instances.join('<br />')} useDangerousHtml />
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
        <StatusImage loading data-test-id="mainDetails-loading" />
      </Loading>
    )
  }

  render() {
    return (
      <Wrapper>
        {this.renderTable()}
        {this.renderNetworksTable()}
        {this.renderBottomControls()}
        {this.renderLoading()}
      </Wrapper>
    )
  }
}

export default MainDetails
