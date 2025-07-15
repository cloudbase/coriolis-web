/*
Copyright (C) 2025  Cloudbase Solutions SRL
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
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NumberedPagination from "./NumberedPagination";
import TestUtils from "@tests/TestUtils";

const NumberedPaginationWithDefaultProps = (
  props: Partial<NumberedPagination["props"]>,
) => (
  <NumberedPagination
    itemsCount={props.itemsCount || 100}
    currentPage={props.currentPage || 2}
    itemsPerPage={props.itemsPerPage || 10}
    itemsPerPageOptions={props.itemsPerPageOptions || [5, 10, 20, 50]}
    onPageChange={props.onPageChange || (() => {})}
    onItemsPerPageChange={props.onItemsPerPageChange || (() => {})}
    style={props.style}
  />
);

describe("NumberedPagination", () => {
  it("renders", () => {
    render(<NumberedPaginationWithDefaultProps />);
    expect(
      TestUtils.select("NumberedPagination__PageNumber")?.textContent,
    ).toBe("Page 2 of 10");
  });

  it("handles previous and next click", async () => {
    const onPageChange = jest.fn();

    render(<NumberedPaginationWithDefaultProps onPageChange={onPageChange} />);

    const previousButton = screen.getByRole("button", { name: "Previous" });
    const nextButton = screen.getByRole("button", { name: "Next" });

    await userEvent.click(previousButton);
    expect(onPageChange).toHaveBeenCalled();

    await userEvent.click(nextButton);
    expect(onPageChange).toHaveBeenCalled();
  });

  it("handles disabled states", async () => {
    let onPageChange = jest.fn();

    const { rerender } = render(
      <NumberedPaginationWithDefaultProps
        onPageChange={onPageChange}
        currentPage={1}
        itemsCount={30}
        itemsPerPage={10}
      />,
    );
    let previousButton = screen.getByRole("button", { name: "Previous" });
    let nextButton = screen.getByRole("button", { name: "Next" });

    await userEvent.click(previousButton);
    expect(onPageChange).not.toHaveBeenCalled();

    await userEvent.click(nextButton);
    expect(onPageChange).toHaveBeenCalled();

    onPageChange = jest.fn();
    rerender(
      <NumberedPaginationWithDefaultProps
        onPageChange={onPageChange}
        currentPage={3}
        itemsCount={30}
        itemsPerPage={10}
      />,
    );

    previousButton = screen.getByRole("button", { name: "Previous" });
    nextButton = screen.getByRole("button", { name: "Next" });

    await userEvent.click(previousButton);
    expect(onPageChange).toHaveBeenCalled();

    onPageChange = jest.fn();

    expect(nextButton).toHaveProperty("disabled", true);
    await userEvent.click(nextButton);
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("renders all items per page options", () => {
    const itemsPerPageOptions = [5, 10, 20, 50, 100];

    render(
      <NumberedPaginationWithDefaultProps
        itemsPerPageOptions={itemsPerPageOptions}
      />,
    );

    const options = screen.getAllByRole("option");

    expect(options.length).toBe(itemsPerPageOptions.length);
    itemsPerPageOptions.forEach((option, index) => {
      expect((options[index] as HTMLOptionElement).value).toBe(
        option.toString(),
      );
      expect(options[index].textContent).toBe(option.toString());
    });
  });
});
