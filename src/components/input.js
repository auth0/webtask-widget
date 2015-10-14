import React from 'react';

import {Input} from 'react-bootstrap';

export default class A0Input extends Input {
    // render() {
    //     const props = this.props;
    //     const state = this.state;
        
    //     return (
    //         <Input {...props} />
    //     );
    // }
    
    // getValue() {
    //     return Input.prototype.getValue.call(this);
    // }
}

A0Input.propTypes = Input.propTypes;
