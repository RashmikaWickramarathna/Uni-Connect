export default function App() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
        background: '#f7f9fc',
        color: '#14213d',
      }}
    >
      <section
        style={{
          maxWidth: '720px',
          width: '100%',
          padding: '2rem',
          borderRadius: '1rem',
          background: '#ffffff',
          boxShadow: '0 12px 40px rgba(20, 33, 61, 0.08)',
        }}
      >
        <h1 style={{ marginTop: 0 }}>Uni-Connect frontend is restored</h1>
        <p style={{ lineHeight: 1.6, marginBottom: 0 }}>
          The Vite entry files were missing, so this placeholder app now lets
          <code> npm run dev </code>
          start cleanly. Your existing
          <code> src </code>
          folders are still in place and can be wired back into this entry
          point.
        </p>
      </section>
    </main>
  )
}
