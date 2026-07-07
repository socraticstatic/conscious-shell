import { describe, it, expect } from 'vitest';
import { decideRequest, isPublicPath } from '../src/gate/decide';

describe('isPublicPath', () => {
  it('allows hashed assets, favicons, og image, robots', () => {
    expect(isPublicPath('/assets/gate-Bx129a.js')).toBe(true);
    expect(isPublicPath('/favicon.ico')).toBe(true);
    expect(isPublicPath('/favicon.svg')).toBe(true);
    expect(isPublicPath('/og-image.png')).toBe(true);
    expect(isPublicPath('/robots.txt')).toBe(true);
  });
  it('does not allow app routes or index', () => {
    expect(isPublicPath('/')).toBe(false);
    expect(isPublicPath('/work/some-slug')).toBe(false);
    expect(isPublicPath('/index.html')).toBe(false);
    expect(isPublicPath('/audio/rain.mp3')).toBe(false);
  });
});

describe('decideRequest', () => {
  it('sends anonymous visitors to the gate for any app path', () => {
    expect(decideRequest('/', null)).toBe('gate');
    expect(decideRequest('/work/att-cloud', null)).toBe('gate');
    expect(decideRequest('/index.html', null)).toBe('gate');
  });
  it('sends authenticated-but-unapproved to the gate', () => {
    expect(decideRequest('/', { approved: false })).toBe('gate');
  });
  it('lets approved sessions through', () => {
    expect(decideRequest('/', { approved: true })).toBe('app');
    expect(decideRequest('/work/att-cloud', { approved: true })).toBe('app');
  });
  it('serves public paths to everyone', () => {
    expect(decideRequest('/assets/x.js', null)).toBe('public');
    expect(decideRequest('/og-image.png', { approved: true })).toBe('public');
  });
  it('always gates the auth confirm route so gate JS can verify the token', () => {
    expect(decideRequest('/auth/confirm', null)).toBe('gate');
    expect(decideRequest('/auth/confirm', { approved: true })).toBe('gate');
  });
  it('redirects approved visitors away from the gate page itself', () => {
    expect(decideRequest('/gate.html', { approved: true })).toBe('home');
    expect(decideRequest('/gate.html', null)).toBe('gate');
  });
});
