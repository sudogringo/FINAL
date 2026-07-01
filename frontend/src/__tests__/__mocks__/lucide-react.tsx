import React from 'react'

type IconProps = { size?: number; className?: string; strokeWidth?: number; [key: string]: unknown }

const icon = (name: string) =>
  function Icon({ size: _s, strokeWidth: _sw, className, ...rest }: IconProps) {
    return React.createElement('svg', { 'data-testid': `icon-${name}`, className, ...rest })
  }

// Babel compiles named imports as properties on the module object.
// We return a Proxy so any named import (ShoppingBag, X, etc.) returns an icon component.
const mod = new Proxy({} as Record<string, React.FC<IconProps>>, {
  get: (_target, name: string) => {
    if (name === '__esModule' || name === 'default') return undefined
    return icon(name)
  },
})

module.exports = mod
