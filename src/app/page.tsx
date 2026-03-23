import Link from 'next/link';
import { ArrowRight, Shield, Zap, Eye, DollarSign, Users, Star } from 'lucide-react';

import { APP_NAME } from '@/lib/constants';

const FEATURES = [
  {
    icon: Users,
    title: 'Expert Designer Network',
    description:
      'Browse and connect with verified dental CAD/CAM designers specializing in crowns, bridges, implants, and more.',
  },
  {
    icon: Eye,
    title: '3D Design Review',
    description:
      'Review submitted designs with our built-in 3D STL viewer. Approve, request revisions, or leave feedback in real-time.',
  },
  {
    icon: Shield,
    title: 'Secure Escrow Payments',
    description:
      'Funds are held securely until you approve the final design. Designers get paid promptly upon approval.',
  },
  {
    icon: Zap,
    title: 'Real-time Messaging',
    description:
      'Communicate directly with designers on each case. Get instant notifications on proposals and design updates.',
  },
  {
    icon: DollarSign,
    title: 'Transparent Pricing',
    description:
      'Set your budget, receive competitive proposals, and agree on a price before work begins. No hidden fees.',
  },
  {
    icon: Star,
    title: 'Quality Ratings',
    description:
      'Rate and review designers after each case. Build trust through a transparent reputation system.',
  },
];

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Post a Case',
    description:
      'Describe your dental design needs, upload scans, and set your budget and timeline.',
  },
  {
    step: '2',
    title: 'Receive Proposals',
    description:
      'Qualified designers submit competitive proposals with pricing and estimated timelines.',
  },
  {
    step: '3',
    title: 'Review Designs',
    description:
      'Use our 3D viewer to inspect submissions. Request revisions or approve the final design.',
  },
  {
    step: '4',
    title: 'Secure Payment',
    description:
      'Payment is released from escrow only when you approve. Everyone stays protected.',
  },
];

/**
 * Public landing page — hero, features, how it works, CTA.
 */
export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            {APP_NAME}
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 py-20 text-center md:py-32">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            The Dental Design
            <br />
            <span className="text-primary">Marketplace</span>
          </h1>
          <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg">
            Connect dental professionals with expert CAD/CAM designers. Post cases,
            receive proposals, review 3D designs, and pay securely — all in one platform.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-8 py-3 text-sm font-medium transition-colors"
            >
              Start Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/designers"
              className="hover:bg-muted inline-flex items-center gap-2 rounded-lg border px-8 py-3 text-sm font-medium transition-colors"
            >
              Browse Designers
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="bg-muted/30 border-t py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight">Everything you need</h2>
              <p className="text-muted-foreground mt-3">
                A complete platform for dental design collaboration
              </p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="bg-background rounded-lg border p-6"
                  >
                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                      <Icon className="text-primary h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground mt-2 text-sm">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
              <p className="text-muted-foreground mt-3">
                Four simple steps from case to completion
              </p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {HOW_IT_WORKS.map((item) => (
                <div key={item.step} className="text-center">
                  <div className="bg-primary text-primary-foreground mx-auto flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold">
                    {item.step}
                  </div>
                  <h3 className="mt-4 font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary text-primary-foreground border-t py-20">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Ready to get started?</h2>
            <p className="text-primary-foreground/80 mt-4">
              Join {APP_NAME} today and transform how you work with dental design.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/register"
                className="bg-background text-foreground hover:bg-background/90 inline-flex items-center gap-2 rounded-lg px-8 py-3 text-sm font-medium transition-colors"
              >
                Create Account <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 inline-flex items-center gap-2 rounded-lg border px-8 py-3 text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="text-muted-foreground mx-auto max-w-6xl px-4 text-center text-sm">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
