import { describe, it } from 'vitest';
import { act } from 'react-dom/test-utils';
import { createRoot } from 'react-dom/client';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(<App />);
    });

    act(() => {
      root.unmount();
    });

    container.remove();
  });
});
