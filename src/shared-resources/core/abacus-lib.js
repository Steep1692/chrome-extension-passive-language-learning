(async () => {
  const HTMLElementClassToTagName = new Map()
  HTMLElementClassToTagName.set(HTMLButtonElement, 'button')

  const init = ({
                  state,
                  stateMutators,
                  onStateMutation,

                  componentInjections,
                  pluginInjections
  }) => {
    const PREFIX = 'pll'
    const SymbolComponentName = Symbol('Abacus Component Name')

    class Reactivity {
      static targetKeys = new Map()

      static reactiveProps = new Map()
      static callbacks = new Map()
      static callbacksSecondary = new Map()

      static makeKey(target, prop) {
        if (!Reactivity.targetKeys.has(target)) {
          Reactivity.targetKeys.set(target, Math.random())
        }
        return Reactivity.targetKeys.get(target) + '-' + prop
      }

      static registerReactiveProp(componentName, target, prop) {
        const key = Reactivity.makeKey(target, prop)

        if (Reactivity.reactiveProps.has(key)) {
          const componentNames = Reactivity.reactiveProps.get(key)
          if (!componentNames.includes(componentName)) {
            componentNames.push(componentName)
          }
        } else {
          Reactivity.reactiveProps.set(key, [componentName])
        }
      }

      static registerCallback(componentName, cb, secondary = false) {
        const callbacks = secondary ? Reactivity.callbacksSecondary : Reactivity.callbacks

        if (callbacks.has(componentName)) {
          callbacks.get(componentName).push(cb)
        } else {
          callbacks.set(componentName, [cb])
        }
      }

      static handleReactivePropChange(target, prop) {
        const key = Reactivity.makeKey(target, prop)
        const componentNames = Reactivity.reactiveProps.get(key)

        if (!componentNames) {
          return;
        }

        const secondaryCallbacks = []
        console.count('handleReactivePropChange')
        for (const componentName of componentNames) {
          const callbacks = Reactivity.callbacks.get(componentName)
          const callbacksSecondary = Reactivity.callbacksSecondary.get(componentName)

          for (const cb of callbacks) {
            cb()
          }

          if (callbacksSecondary) {
            secondaryCallbacks.push(...callbacksSecondary)
          }
        }

        for (const cb of secondaryCallbacks) {
          cb()
        }
      }
    }

    class ReactiveState {
      static preventReactivityGetHandler = false
      static REACTIVITY_PROXY_TARGET_KEY = Symbol('link on the original target object')
      static reactionReceiverID = null

      static proxyState = (obj) => {
        let setInProcess = false
        let proxyingChildren

        const handler = {
          get(target, prop, receiver) {
            if (!proxyingChildren && !setInProcess && !ReactiveState.preventReactivityGetHandler) {
              const isMethod = typeof target[prop] === 'function'

              if (!isMethod && ReactiveState.reactionReceiverID !== null) {
                Reactivity.registerReactiveProp(ReactiveState.reactionReceiverID, target, prop)
              }
            }

            return Reflect.get(...arguments)
          },
          set(target, prop, value) {
            setInProcess = true

            const res = Reflect.set(...arguments)

            if (!proxyingChildren) {
              Reactivity.handleReactivePropChange(target, prop, value)
            }

            setInProcess = false

            return res
          },
        }

        obj[ReactiveState.REACTIVITY_PROXY_TARGET_KEY] = obj
        const objProxy = new Proxy(obj, handler)

        proxyingChildren = true
        for (const objKey in objProxy) {
          const value = objProxy[objKey]
          if (
            typeof value === 'object'
            && value !== null
            && !(value instanceof Promise)
          ) {
            objProxy[objKey] = ReactiveState.proxyState(value)
          }
        }
        proxyingChildren = false

        return objProxy
      }

      static state = ReactiveState.proxyState(state)

      static disableReactivity = () => {
        ReactiveState.preventReactivityGetHandler = true
      }

      static enableReactivity = () => {
        ReactiveState.preventReactivityGetHandler = false
      }

      static getWithoutReactivity = (obj, ...props) => {
        ReactiveState.disableReactivity()

        let res = obj
        for (const prop of props) {
          res = res[prop]
        }

        ReactiveState.enableReactivity()
        return res
      }
    }

    const classnames = (...args) => {
      if (!args.length) {
        return ''
      }

      const classes = []

      for (const arg of args) {
        if (typeof arg === 'string') {
          classes.push(arg)
        } else if (typeof arg === 'object') {
          for (const [key, value] of Object.entries(arg)) {
            if (value) {
              classes.push(key)
            }
          }
        }
      }

      return classes.join(' ')
    }


    const dashCaseToCamel = (str) => str.replace(
      /-(\w)/g,
      ($0, $1) => $1.toUpperCase()
    )

    const tagNameToComponentName = (tagName) => {
      tagName = tagName.toLowerCase()

      if (tagName.startsWith(PREFIX)) {
        tagName = tagName.slice(PREFIX.length + 1)
      }

      return tagName[0].toUpperCase() + dashCaseToCamel(tagName).slice(1)
    }

    const elKey = 'data-' + PREFIX + '-key'
    const isNodesKeysDifferent = ($el1, $el2) => $el1.getAttribute(elKey) !== $el2.getAttribute(elKey)
    const isNodesTagsDifferent = ($el1, $el2) => $el1.tagName !== $el2.tagName
    const isSlotContentHolder = ($el) => $el.hasAttribute('slot')
    const isAbacusExtendComponent = ($el) => $el.hasAttribute('is')
    const isAbacusComponent = ($el) => !!$el.tagName?.toLowerCase().startsWith(PREFIX)
    const isTemplateNode = ($el) => $el.tagName === 'TEMPLATE'


    // INJECT
    class ScriptManager {
      static injectScriptToPage = (src) => {
        const n = document.createElement('script')
        n.src = src

        // {async = false} because by default it is {true},
        // but we need to preserve the behaviour like when writing in "index.html" <script> explicitly,
        // so we change it back {async = false}
        n.async = false
        // ===============================================================

        document.body.append(n)

        return new Promise((resolve) => {
          n.onload = resolve
        })
      }
    }

    const componentInjectionsCache = {}
    const pluginInjectionsCache = {}

    const injectComponent = (componentName) => {
      const url = componentInjections[componentName]

      if (!url) {
        throw new Error(`Module ${componentName} not found on ${url}`)
      }

      if (componentInjectionsCache[componentName]) {
        return componentInjectionsCache[componentName]
      }

      componentInjectionsCache[componentName] = ScriptManager.injectScriptToPage(url)

      return componentInjectionsCache[componentName]
    }

    const injectPlugin = (pluginName, module) => {
      const url = pluginInjections[pluginName]

      if (!url) {
        throw new Error(`Module ${pluginName} not found on ${url}.`)
      }

      if (pluginInjectionsCache[pluginName]) {
        return pluginInjectionsCache[pluginName]
      }

      pluginInjectionsCache[pluginName] = module ? import(url) : ScriptManager.injectScriptToPage(url)

      return pluginInjectionsCache[pluginName]
    }

    const findAndInjectComponentsInNode = ($node) => {
      const promises = []

      for (const $child of $node.children) {
        if (isAbacusComponent($child)) {
          const componentName = tagNameToComponentName($child.tagName)

          if (componentInjections[componentName]) {
            promises.push(injectComponent(componentName, componentInjections[componentName]))
          }
        }

        if (isAbacusExtendComponent($child)) {
          const componentName = tagNameToComponentName($child.getAttribute('is'))

          if (componentInjections[componentName]) {
            promises.push(injectComponent(componentName, componentInjections[componentName]))
          }
        }

        promises.push(...findAndInjectComponentsInNode($child))
      }

      return promises
    }
    // ==============


    // STYLES
    const appendCSS = ($root, css) => {
      const $style = document.createElement('style')
      $style.innerHTML = css
      $root.appendChild($style)
    }

    // const findNearestHost = ($node) => {
    //   let $host = $node
    //
    //   while ($host && !$host.shadowRoot) {
    //     $host = $host.parentNode || $host.host
    //   }
    //
    //   return $host
    // }

    const injectStyleFiles = (ctx, styleFilesURLs) => {
      const shadowDOM = ctx.shadowRoot
      const $content = shadowDOM ? ctx : ctx.$root
      const $stylesDestination = shadowDOM ? ctx.$root : ctx

      // Don't show possibly broken HTML–markup until all styles are loaded
      $content.style.visibility = 'hidden'

      let linksLoaded = 0

      const handleLinkLoad = () => {
        linksLoaded += 1

        if (linksLoaded === styleFilesURLs.length) {
          $content.style.visibility = ''
        }
      }

      for (const url of styleFilesURLs) {
        const $link = document.createElement('link')
        $link.href = url
        $link.rel = 'stylesheet'

        $link.addEventListener('load', handleLinkLoad)

        $stylesDestination.appendChild($link)
      }
    }
    // ==============

    // SLOTS
    function slotsAsData(parent) {
      const data = {};
      [...parent.children].filter(isSlotContentHolder).forEach(el => {
        data[el.getAttribute('slot')] = el
      })
      return data
    }

    const throwIfSlotIsTemplateNode = (ctx) => {
      const data = slotsAsData(ctx)

      for (const slotName in data) {
        if (isTemplateNode(data[slotName])) {
          throw `\nSlot named "${slotName}" in component "${ctx.componentName}" should NOT be a <template /> node. Because <template /> nodes are NOT ALLOWED in components that use shadowDOM (all component use shadowDOM by default, to change it – pass the prop when creating a component {doNotUseShadowDOM = true}).\n`
        }
      }
    }
    // ==============


    // ATTRIBUTES
    const getAttrsNormalized = ($root) => {
      const elementAttrs = $root.getAttributeNames()

      return elementAttrs.reduce((acc, name) => {
        const nameNormalized = dashCaseToCamel(name)
        const value = $root.getAttribute(name)
        acc[name] = value
        acc[nameNormalized] = value
        return acc
      }, {})
    }

    const moveAttributes = ($from, $to) => {
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
    // ==============


    // LISTENERS
    const attachListeners = ($el, ctx) => {
      const attrs = getAttrsNormalized($el)

      for (const key in attrs) {
        const value = attrs[key]

        if (key.startsWith('@on')) {
          const eventName = key.slice(3).toLowerCase()

          $el.addEventListener(eventName, async (...arguments) => {
            ReactiveState.disableReactivity()
            await ctx.methods[value](ctx, ...arguments)
            ReactiveState.enableReactivity()
          })
        }
      }
    }

    const attachListenersToChildren = ($root, ctx) => {
      const $children = [...$root.children]

      for (const $child of $children) {
        attachListeners($child, ctx)
        attachListenersToChildren($child, ctx)
      }
    }
    // ==============


    // UPDATE
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
          ($child, index) => $child.tagName === $old.childNodes[index].tagName
        )
      ) {
        for (const childNode of $new.childNodes) {
          const index = [...$new.childNodes].indexOf(childNode)
          abacusNodesUpdate($old.childNodes[index], childNode, ctx)
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

    function abacusNodesUpdate($old, $new, ctx) {
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


      const abacusElement = (isAbacusComponent($new) && isAbacusComponent($old))
        || (isAbacusExtendComponent($new) && isAbacusExtendComponent($old))

      if (abacusElement && !isNodesTagsDifferent($old, $new)) {
        moveAttributes($new, $old)
        updateSlotContentHoldersInChildren($old, $new, ctx)
      } else {

        if (isNodesKeysDifferent($old, $new) || isNodesTagsDifferent($old, $new)) {
          $old.parentNode.replaceChild($new, $old)
          attachListenersToChildren($new, ctx) // attach listeners to new nodes in DOM
          findAndInjectComponentsInNode($new.parentNode)
        } else {
          moveAttributes($new, $old)
          updateChildNodes($old, $new, ctx)
        }

      }
    }
    // ==============


    const createWebComponent = (name, {
      dontUseShadowDOM,

      translates,

      html,
      css,
      styleFilesURLs,

      plugins,

      methods,

      onAfterFirstRender,

      stateEffects,
      onAttributesChange,

      extendsElement,
    } = {}) => {
      const ExtendedElement = extendsElement ?? HTMLElement

      if (dontUseShadowDOM !== undefined && extendsElement) {
        throw new Error('FOR NOW "extendsElement" can\'t be used in addition with "dontUseShadowDOM=true" due to browsers components limitations')
      }

      class AbacusComponent extends ExtendedElement {
        $root

        state
        stateMutators

        mounted = false

        constructor() {
          super()

          if (dontUseShadowDOM || extendsElement) {
            this.$root = this
          } else {
            this.attachShadow({ mode: 'open' })
            this.$root = this.shadowRoot
          }

          if (plugins) {
            this.plugins = {}

            for (const key of plugins) {
              const [keyName, keyType] = key.split(':')
              const promise = injectPlugin(keyName, keyType === 'module')

              this.plugins[keyName] = new Promise((resolve) => {
                promise.then((module) => {
                  this.plugins[keyName] = module.default
                  resolve(module.default)
                })
              });
            }
          }

          if (methods) {
            this.methods = {}
            for (const methodsKey in methods) {
              this.methods[methodsKey] = methods[methodsKey].bind(this)
            }
          }

          if (stateMutators) {
            this.stateMutators = {}
            for (const key in stateMutators) {
              const state = ReactiveState.getWithoutReactivity(ReactiveState, 'state')

              this.stateMutators[key] = function() {
                stateMutators[key].bind(this)(state, ...arguments)
                onStateMutation?.(key, ...arguments)
              }
            }
          }

          this.state = ReactiveState.getWithoutReactivity(ReactiveState, 'state')
        }

        observeSlotContentHolders() {
          const mutationCallback = () => {
            observer.disconnect()
            this.render()
            observe()
          }

          const observer = new MutationObserver(mutationCallback)

          const config = { childList: true, attributes: true, subtree: true, characterData: true }

          const observe = () => {
            const nodes = []

            for (const $child of this.$root.children) {

              if (isSlotContentHolder($child)) {
                const $content = $child.content
                observer.observe($content, config)
                nodes.push($content)
              }

            }
          }

          observe()
        }

        observeAttributes() {
          const mutationCallback = (record) => {
            if (record[0].attributeName === 'style') {
              // FIXME: Potentially this condition could be troublesome.
              //  This condition prevents the re-render on style change.
              //  The style is changed when the root is hidden,
              //  while the style file is being loaded by {@link injectStyleFiles}.
              return;
            }

            observer.disconnect()
            this.props = getAttrsNormalized(this)
            this.render()
            onAttributesChange?.call(this, this)
            observe()
          }

          const observer = new MutationObserver(mutationCallback)

          const config = { attributes: true, childList: false, subtree: false, characterData: false }

          const observe = () => {
            observer.observe(this.shadowRoot ? this : this.$root, config)
          }

          observe()
        }

        async connectedCallback() {
          if (!this.mounted) {
            if (styleFilesURLs) {
              const styleFileURLsFinal = styleFilesURLs.map((url) => {
                if (url === 'default') {
                  return componentInjections[tagNameToComponentName(name)].replace('.js', '.css')
                }

                return url
              })

              injectStyleFiles(this, styleFileURLsFinal)
            }

            if (css) {
              appendCSS(this.$root, css)
            }

            this.props = getAttrsNormalized(this)

            this.render(true)
            this.observeAttributes()

            if (!this.shadowRoot) {
              this.observeSlotContentHolders()
            }

            onAfterFirstRender?.call(this, this)

            this.mounted = true
          }

          if (stateEffects) {
            stateEffects.forEach((stateEffect, index) => {
              const prevReactionReceiverID = ReactiveState.reactionReceiverID
              const reactionReceiverID = `${name}__stateEffect__${index}`

              const fn = stateEffect.bind(this, this)

              Reactivity.registerCallback(reactionReceiverID, fn)

              ReactiveState.reactionReceiverID = reactionReceiverID
              fn()
              ReactiveState.reactionReceiverID = prevReactionReceiverID
            })
          }

          Reactivity.registerCallback(name, this.render.bind(this))

          if (translates) {
            const configObj = ReactiveState.getWithoutReactivity(this, 'state', 'config', ReactiveState.REACTIVITY_PROXY_TARGET_KEY)

            Reactivity.registerReactiveProp(name, configObj, 'lang')
          }
        }

        render() {
          const prevReactionReceiverID = ReactiveState.reactionReceiverID

          ReactiveState.reactionReceiverID = name

          const state = ReactiveState.getWithoutReactivity(this, 'state')

          let translations
          if (translates) {
            const lang = ReactiveState.getWithoutReactivity(this, 'state', 'config', 'lang')
            translations = translates[lang]
          }

          const props = {
            ctx: this,
            t: translations,
            state,
            classnames,
            ...this.props,
          }

          const markup = html
            ? typeof html === 'string'
              ? html
              : html.call(this, props)
            : ''

          if (!markup && markup !== '') {
            throw `Component "${name}" has no markup.`
          }

          const template = document.createElement('template')
          template.innerHTML = markup
          const newNodesArray = [...template.content.children]

          for (const $node of newNodesArray) {
            $node[SymbolComponentName] = name
          }

          // Workaround to have the <slot/> principle without using Shadow DOM
          // https://stackoverflow.com/questions/48726904/is-there-a-way-workaround-to-have-the-slot-principle-in-hyperhtml-without-using
          if (!this.shadowRoot) {
            const data = slotsAsData(this.$root)

            const handleSlot = ($slot) => {
              const slotName = $slot.getAttribute('name')

              if (slotName && data[slotName]) {
                if (!isTemplateNode(data[slotName])) {
                  throw `\nSlot named "${slotName}" in component "${name}" should be a <template /> node, now it is a <${$slot.tagName.toLowerCase()} /> node. Because <template /> nodes are required to use slots in components that are "{doNotUseShadowDOM = true}".\n`
                }

                const $slotData = data[slotName].content.cloneNode(true)
                $slot.replaceWith($slotData)
              }
            }

            // Handle component slots <slot name="…">
            template.content.querySelectorAll('slot').forEach(handleSlot)

            // Handle component slots inside <template /> nodes,
            // because {querySelectorAll} should be called on each {template.content} to retrieve them
            template.content.querySelectorAll('template').forEach(($slotContentHolder) => {
              $slotContentHolder.content.querySelectorAll('slot').forEach(handleSlot)
            })
          } else {
            throwIfSlotIsTemplateNode(this)
          }
          // ====================================================================

          // FIXME: There is issues with the rendering when not filtered specific DOM Nodes
          //  that were added asynchronously by another extensions or by the js code
          const prevNodesArray = [...this.$root.children].filter((node) => node[SymbolComponentName] === name)

          if (prevNodesArray.length === 0) {
            this.$root.appendChild(template.content)
            attachListenersToChildren(this.$root, this)
            findAndInjectComponentsInNode(this.$root)
          } else {
            // Remove nodes that are not in the new content
            // Note: we don't know what {tagName} to remove
            //  if there are multiple nodes with the same {tagName}
            if (newNodesArray.length < prevNodesArray.length) {
              const newNodeTags = newNodesArray.map((node) => node.tagName)

              for (const $node of prevNodesArray) {
                if (!newNodeTags.includes($node.tagName)) {
                  $node.remove()
                }
              }
            }

            // Update nodes that are in the new content
            newNodesArray.forEach(($el, index) => {
              const $elOld = prevNodesArray[index]

              // Add node that is in new content but not in the current content
              if (!$elOld) {
                this.$root.appendChild($el)
                return
              }

              abacusNodesUpdate($elOld, $el, this)
            })
          }

          ReactiveState.reactionReceiverID = prevReactionReceiverID
        }
      }

      const options = extendsElement ? {
        extends: HTMLElementClassToTagName.get(extendsElement),
      } : undefined

      customElements.define(PREFIX + '-' + name, AbacusComponent, options)
    }

    AbacusLib.createWebComponent = createWebComponent

    findAndInjectComponentsInNode(document.body)
  }

  window.AbacusLib = {
    init,
  }
})()