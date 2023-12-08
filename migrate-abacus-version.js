/**
 * Migrate from Abacus v0.1.0 interface to v0.2.0 interface
 * This script will migrate the component defining code to the new interface
 *
 * FROM:
 * (() => {
 *   const html = () => {
 *     return "Hello world"
 *   }
 *
 *   AbacusLib.createWebComponent('hello-world', {
 *     html: html
 *     css: `
 *       :host {
 *           font-size: 1.5em;
 *       }
 *     `
 *   })
 * })()
 *
 * TO:
 * (() => {
 *   const html = () => {
 *     return "Hello world"
 *   }
 *
 *   class Component extends AbacusLib.Component {
 *     html = html
 *     css = `
 *       :host {
 *           font-size: 1.5em;
 *       }
 *     `
 *   }
 *
 *   AbacusLib.registerComponent('hello-world', Component)
 * })()
 */

import AbstractSyntaxTree from 'abstract-syntax-tree'
import fs from 'fs'

import { generateJSEntryObject } from './utils.js'

function updateContentByLocation(fileData, newData, location) {
  // Update the file content based on the location
  const fileDataSplit = fileData.split('\n')
  const startLine = location.start.line - 1
  const startColumn = location.start.column - 2 // may be an error here and should be -1, but it actually works better with -2
  const endLine = location.end.line - 1
  const endColumn = location.end.column - 1

  fileDataSplit[startLine] = fileDataSplit[startLine].substring(0, startColumn) + newData
  fileDataSplit[endLine] = fileDataSplit[endLine].substring(endColumn)

  fileDataSplit.splice(startLine + 1, endLine - startLine)

  return fileDataSplit.join('\n')
}

function extractContentByLocation(fileData, location) {
  // Extract the file content based on the location
  const fileDataSplit = fileData.split('\n')
  const startLine = location.start.line - 1
  const startColumn = location.start.column
  const endLine = location.end.line - 1
  const endColumn = location.end.column

  const extractedContentArray = fileDataSplit.slice(startLine, endLine + 1)

  extractedContentArray[extractedContentArray.length - 1] = extractedContentArray[extractedContentArray.length - 1].substring(0, endColumn)
  extractedContentArray[0] = extractedContentArray[0].substring(startColumn)

  return extractedContentArray.join('\n')
}

const prependIndent = (array, indent) => {
  return array.map(line => indent + line)
}

const entries = generateJSEntryObject();


for (const entry in entries) {
  const notComponent = !entry.includes('/components/')
  const injectionsListFile = entry.includes('/injections.js')
  // const testFile = entry.includes('/home-screen/')

  if (notComponent || injectionsListFile) {
    continue
  }

  const source = fs.readFileSync(entries[entry], "utf8")
  const tree = new AbstractSyntaxTree(source, {
    next: true,
  })
  const createWebComponent = tree.find(`ExpressionStatement[expression.callee.property.name="createWebComponent"]`).pop()
  if (!createWebComponent) {
    continue
  }

  const INDENT = '  '
  const componentName = createWebComponent.expression.arguments[0].value
  const componentConfig = createWebComponent.expression.arguments[1].properties.reduce((acc, prop) => {
    const key = prop.key.name
    const loc = prop.value.loc
    const method = prop.method

    acc.push([key, loc, method])

    return acc
  }, [])


  const classProperties = componentConfig.map(([key, loc, method]) => {
    const value = extractContentByLocation(source, loc)
    const equalSign = method ? '' : ' = '

    return key + equalSign + value
  })

  const replaceContent = [
    `class Component extends AbacusLib.Component {`,
    ...prependIndent(classProperties, INDENT),
    `}`,
    `AbacusLib.defineCustomElement('${componentName}', Component)`
  ]
  const strReplaceContent = prependIndent(replaceContent, INDENT).join('\n')

  const newFileContent = updateContentByLocation(source, strReplaceContent, createWebComponent.loc)

  fs.writeFileSync(entries[entry], newFileContent, 'utf8')
}