export default function createResponseError (res) {
    if (res.clientError) return new Error('Invalid request: '
        + res.body && res.body.message
            ? res.body.message
            : res.text);
    if (res.serverError) return new Error('Server error: '
        + res.body && res.body.message
            ? res.body.message
            : res.text);
}
