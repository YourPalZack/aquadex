
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
  ShoppingCart, 
  Settings, 
  LogOut,
  HelpCircle,
  FileScan,
  MessageSquare,
  PackageSearch,
  FlaskConical,
  Fish,
  BellRing,
  Leaf,
  Archive,
  Filter,
  Sun,
  Percent,
  Sparkles // Added Sparkles icon
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
    href: '/fish-finder', // Parent link for AIQuarium Tools, points to the first sub-item
    label: 'AIQuarium Tools', 
    icon: Sparkles, // New icon for AI tools
    subItems: [
      { href: '/fish-finder', label: 'Fish Finder', icon: Fish },
      { href: '/plant-finder', label: 'Plant Finder', icon: Leaf },
      { href: '/tank-finder', label: 'Tank Finder', icon: Archive },
      { href: '/filtration-finder', label: 'Filtration Finder', icon: Filter },
      { href: '/lighting-finder', label: 'Lighting Finder', icon: Sun },
    ]
  },
  { 
    href: '/marketplace', 
    label: 'Marketplace', 
    icon: ShoppingCart,
    subItems: [
      // Finder items removed from here
    ]
  },
  { href: '/discounts-deals', label: 'Discounts & Deals', icon: Percent },
];

const bottomNavItems = [
    { href: '/settings', label: 'Settings', icon: Settings },
    { href: '/help', label: 'Help & Support', icon: HelpCircle },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { openMobile, setOpenMobile } = useSidebar();

  const isActiveRoute = (href: string) => {
    if (!href) return false; // Handle items that might not have an href (though all current ones do)
    if (href === '/') return pathname === href; 
    
    // Check if the current path starts with the item's href
    if (pathname.startsWith(href)) return true;

    // Check sub-items - if a sub-item is active, the parent should also be considered active for expansion
    const parentConfig = navItemsConfig.find(item => item.href === href);
    if (parentConfig?.subItems && parentConfig.subItems.length > 0) {
      return parentConfig.subItems.some(sub => sub.href && pathname.startsWith(sub.href));
    }
    
    return false;
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
                <Link href={item.href || '#'} passHref legacyBehavior>
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
                            isActive={subItem.href && pathname.startsWith(subItem.href)} 
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
                console.log("Logout clicked"); // Placeholder
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
