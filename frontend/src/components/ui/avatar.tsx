import {
  Avatar as ChakraAvatar,
  AvatarGroup as ChakraAvatarGroup,
} from "@chakra-ui/react"
import * as React from "react"

type ImageProps = React.ImgHTMLAttributes<HTMLImageElement>

function stringToColor(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = hash % 360
  return `hsl(${hue}, 60%, 70%)`
}

export interface AvatarProps extends ChakraAvatar.RootProps {
  name?: string
  src?: string
  srcSet?: string
  loading?: ImageProps["loading"]
  icon?: React.ReactElement
  fallback?: React.ReactNode
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  function Avatar(props, ref) {
    const { name, src, srcSet, loading, icon, fallback, children, ...rest } =
    props
    const bgColor = name ? stringToColor(name) : undefined
    return (
      <ChakraAvatar.Root ref={ref} {...rest}  bg={bgColor}>
        <ChakraAvatar.Fallback name={name}>
          {icon || fallback}
        </ChakraAvatar.Fallback>
        <ChakraAvatar.Image src={src} srcSet={srcSet} loading={loading} />
        {children}
      </ChakraAvatar.Root>
    )
  },
)

export const AvatarGroup = ChakraAvatarGroup
