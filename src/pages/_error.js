export default function Error({ statusCode }) {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#fff' }}>
            <h1 style={{ fontSize: 48, color: '#1a1a1a', marginBottom: 16 }}>Something went wrong!</h1>
            <p style={{ color: '#333', marginBottom: 24 }}>
                {statusCode
                    ? `An error ${statusCode} occurred on server`
                    : 'An error occurred on client'}
            </p>
            <a href="/" style={{ color: '#fff', background: '#1a1a1a', padding: '10px 24px', borderRadius: 6, textDecoration: 'none' }}>Go Home</a>
        </div>
    );
}

Error.getInitialProps = ({ res, err }) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode };
}; 