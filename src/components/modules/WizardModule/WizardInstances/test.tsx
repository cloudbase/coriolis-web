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
import { shallow } from "enzyme";
import sinon from "sinon";
import TW from "@src/utils/TestWrapper";
import WizardInstances from ".";

const wrap = props =>
  new TW(
    shallow(<WizardInstances instancesPerPage={6} {...props} />),
    "wInstances"
  );

const instances = [
  {
    id: "i-1",
    flavor_name: "Flavor name",
    instance_name: "Instance name 1",
    num_cpu: 3,
    memory_mb: 1024,
  },
  {
    id: "i-2",
    flavor_name: "Flavor name",
    instance_name: "Instance name 2",
    num_cpu: 3,
    memory_mb: 1024,
  },
  {
    id: "i-3",
    flavor_name: "Flavor name",
    instance_name: "Instance name 3",
    num_cpu: 3,
    memory_mb: 1024,
  },
];
describe("WizardInstances Component", () => {
  it("has correct number of instances", () => {
    const wrapper = wrap({ instances, currentPage: 1 });
    expect(wrapper.findPartialId("item-").length).toBe(instances.length);
  });

  it("has correct instances info", () => {
    const wrapper = wrap({ instances, currentPage: 1 });
    instances.forEach(instance => {
      expect(wrapper.find(`item-${instance.id}`).findText("itemName")).toBe(
        instance.instance_name
      );
      expect(wrapper.find(`item-${instance.id}`).findText("itemDetails")).toBe(
        `${instance.num_cpu} vCPU | ${instance.memory_mb} MB RAM | ${instance.flavor_name}`
      );
    });
  });

  it("renders selected instances", () => {
    const wrapper = wrap({
      instances,
      currentPage: 1,
      selectedInstances: [{ ...instances[0] }, { ...instances[2] }],
      instancesPerPage: 3,
    });
    expect(wrapper.findText("selInfo")).toBe("2 instances selected");
    expect(wrapper.find("item-i-1").prop("selected")).toBe(true);
    expect(wrapper.find("item-i-2").prop("selected")).toBe(false);
    expect(wrapper.find("item-i-3").prop("selected")).toBe(true);
  });

  it("renders current page", () => {
    const wrapper = wrap({ instances, currentPage: 2, instancesPerPage: 2 });
    expect(wrapper.findText("currentPage")).toBe("2 of 2");
  });

  it("renders previous page disabled if page is 1", () => {
    const wrapper = wrap({ instances, currentPage: 1 });
    expect(wrapper.find("prevPageButton").prop("disabled")).toBe(true);
  });

  it("renders previous page enabled if page is greater than 1", () => {
    const wrapper = wrap({ instances, currentPage: 3 });
    expect(wrapper.find("prevPageButton").prop("disabled")).toBeFalsy();
    expect(wrapper.find("loadingStatus").length).toBe(0);
  });

  it("renders loading", () => {
    const wrapper = wrap({ instances, currentPage: 1, loading: true });
    expect(wrapper.find("loadingStatus").length).toBe(1);
  });

  it("renders searching", () => {
    const wrapper = wrap({ instances, currentPage: 1, searching: true });
    expect(wrapper.find("searchInput").prop("loading")).toBe(true);
  });

  it("renders search not found", () => {
    const wrapper = wrap({
      instances: [],
      currentPage: 1,
      searchNotFound: true,
    });
    expect(wrapper.findText("notFoundText")).toBe(
      "Your search returned no results"
    );
    expect(wrapper.find("loadingChunks").length).toBe(0);
  });

  it("renders loading page", () => {
    const wrapper = wrap({ instances, currentPage: 1, chunksLoading: true });
    expect(wrapper.find("loadingChunks").length).toBe(1);
  });

  it("enabled next page", () => {
    let wrapper = wrap({ instances, currentPage: 1 });
    expect(wrapper.find("nextPageButton").prop("disabled")).toBe(true);
    wrapper = wrap({ instances, currentPage: 1, instancesPerPage: 2 });
    expect(wrapper.find("nextPageButton").prop("disabled")).toBeFalsy();
  });

  it("dispatches next and previous page click, if enabled", () => {
    const onPageClick = sinon.spy();
    let wrapper = wrap({ instances, currentPage: 1, onPageClick });
    wrapper.find("nextPageButton").click();
    wrapper.find("prevPageButton").click();
    expect(onPageClick.callCount).toBe(0);
    wrapper = wrap({
      instances,
      currentPage: 2,
      onPageClick,
      instancesPerPage: 1,
    });
    wrapper.find("nextPageButton").click();
    wrapper.find("prevPageButton").click();
    expect(onPageClick.callCount).toBe(2);
  });

  it("dispaches reload click", () => {
    const onReloadClick = sinon.spy();
    const wrapper = wrap({ instances, currentPage: 1, onReloadClick });
    wrapper.find("reloadButton").click();
    expect(onReloadClick.calledOnce).toBe(true);
  });
});
