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

export type AlertInfoLevel = "success" | "error" | "info" | "warning";

export type AlertInfoOptions = {
  action?: {
    label: string;
    callback: () => any;
  };
};

export type AlertInfo = {
  options?: AlertInfoOptions | null;
  message: string;
  title?: string;
  id?: string;
  level?: AlertInfoLevel;
};

export type NotificationItemData = {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  unseen?: boolean;
  updatedAt?: string;
};

export type NotificationItem = {
  projectId: string;
  items: NotificationItemData[];
};
