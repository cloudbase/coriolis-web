import React from 'react';
import { ProgressBar } from '../components/ProgressBar';
import renderer from 'react-test-renderer';

describe('Progress Bar', () => {
  it('renders correctly', () => {
    const tree = renderer.create(
      <ProgressBar />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders progress correctly', () => {
    const tree = renderer.create(
      <ProgressBar progress={20} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
})
