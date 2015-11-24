import React from 'react';

import '../styles/toggleButton.less';

export default class A0ToggleButton extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            id: 'a0-toggle-' + A0ToggleButton.seq++,
            checked: !!props.checked,
        };
    }
    
    render() {
        const props = this.props;
        const state = this.state;
        
        return (
            <div className="a0-toggle-button">
                <input className="a0-checkbox" type="checkbox"
                    ref="checkbox"
                    id={ state.id }
                    disabled={ props.disabled }
                    checked={ state.checked }
                    onChange={ e => this.onToggle(e.target.checked) }
                />
                <label className="a0-toggle"
                    htmlFor={ state.id }
                    onClick={ e => e.stopPropagation() }
                />
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

A0ToggleButton.seq = 0;

A0ToggleButton.propTypes = {
    checked: React.PropTypes.bool.isRequired,
};
