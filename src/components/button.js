import React from 'react';

import {Button} from 'react-bootstrap';

export default class A0Button extends React.Component {
    render() {
        const props = this.props;
        const state = this.state;
        
        return (
            <Button {...props} />
        );
    }
}

A0Button.propTypes = Button.propTypes;
