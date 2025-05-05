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

import React from "react";
import { storiesOf } from "@storybook/react";
import moment from "moment";
import DatetimePicker from ".";

const Wrapper = (props: any) => (
  <div style={{ marginLeft: "100px" }}>
    <DatetimePicker
      {...props}
      onChange={() => {}}
    />
  </div>
);

storiesOf("DatetimePicker", module)
  .add("default", () => <Wrapper />)
  .add("disabled dates", () => (
    <Wrapper
      isValidDate={(currentDate: { isAfter: (arg0: moment.Moment) => any }) =>
        currentDate.isAfter(moment().subtract(1, "minute"))
      }
    />
  ));
