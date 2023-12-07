import { attachListenersToChildren } from './dom-events.js'
import { moveAttributes } from './attributes.js'
import {
  isNodesKeysDifferent,
  isNodesTagsDifferent,

  isAbacusComponent,
  isAbacusExtendComponent,

  isSlotContentHolder,

  hasNodesKeys,
} from './utils.js'

const updateSlotContentHoldersInChildren = ($old, $new, ctx) => {
  const $oldSlotContentHolders = [...$old.children].filter(isSlotContentHolder)
  const $newSlotContentHolders = [...$new.children].filter(isSlotContentHolder)

  if ($oldSlotContentHolders.length === $newSlotContentHolders.length) {
    $oldSlotContentHolders.forEach(($oldSlotContent, index) => {
      const $newSlotContent = $newSlotContentHolders[index]
      const isTemplate = $newSlotContent.tagName === 'TEMPLATE'

      abacusNodesUpdate(
        isTemplate ? $oldSlotContent.content : $oldSlotContent,
        isTemplate ? $newSlotContent.content : $newSlotContent,
        ctx
      )
    })
  } else {
    throw new Error(`Component ${name} has different number of templates`)
  }
}

const updateChildNodes = ($old, $new, ctx) => {
  if (
    $old.childNodes.length
    && $new.childNodes.length
    && $old.childNodes.length === $new.childNodes.length
    && [...$new.childNodes].every(
      ($child, index) => !isNodesTagsDifferent($child, $old.childNodes[index])
    )
  ) {
    const $newChildNodes = [...$new.childNodes]

    for (let i = 0; i < $newChildNodes.length; i++) {
      abacusNodesUpdate($old.childNodes[i], $newChildNodes[i], ctx)
    }
  } else {
    const newContent = $new.innerHTML ?? $new.textContent

    if ('innerHTML' in $old) {
      $old.innerHTML = newContent
      attachListenersToChildren($old, ctx) // attach listeners to new nodes in DOM
    } else {
      $old.textContent = newContent
    }
  }
}

export const abacusNodesUpdate = ($old, $new, ctx) => {
  if ($new.nodeType !== $old.nodeType) {
    console.trace()
  }

  if ($new.nodeType === Node.TEXT_NODE) {

    if ($old.nodeValue !== $new.nodeValue) {
      $old.nodeValue = $new.nodeValue
    }

    return

  }

  if ($new.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
    updateChildNodes($old, $new, ctx)
    return
  }

  if ($new.nodeType === Node.COMMENT_NODE) {
    updateChildNodes($old, $new, ctx)
    return
  }

  if (
    $old.nodeType === Node.TEXT_NODE
    || isNodesTagsDifferent($old, $new)
    || (hasNodesKeys($old, $new) && isNodesKeysDifferent($old, $new))
  ) {
    $old.parentNode.replaceChild($new, $old)
    attachListenersToChildren($new.parentNode, ctx) // attach listeners to new nodes in DOM
    findAndInjectComponentsInNode($new.parentNode)
  } else {
    moveAttributes($new, $old)

    const abacusElement = (isAbacusComponent($new) && isAbacusComponent($old))
      || (isAbacusExtendComponent($new) && isAbacusExtendComponent($old))

    if (abacusElement) {
      updateSlotContentHoldersInChildren($old, $new, ctx)
    } else {
      updateChildNodes($old, $new, ctx)
    }
  }
}