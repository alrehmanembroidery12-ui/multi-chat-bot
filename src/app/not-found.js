'use client';

import React from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'radial-gradient(circle at center, #111827 0%, #030712 100%)',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <div style={{
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'center'
      }}>
        {/* Simple Robot SVG Illustration */}
        <svg width="180" height="180" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="25" y="30" width="50" height="40" rx="10" fill="url(#botGrad)" stroke="#6366f1" strokeWidth="2"/>
          <rect x="20" y="42" width="5" height="16" rx="2" fill="#6366f1"/>
          <rect x="75" y="42" width="5" height="16" rx="2" fill="#6366f1"/>
          <circle cx="50" cy="20" r="4" fill="#a855f7"/>
          <path d="M50 20V30" stroke="#6366f1" strokeWidth="2"/>
          <circle cx="41" cy="48" r="4" fill="#10b981"/>
          <circle cx="59" cy="48" r="4" fill="#10b981"/>
          <path d="M42 60Q50 65 58 60" stroke="#f4f4f5" strokeWidth="2.5" strokeLinecap="round"/>
          <defs>
            <linearGradient id="botGrad" x1="25" y1="30" x2="75" y2="70" gradientUnits="userSpaceOnUse">
              <stop stopColor="rgba(99, 102, 241, 0.2)"/>
              <stop offset="1" stopColor="rgba(168, 85, 247, 0.25)"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      <h1 style={{
        fontSize: '2.25rem',
        fontWeight: '800',
        marginBottom: '1rem',
        background: 'linear-gradient(to right, #6366f1, #a855f7)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        404 Page Not Found
      </h1>
      <p style={{
        fontSize: '1.1rem',
        color: '#9ca3af',
        maxWidth: '450px',
        lineHeight: '1.6',
        marginBottom: '2rem',
      }}>
        Oops! This bot wandered off 🤖
      </p>

      <Link href="/dashboard" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'linear-gradient(to right, #6366f1, #4f46e5)',
        color: '#ffffff',
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: '600',
        boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.4)',
        transition: 'all 0.2s',
      }}>
        <Home size={16} />
        Go to Dashboard
      </Link>
    </div>
  );
}
