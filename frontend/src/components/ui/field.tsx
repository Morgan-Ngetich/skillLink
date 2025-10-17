import { Field as ChakraField } from "@chakra-ui/react"
import * as React from "react"

interface FieldProps {
  label?: string
  helperText?: string
  errorText?: string
  required?: boolean
  disabled?: boolean
  invalid?: boolean
  children: React.ReactNode
  orientation?: "horizontal" | "vertical"
}

export const Field: React.FC<FieldProps> = ({
  label,
  helperText,
  errorText,
  required = false,
  disabled = false,
  invalid = false,
  children,
  orientation = "vertical",
}) => {
  return (
    <ChakraField.Root
      required={required}
      disabled={disabled}
      invalid={invalid || !!errorText}
      orientation={orientation}
    >
      {label && <ChakraField.Label>{label}</ChakraField.Label>}
      {children}
      {helperText && !errorText && (
        <ChakraField.HelperText>{helperText}</ChakraField.HelperText>
      )}
      {errorText && (
        <ChakraField.ErrorText>{errorText}</ChakraField.ErrorText>
      )}
    </ChakraField.Root>
  )
}

export default Field