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

let eventAdded = false;
let listeners: any[] = [];
const keyDownHandler = (evt: KeyboardEvent) => {
  let maxPriority = 0;
  listeners.forEach(l => {
    maxPriority = Math.max(l.priority, maxPriority);
  });
  const prioritizedListeners = listeners.filter(
    l => l.priority === maxPriority
  );
  prioritizedListeners.forEach(listener => {
    if (listener.callback && !window.handlingEnterKey) listener.callback(evt);
  });
};
export default class KeyboardManager {
  static eventAdded = false;

  static onKeyDown(
    id: string,
    callback: ((event: KeyboardEvent) => void) | null,
    priority?: number
  ) {
    if (!eventAdded) {
      eventAdded = true;
      document.addEventListener("keydown", (evt: KeyboardEvent) => {
        keyDownHandler(evt);
      });
    }

    const listener = listeners.find(l => l.id === id);
    if (listener) {
      return;
    }
    listeners.push({ id, callback, priority: priority || 0 });
  }

  static onEnter(
    id: string,
    callback: (evt: KeyboardEvent) => void,
    priority?: number
  ) {
    this.onKeyDown(
      `${id}-enter`,
      evt => {
        if (evt.key === "Enter") {
          callback(evt);
        }
      },
      priority
    );
  }

  static onEsc(
    id: string,
    callback: (evt: KeyboardEvent) => void,
    priority?: number
  ) {
    this.onKeyDown(
      `${id}-esc`,
      evt => {
        if (evt.key === "Escape") {
          callback(evt);
        }
      },
      priority
    );
  }

  static removeKeyDown(id: string) {
    listeners = listeners.filter(
      l => l.id !== id && l.id !== `${id}-enter` && l.id !== `${id}-esc`
    );
  }
}
