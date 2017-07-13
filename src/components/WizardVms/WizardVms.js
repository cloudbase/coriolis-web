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
import {itemsPerPage} from '../../config';
import ConnectionsActions from '../../actions/ConnectionsActions';
import LoadingIcon from '../LoadingIcon';

const title = 'Select VMs to migrate';
const vmStatesConst = ["All", "RUNNING", "PAUSED", "STOPPED"]
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
    let timeout = null

    if (this.props.data.instances) {
      this.props.data.instances.forEach((vm) => {
        if (vm.selected) {
          valid = true
        }
      })
    }
    this.state = {
      valid,
      queryText: '',
      page: 0,
      filterStatus: 'All',
      filteredData: this.props.data.instances ? this.props.data.instances.slice(0, itemsPerPage) : [],
      nextStep: "WizardNetworks"
    }
  }

  processProps(props) {
    if (props.data.instances) {
      this.setState({filteredData: props.data.instances.slice(
        this.state.page * itemsPerPage, this.state.page * itemsPerPage + itemsPerPage)})
    }
  }

  componentWillMount() {
    this.context.onSetTitle(title);
    this.props.setWizardState(this.state)
  }

  componentWillReceiveProps(newProps) {
    this.processProps(newProps)
    if (newProps.data.selectedInstances) {
      let valid =  newProps.data.selectedInstances.length > 0
      if (this.props.data.valid != valid) {
        this.props.setWizardState({valid: valid})
      }
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
          if (instance.name == item.name) {
            index = key
          }
        })

        if (index == -1) {
          selectedInstances.push(item)
        } else {
          selectedInstances.splice(index, 1)
        }
        this.props.setWizardState({selectedInstances: selectedInstances})
      }
    })

    this.props.setWizardState({ instances: instances })
  }

  searchVm(queryText) {
    let queryResult = []

    if (this.props.data.instances) {
      this.props.data.instances.forEach((vm) => {
        if (
          //vm.name.toLowerCase().indexOf(queryText.target.value.toLowerCase()) != -1 &&
          (this.state.filterStatus == "All" || this.state.filterStatus == vm.status)
        ) {
          queryResult.push(vm)
        }
      }, this)
    }

    if (this.state.queryText != queryText) {
      if (this.timeout != null) {
        clearTimeout(this.timeout)
      }
      this.timeout = setTimeout(() => {
        this.setState({page: 0, filteredData: null, queryText: queryText}, () => {
          this.props.setWizardState({instances: null})
          ConnectionsActions.loadInstances(
            {id: this.props.data.sourceCloud.credential.id},
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
    return str.replace(/\w\S*/g, (txt) => { // eslint-disable-line arrow-body-style
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  isSelected(item) {
    let selected = false;
    this.props.data.selectedInstances.forEach(instance => {
      if (instance.name == item.name) {
        selected = true
      }
    })
    return selected
  }

  nextPage() {
    if (this.state.filteredData && this.state.filteredData.length == itemsPerPage) {
      this.setState({page: this.state.page + 1}, () => {
        ConnectionsActions.loadInstances(
          {id: this.props.data.sourceCloud.credential.id},
          this.state.page,
          this.state.queryText
        )
        this.processProps({data: {instances: this.props.data.instances}})
      })
    }
  }

  previousPage() {
    if (this.state.page > 0) {
      this.setState({page: this.state.page + -1}, () => {
        ConnectionsActions.loadInstances(
          {id: this.props.data.sourceCloud.credential.id},
          this.state.page,
          this.state.queryText
        )
        this.processProps({data: {instances: this.props.data.instances}})
      })
    }
  }

  renderSearch() {
    let _this = this
    if (this.state.filteredData && this.state.filteredData.length) {
      let instances = this.state.filteredData.map((item, index) =>
        <div className="item" key={ "vm_" + index } onClick={ (e) => _this.checkVm(e, item) }>
          <div className="checkbox-container">
            <input
              id={"vm_check_" + index}
              type="checkbox"
              checked={this.isSelected(item)}
              onChange={(e) => _this.checkVm(e, item)}
              className="checkbox-normal"
            />
            <label htmlFor={ "vm_check_" + index }></label>
          </div>
          <span className="cell cell-icon">
            <div className="icon vm"></div>
            <span className="details">
              {item.instance_name}
            </span>
          </span>
          {/*<span className="cell">
            <span className={ item.status + " status-pill" }>{ item.status }</span>
          </span>*/}
          <span className="cell">{item.num_cpu} vCPU | {item.memory_mb} MB RAM | {item.flavor_name}</span>
        </div>
       )
      return instances
    } else if (this.props.data.instances && this.props.data.instances.length == 0) {
      return <div className="no-results">Your search returned no results</div>
    } else {
      return <LoadingIcon/>
    }
  }

  render() {
    let _this = this
    let vmStates = vmStatesConst.map(
      (state, index) =>
        <a
          className={_this.state.filterStatus == state || (_this.state.filterStatus == null && state == "All") ?
            "selected" : ""}
          onClick={(e) => _this.filterStatus(e, state)} key={"status_" + index}
        >{_this.toTitleCase(state)}</a>
    )
    return (
      <div className={s.root}>
        <div className={s.container}>
          <SearchBox
            placeholder="Search VMs"
            value={this.state.queryText}
            onChange={(e) => this.searchVm(e)}
            className="searchBox"
          />
          <div className="category-filter">
            {vmStates}
          </div>
          <div className="items-list instances">
            {this.renderSearch()}
          </div>
          <div className={s.selectionCount}>
            {this.instancesSelected()} VMs selected
          </div>
          <div className={s.pagination}>
            <span
              className={(this.state.page == 0 ? "disabled " : "")+ s.prev}
              onClick={(e) => this.previousPage(e)}
            ></span>
            <span className={s.currentPage}>{this.state.page + 1}</span>
            <span
              className={(this.state.filteredData && this.state.filteredData.length == itemsPerPage ? " " : "disabled ") + s.next}
              onClick={(e) => this.nextPage(e)}
            ></span>
          </div>
        </div>
      </div>
    );
  }

}

export default withStyles(WizardVms, s);
