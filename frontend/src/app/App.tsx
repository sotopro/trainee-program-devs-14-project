import { BrowserRouter } from 'react-router-dom';
import { AuthSessionGate } from '@/features/auth';
import { AppRouter } from './router';

function App() {
  return (
    <BrowserRouter>
      <AuthSessionGate>
        <AppRouter />
      </AuthSessionGate>
    </BrowserRouter>
  );
}

export default App;
