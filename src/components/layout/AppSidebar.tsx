
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
  Sparkles,
  HeartHandshake // Added for Items Wanted
} from 'lucide-react';
import { marketplaceCategoriesData, type MarketplaceCategory } from '@/types';


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
  { 
    href: '/aquariums', 
    label: 'My Aquariums', 
    icon: Droplet,
    subItems: [
      { href: '/foods', label: 'Manage Foods', icon: PackageSearch },
      { href: '/treatments', label: 'Manage Treatments', icon: FlaskConical },
    ]
  },
  { href: '/reminders', label: 'Reminders', icon: BellRing }, 
  { href: '/qa', label: 'Q&A', icon: MessageSquare },
  { 
    href: '/aiquarium-tools', 
    label: 'AIQuarium Tools', 
    icon: Sparkles, 
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
        ...marketplaceCategoriesData.map((category: MarketplaceCategory) => ({
            href: `/marketplace/${category.slug}`,
            label: category.name,
            icon: category.icon || Leaf, 
        })),
        { href: '/items-wanted', label: 'Items Wanted', icon: HeartHandshake }, // Added Items Wanted link
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
    if (!href || href === '/aiquarium-tools' || href === '/marketplace') return false; 
    if (href === '/') return pathname === href; 
    
    // Check if the current path starts with the item's href
    if (pathname.startsWith(href)) return true;
    
    // Check if any sub-item of a parent is active
    const parentConfig = navItemsConfig.find(item => 
        item.subItems && item.subItems.some(sub => sub.href && pathname.startsWith(sub.href))
    );
    return parentConfig?.href === href;
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
            const isParentSectionActive = (item.href && (pathname.startsWith(item.href) && item.href !== '/aiquarium-tools')) || 
                                          (item.subItems && item.subItems.some(sub => sub.href && pathname.startsWith(sub.href)));


            return (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href || '#'} passHref legacyBehavior>
                  <SidebarMenuButton
                    asChild
                    isActive={isParentSectionActive && item.href !== '/aiquarium-tools' && item.href !== '/marketplace'} // Don't activate parent for group label itself unless it's a direct page
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
                    {item.subItems.map((subItem) => {
                       const SubIcon = subItem.icon; 
                       return (
                          <SidebarMenuSubItem key={subItem.label}>
                            <Link href={subItem.href} passHref legacyBehavior>
                              <SidebarMenuSubButton
                                asChild
                                isActive={subItem.href && pathname.startsWith(subItem.href)} 
                                onClick={() => openMobile && setOpenMobile(false)}
                              >
                                <a>
                                  {SubIcon && <SubIcon className="h-4 w-4" />}
                                  <span>{subItem.label}</span>
                                </a>
                              </SidebarMenuSubButton>
                            </Link>
                          </SidebarMenuSubItem>
                       );
                    })}
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
                  isActive={isActiveRoute(item.href)} // Uses the refined isActiveRoute
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
