// Herramienta para detectar re-renders innecesarios
export const logRenders = (componentName) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔄 ${componentName} rendered at ${new Date().toLocaleTimeString()}`)
  }
}

// Hook para detectar por qué se re-renderiza un componente
export const useWhyDidYouUpdate = (name, props) => {
  const previous = React.useRef()
  
  React.useEffect(() => {
    if (previous.current) {
      const allKeys = Object.keys({ ...previous.current, ...props })
      const changedProps = {}
      
      allKeys.forEach(key => {
        if (previous.current[key] !== props[key]) {
          changedProps[key] = {
            from: previous.current[key],
            to: props[key]
          }
        }
      })
      
      if (Object.keys(changedProps).length) {
        console.log(`🔍 [${name}] Props changed:`, changedProps)
      }
    }
    
    previous.current = props
  })
}

// Medir tiempo de render
export const measureRenderTime = (componentName, renderFn) => {
  const start = performance.now()
  const result = renderFn()
  const end = performance.now()
  
  if (end - start > 16) { // Más de 16ms puede causar lag
    console.warn(`⚠️ ${componentName} render took ${(end - start).toFixed(2)}ms`)
  }
  
  return result
}