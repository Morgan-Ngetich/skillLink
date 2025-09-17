import {
  Heading,
  Text,
  Link,
  Separator,
  CodeBlock,
  Kbd,
} from "@chakra-ui/react"
import type { MDXComponents } from "mdx/types"
import type { ComponentProps } from "react"
import { ScheduleItem, ProgressStat, ThemeItem, TabbedCode } from "./ui"
import { shikiAdapter } from "../hooks/shikiAdapter"

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
    <Text mb={3} lineHeight="tall" {...props} />
  ),
  a: (props: ComponentProps<"a">) => <Link color="blue.400" {...props} />,
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

  code: ({ className, children, ...props}) => {
    // MDX usually passes language in className like "language-js"
    const isBlock = className || String(children).includes("\n")
    const language = className?.replace("language-", "")

    if (isBlock) {      
      return (
        <CodeBlock.AdapterProvider value={shikiAdapter}>
          <CodeBlock.Root code={String(children).trim()} language={language} pr={3}>
            {language && (
            <CodeBlock.Header>
              <CodeBlock.Title>{language}</CodeBlock.Title>
              <CodeBlock.Control>
                <CodeBlock.CopyTrigger />
                <CodeBlock.CollapseTrigger />
              </CodeBlock.Control>
            </CodeBlock.Header>
            )}
            <CodeBlock.Content overflowX={'auto'}>
              <CodeBlock.Code>
                <CodeBlock.CodeText />
              </CodeBlock.Code>
            </CodeBlock.Content>
          </CodeBlock.Root>
        </CodeBlock.AdapterProvider>
      )
    }

    return <Kbd {...props} variant="outline" border="1px solid" size="lg" bg="cardbg">{children}</Kbd>
  },

  ScheduleItem,
  ProgressStat,
  ThemeItem,
  TabbedCode
}

export default components