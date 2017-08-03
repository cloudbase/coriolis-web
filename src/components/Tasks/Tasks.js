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
import moment from 'moment';
import Table from '../Table';
import s from './Tasks.scss';
import TextTruncate from 'react-text-truncate';
import LoadingIcon from "../LoadingIcon/LoadingIcon";
import ProgressBar from '../ProgressBar';
import Helper from '../Helper';

function hasProgress(msg) {
  if (msg.indexOf('progress:') > -1) {
    let progressStr = msg.substr(msg.indexOf('progress:'))
    let value = progressStr.match(/(100|[0-9]{1,2})%/)
    return value[1]
  } else {
    return false
  }
}

class Tasks extends Component {

  static propTypes = {
    tasks: PropTypes.array
  }


  constructor(props) {
    super(props)
    this.headers = [
      { label: "Task", key: 'task_type', width: 1 },
      { label: "Instance", key: 'instance', width: 1 },
      { label: "Latest Message", key: 'latest_message', width: 2 },
      { label: "Timestamp", key: 'timestamp', width: 1 }
    ]

    this.state = {
      listItems: []
    }
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  componentWillReceiveProps(newProps) {
    let listItems = []
    if (newProps.tasks) {
      newProps.tasks.forEach((item) => {
        let latestMessage
        if (item.progress_updates.length && item.progress_updates[item.progress_updates.length - 1]) {
          latestMessage = item.progress_updates[item.progress_updates.length - 1].message
        } else {
          latestMessage = "-"
        }

        let progressUpdates = []
        if (item.progress_updates.length) {
          let first = true

          if (item.progress_updates[0] !== null) {
            item.progress_updates.sort((a, b) => moment(a.created_at).isAfter(moment(b.created_at)))
          }
          for (let i = item.progress_updates.length - 1; i >= 0; i--) {
            let date = "-"
            if (item.progress_updates[i]) {
              let createdAt = Helper.getTimeObject(item.progress_updates[i].created_at)
              date = moment(createdAt).format("YYYY-MM-DD HH:mm:ss")

              progressUpdates.push(
                <div key={"progress_" + i} className={first ? " first" : ""}>
                  <span>{date}</span>
                  <span>
                    {item.progress_updates[i] && item.progress_updates[i].message}
                    {hasProgress(item.progress_updates[i].message) &&
                    <ProgressBar progress={hasProgress(item.progress_updates[i].message)} />
                    }
                  </span>
                </div>)
              first = false
            }
          }
          if (progressUpdates.length == 0) {
            progressUpdates = "N/A"
          }
        } else {
          progressUpdates = "N/A"
        }

        let taskDetails = (<div className={s.taskDetails}>
          <div className={s.group}>
            <div className={s.detailTitle}>Status</div>
            <div className={s.detailValue}><span className={"status-pill " + item.status}>{item.status}</span></div>
          </div>
          <div className={s.group}>
            <div className={s.detailTitle}>ID</div>
            <div className={s.detailValue}>{item.id}</div>
          </div>
          <div className={s.group}>
            <div className={s.detailTitle}>Exception details</div>
            <div className={s.detailValue}>
              {item.exception_details && item.exception_details.length ?
                (<TextTruncate line={10} text={item.exception_details} truncateText="..." />) : "N/A"}
            </div>
          </div>
          <div className={s.group}>
            <div className={s.detailTitle}>Depends on</div>
            <div className={s.detailValue}>{item.depends_on && item.depends_on[0] ? item.depends_on[0] : "N/A"}</div>
          </div>
          <div className={s.group + " " + s.progressUpdates}>
            <div className={s.detailTitle}>Progress Updates</div>
            <div className={s.detailValue}>{progressUpdates}</div>
          </div>
        </div>)

        let taskType = item.task_type.replace(/_/g, " ").toLowerCase()
        taskType = taskType.charAt(0).toUpperCase() + taskType.slice(1)

        let newItem = {
          task_type: (<span>
            <span className={"taskIcon " + item.status} />
            <TextTruncate line={1} truncateText="..." text={taskType} />
          </span>),
          instance: <TextTruncate line={1} text={item.instance} truncateText="..." />,
          latest_message: <TextTruncate line={1} truncateText="..." text={latestMessage} />,
          timestamp: item.created_at ? Helper.getTimeObject(moment(item.created_at)).format("YYYY-MM-DD HH:mm:ss") :
            "-",
          detailView: taskDetails,
          openState: item.status === 'RUNNING'
        }
        listItems.push(newItem)
      }, this)
    }
    this.setState({ listItems: listItems })
  }


  render() {
    return (
      <div className={s.root}>
        { this.state ?
          (<div className={s.container}>
            <Table
              headerItems={this.headers}
              listItems={this.state ? this.state.listItems : null}
              customClassName={s.table}
              show={this.state !== null}
            />
          </div>) : <LoadingIcon />
        }
      </div>
    );
  }

}

export default withStyles(Tasks, s);
