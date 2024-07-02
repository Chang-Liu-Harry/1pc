'use client'

import { cn } from "@/lib/utils";
import { Home, Plus,Sailboat } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useProModal } from "@/hooks/use-pro-modal";
interface SidebarProps {
  isPro: boolean;
}

const Sidebar = (
  { isPro }: SidebarProps
) => {
  const pathname = usePathname()
  const router = useRouter()
  const proModal = useProModal();

  const onNavigate = (url: string, pro: boolean) => {
    if (pro && isPro === false) return proModal.onOpen()
    return router.push(url)
  }
  const routes = [
    {
      icon: Home,
      href: '/',
      label: "Home",
      pro: false,
    },
    {
      icon: Plus,
      href: '/mind/new',
      label: "Create",
      pro: true,
    },
    {
      icon: Sailboat,
      href: '/settings',
      label: "Tickets",
      pro: false,
    },
  ];

  return (
    <div className="space-y-4 flex flex-col h-full text-primary">
      <div className="flex flex-1 justify-center p-3">
        <div className="space-y-2">
          {routes.map((route) => (
            <div
              onClick={() => onNavigate(route.href, route.pro)}
              key={route.href}
              className={cn(
                "text-muted-foreground text-xs group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                pathname === route.href && "bg-primary/10 text-primary",
              )}
            >
              <div className="flex flex-col gap-y-2 items-center flex-1">
                <route.icon className="h-5 w-5" />
                {route.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;