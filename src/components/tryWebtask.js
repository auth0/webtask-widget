import React from 'react';
import Sandbox from 'sandboxjs';

import AceEditor from '../components/ace';
import Alert from '../components/alert';
import Button from '../components/button';
import Inspector from 'react-json-inspector';
import Logs from '../components/logs';


import '../styles/tryWebtask.less';

export default class A0TryWebtask extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            runningCode: false,
            json: JSON.stringify(props.tryParams, null, 4),
            result: null,
            webtask: null,
        };
    }
    
    componentDidMount() {
        this.setState({
            creatingWebtask: true,
            successMessage: '',
        });
        
        this.props.profile.create(this.props.code, {
            merge: this.props.mergeBody,
            parse: this.props.parseBody,
            secret: this.props.secrets,
            name: this.props.name
                ? this.props.name + '__try'
                : null,
        })
            .then((webtask) => this.setState({
                webtask,
            }))
            .finally(() => this.setState({ creatingWebtask: false }));
    }
    
    render() {
        const props = this.props;
        const state = this.state;
        
        const loading = state.creatingWebtask || state.runningCode;
        const onClickBack = this.props.resolve;
        const setState = this.setState.bind(this);
        const runGet = this.run.bind(this, 'get');
        const runPut = this.run.bind(this, 'put');
        const runPost = this.run.bind(this, 'post');
        const runPatch = this.run.bind(this, 'patch');
        const runDelete = this.run.bind(this, 'delete');

        const copyButton = props.webtask
            ?   (
                    <ReactZeroClipboard text={ props.webtask.url }>
                        <Button>Copy</Button>
                    </ReactZeroClipboard>
                )
            :   null;
        
        return (
            <div className="a0-trywebtask">
                { state.creatingWebtask
                ?   (
                        <Alert bsStyle="info">
                            Preparing a test webtask...
                        </Alert>
                    )
                :   null
                }
    
                { state.error
                ?   (
                        <Alert bsStyle="danger">
                            { state.error.message }
                        </Alert>
                    )
                :   null
                }
    
                { props.showTryWebtaskUrl && state.webtask
                ?   (
                        <Input
                            type="text"
                            disabled
                            label="Webtask url:"
                            buttonAfter={ copyButton }
                            value={ props.webtask.url }
                            help="This is the url of the temporary webtask created for this playground."
                        />
                    )
                :   null
                }
    
                <div className="form-group form-group-grow">
                    <label className="control-label">Edit webtask payload:</label>
                    <AceEditor
                        ref="data"
                        name="data"
                        className="form-control"
                        mode="json"
                        theme="textmate"
                        value={ state.json }
                        height=""
                        width=""
                        maxLines={ 12 }
                        minLines={ 5 }
                        onChange={ loading ? null : (json) => setState({ json }) }
                        readOnly={ loading }
                    />
                </div>
    
                <div>
                    <label className="control-label">Result:</label>
                    <Inspector className="well" data={ state.result || {} } search={ null } />
                </div>
    
                <div>
                    <label className="control-label">Logs:</label>
                    <Logs profile={ props.profile } />
                </div>
                
                <div className="btn-list text-right">
                    <Button
                        className="pull-left"
                        type="button"
                        onClick={ onClickBack }>
                        Back
                    </Button>
                    <Button
                        type="submit"
                        bsStyle="primary"
                        disabled={ loading }
                        onClick={ loading ? null : runGet }>
                        GET
                    </Button>
                    <Button
                        type="submit"
                        bsStyle="primary"
                        disabled={ loading }
                        onClick={ loading ? null : runPut }>
                        PUT
                    </Button>
                    <Button
                        type="submit"
                        bsStyle="primary"
                        disabled={ loading }
                        onClick={ loading ? null : runPost }>
                        POST
                    </Button>
                    <Button
                        type="submit"
                        bsStyle="primary"
                        disabled={ loading }
                        onClick={ loading ? null : runPatch }>
                        PATCH
                    </Button>
                    <Button
                        type="submit"
                        bsStyle="primary"
                        disabled={ loading }
                        onClick={ loading ? null : runDelete }>
                        DELETE
                    </Button>
                </div>
            </div>
        );
    }
    
    run (method) {
        const json = this.refs.data.editor.getValue();
        const webtask = this.state.webtask;
        let data;

        try {
            data = JSON.parse(json);
        } catch (__) {
            return this.setState({
                error: new Error('The data you enter must be valid json.'),
            });
        }

        this.setState({
            error: null,
            result: null,
            runningCode: true,
        });

        webtask.run({
            method: method,
            path: data.path,
            parse: !!this.state.parseBody,
            merge: !!this.state.mergeBody,
            headers: data.headers,
            query: data.query,
            body: data.body,
        })
            .then((res) => {
                if (res.serverError) throw new Error(res.error);

                const headers = res.header;
                const auth0HeaderRx = /^x-auth0/;

                for (let header in headers) {
                    if (auth0HeaderRx.test(header)) {
                        headers[header] = JSON.parse(headers[header]);
                    }
                }

                this.setState({
                    result: {
                        headers: headers,
                        statusCode: res.status,
                        body: res.body || res.text,
                    }
                });
            })
            .catch((err) => this.setState({error: err}))
            .finally(() => {
                this.setState({
                    runningCode: false,
                });
            });
    }
}

A0TryWebtask.propTypes = {
    profile:                React.PropTypes.instanceOf(Sandbox).isRequired,
    name:                   React.PropTypes.string.isRequired,
    parseBody:              React.PropTypes.bool.isRequired,
    mergeBody:              React.PropTypes.bool.isRequired,
    secrets:                React.PropTypes.object.isRequired,
    code:                   React.PropTypes.string.isRequired,
    tryParams:              React.PropTypes.object,
};

A0TryWebtask.defaultProps = {
    tryParams: {
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
