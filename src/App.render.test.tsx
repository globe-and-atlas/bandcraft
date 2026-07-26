import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App rendering', () => {
  it('renders the title screen on first load', () => {
    const html = renderToString(<App />);
    expect(html).toContain('Initialize Satellite Workbench');
  });
});
