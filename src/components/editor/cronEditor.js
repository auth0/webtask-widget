import CronExpression from 'cron-parser/lib/expression';
import React from 'react';


import 'styles/cronEditor.less';


export default class CronEditor extends React.Component {
    constructor(props) {
        super(props);
        
        const atoms = props.value.split(/\s+/);
        
        // Discard non-standard seconds specifier
        if (atoms.length > 5) atoms.splice(0, 1);
        
        this.state = {
            atoms,
            schedule: atoms.join(' '),
            invalid: [false, false, false, false, false],
        };
    }
    
    componentWillReceiveProps(props) {
        const atoms = props.value.split(/\s+/);
        
        // Discard non-standard seconds specifier
        if (atoms.length > 5) atoms.splice(0, 1);
        
        this.setState({ atoms })
    }
    
    render() {
        const props = this.props;
        const state = this.state;
        
        const titles = ['Minute', 'Hour', 'Date', 'Month', 'Weekday'];
        
        return (
            <div className="a0-cron-editor" disabled={ props.disabled }>
                {
                    titles.map((title, i) => (
                        <div
                            className={ 'a0-cron-segment' + (state.invalid[i] ? ' -invalid': '' ) }
                            key={ i }
                        >
                            <input className="a0-value"
                                value={ state.atoms[i] }
                                disabled={ props.disabled }
                                onChange={ e => this.onChangeSegment(i, e.target.value) }
                            />
                            <span className="a0-title">{ title }</span>
                        </div>
                    ))
                }
            </div>
        );
    }
    
    getValue() {
        return this.state.schedule;
    }
    
    onChangeSegment(i, value) {
        const invalid = this.state.invalid.slice();
        const atoms = this.state.atoms.slice();
        const field = CronExpression.map[i + 1]; // The .map also has seconds, skip over it
        
        atoms[i] = value;
        
        try {
            CronExpression._parseField(
                field,
                value,
                CronExpression.constraints[i + 1]);
        } catch (e) {
            invalid[i] = e.message;
            
            return this.setState({ atoms, invalid });
        }
        
        const schedule = atoms.join(' ');
        
        invalid[i] = false;
        
        this.setState({ atoms, invalid, schedule }, () => {
            if (this.props.onChange) this.props.onChange(this.getValue());
        });
    }
}

CronEditor.propTypes = {
    help:                   React.PropTypes.oneOfType([
                                React.PropTypes.string,
                                React.PropTypes.array,
                            ]),
    label:                  React.PropTypes.oneOfType([
                                React.PropTypes.string,
                                React.PropTypes.array,
                            ]),
    value:                  React.PropTypes.string,
    onChange:               React.PropTypes.func.isRequired,
    showLabel:              React.PropTypes.bool,
};

CronEditor.defaultProps = {
    value:                  '* * * * *',
    help:                   null,
    label:                  null,
    showLabel:              true,
};
