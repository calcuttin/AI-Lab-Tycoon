import { afterEach, describe, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

afterEach(() => vi.restoreAllMocks());

describe('App', () => {
  it('renders without crashing', () => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
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
