import isEqual from 'lodash.isequal';
import React from 'react';

import {OverlayTrigger} from 'react-bootstrap';



import Alert from '../components/alert';
import Button from '../components/button';
import Input from '../components/input';
import SecretsEditor from '../components/secretsEditor';
import Tooltip from '../components/tooltip';


export default class A0AdvancedEditorOptions extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            name: props.name,
            mergeBody: props.mergeBody,
            parseBody: props.parseBody,
            secrets: props.secrets,
        };
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (this.props.onChange && !isEqual(this.state, prevState))
            this.props.onChange({
                name: this.state.name,
                mergeBody: this.state.mergeBody,
                parseBody: this.state.parseBody,
                secrets: this.state.secrets,
            });
    }
    
    render() {
        const props = this.props;
        const state = this.state;
        
        const setState = this.setState.bind(this);
        const getName = () => this.refs.name.getValue();
        const getSecrets = () => this.refs.secrets.getValue();

        const parseBodyHelp = <Tooltip>
            This will attempt to parse the body of incoming requests and expose
            the parsed body at&nbsp;<code>context.body</code>. Do not enable this if
            you are using any server frameworks with&nbsp;
            <a href="https://github.com/auth0/webtask-tools" target="_blank">webtask-tools</a>.
        </Tooltip>;

        const mergeBodyHelp = <Tooltip>
            This will merge any parameters from the parsed body into
            &nbsp;<code>context.data</code>.
        </Tooltip>;
        
        const loading = props.loading;

        return (
            <div className="a0-advanced">
                <label className="control-label">Advanced options:</label>
                <div className="form-group">
                    <div className="checkbox">
                        <OverlayTrigger placement="top" overlay={ parseBodyHelp }>
                            <label>
                                <input
                                    ref="parseBody"
                                    type="checkbox"
                                    onChange={ (e) => setState({ parseBody: e.target.checked }) }
                                    disabled={ loading }
                                    checked={ state.parseBody }
                                />
                                Automatically parse the request body into  <code>context.body</code>
                            </label>
                        </OverlayTrigger>
                    </div>
                    <div className="checkbox">
                        <OverlayTrigger placement="top" overlay={ mergeBodyHelp} >
                            <label>
                                <input
                                    ref="mergeBody"
                                    type="checkbox"
                                    onChange={ (e) => setState({ mergeBody: e.target.checked }) }
                                    disabled={ loading }
                                    checked={ state.mergeBody }
                                />
                                Merge the parsed body into <code>context.data</code>
                            </label>
                        </OverlayTrigger>
                    </div>
                </div>

                <Input
                    label="Webtask name (optional)"
                    type="text"
                    bsSize="small"
                    placeholder="Name"
                    name="key"
                    ref="name"
                    value={ state.name }
                    onChange={ () => setState({
                        name: getName(),
                    }) }
                />

                <div className="form-group">
                    <SecretsEditor
                        ref="secrets"
                        secrets={ state.secrets }
                        onChange={ () => setState({
                            secrets: getSecrets()
                        }) }
                    />
                </div>
            </div>
        );
    }
    
    getValue() {
        return {
            name: this.state.name,
            mergeBody: this.state.mergeBody,
            parseBody: this.state.parseBody,
            secrets: this.state.secrets,
        };
    }
}

A0AdvancedEditorOptions.propTypes = {
    name: React.PropTypes.string.isRequired,
    mergeBody: React.PropTypes.bool.isRequired,
    parseBody: React.PropTypes.bool.isRequired,
    secrets: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
};