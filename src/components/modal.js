import React from 'react';

import {Modal} from 'react-bootstrap';

export default class A0Modal extends React.Component {
    render() {
        const props = this.props;
        const state = this.state;
        
        const onHide = () => null;
        
        return (
            <Modal.Dialog onHide={ onHide }>
                <Modal.Header closeButton>
                    <Modal.Title>{props.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{props.children}</Modal.Body>
            </Modal.Dialog>
        );
    }
}

A0Modal.propTypes = {
    children: React.PropTypes.element.isRequired,
    title: React.PropTypes.string.isRequired,
};
