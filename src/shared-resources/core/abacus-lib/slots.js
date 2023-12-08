import { isSlotContentHolder, isTemplateNode } from './utils.js'

export function getSlotsAndItsData($parent) {
  const data = {};
  [...$parent.children].filter(isSlotContentHolder).forEach(el => {
    data[el.getAttribute('slot')] = el
  })
  return data
}

export const throwIfSlotIsTemplateNode = (ctx) => {
  const data = getSlotsAndItsData(ctx)

  for (const slotName in data) {
    if (isTemplateNode(data[slotName])) {
      throw `\nSlot named "${slotName}" in component "${ctx.name}" should NOT be a <template /> node. Because <template /> nodes are NOT ALLOWED in components that use shadowDOM (all component use shadowDOM by default, to change it – pass the prop when creating a component {dontUseShadowDOM = true}).\n`
    }
  }
}