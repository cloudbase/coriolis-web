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
import { observer } from 'mobx-react'
import styled from 'styled-components'

import Checkbox from '../../../ui/Checkbox/Checkbox'
import ReloadButton from '../../../ui/ReloadButton/ReloadButton'
import StatusImage from '../../../ui/StatusComponents/StatusImage/StatusImage'
import Button from '../../../ui/Button/Button'
import SearchInput from '../../../ui/SearchInput/SearchInput'
import InfoIcon from '../../../ui/InfoIcon/InfoIcon'
import Pagination from '../../../ui/Pagination/Pagination'

import { ThemePalette, ThemeProps } from '../../../Theme'
import type { Instance as InstanceType } from '../../../../@types/Instance'

import instanceImage from './images/instance.svg'
import bigInstanceImage from './images/instance-big.svg'

const Wrapper = styled.div<any>`
  width: 100%;
  display: flex;
  flex-direction: column;
`
const LoadingWrapper = styled.div<any>`
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
`
const InstancesWrapper = styled.div<any>`
  margin-left: -32px;
  flex-grow: 1;
  overflow: auto;
`
const InstanceContent = styled.div<any>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 16px;
  margin-left: 16px;
  border-top: 1px solid ${ThemePalette.grayscale[1]};
  transition: background ${ThemeProps.animations.swift};

  &:hover {
    background: ${ThemePalette.grayscale[1]};
  }
`
const CheckboxStyled = styled(Checkbox)`
  opacity: 0;
  transition: all ${ThemeProps.animations.swift};

  :focus {
    opacity: 1;
  }
`
const Instance = styled.div<any>`
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;

  ${CheckboxStyled} {
    ${props => (props.selected ? 'opacity: 1;' : '')}
  }

  &:hover ${CheckboxStyled} {
    opacity: 1;
  }

  &:last-child ${InstanceContent} {
    border-bottom: 1px solid ${ThemePalette.grayscale[1]};
  }
`
const LoadingText = styled.div<any>`
  margin-top: 38px;
  font-size: 18px;
`
export const Image = styled.div<any>`
  ${ThemeProps.exactSize('48px')}
  background: url('${instanceImage}') center no-repeat;
`
const Label = styled.div<any>`
  flex-grow: 1;
  margin: 0 16px;
  display: flex;
  flex-direction: column;
`
const LabelTitle = styled.div``
const LabelSubtitle = styled.div`
  color: ${ThemePalette.grayscale[4]};
  overflow-wrap: anywhere;
`
const Details = styled.div<any>`
  color: ${ThemePalette.grayscale[4]};
  min-width: 160px;
  text-align: right;
`
const FiltersWrapper = styled.div<any>`
  padding: 8px 0 0 8px;
  min-height: 24px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
`
const SearchInputInfo = styled.div<any>`
  display: flex;
  align-items: center;
`
const FilterInfo = styled.div<any>`
  display: flex;
  color: ${ThemePalette.grayscale[4]};
`
const SelectionInfo = styled.div<any>``
const FilterSeparator = styled.div<any>`
  margin: 0 14px 0 16px;
`
const Reloading = styled.div<any>`
  margin: 32px auto 0 auto;
  flex-grow: 1;
`
const SearchNotFound = styled.div<any>`
  display: flex;
  flex-direction: column;
  align-items: center;
  ${props => (props.marginTop ? 'margin-top: 64px;' : '')}
  > * {
    margin-bottom: 42px;
  }
`
const SearchNotFoundText = styled.div<any>`
  font-size: 18px;
`
const SearchNotFoundSubtitle = styled.div<any>`
  color: ${ThemePalette.grayscale[4]};
  margin-top: -32px;
  text-align: center;
`
const BigInstanceImage = styled.div<any>`
  ${ThemeProps.exactSize('96px')}
  background: url('${bigInstanceImage}') center no-repeat;
`

type Props = {
  instances: InstanceType[],
  selectedInstances?: InstanceType[] | null,
  currentPage: number,
  instancesPerPage: number,
  loading: boolean,
  chunksLoading: boolean,
  searching: boolean,
  searchNotFound: boolean,
  reloading: boolean,
  hasSourceOptions: boolean,
  searchText?: string,
  onSearchInputChange: (value: string) => void,
  onReloadClick: () => void,
  onInstanceClick: (instance: InstanceType) => void,
  onPageClick: (page: number) => void,
}
type State = {
  searchText: string,
}

@observer
class WizardInstances extends React.Component<Props, State> {
  state = {
    searchText: '',
  }

  timeout!: number

  isCheckboxMouseDown: boolean = false

  componentWillUnmount() {
    this.props.onSearchInputChange('')
  }

  handleSeachInputChange(searchText: string) {
    clearTimeout(this.timeout)
    this.setState({ searchText })
    this.timeout = window.setTimeout(() => {
      this.props.onSearchInputChange(searchText)
    }, 500)
  }

  handlePreviousPageClick() {
    this.props.onPageClick(this.props.currentPage - 1)
  }

  handleNextPageClick() {
    this.props.onPageClick(this.props.currentPage + 1)
  }

  areNoInstances() {
    return !this.props.loading && !this.props.searchNotFound && !this.props.reloading
      && this.props.instances.length === 0 && !this.props.searching
  }

  renderNoInstances() {
    if (!this.areNoInstances()) {
      return null
    }

    let subtitle

    if (this.props.hasSourceOptions) {
      subtitle = (
        <SearchNotFoundSubtitle>
          Some platforms require pre-inputting parameters
          like location or resource containers for listing instances.
          <br />Please check that all of the options from the previous screen are correct.
        </SearchNotFoundSubtitle>
      )
    } else {
      subtitle = (
        <SearchNotFoundSubtitle>
          You can retry the search or choose another Endpoint
        </SearchNotFoundSubtitle>
      )
    }

    return (
      <SearchNotFound marginTop>
        <BigInstanceImage />
        <SearchNotFoundText>
          It seems like you don’t have any Instances in this Endpoint
        </SearchNotFoundText>
        {subtitle}
        <Button hollow onClick={() => { this.props.onReloadClick() }}>Retry Search</Button>
      </SearchNotFound>
    )
  }

  renderSearchNotFound() {
    if (!this.props.searchNotFound) {
      return null
    }

    let subtitle = null
    if (this.props.hasSourceOptions) {
      subtitle = (
        <SearchNotFoundSubtitle>
          Some platforms require pre-inputting parameters like location or resource containers for
          <br />listing instances.
          Please check that all of the options from the previous screen are correct.
        </SearchNotFoundSubtitle>
      )
    }

    return (
      <SearchNotFound>
        <StatusImage status="ERROR" />
        <SearchNotFoundText data-test-id="wInstances-notFoundText">Your search returned no results</SearchNotFoundText>
        {subtitle}
        <Button hollow onClick={() => { this.props.onReloadClick() }}>Retry</Button>
      </SearchNotFound>
    )
  }

  renderReloading() {
    if (!this.props.reloading) {
      return null
    }

    return (
      <Reloading>
        <StatusImage loading />
      </Reloading>
    )
  }

  renderLoading() {
    if (!this.props.loading) {
      return null
    }

    return (
      <LoadingWrapper>
        <StatusImage loading data-test-id="wInstances-loadingStatus" />
        <LoadingText>Loading instances...</LoadingText>
      </LoadingWrapper>
    )
  }

  renderInstances() {
    if (this.props.loading || this.props.searchNotFound
      || this.props.reloading || this.areNoInstances()) {
      return null
    }
    const startIdx = (this.props.currentPage - 1) * this.props.instancesPerPage
    const endIdx = startIdx + (this.props.instancesPerPage - 1)
    const filteredInstances = this.props.instances
      .filter((_, idx) => idx >= startIdx && idx <= endIdx)

    return (
      <InstancesWrapper>
        {filteredInstances.map(instance => {
          const selected = Boolean(this.props.selectedInstances
            && this.props.selectedInstances.find(i => i.id === instance.id))
          const flavorName = instance.flavor_name ? ` | ${instance.flavor_name}` : ''
          const instanceId = instance.instance_name || instance.id
          return (
            <Instance
              key={instance.id}
              onMouseDown={() => {
                if (!this.isCheckboxMouseDown) this.props.onInstanceClick(instance)
              }}
              selected={selected}
              data-test-id={`wInstances-item-${instance.id}`}
            >
              <CheckboxStyled
                checked={selected}
                onChange={() => { this.props.onInstanceClick(instance) }}
                onMouseDown={() => { this.isCheckboxMouseDown = true }}
                onMouseUp={() => { this.isCheckboxMouseDown = false }}
              />
              <InstanceContent data-test-id="wInstances-instanceItem">
                <Image />
                <Label>
                  <LabelTitle>{instance.name}</LabelTitle>
                  {instanceId !== instance.name ? (
                    <LabelSubtitle>{instanceId}</LabelSubtitle>
                  ) : null}
                </Label>
                <Details>{`${instance.num_cpu} vCPU | ${instance.memory_mb} MB RAM${flavorName}`}</Details>
              </InstanceContent>
            </Instance>
          )
        })}
      </InstancesWrapper>
    )
  }

  renderFilters() {
    if (this.props.loading || this.areNoInstances()) {
      return null
    }

    const count = this.props.selectedInstances ? this.props.selectedInstances.length : 0
    const plural = count === 1 ? '' : 's'

    return (
      <FiltersWrapper>
        <SearchInputInfo>
          <SearchInput
            alwaysOpen
            onChange={searchText => { this.handleSeachInputChange(searchText) }}
            value={this.state.searchText}
            loading={this.props.searching}
            placeholder="Search VMs"
            data-test-id="wInstances-searchInput"
          />
          {this.props.hasSourceOptions ? (
            <InfoIcon
              text="Some platforms require pre-inputting parameters like location or resource containers for listing instances. Please check that all of the options from the previous screen are correct."
              marginBottom={0}
              marginLeft={8}
              filled
            />
          ) : null}
        </SearchInputInfo>
        <FilterInfo>
          <SelectionInfo data-test-id="wInstances-selInfo">{count} instance{plural} selected</SelectionInfo>
          <FilterSeparator>|</FilterSeparator>
          <ReloadButton
            onClick={() => { this.props.onReloadClick() }}
            data-test-id="wInstances-reloadButton"
          />
        </FilterInfo>
      </FiltersWrapper>
    )
  }

  renderPagination() {
    if (this.props.loading || this.props.searchNotFound
      || this.props.reloading || this.areNoInstances()) {
      return null
    }

    const hasNextPage = this.props.currentPage
      * this.props.instancesPerPage < this.props.instances.length
    const areAllDisabled = this.props.searching
    const isPreviousDisabled = this.props.currentPage === 1 || areAllDisabled
    const isNextDisabled = !hasNextPage || areAllDisabled

    return (
      <Pagination
        style={{ margin: '32px 0 16px 0' }}
        previousDisabled={isPreviousDisabled}
        onPreviousClick={() => { this.handlePreviousPageClick() }}
        currentPage={this.props.currentPage}
        totalPages={Math.ceil(this.props.instances.length / this.props.instancesPerPage)}
        loading={this.props.chunksLoading}
        nextDisabled={isNextDisabled}
        onNextClick={() => { this.handleNextPageClick() }}
      />
    )
  }

  render() {
    return (
      <Wrapper>
        {this.renderFilters()}
        {this.renderLoading()}
        {this.renderReloading()}
        {this.renderSearchNotFound()}
        {this.renderInstances()}
        {this.renderPagination()}
        {this.renderNoInstances()}
      </Wrapper>
    )
  }
}

export default WizardInstances
