
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
  Fish // Added Fish icon
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
  { href: '/foods', label: 'Manage Foods', icon: PackageSearch },
  { href: '/treatments', label: 'Manage Treatments', icon: FlaskConical },
  { href: '/fish-finder', label: 'Fish Finder', icon: Fish }, // New Fish Finder link
  { href: '/qa', label: 'Q&A', icon: MessageSquare },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingCart }, // Assuming marketplace is a future page
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
            // Determine if the parent item or any of its sub-items are active
            const isParentSectionActive = item.subItems
              ? isActiveRoute(item.href) || item.subItems.some(sub => isActiveRoute(sub.href))
              : isActiveRoute(item.href);

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
                {/* Render sub-menu if there are sub-items and the parent section is active */}
                {item.subItems && item.subItems.length > 0 && isParentSectionActive && (
                  <SidebarMenuSub>
                    {item.subItems.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.label}>
                        <Link href={subItem.href} passHref legacyBehavior>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isActiveRoute(subItem.href)}
                            onClick={() => openMobile && setOpenMobile(false)}
                          >
                            <a>
                              {/* Optional: Add icon for sub-item if desired */}
                              {/* <subItem.icon className="h-4 w-4" /> */}
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
