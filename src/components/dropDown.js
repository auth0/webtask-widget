import React from 'react';

import '../styles/dropDown.less';

export default class A0DropDown extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
        };
    }
    
    render() {
        const props = this.props;
        const state = this.state;
        
        return (
            <div className="a0-dropdown-input">
            </div>
        );
    }
    
    onToggle(checked) {
        this.setState({ checked }, () => {
            if (this.props.onChange) this.props.onChange(this.getValue());
        });
    }
    
    getValue() {
        return this.refs.checkbox.checked;
    }
}

A0DropDown.propTypes = {
};
