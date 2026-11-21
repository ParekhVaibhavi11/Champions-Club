import { useState, useEffect } from 'react';

function App() {
  const [dbStatus, setDbStatus] = useState('Checking backend & database connection...');

  useEffect(() => {
    fetch('http://localhost:5000/api/health')
      .then((res) => res.json())
      .then((data) => {
        setDbStatus(`Backend: ${data.status} | DB: ${data.database}`);
      })
      .catch(() => {
        setDbStatus('Backend not reachable (ensure server is running on port 5000)');
      });
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>🏆 Champions Club</h1>
      <p>Basic React + Vite Client</p>
      <div style={{ marginTop: '20px', padding: '15px', background: '#fff', display: 'inline-block', borderRadius: '8px', border: '1px solid #ddd' }}>
        <strong>Status:</strong> {dbStatus}
      </div>
    </div>
  );
}

export default App;
