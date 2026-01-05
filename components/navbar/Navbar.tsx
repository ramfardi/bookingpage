"use client";

import { usePathname } from "next/navigation";
import SalesNavbar from "./SalesNavbar";
import ClientNavbar from "./ClientNavbar";

export default function Navbar() {
  const pathname = usePathname();

  // Client pages are always under /site/[siteId]
  const isClientSite = pathname.startsWith("/site/");

  return isClientSite ? <ClientNavbar /> : <SalesNavbar />;
}
