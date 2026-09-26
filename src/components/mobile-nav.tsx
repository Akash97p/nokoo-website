"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { demoPath, navigation, site } from "@/lib/site";

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent className="p-0">
        <SheetHeader className="border-b px-6 py-5 text-left">
          <SheetTitle>Nokoo</SheetTitle>
          <SheetDescription>{site.tagline}</SheetDescription>
        </SheetHeader>
        <nav className="grid gap-1 p-4" aria-label="Mobile navigation">
          {navigation.map((item) => (
            <SheetClose asChild key={item.href}>
              <Link className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground" href={item.href}>{item.label}</Link>
            </SheetClose>
          ))}
          <SheetClose asChild>
            <a className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground" href={demoPath} target="_blank" rel="noreferrer">Try the demo</a>
          </SheetClose>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
