'use client';

import { useState, useEffect } from 'react';
import { ArrowUp, MessageCircle, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  className?: string;
}

export default function FloatingActionButton({ className }: FloatingActionButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsExpanded(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const actions = [
    {
      icon: MessageCircle,
      label: 'Chat',
      onClick: () => console.log('Chat clicked'),
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      icon: Phone,
      label: 'Call',
      onClick: () => console.log('Call clicked'),
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      icon: Mail,
      label: 'Email',
      onClick: () => console.log('Email clicked'),
      color: 'bg-purple-500 hover:bg-purple-600',
    },
  ];

  if (!isVisible) return null;

  return (
    <div className={cn('fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-3', className)}>
      {/* Action Buttons */}
      {isExpanded && (
        <div className="flex flex-col space-y-2 animate-on-scroll in-view">
          {actions.map((action, index) => (
            <div
              key={action.label}
              className="flex items-center space-x-3 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <span className="bg-black/80 text-white px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                {action.label}
              </span>
              <Button
                size="icon"
                onClick={action.onClick}
                className={cn(
                  'w-12 h-12 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110',
                  action.color,
                  'animate-on-scroll in-view'
                )}
              >
                <action.icon className="w-5 h-5 text-white" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <div className="relative">
        <Button
          size="icon"
          onClick={isExpanded ? () => setIsExpanded(false) : scrollToTop}
          onMouseEnter={() => setIsExpanded(true)}
          className={cn(
            'w-14 h-14 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110',
            'bg-gradient-to-r from-primary to-pink-500 hover:from-pink-500 hover:to-primary',
            'pulse-glow modern-button',
            isExpanded && 'rotate-45'
          )}
        >
          <ArrowUp className={cn('w-6 h-6 text-white transition-transform duration-300', isExpanded && 'rotate-45')} />
        </Button>
        
        {/* Ripple Effect */}
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-75"></div>
      </div>

      {/* Close overlay when clicking outside */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}