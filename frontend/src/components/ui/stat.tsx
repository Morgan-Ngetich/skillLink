import {
  Badge,
  Stat as ChakraStat,
  FormatNumber,
  Show,
  Flex,
  HStack,
} from "@chakra-ui/react";
import { InfoTip } from "@/components/ui/toggle-tip";
import * as React from "react";

interface StatProps extends ChakraStat.RootProps {
  label?: React.ReactNode;
  value?: number;
  info?: React.ReactNode;
  valueText?: React.ReactNode;
  formatOptions?: Intl.NumberFormatOptions;
  change?: number;
}

export const Stat = React.forwardRef<HTMLDListElement, StatProps>(
  function Stat(props, ref) {
    const {
      label,
      value,
      valueText,
      change,
      info,
      formatOptions,
      ...rest
    } = props;

    return (
      <ChakraStat.Root ref={ref} {...rest}>
        {(label || change != null) && (
          <Flex justify="space-between" align="center" mb="1">
            {label && (
              <HStack gap="1" align="center">
                <ChakraStat.Label fontSize="sm" color="fg.muted">
                  {label}
                </ChakraStat.Label>
                {info && <InfoTip>{info}</InfoTip>}
              </HStack>
            )}

            {change != null && (
              <Badge
                colorPalette={change > 0 ? "green" : "red"}
                variant="subtle"
                fontSize="xs"
              >
                <Show
                  when={change > 0}
                  fallback={<ChakraStat.DownIndicator boxSize="3" />}
                >
                  <ChakraStat.UpIndicator boxSize="3" />
                </Show>
                <FormatNumber
                  value={Math.abs(change)}
                  style="percent"
                  maximumFractionDigits={1}
                />
              </Badge>
            )}
          </Flex>
        )}

        <ChakraStat.ValueText fontSize="2xl" fontWeight="bold">
          {valueText ??
            (value != null && formatOptions ? (
              <FormatNumber value={value} {...formatOptions} />
            ) : (
              value
            ))}
        </ChakraStat.ValueText>
      </ChakraStat.Root>
    );
  }
);
