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
import { observe } from 'mobx'

import StatusImage from '../../atoms/StatusImage'
import Button from '../../atoms/Button'
import LoadingButton from '../../molecules/LoadingButton'

import type { Endpoint as EndpointType } from '../../../@types/Endpoint'
import type { Field } from '../../../@types/Field'
import ObjectUtils from '../../../utils/ObjectUtils'
import KeyboardManager from '../../../utils/KeyboardManager'
import { MinionPool } from '../../../@types/MinionPool'
import MinionPoolModalContent from './MinionPoolModalContent'
import minionPoolStore from '../../../stores/MinionPoolStore'

import minionPoolImage from './images/minion-pool.svg'
import StyleProps from '../../styleUtils/StyleProps'
import notificationStore from '../../../stores/NotificationStore'

const Wrapper = styled.div<any>`
  padding: 24px 0 32px 0;
  display: flex;
  align-items: center;
  flex-direction: column;
  min-height: 0;
`
const MinionPoolImageWrapper = styled.div`
  ${StyleProps.exactSize('128px')}
  background: url('${minionPoolImage}') center no-repeat;
`
const Content = styled.div<any>`
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
`
const LoadingWrapper = styled.div<any>`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 32px 0;
`
const LoadingText = styled.div<any>`
  font-size: 18px;
  margin-top: 32px;
`
const Buttons = styled.div<any>`
  display: flex;
  justify-content: space-between;
  margin-top: 32px;
  flex-shrink: 0;
  padding: 0 32px;
`

type Props = {
  cancelButtonText: string,
  endpoint: EndpointType,
  minionPool?: MinionPool | null
  platform: 'source' | 'destination',
  onCancelClick: () => void,
  onResizeUpdate?: (scrollableRef: HTMLElement, scrollOffset?: number) => void,
  onRequestClose: () => void,
  onUpdateComplete?: (redirectoTo: string) => void,
}
type State = {
  invalidFields: any[],
  minionPool: any | null
  saving: boolean
}
@observer
class MinionPoolModal extends React.Component<Props, State> {
  static defaultProps = {
    cancelButtonText: 'Cancel',
  }

  state: State = {
    invalidFields: [],
    minionPool: null,
    saving: false,
  }

  scrollableRef!: HTMLElement

  minionPoolStoreObserver!: () => void

  UNSAFE_componentWillMount() {
    this.UNSAFE_componentWillReceiveProps(this.props)
    this.minionPoolStoreObserver = observe(minionPoolStore, () => {
      if (this.props.onResizeUpdate) this.props.onResizeUpdate(this.scrollableRef)
    })
  }

  componentDidMount() {
    const loadSchema = async () => {
      if (!this.props.endpoint) {
        return
      }
      await minionPoolStore.loadMinionPoolSchema(this.props.endpoint.type, this.props.platform)
      await minionPoolStore.loadEnvOptions(
        this.props.endpoint.id,
        this.props.endpoint.type,
        this.props.platform,
      )

      this.fillRequiredDefaults()
    }
    loadSchema()
    KeyboardManager.onEnter('minion-pool', () => {
      this.create()
    }, 2)
  }

  UNSAFE_componentWillReceiveProps(props: Props) {
    if (props.minionPool) {
      this.setState(prevState => ({
        minionPool: {
          ...prevState.minionPool,
          ...ObjectUtils.flatten(props.minionPool || {}),
        },
      }))
    }

    if (props.platform) {
      this.setState(prevState => ({
        minionPool: {
          ...prevState.minionPool,
          pool_platform: props.platform,
        },
      }))
    }

    if (props.onResizeUpdate) props.onResizeUpdate(this.scrollableRef)
  }

  componentWillUnmount() {
    KeyboardManager.removeKeyDown('minion-pool')
    this.minionPoolStoreObserver()
  }

  get isLoading() {
    return minionPoolStore.loadingMinionPoolSchema || minionPoolStore.loadingMinionPools
      || minionPoolStore.loadingEnvOptions
  }

  getFieldValue(field?: Field | null) {
    if (!field || !this.state.minionPool) {
      return ''
    }
    if (this.state.minionPool[field.name] != null) {
      return this.state.minionPool[field.name]
    }

    if (Object.keys(field).find(k => k === 'default')) {
      return field.default
    }

    if (field.type === 'integer' || field.type === 'boolean') {
      return null
    }
    return ''
  }

  findInvalidFields = () => {
    const invalidFields = minionPoolStore.minionPoolCombinedSchema.filter(field => {
      if (field.required) {
        const value = this.getFieldValue(field)
        return value === null || value === '' || value.length === 0
      }
      return false
    }).map(f => f.name)

    return invalidFields
  }

  highlightRequired() {
    const invalidFields = this.findInvalidFields()
    this.setState({ invalidFields })
    if (invalidFields.length > 0) {
      notificationStore.alert('Please fill the required fields', 'error')
      return true
    }
    return false
  }

  async create() {
    if (this.highlightRequired()) {
      return
    }
    this.setState({ saving: true })
    if (this.state.minionPool?.id) {
      await this.update()
    } else {
      await this.add()
    }
  }

  async update() {
    const stateMinionPool = { ...this.state.minionPool }
    await minionPoolStore.loadMinionPools()
    const minionPool = minionPoolStore.minionPools.find(e => e.id === stateMinionPool.id)
    if (!minionPool) {
      throw new Error('Minion pool not found!')
    }
    try {
      delete stateMinionPool.pool_platform
      delete stateMinionPool.endpoint_id
      await minionPoolStore.update(stateMinionPool)
      if (this.props.onUpdateComplete) {
        this.props.onUpdateComplete(`/minion-pools/${stateMinionPool.id}`)
      }
    } catch (err) {
      this.props.onRequestClose()
    }
  }

  async add() {
    try {
      await minionPoolStore.add(this.props.endpoint.id, this.state.minionPool)
      notificationStore.alert('Minion Pool created', 'success')
      this.props.onRequestClose()
    } catch (err) {
      this.props.onRequestClose()
    }
  }

  fillRequiredDefaults() {
    this.setState(prevState => {
      const minionPool: any = { ...prevState.minionPool }
      const requiredFieldsDefaults = minionPoolStore.minionPoolCombinedSchema
        .filter(f => f.required && f.default != null)
      requiredFieldsDefaults.forEach(f => {
        if (minionPool[f.name] == null) {
          minionPool[f.name] = f.default
        }
      })
      return { minionPool }
    })
  }

  handleFieldsChange(items: { field: Field, value: any }[]) {
    this.setState(prevState => {
      const minionPool: any = { ...prevState.minionPool }

      items.forEach(item => {
        let value = item.value
        if (item.field.type === 'array') {
          const arrayItems = minionPool[item.field.name] || []
          value = arrayItems.find((v: any) => v === item.value)
            ? arrayItems.filter((v: any) => v !== item.value) : [...arrayItems, item.value]
        }

        minionPool[item.field.name] = value
      })

      return { minionPool }
    })
  }

  handleCancelClick() {
    this.props.onCancelClick()
  }

  renderButtons() {
    let actionButton = (
      <Button
        large
        onClick={() => this.create()}
      >Save
      </Button>
    )

    if (this.state.saving) {
      actionButton = <LoadingButton large>Saving ...</LoadingButton>
    }

    return (
      <Buttons>
        <Button
          large
          secondary
          onClick={() => {
            this.handleCancelClick()
          }}
        >{this.props.cancelButtonText}
        </Button>
        {actionButton}
      </Buttons>
    )
  }

  renderContent() {
    return (
      <Content>
        <MinionPoolModalContent
          endpoint={this.props.endpoint}
          defaultSchema={minionPoolStore.minionPoolDefaultSchema}
          envSchema={minionPoolStore.minionPoolEnvSchema}
          invalidFields={this.state.invalidFields}
          disabled={this.state.saving}
          cancelButtonText={this.props.cancelButtonText}
          getFieldValue={field => this.getFieldValue(field)}
          onFieldChange={(field, value) => {
            if (field) {
              this.handleFieldsChange([{ field, value }])
            }
          }}
          onCreateClick={() => { this.create() }}
          onCancelClick={() => { this.handleCancelClick() }}
          scrollableRef={ref => { this.scrollableRef = ref }}
          onResizeUpdate={() => {
            if (this.props.onResizeUpdate) {
              this.props.onResizeUpdate(this.scrollableRef)
            }
          }}
        />
        {this.renderButtons()}
      </Content>
    )
  }

  renderLoading() {
    return (
      <LoadingWrapper>
        <StatusImage loading />
        <LoadingText>Loading schema ...</LoadingText>
      </LoadingWrapper>
    )
  }

  render() {
    return (
      <Wrapper>
        <MinionPoolImageWrapper />
        {!this.isLoading ? this.renderContent() : null}
        {this.isLoading ? this.renderLoading() : null}
      </Wrapper>
    )
  }
}

export default MinionPoolModal
