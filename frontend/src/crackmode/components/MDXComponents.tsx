import {
  Heading,
  Text,
  Link,
  Separator,
} from "@chakra-ui/react"
import type { MDXComponents } from "mdx/types"
import type { ComponentProps } from "react"
import { ScheduleItem, ProgressStat, ThemeItem } from "./ui"

const components: MDXComponents = {
  h1: (props: ComponentProps<"h1">) => (
    <Heading as="h1" size="2xl" mt={0} mb={6} {...props} />
  ),
  h2: (props: ComponentProps<"h2">) => (
    <Heading
      as="h2"
      size="xl"
      mt={8}
      mb={4}
      pb={2}
      borderBottom="1px solid"
      borderColor="gray.200"
      {...props}
    />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <Heading as="h3" size="lg" mt={6} mb={3} {...props} />
  ),
  h4: (props: ComponentProps<"h4">) => (
    <Heading as="h4" size="md" mt={4} mb={2} {...props} />
  ),
  p: (props: ComponentProps<"p">) => (
    <Text mb={4} lineHeight="tall" {...props} />
  ),
  a: (props: ComponentProps<"a">) => <Link color="blue.500" {...props} />,
  hr: (props: ComponentProps<"hr">) => <Separator my={6} {...props} />,
  
  // Simplified list components - remove List.Root and List.Item
  ul: (props: ComponentProps<"ul">) => (
    <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem', listStyleType: 'disc' }} {...props} />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol style={{ paddingLeft: '1.25rem', marginBottom: '1rem', listStyleType: 'decimal' }} {...props} />
  ),
  li: (props: ComponentProps<"li">) => (
    <li style={{ marginBottom: '0.25rem' }} {...props} />
  ),

  // Simplified code block - remove complex CodeBlock structure
  code: ({ className, children, ...props }: ComponentProps<"code">) => {
    // If it's a code block (has className), render as pre + code
    if (className) {
      return (
        <pre style={{ 
          background: '#f7fafc', 
          padding: '1rem', 
          borderRadius: '0.5rem', 
          overflow: 'auto',
          marginBottom: '1rem'
        }}>
          <code {...props}>{children}</code>
        </pre>
      )
    }
    // If it's inline code
    return (
      <code 
        style={{ 
          background: '#f7fafc', 
          padding: '0.125rem 0.25rem', 
          borderRadius: '0.25rem',
          fontSize: '0.875em'
        }} 
        {...props}
      >
        {children}
      </code>
    )
  },

  ScheduleItem,
  ProgressStat,
  ThemeItem
}

export default components