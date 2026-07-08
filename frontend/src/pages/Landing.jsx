import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Orbit,
  Sparkles,
  Brain,
  BarChart3,
  MessageSquare,
  FileText,
  Presentation,
  Users,
  ArrowRight,
  Zap,
  Rocket,
  Shield,
  Github,
  Twitter,
  Linkedin,
  ChevronDown,
} from 'lucide-react';

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const FeatureCard = ({ icon: Icon, title, desc, tone = 'purple' }) => (
  <motion.div
    variants={fadeUp}
    className="to-card p-6 relative overflow-hidden group"
    data-testid={`feature-${title.toLowerCase().replace(/\s+/g, '-')}`}
  >
    <div
      className={`w-11 h-11 rounded-xl border border-white/10 flex items-center justify-center mb-5 ${
        tone === 'purple'
          ? 'bg-purple-500/10 text-purple-300'
          : tone === 'blue'
          ? 'bg-blue-500/10 text-blue-300'
          : 'bg-cyan-500/10 text-cyan-300'
      }`}
    >
      <Icon size={20} />
    </div>
    <h3 className="text-lg font-medium mb-2">{title}</h3>
    <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
    <div className="absolute -bottom-16 -right-16 w-40 h-40 rounded-full bg-purple-500/5 blur-2xl group-hover:bg-purple-500/10 transition-colors" />
  </motion.div>
);

const StepCard = ({ n, title, desc }) => (
  <motion.div variants={fadeUp} className="to-card p-6">
    <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 mb-3">Step {n}</div>
    <h3 className="text-lg font-medium mb-2">{title}</h3>
    <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
  </motion.div>
);

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="border-b border-white/5 py-5" data-testid={`faq-${q.slice(0, 10).replace(/\s+/g, '-')}`}>
      <button
        className="w-full flex items-center justify-between text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="font-medium">{q}</span>
        <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 text-sm text-slate-400 leading-relaxed"
        >
          {a}
        </motion.p>
      )}
    </div>
  );
};

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#0A0D14] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-40 to-glass border-b border-white/5">
        <div className="container-x flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-2" data-testid="landing-logo">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Orbit size={18} className="text-white" />
            </div>
            <span className="font-semibold tracking-tight">TeamOrbit</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
           {/* <a href="#stories" className="hover:text-white transition-colors">Stories</a> */}
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/auth/login" className="btn-ghost" data-testid="landing-login-cta">Sign in</Link>
            <Link to="/auth/signup" className="btn-primary" data-testid="landing-signup-cta">
              Get started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-glow relative">
        <div className="dotted-grid absolute inset-0 opacity-40 pointer-events-none" />
        <div className="container-x py-24 md:py-32 relative">
          <motion.div
            initial="initial"
            animate="animate"
            transition={{ staggerChildren: 0.08 }}
            className="max-w-4xl"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs mb-8"
            >
              <Sparkles size={12} className="text-purple-300" />
              <span>Built for academic projects, hackathons & capstone teams </span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="mb-6">
              Smart collaboration for <span className="serif-highlight text-gradient">student teams</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-slate-400 max-w-2xl mb-10 leading-relaxed">
              TeamOrbit fixes the messy parts of student project work — uneven contribution,
              last-minute presentations, missing docs, unclear ownership. AI helps you
              distribute tasks fairly, ship on time, and turn effort into evidence.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
              <Link to="/auth/signup" className="btn-primary" data-testid="hero-signup-cta">
                Start free <ArrowRight size={14} />
              </Link>
              <a href="#features" className="btn-secondary">Explore features</a>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              {[
                ['AI', 'Task distribution'],
                ['Real-time', 'Team chat'],
                ['Auto', 'Docs & slides'],
                ['Fair', 'Contribution score'],
              ].map(([k, v]) => (
                <div key={v} className="border-l border-white/10 pl-4">
                  <div className="text-2xl font-medium text-gradient-strong">{k}</div>
                  <div className="text-xs text-slate-500 mt-1">{v}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Preview card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-16 relative"
          >
            <div className="relative to-card p-2 max-w-5xl mx-auto glowing-ring">
              <div className="bg-[#0A0D14] rounded-xl p-6 md:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                  <div className="ml-4 text-xs text-slate-500">teamorbit.io/app · Dashboard</div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { title: 'Active projects', v: 4, icon: Rocket, tone: 'purple' },
                    { title: "Today's tasks", v: 12, icon: Zap, tone: 'blue' },
                    { title: 'Deadlines', v: 3, icon: Shield, tone: 'cyan' },
                  ].map((c) => (
                    <div key={c.title} className="to-card p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-xs text-slate-400">{c.title}</div>
                        <c.icon
                          size={16}
                          className={
                            c.tone === 'purple'
                              ? 'text-purple-300'
                              : c.tone === 'blue'
                              ? 'text-blue-300'
                              : 'text-cyan-300'
                          }
                        />
                      </div>
                      <div className="text-3xl font-medium">{c.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="section relative">
        <div className="container-x">
          <div className="max-w-3xl mb-14">
            <div className="text-[11px] uppercase tracking-[0.25em] text-slate-500 mb-3">Features</div>
            <h2 className="mb-4">Everything a student team actually needs — <span className="serif-highlight text-gradient">nothing they don't.</span></h2>
            <p className="text-slate-400 leading-relaxed">
              Built with the reality of college life in mind: irregular schedules, mixed skills,
              submissions due Sunday night, and a demo tomorrow.
            </p>
          </div>
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.06 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            <FeatureCard icon={Brain} title="AI Task Distribution" desc="Suggests the best member for every task based on skills & current workload — no more assigning the same task to the same person twice." />
            <FeatureCard icon={FileText} title="Meeting Notes → Tasks" desc="Paste your meeting transcript. TeamOrbit extracts action items, deadlines and creates them for you." tone="blue" />
            <FeatureCard icon={Presentation} title="Auto Presentation" desc="Generate a full slide deck for demo day — problem, solution, architecture, timeline, future scope." tone="cyan" />
            <FeatureCard icon={FileText} title="Auto Documentation" desc="README, project report, feature list, API docs, future scope — generated from your project context." />
            <FeatureCard icon={BarChart3} title="Contribution Analytics" desc="A fair, transparent score for every teammate. Say goodbye to 'that one member who did nothing.'" tone="blue" />
            <FeatureCard icon={MessageSquare} title="Team Chat & Kanban" desc="Chat + drag-and-drop Kanban board scoped to each project. Live updates, comments, checklists." tone="cyan" />
          </motion.div>
        </div>
      </section>

    {/* How it works */}
      <section id="how" className="section">
        <div className="container-x">
          <div className="max-w-3xl mb-14">
            <div className="text-[11px] uppercase tracking-[0.25em] text-slate-500 mb-3">How it works</div>
            <h2>Get from idea to submission in <span className="serif-highlight text-gradient">four steps.</span></h2>
          </div>
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.08 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            <StepCard n={1} title="Create your team" desc="Spin up a team, share the invite code, and get everyone on board in seconds." />
            <StepCard n={2} title="Add your project" desc="Describe the problem, tech stack and deadline. Set hackathon mode if the clock is ticking." />
            <StepCard n={3} title="Let AI distribute work" desc="Add tasks — TeamOrbit picks the right owner based on skills and open workload." />
            <StepCard n={4} title="Ship & document" desc="Track progress on Kanban. Generate README, slides and reports with one click." />
          </motion.div>
        </div>
      </section>

       {/* Stories --Sample*/}
      {/*<section id="stories" className="section">
        <div className="container-x">
          <div className="max-w-3xl mb-14">
            <div className="text-[11px] uppercase tracking-[0.25em] text-slate-500 mb-3">Student stories</div>
            <h2>Built with the teams who <span className="serif-highlight text-gradient">actually ship.</span></h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="to-card p-6 relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1639485527538-979deb8edd2f"
                alt="Hackathon team"
                className="w-full h-56 object-cover rounded-xl mb-6"
              />
              <p className="text-slate-300 leading-relaxed mb-4">
                "We used TeamOrbit for our 36-hour hackathon. The AI meeting-notes to tasks alone
                saved us two hours. We ranked in the top three."
              </p>
              <div className="text-sm">
                <div className="font-medium">Ananya S.</div>
                <div className="text-xs text-slate-500">CS Undergrad, VIT · Smart India Hackathon</div>
              </div>
            </div>
            <div className="to-card p-6 relative overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1702468049239-49fd1cf99d20"
                alt="Team on bench"
                className="w-full h-56 object-cover rounded-xl mb-6"
              />
              <p className="text-slate-300 leading-relaxed mb-4">
                "Contribution scores ended every 'who did what' argument. The auto-generated
                report was 80% of what we submitted."
              </p>
              <div className="text-sm">
                <div className="font-medium">Rohan M.</div>
                <div className="text-xs text-slate-500">Final Year Capstone · BITS Pilani</div>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* FAQ */}
      <section id="faq" className="section">
        <div className="container-x max-w-3xl">
          <div className="mb-10">
            <div className="text-[11px] uppercase tracking-[0.25em] text-slate-500 mb-3">FAQ</div>
            <h2>Answers before you ask.</h2>
          </div>
          <div>
            <FAQItem q="Is TeamOrbit free for students?" a="Yes. Every core feature is free for student teams working on academic projects and hackathons." />
            <FAQItem q="How does the AI task distribution work?" a="We look at each member's declared skills and their current open workload, then recommend the best owner for the new task — plus alternates." />
            <FAQItem q="Can we invite non-technical teammates?" a="Absolutely. Designers, content leads, project managers — everyone gets a profile with their own skills and the same fair contribution score." />
            <FAQItem q="Do you support real-time chat?" a="Yes — a project chat with live updates, read receipts and instant delivery is included with every project." />
            <FAQItem q="What happens after the semester ends?" a="Your project stays. Export docs, presentations, contribution scores, or archive it as a portfolio piece." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container-x">
          <div className="to-card p-10 md:p-16 text-center relative overflow-hidden glowing-ring">
            <div className="absolute inset-0 hero-glow opacity-60" />
            <div className="relative">
              <div className="text-[11px] uppercase tracking-[0.25em] text-slate-500 mb-4">Ready when you are</div>
              <h2 className="mb-4">Build the project you'll <span className="serif-highlight text-gradient">brag about.</span></h2>
              <p className="text-slate-400 max-w-xl mx-auto mb-8">
                Free to start. No credit card. Invite your team in under a minute.
              </p>
              <Link to="/auth/signup" className="btn-primary" data-testid="cta-signup">
                Create your team <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10">
        <div className="container-x flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Orbit size={16} className="text-purple-300" />
            <span>© {new Date().getFullYear()} TeamOrbit. For the students who actually ship.</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-white transition-colors"><Github size={16} /></a>
            <a href="#" className="hover:text-white transition-colors"><Twitter size={16} /></a>
            <a href="#" className="hover:text-white transition-colors"><Linkedin size={16} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
