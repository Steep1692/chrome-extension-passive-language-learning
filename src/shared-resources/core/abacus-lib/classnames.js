export const classnames = (...args) => {
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