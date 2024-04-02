"use client";

import Link from "next/link";
import Image from "next/image";
import { Montserrat } from "next/font/google";
import { cn } from "@/lib/utils";
import { LayoutDashboard } from "lucide-react";

const montserrat = Montserrat({ weight: "600", subsets: ["latin"] });

const routes = [
  {
    label: "Dashboard",
    href: "/dashboard",
    color: "text-sky-500",
    icon: LayoutDashboard,
  },
];

const Sidebar = () => {
  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <div className="relative w-8 h-8 mr-4">
            <Image fill alt="logo" src="/logo.png" />
          </div>
          <h1 className={cn(montserrat.className, "text-2xl font-bold")}>
            Geni AI
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link key={route.href} href={route.href}>
              <div className="flex items-center flex-1">
                <route.icon className={cn(route.color, "h-5 w-5 mr-3")} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
