import AceEditor from 'react-ace';
import Brace from 'brace';
import Fetch from 'whatwg-fetch';
import Promise from 'promise';
import React from 'react';
import Qs from 'qs';

import {Alert, Button, Input, Modal, Panel} from 'react-bootstrap';
import Inspector from 'react-json-inspector';

require('brace/mode/javascript');
require('brace/mode/json');
require('brace/theme/textmate');

const defaultCode = `
module.exports = function (ctx, cb) {
    cb(null, 'Hello world');
};
`.trim();


class Editor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            code: props.code || defaultCode,
            editingSecrets: false,
            savingWebtask: false,
            tryingWebtask: false,
        };
    }

    componentDidMount() {
        this.refs.ace.editor.resize();
        window.addEventListener("resize", () => this.refs.ace.editor.resize());
    }

    componentWillUnmount() {
        window.removeEventListener("resize", () => this.refs.ace.editor.resize());
    }

    editSecrets () {

    }

    tryWebtask () {
        return this.setState({tryingWebtask: true});
    }

    saveWebtask () {

    }

    onChange(code) {
        this.setState({
            code: code,
        })
    }

    render() {
        const self = this;
        const loading = false;

        const webtaskName = (
            <Input
                type="text"
                value={this.state.webtaskName}
                disabled={loading}
                placeholder="Name"
                label="Webtask name"
                ref="webtaskName"
            />
        );

        return (
            <Panel className="a0-editor" header="Create a webtask">
                { self.state.error
                    ? (<Alert
                        bsStyle="danger">
                        <p>{self.state.error.message}</p>
                    </Alert>)
                    : null
                }
                <TryWebtask
                    show={self.state.tryingWebtask}
                    onHide={self.setState.bind(self, { tryingWebtask: false })}
                    code={self.state.code}
                    profile={self.props.profile}
                />
                <div className="form-group form-group-grow">
                    <label className="control-label">Edit webtask code:</label>
                    <AceEditor
                        ref="ace"
                        name="code"
                        className="form-control"
                        mode="javascript"
                        theme="textmate"
                        value={this.state.code}
                        height=""
                        width=""
                        onChange={self.onChange.bind(self)}
                        editorProps={{$blockScrolling: true}}
                    />
                </div>

                <div className="btn-list text-right">
                    <Button
                        bsStyle="link"
                        type="button"
                        disabled={loading}
                        onClick={loading ? null : self.editSecrets.bind(self)}>
                        {self.state.editingSecrets ? 'Editing secrets...' : 'Edit secrets'}
                    </Button>

                    <Button
                        type="submit"
                        disabled={loading}
                        onClick={loading ? null : self.tryWebtask.bind(self)}>
                        {self.state.tryingWebtask ? 'Running...' : 'Try'}
                    </Button>

                    <Button
                        bsStyle="primary"
                        type="submit"
                        disabled={loading}
                        onClick={loading ? null : self.saveWebtask.bind(self)}>
                        {self.state.savingWebtask ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </Panel>
        );
    }
}


class TryWebtask extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            runningCode: false,
            json: JSON.stringify({
                headers: {
                    'Content-Type': 'application/json',
                },
                query: {
                    key: 'value',
                },
                // body: {
                //     key: 'value',
                // }
            }, null, 2),
            result: null,
        };
    }

    run () {
        // const createTokenUrl = `${this.props.profile.url}/api/tokens/issue`;
        const json = this.refs.data.editor.getValue();
        const code = this.props.code;
        let data;

        try {
            data = JSON.parse(json);
        } catch (__) {
            return this.setState({
                error: new Error('The data you enter must be valid json.'),
            });
        }
        const query = Qs.stringify(Object.assign({}, data.query, {
            webtask_pb: 1,
            webtask_mb: 1,
        }));
        const runWebtaskUrl = `${this.props.profile.url}/api/run/${this.props.profile.tenant}?${query}`;

        this.setState({
            result: null,
            runningCode: true,
        });

        Promise.resolve(Fetch(runWebtaskUrl, {
            method: 'post',
            headers: Object.assign({
                'Authorization': `Bearer ${this.props.profile.token}`,
                'Content-Type': 'text/plain',
            }, data.headers),
            body: code,
        }))
            .then((res) => {
                const body = res.ok ? res.text() : res.json();

                return body
                    .then((data) => {
                        if (!res.ok) throw new Error(data.error);

                        const it = res.headers.entries();
                        const headers = {};
                        let header;

                        console.log('headers', res.headers.entries());

                        while (!(header = it.next()).done) {
                            headers[header.value[0]] = header.value[1];
                        }

                        this.setState({
                            result: {
                                headers: headers,
                                statusCode: res.status,
                                body: data,
                            }
                        });
                    });
            })
            .catch((err) => this.setState({error: err}))
            .finally(() => this.setState({runningCode: false}));
    }
    
    onHide() {
        this.setState({
            result: null,
        });
        
        this.props.onHide();
    }

    render () {
        const self = this;
        const loading = this.state.runningCode;

        return (
            <Modal show={self.props.show} onHide={self.onHide.bind(self)}>
                <Modal.Header closeButton>
                    <Modal.Title>Try webtask</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="form-group form-group-grow">
                        <label className="control-label">Edit webtask payload:</label>
                        <AceEditor
                            ref="data"
                            name="data"
                            className="form-control"
                            mode="json"
                            theme="textmate"
                            value={self.state.json}
                            height="200px"
                            width=""
                            onChange={loading ? null : (json) => self.setState({ json })}
                            readOnly={loading}
                            editorProps={{$blockScrolling: true}}
                        />
                    </div>

                    { self.state.result
                        ?   <div>
                                <label className="control-label">Result:</label>
                                <Inspector data={self.state.result} search={false} />
                            </div>
                        : null
                    }

                    <div className="btn-list text-right">
                        <Button
                            type="submit"
                            disabled={loading}
                            onClick={loading ? null : self.run.bind(self)}>
                            {self.state.runningCode ? 'Running...' : 'Run webtask'}
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        );
    }
}

export function editor (container, options = {}) {
    console.log('editor', container, Object.assign({container}, options));

    const promise = new Promise((resolve, reject) => {
        const props = Object.assign({resolve, reject, container}, options);

        React.render((
            <Editor container={this} {...props}></Editor>
        ), container);
    });

    // container.classList.add('a0-editor');

    return promise
        .finally(() => {
            React.unmountComponentAtNode(container);
            setTimeout(() => container.remove());
        });
}