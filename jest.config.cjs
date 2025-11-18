// jest.config.cjs
const path = require('node:path');

module.exports = {
    testEnvironment: 'jsdom',
    roots: [
        '<rootDir>/src',
        '<rootDir>/tests'
    ],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest'
    },
    moduleNameMapper: {
        '^@assets/(.*)$': '<rootDir>/src/assets/$1',
        '^@components/(.*)$': '<rootDir>/src/components/$1',
        '^@config$': '<rootDir>/src/config.ts',
        '^@filters/(.*)$': '<rootDir>/src/filters/$1',
        '^@hooks$': '<rootDir>/src/hooks',
        '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
        '^@labels$': '<rootDir>/src/labels.ts',
        '^@panels/(.*)$': '<rootDir>/src/panels/$1',
        '^@stores/(.*)$': '<rootDir>/src/stores/$1',
        '^@tabs/(.*)$': '<rootDir>/src/tabs/$1',
        '^@types/(.*)$': '<rootDir>/src/types/$1',
        '^@utils$': '<rootDir>/src/utils',
        '^@utils/(.*)$': '<rootDir>/src/utils/$1',
        // Mock WordPress dependencies
        '^@wordpress/element$': '<rootDir>/tests/mocks/wp-element.ts'
    },
    testMatch: [
        '<rootDir>/tests/**/*.(test|spec).(ts|tsx)'
    ]
};