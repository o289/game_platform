import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { RoomProvider, CoreGameProvider } from '@core-client/context';
import { App } from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RoomProvider>
      <CoreGameProvider>
        <App />
      </CoreGameProvider>
    </RoomProvider>
  </StrictMode>,
);
