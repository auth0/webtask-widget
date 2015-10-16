import React from 'react';

import {Alert} from 'react-bootstrap';

export default class A0Alert extends React.Component {
    render() {
        const props = this.props;
        const state = this.state;
        
        return (
            <Alert {...props} />
        );
    }
}

A0Alert.propTypes = Alert.propTypes;
