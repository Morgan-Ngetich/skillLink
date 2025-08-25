import { useState } from "react"
import { Tabs, IconButton } from "@chakra-ui/react"
import { CodeBlock } from "@chakra-ui/react"
import { shikiAdapter } from "@/crackmode/hooks/shikiAdapter"

interface TabbedCodeProps {
  files: {
    title: string
    language: string
    code: string
  }[]
}

export const TabbedCode = ({ files }: TabbedCodeProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  return (
    <Tabs.Root
      value={files[selectedIndex].title}
      onValueChange={({ value }) => {
        const idx = files.findIndex(f => f.title === value)
        setSelectedIndex(idx)
      }}
      variant={"enclosed"}
      bg="bg.emphasized"
      borderRadius={"xl"}
      p="1"
    >
      <Tabs.List>
        {files.map((file, idx) => (
          <Tabs.Trigger key={idx} value={file.title} fontSize={"sm"}>
            {file.title}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <Tabs.Indicator />

      {files.map((file, idx) => (
        <Tabs.Content key={idx} value={file.title}>
          <CodeBlock.AdapterProvider value={shikiAdapter}>
            <CodeBlock.Root code={file.code.trim()} language={file.language}>
              <CodeBlock.Header>
                <CodeBlock.Title>{file.language}</CodeBlock.Title>
                <CodeBlock.Control>
                  <CodeBlock.CopyTrigger asChild>
                    <IconButton variant="ghost" size="2xs">
                      <CodeBlock.CopyIndicator />
                    </IconButton>
                  </CodeBlock.CopyTrigger>
                  <CodeBlock.CollapseTrigger />
                </CodeBlock.Control>
              </CodeBlock.Header>
              <CodeBlock.Content w="full" overflowX={'auto'}>
                <CodeBlock.Code>
                  <CodeBlock.CodeText />
                </CodeBlock.Code>
              </CodeBlock.Content>
            </CodeBlock.Root>
          </CodeBlock.AdapterProvider>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  )
}
