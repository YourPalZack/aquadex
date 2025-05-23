
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
  Filter as FilterIcon,
  Sun,
  Percent,
  Sparkles,
  HeartHandshake,
  ChevronRight,
  ChevronDown,
  ListPlus,
  Store as StoreIcon,
  Map as MapIcon,
  Star
} from 'lucide-react';
import { marketplaceCategoriesData, type MarketplaceCategory, mockCurrentUser, questionCategories } from '@/types';
import type { ReactElement, ElementType } from 'react';
import { cn } from '@/lib/utils';


// Define navigation items with potential sub-items
const navItemsConfig = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    href: '/analyze',
    label: 'Water Test',
    icon: FileScan,
    subItems: [
      { href: '/history', label: 'Test History', icon: History },
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
  {
    href: '/qa',
    label: 'Q&A',
    icon: MessageSquare,
    subItems: questionCategories.map(cat => ({
      href: `/qa/${cat.slug}`,
      label: cat.name,
      icon: cat.icon || ChevronRight,
    }))
  },
  {
    href: '/aiquarium-tools',
    label: 'AIQuarium Tools',
    icon: Sparkles,
    subItems: [
      { href: '/fish-finder', label: 'Fish Finder', icon: Fish },
      { href: '/plant-finder', label: 'Plant Finder', icon: Leaf },
      { href: '/tank-finder', label: 'Tank Finder', icon: Archive },
      { href: '/filtration-finder', label: 'Filtration Finder', icon: FilterIcon },
      { href: '/lighting-finder', label: 'Lighting Finder', icon: Sun },
    ]
  },
  {
    href: '/marketplace',
    label: 'Marketplace',
    icon: ShoppingCart,
    subItems: [
        { href: '/marketplace/featured', label: 'Featured', icon: Star, className: 'text-amber-500 dark:text-amber-400 font-semibold' },
        ...(mockCurrentUser.isSellerApproved ? [
            { href: '/marketplace/add-listing', label: 'Create Listing', icon: ListPlus, className: 'text-primary font-semibold' },
        ] : []),
        ...marketplaceCategoriesData.map((category: MarketplaceCategory) => ({
            href: `/marketplace/${category.slug}`,
            label: category.name,
            icon: category.icon || ChevronRight,
        })),
        { href: '/items-wanted', label: 'Items Wanted', icon: HeartHandshake },
    ]
  },
  ...(mockCurrentUser.isSellerApproved ? [
    { 
      href: '/marketplace/purchase-featured-listing', 
      label: 'Feature Your Listing', 
      icon: Star, 
      className: 'text-green-600 dark:text-green-500 bg-green-500/10 hover:bg-green-500/20 dark:hover:bg-green-500/30 font-semibold',
      iconClassName: 'text-green-600 dark:text-green-500' 
    }
  ] : []),
  { href: '/local-fish-stores', label: 'Local Fish Stores', icon: StoreIcon },
  { href: '/discounts-deals', label: 'Discounts & Deals', icon: Percent },
];

const bottomNavItems = [
    { href: '/settings', label: 'Settings', icon: Settings },
    { href: '/help', label: 'Help & Support', icon: HelpCircle },
    { href: '/sitemap', label: 'Sitemap', icon: MapIcon },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { openMobile, setOpenMobile } = useSidebar();

  const isActiveRoute = (href: string | undefined) => {
    if (!href) return false;
    // For parent items, only activate if it's an exact match,
    // or if a sub-item is active and the current path starts with the parent's href.
    // This prevents the parent from staying "more active" than a specific child.
    if (href === '/') return pathname === href;

    const parentItem = navItemsConfig.find(item => item.href === href && item.subItems && item.subItems.length > 0);
    if (parentItem) {
        // If any sub-item is active, parent is "section active" but not "direct active"
        const isSubItemActive = parentItem.subItems.some(sub => sub.href && pathname.startsWith(sub.href));
        if (isSubItemActive) {
            return pathname === href; // Only true if current page is exactly the parent link
        }
    }
    return pathname.startsWith(href);
  };
  
  const isSectionActive = (item: typeof navItemsConfig[0]) => {
    if (!item.href) return false;
    if (pathname.startsWith(item.href)) return true;
    if (item.subItems) {
        return item.subItems.some(sub => sub.href && pathname.startsWith(sub.href));
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
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const currentSectionActive = isSectionActive(item);


            return (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href || '#'} passHref legacyBehavior>
                  <SidebarMenuButton
                    asChild
                    isActive={isActiveRoute(item.href) && (!hasSubItems || item.href === pathname)}
                    tooltip={item.label}
                    onClick={() => {
                      if (openMobile && !hasSubItems) setOpenMobile(false);
                    }}
                    className={cn(item.className)}
                  >
                    <a>
                      <item.icon className={cn("h-5 w-5", item.iconClassName)} />
                      <span className="flex-grow">{item.label}</span>
                      {hasSubItems && (
                        currentSectionActive ?
                        <ChevronDown className="h-4 w-4 shrink-0" /> :
                        <ChevronRight className="h-4 w-4 shrink-0" />
                      )}
                    </a>
                  </SidebarMenuButton>
                </Link>
                {hasSubItems && currentSectionActive && (
                  <SidebarMenuSub>
                    {item.subItems.map((subItem) => {
                       const SubIcon = subItem.icon as ElementType;
                       return (
                          <SidebarMenuSubItem key={subItem.label}>
                            <Link href={subItem.href} passHref legacyBehavior>
                              <SidebarMenuSubButton
                                asChild
                                isActive={subItem.href && pathname.startsWith(subItem.href)}
                                onClick={() => openMobile && setOpenMobile(false)}
                                className={cn(subItem.className)}
                              >
                                <a>
                                  {SubIcon && <SubIcon className={cn("h-4 w-4", subItem.iconClassName)} />}
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
