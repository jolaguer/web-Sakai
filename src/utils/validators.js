
// Form validation rues
export const requiredValidator = (v) => !!v || 'This field is required'

export const emailValidator = (v) => {
  const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return pattern.test(v) || 'Enter a valid email'
}

export const passwordValidator = (v) => {
  const hasMinLength = v && v.length >= 8
  const hasUppercase = /[A-Z]/.test(v)
  const hasLowercase = /[a-z]/.test(v)
  const hasNumber = /[0-9]/.test(v)
  
  if (!hasMinLength) return 'Password must be at least 8 characters'
  if (!hasUppercase) return 'Password must contain at least one uppercase letter'
  if (!hasLowercase) return 'Password must contain at least one lowercase letter'
  if (!hasNumber) return 'Password must contain at least one number'
  
  return true
}

export const confirmValidator = (confirmation, password) => {
  return confirmation === password || 'Passwords do not match'
}
