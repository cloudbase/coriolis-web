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

  it('renders correctly animated', () => {
    const tree = renderer.create(
      <LoadingIcon animate />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly with text', () => {
    const tree = renderer.create(
      <LoadingIcon text="Test text" />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly with sizes', () => {
    const tree = renderer.create(
      <LoadingIcon width={300} height={200} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
})
