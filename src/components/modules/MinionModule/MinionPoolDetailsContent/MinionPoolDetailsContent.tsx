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

import React from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react'

import Button from '../../../ui/Button/Button'
import DetailsNavigation from '../../NavigationModule/DetailsNavigation/DetailsNavigation'
import type { Endpoint } from '../../../../@types/Endpoint'
import type { Field } from '../../../../@types/Field'
import MinionPoolMainDetails from './MinionPoolMainDetails'
import { ReplicaItem, MigrationItem } from '../../../../@types/MainItem'
import { MinionPoolDetails } from '../../../../@types/MinionPool'
import MinionPoolMachines from './MinionPoolMachines'
import StatusImage from '../../../ui/StatusComponents/StatusImage/StatusImage'
import MinionPoolEvents from './MinionPoolEvents'
import { ThemeProps } from '../../../Theme'

const Wrapper = styled.div<any>`
  display: flex;
  justify-content: center;
`
const Loading = styled.div<any>`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`
const Buttons = styled.div<any>`
  display: flex;
  justify-content: space-between;
  margin-top: 64px;
`
const ButtonColumn = styled.div<any>`
  display: flex;
  flex-direction: column;
  button {
    margin-top: 16px;
    &:first-child {
      margin-top: 0;
    }
  }
`
const DetailsBody = styled.div<any>`
  ${ThemeProps.exactWidth(ThemeProps.contentWidth)}
`

const NavigationItems = [
  {
    label: 'Minion Pool',
    value: '',
  },
  {
    label: 'Machines',
    value: 'machines',
  },
  {
    label: 'Events',
    value: 'events',
  },
]

type Props = {
  item?: MinionPoolDetails | null,
  itemId: string
  replicas: ReplicaItem[],
  migrations: MigrationItem[]
  endpoints: Endpoint[],
  schema: Field[],
  schemaLoading: boolean,
  loading: boolean,
  page: string,
  onAllocate: () => void,
  onDeleteMinionPoolClick: () => void,
}
@observer
class MinionPoolDetailsContent extends React.Component<Props> {
  getStatus() {
    return this.props.item?.status
  }

  isEndpointMissing() {
    const endpoint = this.props.endpoints
      .find(e => e.id === this.props.item?.endpoint_id)

    return Boolean(!endpoint)
  }

  renderBottomControls() {
    const status = this.props.item?.status
    const deleteEnabled = status === 'DEALLOCATED' || status === 'ERROR'
    const deallocated = this.props.item?.status === 'DEALLOCATED'

    return (
      <Buttons>
        <ButtonColumn>
          <Button
            primary
            hollow
            disabled={this.isEndpointMissing() || !deallocated}
            onClick={() => { this.props.onAllocate() }}
          >Allocate
          </Button>
        </ButtonColumn>
        <ButtonColumn>
          <Button
            alert
            hollow
            disabled={!deleteEnabled}
            onClick={this.props.onDeleteMinionPoolClick}
          >Delete Minion Pool
          </Button>
        </ButtonColumn>
      </Buttons>
    )
  }

  renderLoading() {
    return (
      <Loading>
        <StatusImage loading />
      </Loading>
    )
  }

  renderMachines() {
    if (this.props.page !== 'machines') {
      return null
    }

    return (
      <MinionPoolMachines
        item={this.props.item}
        replicas={this.props.replicas}
        migrations={this.props.migrations}
      />
    )
  }

  renderEvents() {
    if (this.props.page !== 'events') {
      return null
    }

    return <MinionPoolEvents item={this.props.item} />
  }

  renderMainDetails() {
    if (this.props.page !== '') {
      return null
    }

    return (
      <MinionPoolMainDetails
        item={this.props.item}
        replicas={this.props.replicas}
        migrations={this.props.migrations}
        schema={this.props.schema}
        schemaLoading={this.props.schemaLoading}
        endpoints={this.props.endpoints}
        bottomControls={this.renderBottomControls()}
      />
    )
  }

  render() {
    return (
      <Wrapper>
        <DetailsNavigation
          items={NavigationItems}
          selectedValue={this.props.page}
          itemId={this.props.itemId}
          itemType="minion-pool"
        />
        <DetailsBody>
          {!this.props.loading ? this.renderMainDetails() : null}
          {!this.props.loading ? this.renderMachines() : null}
          {!this.props.loading ? this.renderEvents() : null}
          {this.props.loading ? this.renderLoading() : null}
        </DetailsBody>
      </Wrapper>
    )
  }
}

export default MinionPoolDetailsContent
