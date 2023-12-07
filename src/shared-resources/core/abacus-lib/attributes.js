import { dashCaseToCamel } from './utils.js'

export const getAttrsNormalized = ($root) => {
  const elementAttrs = $root.getAttributeNames()

  return elementAttrs.reduce((acc, name) => {
    const nameNormalized = dashCaseToCamel(name)
    const value = $root.getAttribute(name)
    acc[name] = value
    acc[nameNormalized] = value
    return acc
  }, {})
}

export const moveAttributes = ($from, $to) => {
  const toAttrNames = Array.from($to.getAttributeNames())
  const fromAttrNames = Array.from($from.getAttributeNames())

  for (const attr of fromAttrNames) {
    if ($to.getAttribute(attr) === $from.getAttribute(attr)) {
      continue
    }

    $to.setAttribute(attr, $from.getAttribute(attr))
  }

  for (const attr of toAttrNames) {
    if (!$from.hasAttribute(attr)) {
      $to.removeAttribute(attr)
    }
  }
}