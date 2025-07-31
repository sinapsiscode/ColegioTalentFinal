import React, { forwardRef } from 'react'
import { FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi'

const Input = forwardRef(({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  name,
  id,
  required = false,
  disabled = false,
  error,
  helperText,
  size = 'md',
  variant = 'default',
  icon: Icon,
  iconPosition = 'left',
  showPasswordToggle = false,
  className = '',
  labelClassName = '',
  inputClassName = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false)
  const [internalType, setInternalType] = React.useState(type)
  
  React.useEffect(() => {
    if (type === 'password' && showPasswordToggle) {
      setInternalType(showPassword ? 'text' : 'password')
    } else {
      setInternalType(type)
    }
  }, [type, showPassword, showPasswordToggle])
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  }
  
  const variants = {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-500',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
    warning: 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500'
  }
  
  const baseInputClasses = `
    w-full rounded-lg border transition-all duration-200 
    focus:outline-none focus:ring-2 focus:ring-opacity-50
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    placeholder:text-gray-400
  `
  
  const inputVariant = error ? 'error' : variant
  const inputClasses = `${baseInputClasses} ${sizes[size]} ${variants[inputVariant]} ${inputClassName}`
  
  const inputId = id || name
  
  return (
    <div className={`${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId}
          className={`block text-sm font-medium text-gray-700 mb-2 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {Icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
        )}
        
        {/* Input */}
        <input
          ref={ref}
          type={internalType}
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            ${inputClasses}
            ${Icon && iconPosition === 'left' ? 'pl-10' : ''}
            ${(Icon && iconPosition === 'right') || showPasswordToggle || error ? 'pr-10' : ''}
          `}
          {...props}
        />
        
        {/* Right Icon or Password Toggle */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {error && (
            <FiAlertCircle className="w-5 h-5 text-red-500" />
          )}
          
          {!error && Icon && iconPosition === 'right' && (
            <Icon className="w-5 h-5 text-gray-400" />
          )}
          
          {!error && showPasswordToggle && type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <FiEyeOff className="w-5 h-5" />
              ) : (
                <FiEye className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Helper Text or Error */}
      {(error || helperText) && (
        <div className="mt-2">
          {error && (
            <p className="text-sm text-red-600 flex items-center">
              <FiAlertCircle className="w-4 h-4 mr-1" />
              {error}
            </p>
          )}
          {!error && helperText && (
            <p className="text-sm text-gray-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input