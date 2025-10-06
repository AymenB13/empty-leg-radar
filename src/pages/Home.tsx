import { Link } from "react-router-dom";
import { Plane, Zap, BarChart3, Clock, Target, Shield, Slack, Mail, Webhook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Plane className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">Empty Leg Radar</span>
          </div>
          <Link to="/login">
            <Button variant="ghost">Sign in</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 text-center">
        <Badge variant="secondary" className="mb-6">
          Private beta — 10 seats
        </Badge>
        <h1 className="text-5xl font-bold tracking-tight mb-6">
          Stop Missing Empty Legs
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Get alerted before the market moves. Plan smarter with simple, reliable patterns.
        </p>
        <div className="flex gap-4 justify-center mb-12">
          <Button size="lg" asChild>
            <a href="#cta">Request access</a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#demo">Watch 3-min demo</a>
          </Button>
        </div>
      </section>

      {/* Beta Pitch */}
      <section className="bg-muted/50 py-12">
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <p className="text-lg">
            <strong>No credit card.</strong> We connect 2–3 airports of your choice and you start getting live alerts. 
            In return: <strong>10 minutes of feedback.</strong>
          </p>
        </div>
      </section>

      {/* What You Get */}
      <section className="container mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center mb-12">What you get</h2>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Signals Live */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-primary" />
                <CardTitle>1) Signals Live — React first, not last</CardTitle>
              </div>
              <CardDescription>
                Clear, action-ready alerts when it actually matters.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Shield className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Part 135 (FAA) filtered: no personal aircraft, no cargo, less noise.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Readable reasons: quick turn, likely return-to-base, base distance.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Delivered where you work: Slack, email, webhook/API.</span>
                </li>
              </ul>
              
              <div className="bg-muted p-4 rounded-lg border border-border">
                <p className="text-xs font-semibold mb-2 text-muted-foreground">SAMPLE ALERT</p>
                <p className="text-sm">
                  "G650 N1234X just landed at KASE, departing to KVNY soon.
                  Part 135 confirmed. Empty-leg probability: 0.80.
                  Reasons: turn &lt; 60 min, likely RTB, base 320 NM."
                </p>
              </div>
              
              <p className="text-sm font-medium">
                <strong>Why it matters:</strong> The jet is about to go. You get the signal, call your client, 
                place the option—you're first.
              </p>
            </CardContent>
          </Card>

          {/* Pattern Intelligence */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <CardTitle>2) Pattern Intelligence — Stop guessing, start planning</CardTitle>
              </div>
              <CardDescription>
                Turn habits into pipeline.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Clock className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Hot hours by airport (UTC) to time your calls.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Tails that do frequent quick turns at your airports.</span>
                </li>
                <li className="flex items-start gap-2">
                  <BarChart3 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Routes that heat up by weekday/hour.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Turn p95 by aircraft to spot "sprinters."</span>
                </li>
              </ul>
              
              <p className="text-sm">Save watchlists, export CSV, use the API.</p>
              
              <div className="bg-muted p-4 rounded-lg border border-border">
                <p className="text-xs font-semibold mb-2 text-muted-foreground">REAL USE CASE</p>
                <p className="text-sm">
                  "Every Friday 16:00–20:00 at TEB, three Hawkers from operator X often RTB to PHL."
                  <br />
                  → Pre-target on Thursday. Be the first to propose—not the last to react.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-8">Built for brokers who are tired of noise</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="font-medium mb-2">Stop refreshing 10 tabs</p>
              <p className="text-sm text-muted-foreground">and scanning WhatsApp all day.</p>
            </div>
            <div>
              <p className="font-medium mb-2">See the signals that matter</p>
              <p className="text-sm text-muted-foreground">instead of chasing the same public feeds as everyone else.</p>
            </div>
            <div>
              <p className="font-medium mb-2">Win last-minute and prep ahead</p>
              <p className="text-sm text-muted-foreground">in one tool.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-6 py-24 max-w-4xl">
        <h2 className="text-3xl font-bold text-center mb-12">How it works (no fluff)</h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold flex-shrink-0">
              1
            </div>
            <p>We monitor the airports you choose.</p>
          </div>
          <div className="flex gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold flex-shrink-0">
              2
            </div>
            <p>We filter what's actually charterable (Part 135).</p>
          </div>
          <div className="flex gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold flex-shrink-0">
              3
            </div>
            <p>We detect quick turns, return-to-base, and recurring habits.</p>
          </div>
          <div className="flex gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold flex-shrink-0">
              4
            </div>
            <p>We compute a probability using aircraft, route, and airport behavior.</p>
          </div>
          <div className="flex gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold flex-shrink-0">
              5
            </div>
            <p>You get a clean alert, or browse patterns to plan ahead.</p>
          </div>
        </div>
        
        <div className="mt-12 p-6 bg-muted rounded-lg border border-border space-y-2 text-sm">
          <p><strong>Sources:</strong> public data only.</p>
          <p><strong>Current focus:</strong> N-reg + Part 135, US/EU first.</p>
          <p><strong>No tracking:</strong> zero personal tracking, no magic claims.</p>
        </div>
      </section>

      {/* Target Audience */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">Who it's for</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Brokers & dispatch</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">chasing real last-minute wins.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sales teams</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">who want a simple FOMO board to convert faster.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Managers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">who want watchlists, exports, and API to industrialize outreach.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Different */}
      <section className="container mx-auto px-6 py-24 max-w-4xl">
        <h2 className="text-3xl font-bold text-center mb-12">Why this is different</h2>
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Less noise, more wins</h3>
              <p className="text-sm text-muted-foreground">Part 135 filter + human-readable reasons.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Last-minute and upstream</h3>
              <p className="text-sm text-muted-foreground">live alerts plus planning patterns.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Five-minute setup</h3>
              <p className="text-sm text-muted-foreground">Slack, email, or webhook.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Integrations */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Integrations</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="text-center">
              <CardContent className="pt-6 pb-6">
                <Slack className="h-10 w-10 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-1">Slack</h3>
                <p className="text-xs text-muted-foreground">Dedicated channel</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6 pb-6">
                <Mail className="h-10 w-10 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-1">Email</h3>
                <p className="text-xs text-muted-foreground">Summary + deep link</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6 pb-6">
                <Webhook className="h-10 w-10 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-1">Webhook/API</h3>
                <p className="text-xs text-muted-foreground">JSON</p>
              </CardContent>
            </Card>
          </div>
          <div className="text-center">
            <Button variant="outline" asChild>
              <a href="#api-docs">View API docs</a>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-6 py-24 max-w-3xl">
        <h2 className="text-3xl font-bold text-center mb-12">FAQ</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="legal">
            <AccordionTrigger>Is this legal?</AccordionTrigger>
            <AccordionContent>
              Yes—public sources only, no personal data.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="guarantee">
            <AccordionTrigger>Does this "guarantee" an empty leg?</AccordionTrigger>
            <AccordionContent>
              No. It's a probability radar + patterns. You'll still see misses, but you'll be earlier and get less noise.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="coverage">
            <AccordionTrigger>What aircraft are covered?</AccordionTrigger>
            <AccordionContent>
              Priority N-reg + Part 135. Europe is expanding.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="setup">
            <AccordionTrigger>How long to set up?</AccordionTrigger>
            <AccordionContent>
              About 5 minutes: pick 2–3 airports, connect Slack/email/webhook, done.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="export">
            <AccordionTrigger>Can I export and connect my CRM?</AccordionTrigger>
            <AccordionContent>
              Yes—CSV and API. Save watchlists for your teams.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* Final CTA */}
      <section id="cta" className="bg-primary text-primary-foreground py-24">
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <h2 className="text-4xl font-bold mb-4">Try it on your airports this week</h2>
          <p className="text-lg mb-8 opacity-90">
            10 free beta seats. We set you up, you get live alerts and a starter pattern watchlist. 
            In return: 10 minutes of honest feedback.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/login">Request access</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2025 Empty Leg Radar. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
