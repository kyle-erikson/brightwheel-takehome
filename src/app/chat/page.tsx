'use client';

import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ChatPage() {
  const { userType, childData, parentName, logout } = useUser();
  const router = useRouter();

  // Placeholder - this will be fully built in Phase 3
  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌱</span>
            <span className="font-semibold text-lg">Little Sprouts</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {userType === 'LOGGED_IN' && parentName 
                ? `👋 Hi, ${parentName.split(' ')[0]}!` 
                : '👀 Guest Mode'}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Placeholder for Phase 3 */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">
            {userType === 'LOGGED_IN' && childData
              ? `Welcome! ${childData.childName} is ${childData.status.toLowerCase()} 💚`
              : 'Welcome to Little Sprouts!'}
          </h1>
          
          {userType === 'LOGGED_IN' && childData && (
            <div className="bg-card rounded-2xl p-6 shadow-lg mb-6">
              <p className="text-lg mb-2">
                <strong>{childData.childName}</strong> is in <strong>{childData.classroom}</strong> with <strong>{childData.teacher}</strong>
              </p>
              <p className="text-muted-foreground">
                Mood: {childData.mood} • Last meal: {childData.lastMeal}
              </p>
            </div>
          )}

          <p className="text-muted-foreground text-lg">
            🚧 Chat interface coming in Phase 3...
          </p>
        </div>
      </main>
    </div>
  );
}
