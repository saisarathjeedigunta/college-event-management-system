export function getErrorMessage(error: any): string {
    if (!error) return 'Unknown error occurred';

    // 1. Check for specific backend error message field
    if (error.response?.data?.message) {
        const msg = error.response.data.message;
        return typeof msg === 'string' ? msg : JSON.stringify(msg);
    }

    // 2. Check if data itself is the message (text response)
    if (typeof error.response?.data === 'string') {
        return error.response.data;
    }

    // 3. Check for specific backend "error" field (Spring Security default)
    if (error.response?.data?.error) {
        return typeof error.response.data.error === 'string'
            ? error.response.data.error
            : JSON.stringify(error.response.data.error);
    }

    // 4. Axios error message
    if (error.message) return error.message;

    // 5. Fallback
    return typeof error === 'string' ? error : JSON.stringify(error);
}
