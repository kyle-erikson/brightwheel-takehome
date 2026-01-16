'use client';

import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  actions?: { label: string; onClick: () => void }[];
}

export default function ChatPage() {
  const { userType, childData, parentName, logout } = useUser();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Get first name for greeting
  const firstName = parentName?.split(' ')[0] || 'there';

  // Add a message with typing simulation
  const addAssistantMessage = (content: string, actions?: Message['actions']) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'assistant', content, actions },
      ]);
    }, 800);
  };

  // Guided flow handlers
  const handleSickPolicy = () => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: '🤒 Sick Policy' },
    ]);
    
    const childName = childData?.childName || 'your child';
    const teacher = childData?.teacher || 'their teacher';
    
    addAssistantMessage(
      `I understand you're concerned about ${childName}'s health. Here's our sick policy:\n\n` +
      `📋 **24-Hour Fever-Free Rule**\nChildren must be fever-free (below 100.4°F) for 24 hours *without* fever-reducing medication before returning to school.\n\n` +
      `If ${childName} has a fever, please keep them home and let us know. We want to make sure everyone stays healthy! 💚`,
      [
        { 
          label: `📱 Notify ${teacher}`, 
          onClick: () => handleNotifyTeacher(teacher) 
        },
        { 
          label: '📅 Mark Absent', 
          onClick: () => handleMarkAbsent() 
        },
      ]
    );
  };

  const handleForgotLunch = () => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: '🥪 Forgot Lunch' },
    ]);
    
    const childName = childData?.childName || 'your child';
    
    addAssistantMessage(
      `No worries! It happens to the best of us! 😊\n\n` +
      `Today's menu is **Turkey & Cheese Sliders** with sliced apples and steamed carrots. Sounds yummy, right?\n\n` +
      `💰 **Cost:** $5 (charged to your Brightwheel account)\n\n` +
      `Would you like me to provide lunch for ${childName} today?`,
      [
        { 
          label: '💳 Charge My Account ($5)', 
          onClick: () => handleChargeLunch() 
        },
        { 
          label: '📋 See Full Menu', 
          onClick: () => handleShowMenu() 
        },
      ]
    );
  };

  const handleDailyUpdate = () => {
    if (!childData) return;
    
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: '📅 Daily Update' },
    ]);
    
    addAssistantMessage(
      `Here's how ${childData.childName} is doing today! 🌟\n\n` +
      `📍 **Current Activity:** ${childData.status}\n` +
      `🍽️ **Last Meal:** ${childData.lastMeal}\n` +
      `😊 **Mood:** ${childData.mood}\n` +
      `👩‍🏫 **With:** ${childData.teacher} in ${childData.classroom}\n\n` +
      `Is there anything specific you'd like to know?`,
      [
        { label: '📸 Request Photo', onClick: () => handleRequestPhoto() },
      ]
    );
  };

  // Prospective parent flows
  const handleTuition = () => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: '💰 Tuition' },
    ]);
    
    addAssistantMessage(
      `Great question! Here are our weekly tuition rates:\n\n` +
      `👶 **Infant (6 weeks - 15 months):** $450/week\n` +
      `🧒 **Toddler (16 months - 3 years):** $400/week\n` +
      `🎒 **Pre-K (3 - 5 years):** $350/week\n\n` +
      `These rates include all meals, snacks, and enrichment activities. Would you like to schedule a tour to see our classrooms?`,
      [
        { label: '🗓️ Schedule a Tour', onClick: () => handleScheduleTour() },
      ]
    );
  };

  const handleTours = () => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: '🗓️ Tours' },
    ]);
    
    addAssistantMessage(
      `We'd love to show you around! 🏫\n\n` +
      `**Tour Schedule:**\nTuesdays and Thursdays at 10:00 AM\n\n` +
      `During the tour, you'll meet our teachers, see the classrooms, and learn about our curriculum. It usually takes about 30-45 minutes.\n\n` +
      `Would you like me to reserve a spot for you?`,
      [
        { label: '📅 Book Tuesday 10 AM', onClick: () => handleBookTour('Tuesday') },
        { label: '📅 Book Thursday 10 AM', onClick: () => handleBookTour('Thursday') },
      ]
    );
  };

  const handleMission = () => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: '📍 Our Mission' },
    ]);
    
    addAssistantMessage(
      `At Little Sprouts Academy, we believe every child deserves a nurturing environment where they can grow, learn, and thrive. 🌱\n\n` +
      `**Our Philosophy:**\n` +
      `• Play-based learning that sparks curiosity\n` +
      `• Small class sizes for individual attention\n` +
      `• Experienced, loving teachers\n` +
      `• Partnership with families\n\n` +
      `We're not just a daycare—we're your child's home away from home. 💚`,
      [
        { label: '🗓️ Schedule a Tour', onClick: () => handleScheduleTour() },
        { label: '💰 View Tuition', onClick: () => handleTuition() },
      ]
    );
  };

  // Action handlers (these would connect to real APIs in production)
  const handleNotifyTeacher = (teacher: string) => {
    addAssistantMessage(
      `✅ Done! I've sent a message to ${teacher} letting them know. They'll be expecting ${childData?.childName || 'your child'} to be out today.\n\n` +
      `Feel better soon! 💚 Is there anything else I can help with?`
    );
  };

  const handleMarkAbsent = () => {
    addAssistantMessage(
      `✅ ${childData?.childName || 'Your child'} has been marked absent for today. Get well soon! 💚\n\n` +
      `Remember: They can return once they've been fever-free for 24 hours without medication.`
    );
  };

  const handleChargeLunch = () => {
    addAssistantMessage(
      `✅ All set! $5 has been added to your Brightwheel account and ${childData?.childName || 'your child'} will get today's lunch.\n\n` +
      `🍽️ Turkey & Cheese Sliders, sliced apples, and steamed carrots coming right up! 😊`
    );
  };

  const handleShowMenu = () => {
    addAssistantMessage(
      `📋 **This Week's Menu:**\n\n` +
      `**Monday:** Mac & Cheese with steamed broccoli\n` +
      `**Tuesday:** Chicken tenders with mashed potatoes\n` +
      `**Wednesday:** Pasta with marinara and green beans\n` +
      `**Thursday (Today):** Turkey & Cheese Sliders with apples\n` +
      `**Friday:** Pizza day! 🍕\n\n` +
      `All lunches include milk and a fruit serving.`
    );
  };

  const handleRequestPhoto = () => {
    addAssistantMessage(
      `📸 Photo request sent to ${childData?.teacher || 'the teacher'}! They'll snap a pic of ${childData?.childName || 'your child'} when they get a chance and upload it to your Brightwheel timeline.\n\n` +
      `Usually takes about 15-30 minutes. 📱`
    );
  };

  const handleScheduleTour = () => {
    addAssistantMessage(
      `I'd love to help you schedule a tour! 🗓️\n\n` +
      `Tours are available:\n• **Tuesdays** at 10:00 AM\n• **Thursdays** at 10:00 AM\n\n` +
      `Which day works better for you?`,
      [
        { label: '📅 Book Tuesday', onClick: () => handleBookTour('Tuesday') },
        { label: '📅 Book Thursday', onClick: () => handleBookTour('Thursday') },
      ]
    );
  };

  const handleBookTour = (day: string) => {
    addAssistantMessage(
      `🎉 Wonderful! You're booked for a tour on **${day} at 10:00 AM**!\n\n` +
      `📍 **Location:** 123 Sprout Lane, Austin, TX\n\n` +
      `We'll send you a confirmation email with parking info. Can't wait to meet you! 💚`
    );
  };

  // Handle text input submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: input },
    ]);
    
    // Simple response for demo - this will be replaced with AI in Phase 4
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('sick') || lowerInput.includes('fever')) {
      setInput('');
      handleSickPolicy();
    } else if (lowerInput.includes('lunch') || lowerInput.includes('forgot')) {
      setInput('');
      handleForgotLunch();
    } else if (lowerInput.includes('tuition') || lowerInput.includes('cost') || lowerInput.includes('price')) {
      setInput('');
      handleTuition();
    } else if (lowerInput.includes('tour')) {
      setInput('');
      handleTours();
    } else {
      setInput('');
      addAssistantMessage(
        `Thanks for your message! 😊 I'm here to help with any questions about Little Sprouts.\n\n` +
        `Try asking about our sick policy, lunch program, tuition, or scheduling a tour!`
      );
    }
  };

  // Quick action chips based on user type
  const loggedInChips = [
    { emoji: '🤒', label: 'Sick Policy', onClick: handleSickPolicy },
    { emoji: '🥪', label: 'Forgot Lunch', onClick: handleForgotLunch },
    { emoji: '📅', label: 'Daily Update', onClick: handleDailyUpdate },
  ];

  const prospectiveChips = [
    { emoji: '💰', label: 'Tuition', onClick: handleTuition },
    { emoji: '🗓️', label: 'Tours', onClick: handleTours },
    { emoji: '📍', label: 'Our Mission', onClick: handleMission },
  ];

  const quickChips = userType === 'LOGGED_IN' ? loggedInChips : prospectiveChips;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌱</span>
            <span className="font-semibold text-lg text-foreground">Little Sprouts</span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={userType === 'LOGGED_IN' ? 'default' : 'secondary'} className="rounded-full">
              {userType === 'LOGGED_IN' ? '👤 Parent' : '👀 Guest'}
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content with Tabs */}
      <main className="flex-1 container mx-auto px-4 py-4 max-w-2xl">
        <Tabs defaultValue="assistant" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 rounded-2xl h-12">
            <TabsTrigger value="assistant" className="rounded-xl text-base">
              💬 Assistant
            </TabsTrigger>
            <TabsTrigger value="info" className="rounded-xl text-base">
              📋 School Info
            </TabsTrigger>
          </TabsList>

          {/* Assistant Tab */}
          <TabsContent value="assistant" className="flex-1 flex flex-col mt-4">
            {/* Greeting Card */}
            <Card className="rounded-2xl shadow-md mb-4 bg-gradient-to-br from-primary/5 to-secondary/5 border-0">
              <CardContent className="py-4">
                {userType === 'LOGGED_IN' && childData ? (
                  <div>
                    <p className="text-xl font-semibold text-foreground">
                      Hi {firstName}! 👋
                    </p>
                    <p className="text-muted-foreground mt-1">
                      <span className="font-medium text-foreground">{childData.childName}</span> is having a{' '}
                      <span className="font-medium text-primary">{childData.mood}</span> morning!
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Currently: {childData.status} with {childData.teacher}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xl font-semibold text-foreground">
                      Welcome to Little Sprouts! 🌱
                    </p>
                    <p className="text-muted-foreground mt-1">
                      I&apos;m here to answer any questions about our school.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Action Chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              {quickChips.map((chip) => (
                <Button
                  key={chip.label}
                  variant="outline"
                  size="sm"
                  onClick={chip.onClick}
                  className="rounded-full px-4 py-2 h-auto hover:bg-primary/10 hover:border-primary transition-all"
                >
                  {chip.emoji} {chip.label}
                </Button>
              ))}
            </div>

            {/* Chat Messages */}
            <Card className="flex-1 rounded-2xl shadow-md overflow-hidden flex flex-col">
              <ScrollArea className="flex-1 p-4 max-h-[400px]">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <p className="text-lg mb-2">How can I help you today?</p>
                    <p className="text-sm">Click a quick action above or type a message below.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                          {msg.actions && msg.actions.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {msg.actions.map((action, idx) => (
                                <Button
                                  key={idx}
                                  size="sm"
                                  variant={msg.role === 'user' ? 'secondary' : 'default'}
                                  className="rounded-xl text-xs"
                                  onClick={action.onClick}
                                >
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-2xl px-4 py-3">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t p-4">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="rounded-xl"
                  />
                  <Button type="submit" className="rounded-xl px-6">
                    Send
                  </Button>
                </form>
              </div>
            </Card>
          </TabsContent>

          {/* School Info Tab */}
          <TabsContent value="info" className="mt-4 space-y-4">
            {/* Hours Card */}
            <Card className="rounded-2xl shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  🕐 Hours & Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">Regular Hours</p>
                  <p className="text-muted-foreground">Monday - Friday, 7:00 AM - 6:00 PM</p>
                </div>
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-muted-foreground">123 Sprout Lane, Austin, TX 78701</p>
                </div>
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-muted-foreground">(512) 555-GROW</p>
                </div>
              </CardContent>
            </Card>

            {/* Closures Card */}
            <Card className="rounded-2xl shadow-md border-amber-200 bg-amber-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-amber-900">
                  📅 Upcoming Closures
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Badge className="bg-amber-500 hover:bg-amber-600 rounded-full">Closed</Badge>
                  <div>
                    <p className="font-medium text-amber-900">Veterans Day</p>
                    <p className="text-sm text-amber-700">Honoring our heroes 🇺🇸</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="rounded-2xl shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">💰 Tuition</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p>Infant: $450/wk</p>
                  <p>Toddler: $400/wk</p>
                  <p>Pre-K: $350/wk</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">🍽️ Lunch</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p>$5/day optional</p>
                  <p className="text-muted-foreground">Today: Turkey Sliders</p>
                </CardContent>
              </Card>
            </div>

            {/* Health Policy Card */}
            <Card className="rounded-2xl shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  🏥 Health Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Fever:</span> Children must be 24 hours fever-free (below 100.4°F) without medication before returning.
                </p>
                <p>
                  <span className="font-medium">Pickup:</span> If fever exceeds 100.4°F, we&apos;ll call for immediate pickup.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
