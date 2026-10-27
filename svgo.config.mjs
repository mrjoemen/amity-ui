// Optimizes the animated illustration in public/. The illustration relies on
// nested <g transform> groups targeted by <animateTransform>, and preset-default
// restructures those (collapseGroups, convertTransform, cleanupIds, ...), which
// breaks the animation. Only plugins that don't touch structure are used.
const plugins = [
  'removeComments',
  'removeMetadata',
  'removeEditorsNSData',
  'cleanupAttrs',
  'removeEmptyAttrs',
  { name: 'convertPathData', params: { floatPrecision: 2 } },
  { name: 'cleanupNumericValues', params: { floatPrecision: 2 } },
];

// Set SVGO_STILL=1 to also strip every SMIL animation element, producing the
// reduced-motion copy.
const removeAnimations = {
  name: 'removeAnimations',
  fn: () => ({
    element: {
      enter: (node, parent) => {
        if (['animate', 'animateTransform', 'animateMotion', 'set'].includes(node.name)) {
          parent.children = parent.children.filter((child) => child !== node);
        }
      },
    },
  }),
};

export default {
  plugins: process.env.SVGO_STILL ? [...plugins, removeAnimations] : plugins,
};
