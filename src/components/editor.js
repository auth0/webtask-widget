import AceEditor from 'react-ace';
import React from 'react';
import Debounce from 'lodash.debounce';

import {Modal} from 'react-bootstrap';

import Alert from '../components/alert';

import ComponentStack from '../lib/componentStack';


export default class A0Editor extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            code: props.code,
            secrets: props.secrets,
            creatingToken: false,
            showAdvanced: false,
            savingWebtask: false,
            tryingWebtask: false,
            mergeBody: props.mergeBody,
            parseBody: props.parseBody,
            name: props.name,
            successMessage: '',
        };

        const debounceInterval = Math.max(1000, Number(props.autoSaveInterval));

        this.autoSave = Debounce(() => this.saveWebtask(), debounceInterval);
    }
    
    render() {
        const props = this.props;
        const state = this.state;
        
        const loading = state.creatingToken
            || state.savingWebtask
            || state.tryingWebtask;
        const onChange = this.onChange.bind(this);
        
        return (
            <div className="a0-editor">
                { state.error
                ?   (
                        <Alert bsStyle="danger">
                            { state.error.message }
                        </Alert>
                    )
                :   null
                }
                
                <div className="form-group form-group-grow">
                    <label className="control-label">Edit webtask code:</label>
                    <AceEditor
                        ref="ace"
                        name="code"
                        className="form-control"
                        mode="javascript"
                        theme="textmate"
                        value={ state.code }
                        maxLines={ 15 }
                        height=""
                        width=""
                        onChange={ onChange }
                        editorProps={ { $blockScrolling: true } }
                    />
                </div>
                
            </div>
        );
    }
    
    onChange(code) {
        this.setState({ code });
    }
}

A0Editor.title = 'Create a webtask';

A0Editor.propTypes = {
    componentStack:         React.PropTypes.instanceOf(ComponentStack).isRequired,
    name:                   React.PropTypes.string,
    mergeBody:              React.PropTypes.bool,
    parseBody:              React.PropTypes.bool,
    autoSaveInterval:       React.PropTypes.number,
    autoSaveOnChange:       React.PropTypes.bool,
    autoSaveOnLoad:         React.PropTypes.bool,
    showWebtaskUrl:         React.PropTypes.bool,
    showTryWebtaskUrl:      React.PropTypes.bool,
    secrets:                React.PropTypes.object,
    code:                   React.PropTypes.string.isRequired,
    tryParams:              React.PropTypes.object,
    onSave:                 React.PropTypes.func.isRequired,
};

A0Editor.defaultProps = {
    mergeBody:              false,
    parseBody:              false,
    name:                   '',
    autoSaveInterval:       1000,
    autoSaveOnChange:       false,
    autoSaveOnLoad:         false,
    showWebtaskUrl:         true,
    showTryWebtaskUrl:      true,
    secrets:                {},
    tryParams:              {
                                path: '',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                query: {
                                    hello: 'world',
                                },
                                body: {
                                    hint: 'Only sent for PUT, POST and PATCH requests',
                                },
                            },
};