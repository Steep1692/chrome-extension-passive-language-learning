import { EL_KEY, PREFIX } from './constants.js'

export const dashCaseToCamel = (str) => str.replace(
  /-(\w)/g,
  ($0, $1) => $1.toUpperCase()
)

export const tagNameToComponentName = (tagName) => {
  tagName = tagName.toLowerCase()

  if (tagName.startsWith(PREFIX)) {
    tagName = tagName.slice(PREFIX.length + 1)
  }

  return tagName[0].toUpperCase() + dashCaseToCamel(tagName).slice(1)
}

export const hasNodesKeys = ($el1, $el2) => $el1.hasAttribute(EL_KEY) || $el2.hasAttribute(EL_KEY)
export const isNodesKeysDifferent = ($el1, $el2) => $el1.getAttribute(EL_KEY) !== $el2.getAttribute(EL_KEY)
export const isNodesTagsDifferent = ($el1, $el2) => $el1.tagName !== $el2.tagName
export const isSlotContentHolder = ($el) => $el.hasAttribute('slot')
export const isAbacusExtendComponent = ($el) => {
  try {
    return $el.hasAttribute('is')
  } catch (e) {
    debugger
  }
}
export const isAbacusComponent = ($el) => !!$el.tagName?.toLowerCase().startsWith(PREFIX)
export const isTemplateNode = ($el) => $el.tagName === 'TEMPLATE'
