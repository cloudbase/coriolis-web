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

import React, { Component, PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import SearchBox from '../SearchBox';
import s from './WizardVms.scss';
import { itemsPerPage } from '../../config';
import ConnectionsActions from '../../actions/ConnectionsActions';
import LoadingIcon from '../LoadingIcon';

const title = 'Select instances to migrate';
const loadingStates = { IDLE: 0, QUERY: 1, PAGINATION: 2 }
const searchTimeout = 1000;

class WizardVms extends Component {

  static propTypes = {
    data: PropTypes.object,
    setWizardState: PropTypes.func
  }

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props)
    let valid = false

    if (this.props.data.instances) {
      this.props.data.instances.forEach((vm) => {
        if (vm.selected) {
          valid = true
        }
      })
    }

    this.reloadInstances = this.reloadInstances.bind(this)

    this.state = {
      valid,
      queryText: '',
      loadingState: loadingStates.IDLE,
      page: 0,
      filterStatus: 'All',
      filteredData: this.props.data.instances ? this.props.data.instances.slice(0, itemsPerPage) : [],
      nextStep: "WizardOptions"
    }
  }

  componentWillMount() {
    this.context.onSetTitle(title);
    this.props.setWizardState(this.state)
  }

  componentWillReceiveProps(newProps) {
    this.processProps(newProps)
    if (newProps.data.selectedInstances) {
      let valid = newProps.data.selectedInstances.length > 0
      if (this.props.data.valid != valid) {
        this.props.setWizardState({ valid: valid })
      }
    }
  }

  processProps(props) {
    let loadingState = typeof props.data.loadingState === undefined ? this.state.loadingState : props.data.loadingState
    if (props.data.instances && !loadingState) {
      this.setState({
        filteredData: props.data.instances.slice(
          this.state.page * itemsPerPage, this.state.page * itemsPerPage + itemsPerPage),
        loadingState: loadingState.IDLE
      })
    } else {
      this.setState({
        loadingState: loadingState
      })
    }
  }

  checkVm(e, item) {
    let instances = this.props.data.instances
    instances.forEach((vm) => {
      if (vm == item) {
        vm.selected = !vm.selected

        let selectedInstances = this.props.data.selectedInstances
        let index = -1
        selectedInstances.forEach((instance, key) => {
          if (instance.id === item.id) {
            index = key
          }
        })

        if (index == -1) {
          selectedInstances.push(item)
        } else {
          selectedInstances.splice(index, 1)
        }
        this.props.setWizardState({ selectedInstances: selectedInstances })
      }
    })

    this.props.setWizardState({ instances: instances })
  }

  searchVm(queryText) {
    let queryResult = []

    if (this.props.data.instances) {
      this.props.data.instances.forEach((vm) => {
        if (this.state.filterStatus === "All" || this.state.filterStatus === vm.status) {
          queryResult.push(vm)
        }
      }, this)
    }

    if (this.state.queryText != queryText) {
      this.props.setWizardState({ loadingState: loadingStates.QUERY })

      if (this.timeout != null) {
        clearTimeout(this.timeout)
      }
      this.timeout = setTimeout(() => {
        this.setState({ queryText: queryText, page: 0 }, () => {
          ConnectionsActions.loadInstances(
            { id: this.props.data.sourceCloud.credential.id },
            this.state.page,
            queryText,
            false
          )
        })
      }, searchTimeout)
    } else {
      this.setState({
        filteredData: queryResult
      })
    }
  }


  instancesSelected() {
    let count = this.props.data.selectedInstances.length;

    return count;
  }


  filterStatus(e, status) {
    this.setState({ filterStatus: status }, () => {
      this.searchVm({ target: { value: this.state.queryText } })
    })
  }

  toTitleCase(str) {
    return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
  }

  isSelected(item) {
    let selected = false;
    this.props.data.selectedInstances.forEach(instance => {
      if (instance.id === item.id) {
        selected = true
      }
    })
    return selected
  }

  nextPage() {
    if (this.state.filteredData && this.state.filteredData.length == itemsPerPage) {
      this.props.setWizardState({ loadingState: loadingStates.PAGINATION })
      this.setState({ page: this.state.page + 1 }, () => {
        ConnectionsActions.loadInstances(
          { id: this.props.data.sourceCloud.credential.id },
          this.state.page,
          this.state.queryText
        )
      })
    }
  }

  previousPage() {
    if (this.state.page > 0) {
      this.props.setWizardState({ loadingState: loadingStates.PAGINATION })
      this.setState({ page: this.state.page - 1 }, () => {
        ConnectionsActions.loadInstances(
          { id: this.props.data.sourceCloud.credential.id },
          this.state.page,
          this.state.queryText
        )
        this.processProps({ data: { instances: this.props.data.instances } })
      })
    }
  }

  reloadInstances() {
    ConnectionsActions.loadInstances(
      { id: this.props.data.sourceCloud.credential.id },
      this.state.page,
      this.state.queryText,
      false
    )
  }

  refreshButtonClick() {
    this.props.setWizardState({ loadingState: loadingStates.PAGINATION })
    this.setState({ page: 0 }, this.reloadInstances)
  }

  renderFilteredItems() {
    if (this.state.filteredData && this.state.filteredData.length) {
      let instances = this.state.filteredData.map((item, index) =>
        <div className={'item ' + (this.isSelected(item) ? 'selected' : '')}
          key={"vm_" + index} onClick={(e) => this.checkVm(e, item)}
        >
          <div className="checkbox-container">
            <input
              id={"vm_check_" + index}
              type="checkbox"
              checked={this.isSelected(item)}
              onChange={(e) => this.checkVm(e, item)}
              className="checkbox-normal"
            />
            <label htmlFor={"vm_check_" + index}></label>
          </div>
          <span className="cell cell-icon">
            <div className="icon vm"></div>
            <span className="details">
              {item.instance_name}
            </span>
          </span>
          <span className="cell">{item.num_cpu} vCPU | {item.memory_mb} MB RAM
                {item.flavor_name && (" | " + item.flavor_name)}</span>
        </div>
      )
      return instances
    } else {
      return <div className="no-results">Your search returned no results</div>
    }
  }

  renderSearch() {
    if (this.props.data.instancesLoadState === 'success' || this.state.loadingState) {
      return this.renderFilteredItems()
    }

    switch (this.props.data.instancesLoadState) {
      case "error":
        return (<div className="no-results">
          An error occurred while searching for instances <br />
          <button onClick={this.reloadInstances}>Retry</button>
        </div>)
      case "loading":
        return <LoadingIcon padding={64} text="Loading instances.." />
      default:
        return <LoadingIcon padding={64} text="Loading instances.." />
    }
  }

  renderSelectionInfo() {
    if (this.state.filteredData && this.state.filteredData.length) {
      return (
        <div className={s.selectionInfo}>
          <div className={s.selectionCount +
            (!(this.state.filteredData && this.state.filteredData.length) ? " hidden" : " ")}
          >
            {this.instancesSelected()} instances selected
                </div>
          <div className={s.refreshButton}
            onClick={this.refreshButtonClick.bind(this)}
          >
            <div className="refresh icon"></div>
          </div>
        </div>
      )
    }

    return null
  }

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <div className={s.topFilters}>
            <SearchBox
              placeholder="Search VMs"
              isLoading={this.state.loadingState === loadingStates.QUERY}
              value={this.state.queryText}
              onChange={(e) => this.searchVm(e)}
              className={s.searchBox}
              show={(!this.state.filteredData || !!this.state.filteredData.length)
                || this.state.loadingState > 0 || !!this.state.queryText}
            />
            {this.renderSelectionInfo()}
          </div>
          <div className="items-list instances">
            {this.renderSearch()}
          </div>
          <div className={s.pagination +
            (!(this.state.filteredData && this.state.filteredData.length) ? " hidden" : " ")}
          >
            <span
              className={(this.state.page === 0 || this.state.loadingState ? "disabled " : "") + s.prev}
              onClick={(e) => this.previousPage(e)}
            ></span>
            <span className={s.currentPage}>{
              this.state.loadingState === loadingStates.PAGINATION ?
                <div className="spinner"></div> : this.state.page + 1
            }</span>
            <span
              className={((this.state.filteredData && this.state.filteredData.length == itemsPerPage)
                && !this.state.loadingState ? " " : "disabled ") + s.next}
              onClick={(e) => this.nextPage(e)}
            ></span>
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(WizardVms, s);
