import { Global, css } from '@emotion/react';

export function GlobalStyles() {
  return (
    <Global
      styles={css`
        :root {
          --scrollbar-thumb: rgba(0, 0, 0, 0.2);
        }

        /* ✅ Changed from [data-theme="dark"] to .dark */
        .dark {
          --scrollbar-thumb: rgba(255, 255, 255, 0.2);
        }

        * {
          scroll-behavior: smooth !important;
        }

        body, html {
          scroll-behavior: smooth !important;
        }
                  
        html {
          scroll-padding-top: 50px;
        }

        h2, h3, h4, h5, h6 {
          scroll-margin-top: 50px;
        }

        .search-highlight {
          background-color: #fef08a;
          color: #92400e;
          font-weight: 600;
        }
        
        /* ✅ Changed from [data-theme="dark"] to .dark */
        .dark .search-highlight {
          background-color: #365314;
          color: #bef264;
        }
        
        ::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: var(--scrollbar-thumb);
          border-radius: 8px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        * {
          scrollbar-width: thin;
          scrollbar-color: var(--scrollbar-thumb) transparent;
        }
      `}
    />
  );
}