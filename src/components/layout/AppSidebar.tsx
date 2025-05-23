
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from '@/components/ui/sidebar';
import Logo from './Logo';
import { 
  LayoutDashboard, 
  History, 
  Droplet, 
  Users, 
  ShoppingCart, 
  Settings, 
  LogOut,
  HelpCircle,
  FileScan,
  MessageSquare,
  PackageSearch,
  FlaskConical,
  Fish,
  BellRing 
} from 'lucide-react';

// Define navigation items with potential sub-items
const navItemsConfig = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    href: '/analyze', // Parent item
    label: 'Water Test',
    icon: FileScan,
    subItems: [
      { href: '/history', label: 'Test History', icon: History }, // Child item
    ],
  },
  { href: '/aquariums', label: 'My Aquariums', icon: Droplet },
  { href: '/reminders', label: 'Reminders', icon: BellRing }, 
  { href: '/foods', label: 'Manage Foods', icon: PackageSearch },
  { href: '/treatments', label: 'Manage Treatments', icon: FlaskConical },
  { href: '/qa', label: 'Q&A', icon: MessageSquare },
  { 
    href: '/marketplace', // Parent item for Marketplace
    label: 'Marketplace', 
    icon: ShoppingCart,
    subItems: [
      { href: '/fish-finder', label: 'Fish Finder', icon: Fish }, // Fish Finder nested here
    ]
  },
];

const bottomNavItems = [
    { href: '/settings', label: 'Settings', icon: Settings },
    { href: '/help', label: 'Help & Support', icon: HelpCircle },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { openMobile, setOpenMobile } = useSidebar();

  // General isActive check for items without sub-items, or for sub-items themselves
  const isActiveRoute = (href: string) => {
    if (href === '/') return pathname === href; // Handle home explicitly if needed
    // For parent items with sub-items, we want them to be active if any sub-item is active OR if the parent href itself is active.
    // For direct links or sub-items, a simple startsWith is usually fine.
    const parentConfig = navItemsConfig.find(item => item.href === href && item.subItems && item.subItems.length > 0);
    if (parentConfig) {
        return pathname.startsWith(href) || parentConfig.subItems.some(sub => pathname.startsWith(sub.href));
    }
    return pathname.startsWith(href);
  };
  
  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar">
      <SidebarHeader className="border-b">
        <div className="flex items-center justify-between w-full p-2">
          <Logo size="sm" />
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-grow p-2">
        <SidebarMenu>
          {navItemsConfig.map((item) => {
            const isParentSectionActive = isActiveRoute(item.href);

            return (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton
                    asChild
                    isActive={isParentSectionActive}
                    tooltip={item.label}
                    onClick={() => openMobile && setOpenMobile(false)}
                  >
                    <a>
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </Link>
                {item.subItems && item.subItems.length > 0 && isParentSectionActive && (
                  <SidebarMenuSub>
                    {item.subItems.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.label}>
                        <Link href={subItem.href} passHref legacyBehavior>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isActiveRoute(subItem.href)} // Sub-items check their own active state
                            onClick={() => openMobile && setOpenMobile(false)}
                          >
                            <a>
                              {subItem.icon && <subItem.icon className="h-4 w-4" />}
                              <span>{subItem.label}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </Link>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t">
         <SidebarMenu>
          {bottomNavItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  asChild
                  isActive={isActiveRoute(item.href)}
                  tooltip={item.label}
                  onClick={() => openMobile && setOpenMobile(false)}
                >
                  <a>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
             <SidebarMenuButton tooltip="Log Out" onClick={() => {
                openMobile && setOpenMobile(false);
                console.log("Logout clicked");
             }}>
                <LogOut className="h-5 w-5" />
                <span>Log Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
