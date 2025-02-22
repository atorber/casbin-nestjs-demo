'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', show: !!user },
    { name: 'User Management', href: '/users', show: user?.roles.includes('admin') },
    { name: 'My Profile', href: '/profile', show: !!user },
  ];

  const handleLogin = () => {
    router.push('/login');
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="mr-8 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-lg font-bold">Casbin Demo</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center space-x-4">
          {navigation
            .filter((item) => item.show)
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === item.href
                    ? 'text-foreground'
                    : 'text-foreground/60'
                )}
              >
                {item.name}
              </Link>
            ))}
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm text-foreground/60">
                {user.username}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogin}
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
} 