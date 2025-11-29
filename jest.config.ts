import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
    dir: './',
})

const config: Config = {
    coverageProvider: 'v8',
    testEnvironment: 'jsdom',
    testPathIgnorePatterns: ['<rootDir>/e2e/', '<rootDir>/node_modules/'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^react-markdown$': '<rootDir>/app/components/__mocks__/react-markdown.tsx',
    },
    collectCoverageFrom: [
        'app/**/*.{js,jsx,ts,tsx}',
        '!app/**/*.d.ts',
        '!app/**/layout.tsx',
        '!app/**/page.tsx',
        '!app/actions.ts',
        '!app/components/AudioUploader.tsx',
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
    transformIgnorePatterns: [
        'node_modules/(?!(react-markdown|vfile|vfile-message|unist-.*|unified|bail|is-plain-obj|trough|remark-.*|mdast-util-.*|micromark.*|decode-named-character-reference|character-entities|property-information|hast-util-whitespace|space-separated-tokens|comma-separated-tokens|pretty-bytes|ccount|escapestringregexp|markdown-table|trim-lines)/)',
    ],
}

export default createJestConfig(config)
