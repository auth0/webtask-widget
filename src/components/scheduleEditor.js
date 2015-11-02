import React from 'react';

import AceEditor from '../components/ace';
import Alert from '../components/alert';
import Button from '../components/button';
import Input from '../components/input';


import '../styles/scheduleEditor.less';

export default class A0ScheduleEditor extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            value: props.value,
        };
    }
    
    render() {
        const props = this.props;
        const state = this.state;
        
        const invalid = false;
        
        const onChangeSchedule = this.onChangeSchedule.bind(this);

        return (
            <div className="a0-scheduleeditor">
                { state.error
                ?   (
                        <Alert bsStyle="danger">
                            { state.error.message }
                        </Alert>
                    )
                :   null
                }
                
                <Input
                    type="text"
                    label={ props.label }
                    placeholder="Enter a valid cron schedule"
                    name="schedule"
                    ref="schedule"
                    help={ props.help }
                    value={ state.schedule }
                    onChange={ onChangeSchedule }
                />

            </div>
        );
    }
    
    getValue() {
        return this.refs.schedule.getValue();
    }
    
    onChangeSchedule(e) {
        if (e && e.preventDefault) e.preventDefault();
        
        const value = this.getValue();
        
        if (this.props.onChange) {
            this.props.onChange(value);
        }
        
        this.setState({ value });
    }
    
    onReject(e) {
        if (e && e.preventDefault) e.preventDefault();
    }
    
    onResolve(e) {
        if (e && e.preventDefault) e.preventDefault();
    }
}

A0ScheduleEditor.title = 'Create a schedule';

A0ScheduleEditor.propTypes = {
    help:                   React.PropTypes.oneOfType([
                                React.PropTypes.string,
                                React.PropTypes.array,
                            ]),
    label:                  React.PropTypes.oneOfType([
                                React.PropTypes.string,
                                React.PropTypes.array,
                            ]),
    value:                  React.PropTypes.string,
    onChange:               React.PropTypes.func,
    showLabel:              React.PropTypes.bool,
};

A0ScheduleEditor.defaultProps = {
    value:                  '* * * * *',
    help:                   null,
    label:                  null,
    showLabel:              true,
};
