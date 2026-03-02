import { Component } from 'react';
import { Button } from './Button';

export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#0f0f0f',
                    color: 'white',
                    padding: '24px',
                    textAlign: 'center'
                }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: '#ef4444' }}>Something went wrong</h2>
                    <p style={{ color: '#a1a1aa', marginBottom: '24px', maxWidth: '600px' }}>
                        The application encountered an unexpected error. This might be due to corrupted data.
                    </p>
                    <div style={{ marginBottom: '24px', textAlign: 'left', background: '#18181b', padding: '16px', borderRadius: '8px', overflow: 'auto', maxHeight: '200px', width: '100%', maxWidth: '800px' }}>
                        <code style={{ fontFamily: 'monospace', color: '#f87171' }}>
                            {this.state.error && this.state.error.toString()}
                        </code>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => {
                            // Try to clear local storage if user wants to hard reset? 
                            // Or just reload
                            window.location.href = '/';
                        }}
                    >
                        Reload Application
                    </Button>
                    <button
                        onClick={() => {
                            localStorage.clear();
                            window.location.reload();
                        }}
                        style={{ marginTop: '16px', textDecoration: 'underline', color: '#a1a1aa', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        Clear Data & Reset (Fixes Corruption)
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
