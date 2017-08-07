import React from 'react';
import { shallow } from 'enzyme';
import App from '../components/App'
import { LoginPage } from '../components/LoginPage';
import renderer from 'react-test-renderer';
import sinon from 'sinon';


describe('Login Page', () => {
  const tree = renderer.create(
    <App context={{ insertCss: () => {} }}>
      <LoginPage />
    </App>
  ).toJSON();

  it('renders correctly', () => {
    expect(tree).toMatchSnapshot();
  });

  it('simulate click event', () => {
    const onBtnClick = sinon.spy()
    const loginForm = shallow(
      <App context={{ insertCss: () => {} }}>
        <LoginPage />
      </App>
    )

    loginForm.find('button').simulate('click');

    expect(onBtnClick).to.have.property('callCount', 1);
  })
})
