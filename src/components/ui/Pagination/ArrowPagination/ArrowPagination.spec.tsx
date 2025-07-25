/*
Copyright (C) 2021  Cloudbase Solutions SRL
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
import { render } from "@testing-library/react";
import ArrowPagination from "./ArrowPagination";
import TestUtils from "@tests/TestUtils";

const ArrowPaginationWithDefaultProps = (
  props: Partial<ArrowPagination["props"]>,
) => (
  <ArrowPagination
    currentPage={2}
    totalPages={10}
    onPreviousClick={props.onPreviousClick || (() => {})}
    onNextClick={props.onNextClick || (() => {})}
    nextDisabled={props.nextDisabled || false}
    previousDisabled={props.previousDisabled || false}
    loading={props.loading || false}
  />
);

describe("ArrowPagination", () => {
  it("renders", () => {
    render(<ArrowPaginationWithDefaultProps />);
    expect(TestUtils.select("ArrowPagination__PageNumber")?.textContent).toBe(
      "2 of 10",
    );
  });

  it("handles previous and next click", () => {
    const onPreviousClick = jest.fn();
    const onNextClick = jest.fn();
    render(
      <ArrowPaginationWithDefaultProps
        onPreviousClick={onPreviousClick}
        onNextClick={onNextClick}
      />,
    );
    TestUtils.select("ArrowPagination__PagePrevious")!.click();
    expect(onPreviousClick).toHaveBeenCalled();
    TestUtils.select("ArrowPagination__PageNext")!.click();
    expect(onNextClick).toHaveBeenCalled();
  });

  it("handles disabled states", () => {
    let onPreviousClick = jest.fn();
    let onNextClick = jest.fn();
    const { rerender } = render(
      <ArrowPaginationWithDefaultProps
        onPreviousClick={onPreviousClick}
        previousDisabled
        onNextClick={onNextClick}
      />,
    );
    TestUtils.select("ArrowPagination__PagePrevious")!.click();
    expect(onPreviousClick).not.toHaveBeenCalled();
    TestUtils.select("ArrowPagination__PageNext")!.click();
    expect(onNextClick).toHaveBeenCalled();

    onPreviousClick = jest.fn();
    onNextClick = jest.fn();
    rerender(
      <ArrowPaginationWithDefaultProps
        onPreviousClick={onPreviousClick}
        onNextClick={onNextClick}
        nextDisabled
      />,
    );
    TestUtils.select("ArrowPagination__PagePrevious")!.click();
    expect(onPreviousClick).toHaveBeenCalled();
    TestUtils.select("ArrowPagination__PageNext")!.click();
    expect(onNextClick).not.toHaveBeenCalled();
  });

  it("shows loading", () => {
    const { rerender } = render(<ArrowPaginationWithDefaultProps />);
    expect(TestUtils.select("HorizontalLoading__Wrapper")).toBeFalsy();

    rerender(<ArrowPaginationWithDefaultProps loading />);
    expect(TestUtils.select("HorizontalLoading__Wrapper")).toBeTruthy();
  });
});
