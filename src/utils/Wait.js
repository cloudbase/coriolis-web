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

class Wait {
  /**
   * Waits the specified timeout (default: 5000ms) amount of time for the stop condition to be true,
   * then calls the stop callback.
   * @param {Function} stopCondition Called every 500ms to check if the wait should stop.
   * @param {Function} stopCallback Called when stopCondition evaluates to true.
   * @param {number} timeout Specifies after how many miliseconds should the wait give up.
   * @param {Function} timeoutCallback Called if wait reaches timeout.
   */
  static for(stopCondition, stopCallback, timeout = 5000, timeoutCallback = () => { }) {
    let startTime = new Date()

    if (stopCondition()) {
      stopCallback()
      return
    }

    let interval = setInterval(() => {
      let currentTime = new Date()

      if (currentTime - startTime > timeout) {
        clearInterval(interval)
        timeoutCallback()
      }

      if (stopCondition()) {
        clearInterval(interval)
        stopCallback()
      }
    }, 500)
  }
}

export default Wait
