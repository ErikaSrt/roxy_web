import { useEffect, useState } from 'react';
import { getApiHealth } from './services/api';
import './App.css';

function App() {
  const [apiStatus, setApiStatus] = useState('Verificando API...');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    async function checkApi(): Promise<void> {
      try {
        const response = await getApiHealth();

        setApiStatus(`${response.application} está ${response.status}`);
      } catch {
        setApiStatus('Não foi possível conectar com a Roxy API');
        setHasError(true);
      }
    }

    void checkApi();
  }, []);

  return (
    <main>
      <h1>Roxy</h1>

      <p>Plataforma de exercícios fonoaudiológicos</p>

      <p>
        Status:{' '}
        <strong>
          {hasError ? '🔴' : '🟢'} {apiStatus}
        </strong>
      </p>
    </main>
  );
}

export default App;