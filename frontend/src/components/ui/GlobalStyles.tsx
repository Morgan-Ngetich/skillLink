import { Global, css } from '@emotion/react';
import { useColorMode } from './color-mode';

export function GlobalStyles() {
  const { colorMode } = useColorMode();

  return (
    <Global
      styles={css`
        scroll-behavior: smooth;

        .search-highlight {
          background-color: #fef08a;
          color: #92400e;
          font-weight: 600;
        }
        
        [data-theme="dark"] .search-highlight {
          background-color: #365314;
          color: #bef264;
        }
        
        ::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: ${colorMode === 'dark'
          ? 'rgba(255, 255, 255, 0.2)'
          : 'rgba(0, 0, 0, 0.2)'};
          border-radius: 8px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        * {
          scrollbar-width: thin;
          scrollbar-color: ${colorMode === 'dark'
          ? 'rgba(255, 255, 255, 0.2) transparent'
          : 'rgba(0, 0, 0, 0.2) transparent'};
        }
      `}
    />
  );
}
