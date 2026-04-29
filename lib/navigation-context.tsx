"use client";

import { createContext, useContext, useTransition } from "react";
import { useRouter } from "next/navigation";

type NavCtx = { navigate: (href: string) => void; isPending: boolean };

const NavigationContext = createContext<NavCtx>({ navigate: () => {}, isPending: false });

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const navigate = (href: string) => startTransition(() => router.push(href));
  return (
    <NavigationContext.Provider value={{ navigate, isPending }}>
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavigation = () => useContext(NavigationContext);
