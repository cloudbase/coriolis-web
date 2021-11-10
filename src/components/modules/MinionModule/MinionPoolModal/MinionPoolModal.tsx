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

import StatusImage from '../../../ui/StatusComponents/StatusImage/StatusImage'
import Button from '../../../ui/Button/Button'
import LoadingButton from '../../../ui/LoadingButton/LoadingButton'

import type { Endpoint as EndpointType } from '../../../../@types/Endpoint'
import { Field, isEnumSeparator } from '../../../../@types/Field'
import ObjectUtils from '../../../../utils/ObjectUtils'
import KeyboardManager from '../../../../utils/KeyboardManager'
import MinionPoolModalContent from './MinionPoolModalContent'
import minionPoolStore from '../../../../stores/MinionPoolStore'

import minionPoolImage from './images/minion-pool.svg'
import notificationStore from '../../../../stores/NotificationStore'
import providerStore, { getFieldChangeOptions } from '../../../../stores/ProviderStore'
import { MinionPool } from '../../../../@types/MinionPool'
import { ThemeProps } from '../../../Theme'

const Wrapper = styled.div<any>`
  padding: 24px 0 32px 0;
  display: flex;
  align-items: center;
  flex-direction: column;
  min-height: 0;
`
const MinionPoolImageWrapper = styled.div`
  ${ThemeProps.exactSize('128px')}
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
  minionPool?: MinionPool | null,
  editableData?: any | null
  platform: 'source' | 'destination',
  onCancelClick: () => void,
  onResizeUpdate?: (scrollableRef: HTMLElement, scrollOffset?: number) => void,
  onRequestClose: () => void,
  onUpdateComplete?: (redirectoTo: string) => void,
}
type State = {
  invalidFields: any[],
  editableData: any | null
  saving: boolean
}
@observer
class MinionPoolModal extends React.Component<Props, State> {
  static defaultProps = {
    cancelButtonText: 'Cancel',
  }

  state: State = {
    invalidFields: [],
    editableData: null,
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

      await providerStore.loadProviders()
      const providers = providerStore.providers
      if (!providers) {
        return
      }
      await minionPoolStore.loadOptions({
        providers,
        optionsType: this.props.platform,
        endpoint: this.props.endpoint,
        envData: this.envData,
        useCache: true,
      })

      this.fillRequiredDefaults()
    }
    loadSchema()
    KeyboardManager.onEnter('minion-pool', () => {
      this.create()
    }, 2)
  }

  UNSAFE_componentWillReceiveProps(props: Props) {
    if (props.editableData) {
      this.setState(prevState => ({
        editableData: {
          ...ObjectUtils.flatten(props.editableData || {}),
          ...prevState.editableData,
        },
      }))
    }

    if (props.platform) {
      this.setState(prevState => ({
        editableData: {
          ...prevState.editableData,
          platform: props.platform,
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
    return minionPoolStore.loadingMinionPoolSchema
      || minionPoolStore.loadingMinionPools
      || minionPoolStore.optionsPrimaryLoading
      || providerStore.providersLoading
  }

  get envData() {
    let envData: any = null
    Object.keys(this.state.editableData).forEach(prop => {
      if (!minionPoolStore.minionPoolDefaultSchema.find(f => f.name === prop)) {
        envData = envData || {}
        envData[prop] = this.state.editableData[prop]
      }
    })
    return envData
  }

  getFieldValue(field?: Field | null) {
    if (!field || !this.state.editableData) {
      return ''
    }
    if (this.state.editableData[field.name] != null) {
      return this.state.editableData[field.name]
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
        if (value === null || value === '' || value.length === 0) {
          return true
        }
        if (!field.enum) {
          return false
        }
        // When loading new options as a result of destination options calls,
        // the value stored in the state may no longer be found in the field's enum.
        // Example: When changing the AD of an OCI minion pool,
        // although the Subnet ID may show 'Choose Value', the modal would still let you hit 'Update'.
        if (!field.enum.find(f => (!isEnumSeparator(f) ? (typeof f === 'string' ? f === value : (f.value === value || f.id === value)) : false))) {
          return true
        }
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
    try {
      if (this.props.minionPool?.id) {
        await this.update()
      } else {
        await this.add()
      }
    } catch (err) {
      console.error(err)
      this.setState({ saving: false })
    }
  }

  async update() {
    const stateMinionPool = {
      ...this.state.editableData,
      id: this.props.minionPool?.id,
    }
    delete stateMinionPool.platform
    delete stateMinionPool.endpoint_id
    await minionPoolStore.update(this.props.endpoint.type, stateMinionPool)
    if (this.props.onUpdateComplete) {
      this.props.onUpdateComplete(`/minion-pools/${this.props.minionPool?.id}`)
    }
  }

  async add() {
    await minionPoolStore.add(this.props.endpoint.type, this.props.endpoint.id, this.state.editableData)
    notificationStore.alert('Minion Pool created', 'success')
    this.props.onRequestClose()
  }

  fillRequiredDefaults() {
    this.setState(prevState => {
      const minionPool: any = { ...prevState.editableData }
      const requiredFieldsDefaults = minionPoolStore.minionPoolCombinedSchema
        .filter(f => f.required && f.default != null)
      requiredFieldsDefaults.forEach(f => {
        if (minionPool[f.name] == null) {
          minionPool[f.name] = f.default
        }
      })
      return { editableData: minionPool }
    })
  }

  async loadExtraOptions(field: Field | null, type: 'source' | 'destination', useCache: boolean = true) {
    const envData = getFieldChangeOptions({
      providerName: this.props.endpoint.type,
      schema: minionPoolStore.minionPoolEnvSchema,
      data: this.envData,
      field,
      type,
    })
    if (!envData) {
      return
    }
    await minionPoolStore.loadOptions({
      providers: providerStore.providers!,
      optionsType: type,
      endpoint: this.props.endpoint,
      envData,
      useCache,
    })
    this.fillRequiredDefaults()
  }

  handleFieldChange(field: Field, value: any) {
    this.setState(prevState => {
      const minionPool: any = { ...prevState.editableData }

      if (field.type === 'array') {
        const arrayItems = minionPool[field.name] || []
        value = arrayItems.find((v: any) => v === value)
          ? arrayItems.filter((v: any) => v !== value) : [...arrayItems, value]
      }

      minionPool[field.name] = value

      return { editableData: minionPool }
    }, () => {
      if (field.type !== 'string' || field.enum) {
        this.loadExtraOptions(field, this.props.platform, true)
      }
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
          platform={this.props.platform}
          optionsLoading={minionPoolStore.optionsSecondaryLoading}
          optionsLoadingSkipFields={minionPoolStore.minionPoolDefaultSchema.map(f => f.name)}
          envOptionsDisabled={this.props.minionPool != null && this.props.minionPool.status !== 'DEALLOCATED'}
          defaultSchema={minionPoolStore.minionPoolDefaultSchema}
          envSchema={minionPoolStore.minionPoolEnvSchema}
          invalidFields={this.state.invalidFields}
          disabled={this.state.saving}
          cancelButtonText={this.props.cancelButtonText}
          getFieldValue={field => this.getFieldValue(field)}
          onFieldChange={(field, value) => {
            if (field) {
              this.handleFieldChange(field, value)
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
        <LoadingText>Loading Pool Options ...</LoadingText>
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
