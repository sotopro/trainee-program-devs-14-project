import { BrowserRouter } from 'react-router-dom';
import { AuthSessionGate } from '@/features/auth';
import { GlobalErrorBoundary, NotificationProvider } from '@/shared/providers';
import { AppRouter } from './router';

function App() {
  return (
    <NotificationProvider>
      <GlobalErrorBoundary>
        <BrowserRouter>
          <AuthSessionGate>
            <AppRouter />
          </AuthSessionGate>
        </BrowserRouter>
      </GlobalErrorBoundary>
    </NotificationProvider>
  );
}

export default App;
