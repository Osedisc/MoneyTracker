'use client';

import React from 'react';
import {
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Home,
  HeartPulse,
  Gamepad2,
  GraduationCap,
  CircleEllipsis,
  Wallet,
  Briefcase,
  TrendingUp,
  Gift,
  CreditCard,
  Banknote,
  Smartphone,
  Coffee,
  Sparkles,
  Dog,
  Plane,
  Music,
  BookOpen,
  LucideProps,
} from 'lucide-react';

interface Props extends LucideProps {
  name: string;
}

export const AVAILABLE_CATEGORY_ICONS = [
  'Utensils',
  'Coffee',
  'Car',
  'ShoppingBag',
  'Receipt',
  'Home',
  'HeartPulse',
  'Gamepad2',
  'GraduationCap',
  'Sparkles',
  'Dog',
  'Plane',
  'Music',
  'BookOpen',
  'Wallet',
  'Briefcase',
  'TrendingUp',
  'Gift',
  'CreditCard',
  'Banknote',
  'CircleEllipsis',
];

export function CategoryIcon({ name, ...props }: Props) {
  switch (name) {
    case 'Utensils':
      return <Utensils {...props} />;
    case 'Coffee':
      return <Coffee {...props} />;
    case 'Car':
      return <Car {...props} />;
    case 'ShoppingBag':
      return <ShoppingBag {...props} />;
    case 'Receipt':
      return <Receipt {...props} />;
    case 'Home':
      return <Home {...props} />;
    case 'HeartPulse':
      return <HeartPulse {...props} />;
    case 'Gamepad2':
      return <Gamepad2 {...props} />;
    case 'GraduationCap':
      return <GraduationCap {...props} />;
    case 'Sparkles':
      return <Sparkles {...props} />;
    case 'Dog':
      return <Dog {...props} />;
    case 'Plane':
      return <Plane {...props} />;
    case 'Music':
      return <Music {...props} />;
    case 'BookOpen':
      return <BookOpen {...props} />;
    case 'Wallet':
      return <Wallet {...props} />;
    case 'Briefcase':
      return <Briefcase {...props} />;
    case 'TrendingUp':
      return <TrendingUp {...props} />;
    case 'Gift':
      return <Gift {...props} />;
    case 'CreditCard':
      return <CreditCard {...props} />;
    case 'Banknote':
      return <Banknote {...props} />;
    case 'Smartphone':
      return <Smartphone {...props} />;
    default:
      return <CircleEllipsis {...props} />;
  }
}
