/**
 * Babel register hook for loading JSX templates in the backend.
 * Import this ONCE before any JSX template imports.
 */
import { register } from '@babel/register';

register({
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' }, modules: false }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  extensions: ['.jsx'],
  only: [/src\/templates/],
  cache: true,
});
