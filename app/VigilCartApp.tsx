'use client';

import { WorkspaceProvider } from './workspace/WorkspaceContext';
import AppShell from './components/shell/AppShell';

export default function VigilCartApp() {
  return (
    <WorkspaceProvider>
      <AppShell />
    </WorkspaceProvider>
  );
}
