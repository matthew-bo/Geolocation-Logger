import '@testing-library/jest-dom';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn().mockImplementation(success =>
    success({
      coords: {
        latitude: 42.3601,
        longitude: -71.0589,
      },
    })
  ),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
};

global.navigator.geolocation = mockGeolocation; 