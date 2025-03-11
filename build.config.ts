import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index.node',
    'src/index.browser',
  ],
  declaration: 'node16',
  clean: true,
  externals: [],
  rollup: {
    inlineDependencies: true,
    dts: {
      respectExternal: true,
    },
  },
})
