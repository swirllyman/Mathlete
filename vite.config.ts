import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
  version: string
}

/** Short commit of the build, so an on-screen stamp names an exact tree. */
function buildSha(): string {
  // GitHub Actions hands the commit over directly; locally, ask git.
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7)
  try {
    return execSync('git rev-parse --short=7 HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
  } catch {
    // A tarball with no git history still has to build.
    return 'nogit'
  }
}

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths, so the same build works from the domain root, from a
  // GitHub Pages project subpath (/Mathlete/), or opened straight off disk.
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_SHA__: JSON.stringify(buildSha()),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
  plugins: [react()],
})
