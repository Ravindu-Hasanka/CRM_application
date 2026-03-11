import { Link } from 'react-router-dom'

const features = [
  {
    title: 'AI Forecasting',
    body: 'Predict future revenue with smart models built from historical patterns and sales activity.',
    icon: '↗',
  },
  {
    title: 'Unified Inbox',
    body: 'Manage all customer communication from email, SMS, and social channels in one place.',
    icon: '✉',
  },
  {
    title: 'Automated Workflows',
    body: 'Reduce manual work by automating repetitive follow-ups, tasks, and pipeline actions.',
    icon: '⚡',
  },
  {
    title: 'Team Collaboration',
    body: 'Keep teams aligned with shared notes, task ownership, and real-time updates.',
    icon: '👥',
  },
  {
    title: 'Advanced Reporting',
    body: 'Track performance, conversion rates, and pipeline health with clear visual reporting.',
    icon: '▣',
  },
  {
    title: 'Enterprise Security',
    body: 'Protect your data with access controls, audit logs, and enterprise-grade safeguards.',
    icon: '🛡',
  },
]

const metrics = [
  { value: '10k+', label: 'Businesses served' },
  { value: '99.9%', label: 'Platform uptime' },
  { value: '$2B+', label: 'Revenue tracked' },
  { value: '4.9/5', label: 'Customer rating' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main>
        <section className="px-6 pb-16 pt-16 md:pb-20 md:pt-20">
          <div className="mx-auto max-w-7xl text-center">
            <div className="mb-6 w-full flex flex-col items-center">
              <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-600">
              Now with AI-powered insights
            </span>

            <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-5xl md:text-6xl">
              Supercharge Your Sales
              <br />
              with <span className="text-blue-600">NexGen CRM</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-500 md:text-lg">
              The next-generation platform for managing customer relationships,
              streamlining workflows, and scaling your business with AI-driven
              insights.
            </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/register/subscription"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Start Your Free Trial →
              </Link>
              <Link
                to="/login"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:border-slate-300"
              >
                Watch Demo
              </Link>
            </div>

            <div className="mt-14 rounded-[28px] bg-[radial-gradient(circle_at_top_left,_#2c6274,_#183845_58%,_#132f3a_100%)] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.12)] md:p-12">
              <div className="mx-auto flex max-w-xl justify-center">
                <div className="w-full rounded-[28px] bg-[linear-gradient(180deg,#24343f_0%,#16252f_100%)] p-4 shadow-[0_30px_50px_rgba(0,0,0,0.35)]">
                  <div className="mb-4 flex gap-2">
                    <span className="h-2 w-2 rounded-full bg-white/30" />
                    <span className="h-2 w-2 rounded-full bg-white/30" />
                    <span className="h-2 w-2 rounded-full bg-white/30" />
                  </div>

                  <div className="overflow-hidden rounded-[20px] bg-slate-100">
                    <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                      <span className="font-semibold text-slate-900">Customer Return</span>
                      <span className="text-xs text-slate-500">Revenue</span>
                    </div>

                    <div className="flex h-56 items-end justify-between gap-2 bg-[linear-gradient(180deg,#1b3e4a,#274f5c)] px-5 pb-5 pt-6 md:gap-3">
                      {['28%', '38%', '22%', '46%', '64%', '40%', '72%', '52%', '60%'].map((height, i) => (
                        <span
                          key={i}
                          className="min-h-[28px] flex-1 rounded-t-[10px] bg-[linear-gradient(180deg,#93c5fd,#67e8f9)]"
                          style={{ height }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="px-6 py-16 md:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-2xl">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600">
                Powerful features
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
                Everything you need to grow
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-500">
                Discover why thousands of companies trust NexGen CRM to power
                their sales pipeline and automate their customer journey.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-1"
                >
                  <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-500">{feature.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-blue-600 px-6 py-10 text-white">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 text-center sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <article key={metric.label}>
                <h3 className="text-3xl font-extrabold">{metric.value}</h3>
                <p className="mt-2 text-sm text-white/85">{metric.label}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="pricing" className="px-6 py-16 md:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-4xl rounded-[28px] bg-[linear-gradient(135deg,#020617,#0f172a_50%,#0b2a63_100%)] px-6 py-14 text-center text-white shadow-[0_24px_50px_rgba(15,23,42,0.16)] md:px-10">
              <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
                Ready to transform your sales process?
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/75">
                Join 10,000+ businesses growing faster with NexGen CRM. No credit
                card required to start.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/register/subscription"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  Start Your 14-Day Free Trial
                </Link>
                <Link
                  to="/login"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-800 px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-700"
                >
                  Talk to Sales
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-6 pt-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 pb-10 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-3 text-sm font-bold text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm text-white shadow-sm">
                ✦
              </span>
              <span>NexGen CRM</span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-500">
              The world’s most intuitive CRM platform designed for modern sales
              teams. Scale faster with data-driven decisions.
            </p>

            <div className="mt-5 flex gap-3 text-slate-500">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200">
                ◉
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200">
                ◉
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200">
                ◉
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">Product</h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-500">
              <li><a href="#features" className="transition hover:text-blue-600">Features</a></li>
              <li><a href="#pricing" className="transition hover:text-blue-600">Pricing</a></li>
              <li><a href="#solutions" className="transition hover:text-blue-600">Integrations</a></li>
              <li><a href="#pricing" className="transition hover:text-blue-600">Enterprise</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">Company</h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-500">
              <li><a href="/" className="transition hover:text-blue-600">About Us</a></li>
              <li><a href="/" className="transition hover:text-blue-600">Careers</a></li>
              <li><a href="/" className="transition hover:text-blue-600">Blog</a></li>
              <li><a href="/" className="transition hover:text-blue-600">Press</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900">Resources</h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-500">
              <li><a href="/" className="transition hover:text-blue-600">Documentation</a></li>
              <li><a href="/" className="transition hover:text-blue-600">Help Center</a></li>
              <li><a href="/" className="transition hover:text-blue-600">Community</a></li>
              <li><a href="/" className="transition hover:text-blue-600">Security</a></li>
            </ul>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl flex-col gap-4 border-t border-slate-200 py-6 text-xs text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>© 2024 NEXGEN CRM. ALL RIGHTS RESERVED.</p>
          <div className="flex flex-wrap gap-4">
            <a href="/" className="transition hover:text-blue-600">PRIVACY POLICY</a>
            <a href="/" className="transition hover:text-blue-600">TERMS OF SERVICE</a>
            <a href="/" className="transition hover:text-blue-600">COOKIES</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
