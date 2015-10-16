import React from 'react';
import Debounce from 'lodash.debounce';

import {Modal} from 'react-bootstrap';

import AceEditor from '../components/ace';
import AdvancedEditorOptions from '../components/advancedEditorOptions';
import Alert from '../components/alert';
import Button from '../components/button';

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
        const saveWebtask = this.saveWebtask.bind(this);
        const toggleSecrets = this.toggleSecrets.bind(this);
        const tryWebtask = this.tryWebtask.bind(this);
        
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
                
                { state.showAdvanced
                ?   (
                        <AdvancedEditorOptions
                            secrets={ state.secrets }
                        />
                    )
                :   null
                }

                <div className="btn-list text-right">
                    <Button
                        bsStyle="link"
                        className="pull-left"
                        type="button"
                        disabled={ loading }
                        onClick={ loading ? null : toggleSecrets }
                    >
                        { state.showAdvanced ? 'Hide advanced' : 'Show advanced' }
                    </Button>

                    <Button
                        type="submit"
                        disabled={ loading }
                        onClick={ loading ? null : tryWebtask }
                    >
                        { state.creatingToken ? 'Sending...' : 'Try'}
                    </Button>

                    <Button
                        bsStyle="primary"
                        type="submit"
                        disabled={ loading }
                        onClick={ loading ? null : saveWebtask }
                    >
                        { state.savingWebtask ? 'Saving...' : 'Save' }
                    </Button>
                </div>
            </div>
        );
    }
    
    onChange(code) {
        this.setState({ code });
    }
    
    saveWebtask(e) {
        e.preventDefault();
        
    }
    
    toggleSecrets(e) {
        e.preventDefault();
        
        this.setState({
            showAdvanced: !this.state.showAdvanced
        });
    }
    
    tryWebtask(e) {
        e.preventDefault();
        
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