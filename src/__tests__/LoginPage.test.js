import React from 'react';
import { shallow } from 'enzyme';
import App from '../components/App'
import { LoginPage } from '../components/LoginPage';
import renderer from 'react-test-renderer';

describe('Login Page', () => {
  it('renders correctly', () => {
    const tree = renderer.create(
      <App context={{ insertCss: () => {} }}>
        <LoginPage />
      </App>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('changes user name', () => {
    const LoginPage = shallow(
      <LoginPage />
    )
    expect()
  })
})
