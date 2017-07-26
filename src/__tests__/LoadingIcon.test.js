import React from 'react';
import { LoadingIcon } from '../components/LoadingIcon';
import renderer from 'react-test-renderer';

describe('Loading icon', () => {
  it('renders correctly', () => {
    const tree = renderer.create(
      <LoadingIcon />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
})
