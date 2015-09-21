import AceEditor from 'react-ace';
import Bluebird from 'bluebird';
import Brace from 'brace';
import React from 'react';
import Sandbox from 'sandboxjs';

import {Alert, Button, Input, Modal, Panel} from 'react-bootstrap';
import Inspector from 'react-json-inspector';

require('brace/mode/javascript');
require('brace/mode/json');
require('brace/theme/textmate');

const defaultCode = `
module.exports = function (ctx, cb) {
    cb(null, 'Hello ' + ctx.query.hello);
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
                    hello: 'world',
                },
                // body: {
                //     hello: 'world',
                // }
            }, null, 2),
            result: null,
        };
    }

    run () {
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

        const sandbox = Sandbox.init(this.props.profile);

        this.setState({
            result: null,
            runningCode: true,
        });

        sandbox.run(code, {
            method: 'post',
            parse: true,
            headers: data.headers,
            query: data.query,
            body: data.body,
        })
            .then((res) => {
                if (res.error) throw new Error(res.error);

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

    const promise = new Bluebird((resolve, reject) => {
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