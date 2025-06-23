import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props: {} | Readonly<{}>) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    /* componentDidCatch(error: { message: string | string[]; }, errorInfo: any) {
         window.location.reload();
     }
 */
    render() {
        // @ts-ignore
        if (this.state.hasError) {
            return <h1 className={'text-center text-red-'}>Une erreur inconnue est survenue.</h1>;
        }

        // @ts-ignore
        return this.props.children;
    }
}

export default ErrorBoundary;
