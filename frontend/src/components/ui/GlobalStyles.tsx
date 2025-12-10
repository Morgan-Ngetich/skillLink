import { Global, css } from '@emotion/react';
import { useColorMode } from './colormode/useColorMode';

export function GlobalStyles() {
  const { colorMode } = useColorMode();

  return (
    <Global
      styles={css`
        * {
          scroll-behavior: smooth !important;
        }

        /* Ensure no conflicting styles */
        body, html {
          scroll-behavior: smooth !important;
        }
                  
        html {
          scroll-padding-top: 50px; /* Instead of scroll-margin-top on headings */
        }

        h2, h3, h4, h5, h6 {
          scroll-margin-top: 50px;
        }

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
