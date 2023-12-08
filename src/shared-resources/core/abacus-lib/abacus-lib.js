import { PREFIX, SYM_COMPONENT_NAME } from './constants.js'
import { ReactiveState, Reactivity } from './reactivity.js'
import { appendCSS, injectStyleFiles } from './styles.js'
import { Injector } from './inject.js'
import { classnames } from './classnames.js'
import {
  isAbacusComponent,
  isAbacusExtendComponent,
  isSlotContentHolder,
  isTemplateNode,
  tagNameToComponentName
} from './utils.js'
import { getSlotsAndItsData, throwIfSlotIsTemplateNode } from './slots.js'
import { attachListenersToChildren } from './dom-events.js'
import { getAttrsNormalized } from './attributes.js'
import { abacusNodesUpdate } from './nodes-updater.js'

(async () => {
  const mapComponentToComponentName = new Map()

  const HTMLElementClassToTagName = new Map()
  HTMLElementClassToTagName.set(HTMLButtonElement, 'button')
  HTMLElementClassToTagName.set(HTMLInputElement, 'input')

  const init = ({
                  constants,
                  state,
                  stateMutators,
                  onStateMutation,

                  componentInjections,
                  pluginInjections,
                  serviceInjections,
                }) => {
    const ComponentInjector = new Injector('Component', componentInjections)
    const ServiceInjector = new Injector('Service', serviceInjections)
    const PluginInjector = new Injector('Plugin', pluginInjections)

    ReactiveState.init({ state, onStateMutation })

    const injectTranslations = (name) => {
      return fetch(componentInjections[tagNameToComponentName(name)].replace('.js', '.translates.json')).then(r => r.json())
    }

    const findAndInjectComponentsInNode = ($node) => {
      const promises = []

      for (const $child of $node.children) {
        if (isAbacusComponent($child)) {
          const componentName = tagNameToComponentName($child.tagName)

          if (componentInjections[componentName]) {
            promises.push(ComponentInjector.inject(componentName, componentInjections[componentName]))
          }
        }

        if (isAbacusExtendComponent($child)) {
          const componentName = tagNameToComponentName($child.getAttribute('is'))

          if (componentInjections[componentName]) {
            promises.push(ComponentInjector.inject(componentName, componentInjections[componentName]))
          }
        }

        promises.push(...findAndInjectComponentsInNode($child))
      }

      return promises
    }

    const stateMutatorsWithStateArgPassed = {}
    const stateObj = ReactiveState.getWithoutReactivity(ReactiveState, 'state')

    for (const stateMutatorKey in stateMutators) {
      stateMutatorsWithStateArgPassed[stateMutatorKey] = (...args) => stateMutators[stateMutatorKey].call(undefined, state, ...args)
    }

    const createWebComponent = (extendsElement) => {
      const ExtendedElement = extendsElement ?? HTMLElement
      const dontUseShadowDOMDefault = !!extendsElement

      class AbacusComponent extends ExtendedElement {
        #firstRenderer = true
        $root

        constants = constants
        state = stateObj
        stateMutators = stateMutatorsWithStateArgPassed

        props

        name
        dontUseShadowDOM = dontUseShadowDOMDefault
        html

        localState

        onAttributesChange

        constructor() {
          super()

          this.name = mapComponentToComponentName.get(this.constructor)
        }

        mutateLocalState(payload) {
          for (const payloadKey in payload) {
            this.localState[payloadKey] = payload[payloadKey]
          }

          this.render()
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
              return
            }

            observer.disconnect()
            this.props = getAttrsNormalized(this)
            this.render()
            this.onAttributesChange?.call(this, this)
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
          if (this.#firstRenderer) {

            if (this.dontUseShadowDOM) {
              this.$root = this
            } else {
              if (extendsElement) {
                throw new Error('FOR NOW "extendsElement" can\'t be used in addition with "dontUseShadowDOM=true" due to browsers components limitations')
              }

              this.attachShadow({ mode: 'open' })
              this.$root = this.shadowRoot
            }

            if (this.plugins) {
              this.pluginInjections = {}

              for (const key of this.plugins) {
                const promise = PluginInjector.inject(key)

                this.pluginInjections[key] = new Promise((resolve) => {
                  promise.then((module) => {
                    this.pluginInjections[key] = module.default
                    resolve(module.default)
                  })
                })
              }
            }

            if (this.services) {
              this.serviceInjections = {}

              for (const key of this.services) {
                const promise = ServiceInjector.inject(key)

                this.serviceInjections[key] = new Promise((resolve) => {
                  promise.then((module) => {
                    this.serviceInjections[key] = module.default
                    resolve(module.default)
                  })
                })
              }
            }

            if (this.styleFilesURLs) {
              const styleFileURLsFinal = this.styleFilesURLs.map((url) => {
                if (url === 'default') {
                  return componentInjections[tagNameToComponentName(this.name)].replace('.js', '.css')
                }

                return url
              })

              injectStyleFiles(this, styleFileURLsFinal)
            }

            if (this.css) {
              appendCSS(this.$root, this.css)
            }

            if (this.hasTranslates) {
              this.translates = await injectTranslations(this.name)
            }

            this.props = getAttrsNormalized(this)

            this.render(true)
            this.observeAttributes()

            if (!this.shadowRoot) {
              this.observeSlotContentHolders()
            }

            this.onAfterFirstRender?.call(this, this)

            this.#firstRenderer = false
          }

          if (this.stateEffects) {
            this.stateEffects.forEach((stateEffect, index) => {
              const prevReactionReceiverID = ReactiveState.reactionReceiverID
              const reactionReceiverID = `${this.name}__stateEffect__${index}`

              const fn = stateEffect.bind(this, this)

              Reactivity.registerCallback(reactionReceiverID, fn)

              ReactiveState.reactionReceiverID = reactionReceiverID
              fn()
              ReactiveState.reactionReceiverID = prevReactionReceiverID
            })
          }

          Reactivity.registerCallback(this.name, this.render.bind(this))

          if (this.translates) {
            const configObj = ReactiveState.getWithoutReactivity(this, 'state', 'config', ReactiveState.SYMBOL_PROXY_TARGET)

            Reactivity.registerReactiveProp(this.name, configObj, 'lang')
          }
        }

        render() {
          const prevReactionReceiverID = ReactiveState.reactionReceiverID

          ReactiveState.reactionReceiverID = this.name

          const state = ReactiveState.getWithoutReactivity(this, 'state')

          let translations
          if (this.translates) {
            const lang = ReactiveState.getWithoutReactivity(this, 'state', 'config', 'lang')
            translations = this.translates[lang]
          }

          const props = {
            ctx: this,
            t: translations,
            constants,
            state,
            classnames,
            localState: this.localState,
            ...this.props,
          }

          const markup = this.html
            ? typeof this.html === 'string'
              ? this.html
              : this.html.call(this, props)
            : ''

          if (!markup && markup !== '') {
            throw `Component "${this.name}" has no markup.`
          }

          const template = document.createElement('template')
          template.innerHTML = markup
          const newNodesArray = [...template.content.children]

          for (const $node of newNodesArray) {
            $node[SYM_COMPONENT_NAME] = this.name
          }

          // Workaround to have the <slot/> principle without using Shadow DOM
          // https://stackoverflow.com/questions/48726904/is-there-a-way-workaround-to-have-the-slot-principle-in-hyperhtml-without-using
          if (!this.shadowRoot) {
            const data = getSlotsAndItsData(this.$root)

            const handleSlot = ($slot) => {
              const slotName = $slot.getAttribute('name')

              if (slotName && data[slotName]) {
                if (!isTemplateNode(data[slotName])) {
                  throw `\nSlot named "${slotName}" in component "${this.name}" should be a <template /> node, now it is a <${$slot.tagName.toLowerCase()} /> node. Because <template /> nodes are required to use slots in components that are "{dontUseShadowDOM = true}".\n`
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
          const prevNodesArray = [...this.$root.children].filter((node) => node[SYM_COMPONENT_NAME] === this.name)

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

              abacusNodesUpdate($elOld, $el, this, ($parentNode) => {
                attachListenersToChildren($parentNode, this)
                findAndInjectComponentsInNode($parentNode)
              })
            })
          }

          ReactiveState.reactionReceiverID = prevReactionReceiverID
        }
      }

      return AbacusComponent
    }


    const AbacusComponent = createWebComponent()
    const AbacusButtonComponent = createWebComponent(HTMLButtonElement)

    window.AbacusLib.Component = AbacusComponent
    window.AbacusLib.ButtonComponent = AbacusButtonComponent
    window.AbacusLib.defineCustomElement = (name, Component, options) => {
      mapComponentToComponentName.set(Component, name)

      customElements.define(PREFIX + '-' + name, Component, options)
    }

    findAndInjectComponentsInNode(document.body)
  }

  window.AbacusLib = {
    init,
  }
})()