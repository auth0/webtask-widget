import React from 'react';

import 'styles/toggleButton.less';

export default class ToggleButton extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            id: 'a0-toggle-' + ToggleButton.seq++,
            checked: !!props.checked,
        };
    }
    
    render() {
        const props = this.props;
        const state = this.state;
        
        return (
            <div className={ 'a0-toggle-button' + (props.loading ? ' -loading': '') }>
                <input className="a0-checkbox" type="checkbox"
                    ref="checkbox"
                    id={ state.id }
                    disabled={ props.disabled }
                    checked={ props.checked }
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
        if (this.props.async) {
            if (this.props.onChange) this.props.onChange(this.getValue());
        } else {
            this.setState({ checked }, () => {
                if (this.props.onChange) this.props.onChange(this.getValue());
            });
        }
    }
    
    getValue() {
        return this.refs.checkbox.checked;
    }
}

ToggleButton.seq = 0;

ToggleButton.propTypes = {
    checked: React.PropTypes.bool.isRequired,
    onChange: React.PropTypes.func,
    async: React.PropTypes.bool,
    loading: React.PropTypes.bool,
};

ToggleButton.defaultProps = {
    async: false,
    loading: false,
};
