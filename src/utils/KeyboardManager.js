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

// @flow

let eventAdded = false
let listeners = []
const keyDownHandler = evt => {
  let maxPriority = 0
  listeners.forEach(l => { maxPriority = Math.max(l.priority, maxPriority) })
  let prioritizedListeners = listeners.filter(l => l.priority === maxPriority)
  prioritizedListeners.forEach(listener => {
    if (listener.callback) listener.callback(evt)
  })
}
export default class KeyboardManager {
  static eventAdded = false
  static onKeyDown(id: string, callback: ?(event: KeyboardEvent) => void, priority?: number) {
    if (!eventAdded) {
      eventAdded = true
      document.addEventListener('keydown', (evt: KeyboardEvent) => { keyDownHandler(evt) })
    }

    let listener = listeners.find(l => l.id === id)
    if (listener) {
      return
    }
    listeners.push({ id, callback, priority: priority || 0 })
  }

  static onEnter(id: string, callback: (evt: KeyboardEvent) => void, priority?: number) {
    this.onKeyDown(`${id}-enter`, evt => {
      if (evt.keyCode === 13) {
        callback(evt)
      }
    }, priority)
  }

  static onEsc(id: string, callback: (evt: KeyboardEvent) => void, priority?: number) {
    this.onKeyDown(`${id}-esc`, evt => {
      if (evt.keyCode === 27) {
        callback(evt)
      }
    }, priority)
  }

  static removeKeyDown(id: string) {
    listeners = listeners.filter(l => l.id !== id && l.id !== `${id}-enter` && l.id !== `${id}-esc`)
  }
}
