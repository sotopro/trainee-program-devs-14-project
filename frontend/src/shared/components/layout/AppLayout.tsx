import { type ReactNode, type FC } from 'react';
import { LayoutProvider } from './LayoutContext';
import { LayoutHeader } from './LayoutHeader';
import { LayoutSidebar } from './LayoutSidebar';
import { LayoutContent } from './LayoutContent';
import { LayoutFooter } from './LayoutFooter';

interface AppLayoutProps {
  children: ReactNode;
}

interface AppLayoutComponent extends FC<AppLayoutProps> {
  Header: FC<{ children?: ReactNode }>;
  Sidebar: FC<{ children?: ReactNode }>;
  Content: FC<{ children?: ReactNode }>;
  Footer: FC<{ children?: ReactNode }>;
}

export const AppLayout: AppLayoutComponent = ({ children }) => {
  return (
    <LayoutProvider>
      <div 
        className="h-screen w-full grid overflow-hidden"
        style={{
          gridTemplateAreas: `
            "sidebar header"
            "sidebar content"
            "sidebar footer"
          `,
          gridTemplateColumns: 'auto 1fr',
          gridTemplateRows: 'auto 1fr auto',
        }}
      >
        {children}
      </div>
    </LayoutProvider>
  );
};

AppLayout.Header = LayoutHeader;
AppLayout.Header.displayName = 'AppLayout.Header';

AppLayout.Sidebar = LayoutSidebar;
AppLayout.Sidebar.displayName = 'AppLayout.Sidebar';

AppLayout.Content = LayoutContent;
AppLayout.Content.displayName = 'AppLayout.Content';

AppLayout.Footer = LayoutFooter;
AppLayout.Footer.displayName = 'AppLayout.Footer';