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
import s from './MigrationDetail.scss';
import Moment from 'react-moment';
import LoadingIcon from "../LoadingIcon";
import EndpointLink from '../EndpointLink';

const title = 'Migration details';

class MigrationDetail extends Component {
  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
  };

  static propTypes = {
    migration: PropTypes.object
  }

  componentWillMount() {
    this.context.onSetTitle(title);
  }

  render() {
    let item = this.props.migration
    let output = null
    if (item) {
      output = (
        <div className={s.root}>
          <div className={s.container}>
            <div className={s.columnLeft}>
              <div className={s.formGroup}>
                <div className={s.title}>
                  Source
                </div>
                <div className={s.value}>
                  <EndpointLink connectionId={item.origin_endpoint_id} />
                </div>
                <div className={s.cloudImg + " icon large-cloud " + item.origin_endpoint_type + " dim"}></div>
                <div className="arrow large"></div>
              </div>
              <div className={s.formGroup}>
                <div className={s.title}>
                  Type
                </div>
                <div className={s.value}>
                  {item.migrationType == "replica" ? "Coriolis Replica" : "Coriolis Migration"}
                </div>
              </div>
              <div className={s.formGroup}>
                <div className={s.title}>
                  Notes
                </div>
                <div className={s.value}>
                  {item.notes}
                </div>
              </div>
            </div>
            <div className={s.columnRight}>
              <div className={s.formGroup}>
                <div className={s.title}>
                  Target
                </div>
                <div className={s.value}>
                  <EndpointLink connectionId={item.destination_endpoint_id} />
                </div>
                <div className={s.cloudImg + " icon large-cloud " + item.destination_endpoint_type + " dim"}></div>
              </div>
              <div className={s.formGroup}>
                <div className={s.title}>
                  Created
                </div>
                <div className={s.value}>
                  <Moment format="MM/DD/YYYY HH:MM" date={item.created} />
                </div>
              </div>
              <div className={s.formGroup}>
                <div className={s.titleIp}>
                  Id
                </div>
                <div className={s.value}>
                  <a>{item.id}</a>
                </div>
              </div>
              {/*<div className={s.formGroup}>
               <div className={s.title}>
               Flavours
               </div>
               <div className={s.value}>
               {item.autoFlavors ? "Automatic flavour selection" : "Manual flavour selection"}
               </div>
               </div>*/}
              {/*<div className={s.formGroup}>
               <div className={s.title}>
               Disk Format
               </div>
               <div className={s.value}>
               {item.diskFormat}
               </div>
               </div>*/}
            </div>
          </div>
        </div>
      )
    }
    return output
  }

}

export default withStyles(MigrationDetail, s);
