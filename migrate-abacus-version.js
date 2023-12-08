import AbstractSyntaxTree from 'abstract-syntax-tree'
import fs from 'fs'

import { generateJSEntryObject } from './utils.js'

function updateContentByLocation(fileData, newData, location) {
  // Update the file content based on the location
  const fileDataSplit = fileData.split('\n')
  const startLine = location.start.line - 1
  const startColumn = location.start.column - 1
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

const entries = generateJSEntryObject();


for (const entry in entries) {
  if (!entry.includes('/components/') || entry.includes('/injections.js')) {
    continue
  }

  const source = fs.readFileSync(entries[entry], "utf8")
  const tree = new AbstractSyntaxTree(source, {
    next: true,
    raw: true
  })
  const createWebComponent = tree.find(`ExpressionStatement[expression.callee.property.name="createWebComponent"]`).pop()
  if (!createWebComponent) {
    continue
  }

  const componentName = createWebComponent.expression.arguments[0].value
  const props = createWebComponent.expression.arguments[1].properties.reduce((acc, prop) => {
    const key = prop.key.name
    const loc = prop.value.loc

    acc.push([key, loc])

    return acc
  }, [])

  const indent = '    '
  const halfIndent = indent.slice(0, indent / 2 + 1)

  const classProperties = props.map(([key, loc]) => {
    const value = extractContentByLocation(source, loc)

    return `${key} = ${value}`
  }).join('\n' + indent)

  const replaceContent = `${halfIndent}class Component extends AbacusLib.Component {
${indent}${classProperties}
  }
  
  AbacusLib.registerComponent('${componentName}', Component)`


  const newFileContent = updateContentByLocation(source, replaceContent, createWebComponent.loc)

  fs.writeFileSync(entries[entry], newFileContent, 'utf8')
  debugger
}