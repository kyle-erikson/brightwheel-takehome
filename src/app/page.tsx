'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/context/UserContext';
import studentsData from '@/../data/students.json';
import { Student } from '@/types';

type AuthStep = 'welcome' | 'phone' | 'code';

export default function Gateway() {
  const [step, setStep] = useState<AuthStep>('welcome');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const { setUserType, setChildData } = useUser();
  const router = useRouter();

  const students = studentsData as Student[];

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Format validation (simple check)
    if (!phone || phone.length < 7) {
      setError('Please enter a valid phone number');
      return;
    }
    
    setStep('code');
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Accept any 4-digit code for demo
    if (code.length !== 4 || !/^\d{4}$/.test(code)) {
      setError('Please enter a 4-digit code');
      return;
    }
    
    // Check if phone matches a student record
    const matchedStudent = students.find(
      (s) => s.parentPhone === phone || s.parentPhone === phone.replace(/-/g, '')
    );
    
    if (matchedStudent) {
      setUserType('LOGGED_IN');
      setChildData(matchedStudent);
    } else {
      // Phone not recognized, treat as prospective parent
      setUserType('PROSPECTIVE');
      setChildData(null);
    }
    
    router.push('/chat');
  };

  const handleGuestContinue = () => {
    setUserType('PROSPECTIVE');
    setChildData(null);
    router.push('/chat');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/30 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
            <span className="text-4xl">🌱</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Little Sprouts</h1>
          <p className="text-muted-foreground mt-1">Academy</p>
        </div>

        {/* Welcome Step */}
        {step === 'welcome' && (
          <Card className="shadow-xl border-0 rounded-2xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Welcome! 👋</CardTitle>
              <CardDescription className="text-base">
                How would you like to get started?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <Button
                onClick={() => setStep('phone')}
                className="w-full h-14 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                📱 Already a Parent? Log in with Phone
              </Button>
              <Button
                onClick={handleGuestContinue}
                variant="secondary"
                className="w-full h-14 text-lg rounded-2xl"
                size="lg"
              >
                👀 Just Looking? Chat as Guest
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Phone Input Step */}
        {step === 'phone' && (
          <Card className="shadow-xl border-0 rounded-2xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Phone Login</CardTitle>
              <CardDescription className="text-base">
                Enter your phone number and we&apos;ll send you a code
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <Input
                    type="tel"
                    placeholder="555-0101"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-14 text-lg text-center rounded-xl"
                    autoFocus
                  />
                  {error && (
                    <p className="text-destructive text-sm mt-2 text-center">{error}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full h-14 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                >
                  Send Code →
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { setStep('welcome'); setError(''); }}
                  className="w-full"
                >
                  ← Back
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Code Verification Step */}
        {step === 'code' && (
          <Card className="shadow-xl border-0 rounded-2xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Enter Code</CardTitle>
              <CardDescription className="text-base">
                We sent a 4-digit code to {phone}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleCodeSubmit} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="• • • •"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    className="h-14 text-2xl text-center tracking-[0.5em] rounded-xl font-mono"
                    autoFocus
                  />
                  {error && (
                    <p className="text-destructive text-sm mt-2 text-center">{error}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    💡 Demo: Enter any 4 digits
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full h-14 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                >
                  Verify & Continue →
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { setStep('phone'); setCode(''); setError(''); }}
                  className="w-full"
                >
                  ← Back
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Demo hint */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Demo phones: 555-0101 (James), 555-0202 (Elena), 555-0303 (Sarah)
        </p>
      </div>
    </div>
  );
}
