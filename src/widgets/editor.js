import Editor from 'components/editor';
import AuthenticatedWidget from 'lib/authenticatedWidget';

export default class EditorWidget extends AuthenticatedWidget {
    constructor(options) {
        super(Editor, options);
    }
}