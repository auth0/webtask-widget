import React from 'react';

import {Modal} from 'react-bootstrap';

export default class A0Modal extends React.Component {
    render() {
        const props = this.props;
        const state = this.state;
        
        const child = React.Children.only(props.children);
        const clone = React.cloneElement(child, {
            ref: 'child',
        });
        
        const onHide = function () {
            console.log('afdsfs');
            console.log('onHide', ...arguments, props);
            
            props.onHide(...arguments);
        };
        
        return (
            <Modal show={ true } onHide={ onHide }>
                <Modal.Header closeButton>
                    <Modal.Title>{ props.title }</Modal.Title>
                </Modal.Header>
                <Modal.Body>{ clone }</Modal.Body>
            </Modal>
        );
    }
}

A0Modal.propTypes = {
    children: React.PropTypes.element.isRequired,
    title: React.PropTypes.string.isRequired,
    onHide: React.PropTypes.func.isRequired,
};
