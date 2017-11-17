// https://github.com/diegohaz/arc/wiki/Testing-components
import React from 'react'
import PropTypes from 'prop-types'

module.exports = new Proxy({}, {
  get: (target, property) => {
    const Mock = props => React.createElement('span', null, props.children)

    Mock.displayName = property
    Mock.propTypes = {
      children: PropTypes.any,
    }

    return Mock
  },
})
