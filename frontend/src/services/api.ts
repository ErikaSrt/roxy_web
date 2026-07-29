export interface HealthResponse {
  status: string;
  application: string;
}

const API_URL = 'http://localhost:3000';

export async function getApiHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_URL}/health`);

  if (!response.ok) {
    throw new Error('Não foi possível conectar com a API.');
  }

  return response.json() as Promise<HealthResponse>;
}