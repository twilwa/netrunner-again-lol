import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		// Reuse your existing Jest environment
		environment: 'jsdom',
		// Specify file patterns that should be tested with Vitest
		include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
		// Optional: Enable globals for easier Jest compatibility
		globals: true
	}
})
