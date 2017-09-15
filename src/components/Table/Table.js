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
import Collapse from 'react-collapse';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Table.scss';

class Table extends Component {

  static defaultProps = {
    headerItems: [],
    listItems: [],
    parentId: null,
    show: true
  }

  static propTypes = {
    headerItems: PropTypes.array,
    listItems: PropTypes.array,
    customClassName: PropTypes.string,
    show: PropTypes.bool,
    parentId: PropTypes.string
  }

  constructor(props) {
    super(props)
    this.state = {
      openState: [],
      parentId: null
    }
  }

  componentWillReceiveProps(newProps) {
    let openState = []
    for (let i in newProps.listItems) {
      // Use the previous open state if the table's parent ID is the same
      // i.e. don't close the collapser if new props arrive
      let isSameParent = this.state.parentId === null || newProps.parentId === this.state.parentId
      let prevOpenState = isSameParent && this.state.openState[i]
      openState.push(newProps.listItems[i].openState || prevOpenState)
    }
    this.setState({ openState: openState, parentId: newProps.parentId })
  }

  toggleDrawer(index) {
    let newOpenState = this.state.openState
    let toggled = !newOpenState[index]
    for (let i in newOpenState) {
      newOpenState[i] = false
    }
    newOpenState[index] = toggled

    this.setState({ openState: newOpenState })
  }

  rowMouseDown(e) {
    this.dragStartPosition = { x: e.screenX, y: e.screenY };
  }

  rowMouseUp(e, index) {
    this.dragStartPosition = this.dragStartPosition || { x: e.screenX, y: e.screenY };

    // If a drag operation has been initiated (i.e. text selection), don't call toggleDrawer
    if (Math.abs(this.dragStartPosition.x - e.screenX) < 3 && Math.abs(this.dragStartPosition.y - e.screenY) < 3) {
      this.toggleDrawer(index);
    }

    this.dragStartPosition = null;
  }

  render() {
    let headerItems = this.props.headerItems.map((item, index) =>
      <div className={s.cell + " cell"} key={'headerItem_' + index}>{item.label}</div>
    )

    let listItems = (<div className="no-results">No results</div>)
    if (this.props.listItems) {
      listItems = this.props.listItems.map((listItem, index) => {
        let row = this.props.headerItems.map((headerItem) =>
          (
            <div className={s.cell + " cell"} key={headerItem.key + " " + index}>
              {listItem[headerItem.key]}
            </div>
          )
        )

        let detailView = null
        if (listItem.detailView) {
          detailView = (
            <div className={s.detailView}>
              <span className={s.caret}></span>
              <Collapse
                isOpened={typeof this.state.openState[index] == "undefined" ? false : this.state.openState[index]}
                key={"collapse_" + index}
                springConfig={{ stiffness: 100, damping: 20 }}
              >
                {listItem.detailView}
              </Collapse>
            </div>)
        }
        return (
          <div
            className={s.row + " row " + (this.state.openState[index] ? "isOpen" : "")}
            key={"row_" + index}
            onMouseDown={e => this.rowMouseDown(e)}
            onMouseUp={e => this.rowMouseUp(e, index)}
          >
            {row} {detailView}
          </div>)
      }, this)
    }

    return (
      <div className={s.root + " " + this.props.customClassName}>
        <div className={s.headerItems + " headerItems"}>
          {headerItems}
        </div>
        <div className={s.listItems + " listItems"}>
          {listItems}
        </div>
      </div>
    );
  }

}

export default withStyles(Table, s);
