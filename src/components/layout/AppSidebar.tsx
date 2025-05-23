
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarClose,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
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
  ImageUp,
  MessageSquare,
  FileScan // Added FileScan as it's used on the analyze page, could be ImageUp too
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analyze', label: 'Water Test', icon: FileScan }, // Changed label and icon
  { href: '/history', label: 'Test History', icon: History },
  { href: '/aquariums', label: 'My Aquariums', icon: Droplet },
  { href: '/qa', label: 'Q&A', icon: MessageSquare },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingCart },
];

const bottomNavItems = [
    { href: '/settings', label: 'Settings', icon: Settings },
    { href: '/help', label: 'Help & Support', icon: HelpCircle },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { openMobile, setOpenMobile } = useSidebar();

  const isActive = (href: string) => pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
  
  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar">
      <SidebarHeader className="border-b">
        <div className="flex items-center justify-between w-full p-2">
          <Logo size="sm" />
          {/* <SidebarClose className="md:hidden" /> TODO: Check if needed with new sidebar setup */}
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-grow p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.href)}
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
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t">
         <SidebarMenu>
          {bottomNavItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.href)}
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
            {/* Placeholder for logout functionality */}
             <SidebarMenuButton tooltip="Log Out" onClick={() => {
                openMobile && setOpenMobile(false);
                // Add actual logout logic here
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
