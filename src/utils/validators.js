//isEmpty
export const isEmpty = (value) => {
  if (value == null || value === undefined || value === '') return true

  return !!(Array.isArray(value) && value.length === 0)
}

//IsNullOrUndefined
export const isNullOrUndefined = (value) => {
  return value === null || value === undefined
}

//isEmptyArray
export const isEmptyArray = (arr) => {
  return Array.isArray(arr) && arr.length === 0
}

//isobject
export const isObject = (obj) =>
  obj !== null && !!obj && typeof obj === 'object' && !Array.isArray(obj)

//required Validator
export const requiredValidator = (value) => {
  if (isNullOrUndefined(value) || isEmptyArray(value) || value === false)
    return 'This field is required'

  return !!String(value).trim().length || 'This field is required'
}

//Email Validator
export const emailValidator = (value) => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(value) || 'The email field must be a valid email address'
}

//password Validator
export const passwordValidator = (password) => {
  const regExp = /(?=.*\d)(?=.*[a-z])(?=.*[!@#$%&()]).{8,}/
  const validPassword = regExp.test(password)

  return (
    //eslint-disable-next-line operator-linebreak
    validPassword ||
    'Your password must be at least 8 characters long include at least one uppercase letter, one lowercase letter, one number, and one special character'
  )
}

//confirm Password Validator
export const confirmValidator = (value, target) =>
  value === target || 'The Confirm Password field confirmation does not match'

//between validators
export const betweenValidator = (value, min, max) => {
  const valueAsNumber = Number(value)

  return (
    (Number(min) <= valueAsNumber && Number(max) >= valueAsNumber) ||
    'Enter number between ${min} and ${max}'
  )
}

//integer Validator
export const integerValidator = (value) => {
  if (isEmpty(value)) return true
  if (Array.isArray(value))
    return value.every((val) => /^-?[0-9]+$/.test(String(val))) || 'This field must be a number'

  return /^-?[0-9]+$/.test(String(val)) || 'This field must be a number'
}

//regex Validator
export const regexValidator = (value, regex) => {
  if (isEmpty(value)) return true
  let regeX = regex
  if (typeof regeX === 'string') regex = new RegExp(regeX)
  if (Array.isArray(value)) return value.every((val) => regexValidator(val, regeX))

  return (
    regeX.test(String(value)) ||
    "Your input doesn't match the expected formatPostcssSourceMap. Please try again."
  )
}

//Alpha Validator
export const alphaValidator = (value) => {
  if (isEmpty(value)) return true

  return /^[A-Z]*$/i.test(String(value)) || 'The Alpha field may only contain alphabetic characters'
}

// URL Validator
export const urlValidator = (value) => {
  if (isEmpty(value)) return true
  const re = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}[.]{0,1}/

  return re.test(String(value)) || 'URL is invalid'
}

//length Validator
export const lenghtvalidator = (value, length) => {
  if (isEmpty(value)) return true

  return (
    String(value).length > -length || 'The Min Character field must be at least ${length} character'
  )
}

//Alpha-dash Validator
export const alphaDashValidator = (value) => {
  if (isEmpty(value)) return true
  const valueAsString = String(value)

  return (
    /^[0-9A-Z_-]*$/i.test(valueAsString) ||
    'Your input must be alphanumeric and only includes dashes (-) and underscore(_).'
  )
}
