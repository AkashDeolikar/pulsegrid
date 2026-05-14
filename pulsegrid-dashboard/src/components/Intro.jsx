// import { useState } from "react";
// import { motion } from "framer-motion";
// import {
//   Zap,
//   Brain,
//   Database,
//   BarChart3,
//   Wifi,
//   ShieldCheck,
//   Server,
//   Cpu,
//   Globe,
//   TrendingUp,
//   MessageSquare,
//   Users,
//   BookOpen,
//   Play,
//   Download,
//   Key,
//   Send,
//   Lock,
//   Clock,
//   Layers,
// } from "lucide-react";

// const HERO_ACTIONS = [
//   {
//     key: "dashboard",
//     label: "Launch Dashboard",
//     icon: <Play size={16} />,
//     variant: "primary",
//     aria: "Launch dashboard",
//   },
//   {
//     key: "docs",
//     label: "Read Docs",
//     icon: <BookOpen size={16} />,
//     variant: "secondary",
//     aria: "Read documentation",
//   },
// ];

// const HERO_STATS = [
//   { label: "Events/sec", value: "1.2M+", icon: <Server size={18} color="#5b6cf4" /> },
//   { label: "P99 Latency", value: "42ms", icon: <Cpu size={18} color="#22c55e" /> },
//   { label: "Uptime", value: "99.98%", icon: <Globe size={18} color="#f59e0b" /> },
// ];

// const featureCards = [
//   { icon: <Zap size={20} />, title: "Real-Time Delivery", description: "Instant event propagation over WebSocket and Redis pub/sub." },
//   { icon: <Brain size={20} />, title: "Priority Routing", description: "AI-powered urgent/normal/low classification for every event." },
//   { icon: <Database size={20} />, title: "Offline Replay", description: "Replay missed events after reconnect using durable Postgres storage." },
//   { icon: <BarChart3 size={20} />, title: "Visibility & Metrics", description: "Built-in observability for latency, throughput, and anomalies." },
//   { icon: <ShieldCheck size={20} />, title: "Reliable Delivery", description: "Write-ahead durability and fault-tolerant queue processing." },
//   { icon: <Layers size={20} />, title: "Scalable Architecture", description: "Multi-tier event pipeline for consistent performance at scale." },
// ];

// const useCaseCards = [
//   { icon: <TrendingUp size={20} />, title: "E-Commerce", description: "Order updates, payment events, and inventory sync in real time." },
//   { icon: <MessageSquare size={20} />, title: "Notifications", description: "Critical alerts and user messages delivered with priority." },
//   { icon: <Users size={20} />, title: "Ride Sharing", description: "Driver assignments and trip status updates with guaranteed delivery." },
//   { icon: <Lock size={20} />, title: "Security", description: "Anomaly alerts and audit events processed safely and quickly." },
//   { icon: <Globe size={20} />, title: "Analytics", description: "High-volume event streams for real-time business intelligence." },
//   { icon: <Database size={20} />, title: "Data Pipelines", description: "Reliable event capture, replay, and downstream processing." },
// ];

// const quickStartSteps = [
//   { number: "01", title: "Sign Up", description: "Create an account and configure your workspace.", icon: <Users size={18} /> },
//   { number: "02", title: "Generate API Keys", description: "Issue credentials for secure application access.", icon: <Key size={18} /> },
//   { number: "03", title: "Connect WebSocket", description: "Open a JWT-authenticated realtime session.", icon: <Wifi size={18} /> },
//   { number: "04", title: "Publish Events", description: "Send event payloads from your app or backend.", icon: <Send size={18} /> },
//   { number: "05", title: "Subscribe", description: "Listen to topic streams and receive updates instantly.", icon: <Download size={18} /> },
//   { number: "06", title: "Monitor", description: "Inspect metrics, queues, and replay history.", icon: <Clock size={18} /> },
// ];

// const pipelineSteps = [
//   "Producer",
//   "API Gateway",
//   "AI Classifier",
//   "Priority Queues",
//   "Worker Pools",
//   "Redis Pub/Sub",
//   "WebSocket Delivery",
//   "Offline Replay",
// ];

// const pipelineCopy = [
//   "Events are created by services and apps.",
//   "Requests are authenticated, validated, and routed.",
//   "AI classifies each event by urgency.",
//   "Events are placed into dedicated priority queues.",
//   "Workers process each queue independently.",
//   "Redis pub/sub broadcasts events to subscribers.",
//   "WebSocket clients receive live updates instantly.",
//   "Disconnected clients replay missed events on reconnect.",
// ];

// const faqItems = [
//   { question: "What is PulseGrid for?", answer: "PulseGrid is a complete event delivery platform for realtime apps. It combines priority routing, WebSocket streaming, and durable replay so your users never miss critical updates." },
//   { question: "Can it handle high volume?", answer: "Yes. The architecture is designed for high throughput and low latency, with separate queues for urgent, normal, and low-priority events." },
//   { question: "How does offline replay work?", answer: "Events are stored in PostgreSQL and replayed automatically when a subscriber reconnects, ensuring no lost messages." },
//   { question: "Is it secure?", answer: "All WebSocket connections and API calls are JWT authenticated. Data is protected during transport and when persisted." },
//   { question: "What integration options exist?", answer: "PulseGrid supports REST publishing, WebSocket subscriptions, and can be connected to any backend or frontend through standard APIs." },
// ];

// const liveEvents = [
//   { time: "12:04:11", topic: "payment.completed", priority: "urgent" },
//   { time: "12:04:12", topic: "driver.assigned", priority: "urgent" },
//   { time: "12:04:13", topic: "email.sent", priority: "low" },
//   { time: "12:04:14", topic: "analytics.batch", priority: "low" },
//   { time: "12:04:15", topic: "order.created", priority: "normal" },
// ];

// const priorityStyles = {
//   urgent: { color: "#ef4444", borderColor: "#ef4444" },
//   normal: { color: "#5b6cf4", borderColor: "#5b6cf4" },
//   low: { color: "#22c55e", borderColor: "#22c55e" },
// };

// function PageSection({ title, children }) {
//   return (
//     <section style={styles.section}>
//       <h2 style={styles.sectionHeading}>{title}</h2>
//       {children}
//     </section>
//   );
// }

// function ActionButton({ label, icon, variant, aria }) {
//   return (
//     <button type="button" style={{ ...styles.buttonBase, ...(variant === "primary" ? styles.primaryButton : styles.secondaryButton) }} aria-label={aria}>
//       {icon}
//       {label}
//     </button>
//   );
// }

// function DataCard({ icon, title, description }) {
//   return (
//     <motion.div whileHover={{ y: -6 }} style={styles.infoCard}>
//       <div style={styles.cardIcon}>{icon}</div>
//       <h3 style={styles.cardTitle}>{title}</h3>
//       <p style={styles.cardText}>{description}</p>
//     </motion.div>
//   );
// }

// export default function Intro() {
//   const [expandedFaq, setExpandedFaq] = useState(null);

//   return (
//     <main style={styles.page}>
//       <div style={styles.glowOne} />
//       <div style={styles.glowTwo} />

//       <section style={styles.heroSection}>
//         <div style={styles.heroContent}>
//           <span style={styles.badge}>Realtime Event Platform</span>
//           <h1 style={styles.heroTitle}>Build event systems that never drop a message.</h1>
//           <p style={styles.heroDescription}>
//             PulseGrid delivers intelligent, priority-based event routing with real-time WebSocket fan-out, durable replay, and observability for modern applications.
//           </p>

//           <div style={styles.heroButtons}>
//             {HERO_ACTIONS.map((action) => (
//               <ActionButton key={action.key} label={action.label} icon={action.icon} variant={action.variant} aria={action.aria} />
//             ))}
//           </div>

//           <div style={styles.heroStats}>
//             {HERO_STATS.map((stat) => (
//               <div key={stat.label} style={styles.statCard}>
//                 {stat.icon}
//                 <div style={styles.statValue}>{stat.value}</div>
//                 <div style={styles.statLabel}>{stat.label}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       <PageSection title="What PulseGrid Provides">
//         <div style={styles.cardGrid}>
//           <DataCard icon={<Zap size={24} />} title="Purpose" description="A single platform for event publishing, priority routing, real-time delivery, and offline replay." />
//           <DataCard icon={<Layers size={24} />} title="How It Works" description="Events are classified, queued, and delivered instantly over WebSocket while being stored for replay." />
//           <DataCard icon={<ShieldCheck size={24} />} title="Why Use It" description="Avoid missed notifications, simplify event infrastructure, and get deep visibility into delivery health." />
//         </div>
//       </PageSection>

//       <PageSection title="Core Features">
//         <div style={styles.featureGrid}>
//           {featureCards.map((feature) => (
//             <motion.article key={feature.title} whileHover={{ y: -6 }} style={styles.featureCard}>
//               <div style={styles.featureIcon}>{feature.icon}</div>
//               <h3 style={styles.featureTitle}>{feature.title}</h3>
//               <p style={styles.featureText}>{feature.description}</p>
//             </motion.article>
//           ))}
//         </div>
//       </PageSection>

//       <PageSection title="Built for Real Use Cases">
//         <div style={styles.useCaseGrid}>
//           {useCaseCards.map((item) => (
//             <motion.article key={item.title} whileHover={{ y: -6 }} style={styles.useCaseCard}>
//               <div style={styles.useCaseIcon}>{item.icon}</div>
//               <h3 style={styles.useCaseTitle}>{item.title}</h3>
//               <p style={styles.useCaseText}>{item.description}</p>
//             </motion.article>
//           ))}
//         </div>
//       </PageSection>

//       <PageSection title="Live Event Stream">
//         <div style={styles.streamCard}>
//           {liveEvents.map((event) => (
//             <div key={`${event.time}-${event.topic}`} style={styles.streamRow}>
//               <div style={styles.streamInfo}>
//                 <span style={styles.streamTime}>{event.time}</span>
//                 <span style={styles.streamTopic}>{event.topic}</span>
//               </div>
//               <span style={{ ...styles.priorityPill, ...priorityStyles[event.priority] }}>{event.priority}</span>
//             </div>
//           ))}
//         </div>
//         <div style={styles.priorityLegend}>
//           <div style={styles.legendItem}><span style={{ ...styles.legendDot, background: "#ef4444" }} />Urgent</div>
//           <div style={styles.legendItem}><span style={{ ...styles.legendDot, background: "#5b6cf4" }} />Normal</div>
//           <div style={styles.legendItem}><span style={{ ...styles.legendDot, background: "#22c55e" }} />Low</div>
//         </div>
//       </PageSection>

//       <PageSection title="Getting Started">
//         <div style={styles.quickGrid}>
//           {quickStartSteps.map((step) => (
//             <motion.article key={step.number} whileHover={{ y: -6 }} style={styles.quickCard}>
//               <div style={styles.stepBadge}>{step.number}</div>
//               <div style={styles.stepIcon}>{step.icon}</div>
//               <h3 style={styles.stepTitle}>{step.title}</h3>
//               <p style={styles.stepText}>{step.description}</p>
//             </motion.article>
//           ))}
//         </div>
//       </PageSection>

//       <PageSection title="Integration Examples">
//         <div style={styles.codeGrid}>
//           <article style={styles.codeCard}>
//             <h3 style={styles.codeTitle}>Connect WebSocket</h3>
//             <pre style={styles.codeBlock}>{`const ws = new WebSocket('wss://your-api.pulsegrid.dev');
// ws.onopen = () => {
//   ws.send(JSON.stringify({ type: 'AUTHENTICATE', token: JWT_TOKEN }));
// };
// ws.onmessage = (event) => {
//   const payload = JSON.parse(event.data);
//   handleEvent(payload);
// };`}</pre>
//           </article>
//           <article style={styles.codeCard}>
//             <h3 style={styles.codeTitle}>Publish Events</h3>
//             <pre style={styles.codeBlock}>{`fetch('https://your-api.pulsegrid.dev/publish', {
//   method: 'POST',
//   headers: {
//     Authorization: 'Bearer ' + API_KEY,
//     'Content-Type': 'application/json',
//   },
//   body: JSON.stringify({
//     topic: 'payment.completed',
//     priority: 'urgent',
//     payload: { amount: 5000, currency: 'INR' },
//   }),
// });`}</pre>
//           </article>
//         </div>
//       </PageSection>

//       <PageSection title="How PulseGrid Works">
//         <div style={styles.pipelineGrid}>
//           {pipelineSteps.map((step, index) => (
//             <article key={step} style={styles.pipelineStep}>
//               <div style={styles.pipelineCircle}>{index + 1}</div>
//               <div>
//                 <h3 style={styles.pipelineTitle}>{step}</h3>
//                 <p style={styles.pipelineText}>{pipelineCopy[index]}</p>
//               </div>
//             </article>
//           ))}
//         </div>
//       </PageSection>

//       <PageSection title="Frequently Asked Questions">
//         <div style={styles.faqGrid}>
//           {faqItems.map((item, index) => (
//             <article key={item.question} style={styles.faqCard}>
//               <button
//                 type="button"
//                 style={styles.faqButton}
//                 aria-expanded={expandedFaq === index}
//                 aria-controls={`faq-answer-${index}`}
//                 onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
//               >
//                 <span>{item.question}</span>
//                 <span>{expandedFaq === index ? "-" : "+"}</span>
//               </button>
//               {expandedFaq === index && (
//                 <p id={`faq-answer-${index}`} style={styles.faqAnswer}>{item.answer}</p>
//               )}
//             </article>
//           ))}
//         </div>
//       </PageSection>

//       <section style={styles.ctaSection}>
//         <div style={styles.ctaContent}>
//           <h2 style={styles.ctaTitle}>Ready to build reliable realtime event systems?</h2>
//           <p style={styles.ctaDescription}>Start with PulseGrid and get real-time delivery, priority routing, and observability in one platform.</p>
//           <div style={styles.ctaButtons}>
//             <ActionButton label="Start Free Trial" icon={null} variant="primary" aria="Start free trial" />
//             <ActionButton label="Explore Docs" icon={null} variant="secondary" aria="Explore documentation" />
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// }

// const styles = {
//   page: {
//     position: "relative",
//     background: "#050816",
//     color: "#e2e8f0",
//     fontFamily: "Inter, system-ui, sans-serif",
//     minHeight: "100%",
//     overflowX: "hidden",
//     paddingBottom: "80px",
//   },
//   glowOne: {
//     position: "absolute",
//     width: "500px",
//     height: "500px",
//     borderRadius: "50%",
//     background: "rgba(91,108,244,0.16)",
//     filter: "blur(120px)",
//     top: "-180px",
//     left: "-120px",
//     zIndex: 0,
//   },
//   glowTwo: {
//     position: "absolute",
//     width: "450px",
//     height: "450px",
//     borderRadius: "50%",
//     background: "rgba(34,197,94,0.14)",
//     filter: "blur(120px)",
//     bottom: "-180px",
//     right: "-120px",
//     zIndex: 0,
//   },
//   heroSection: {
//     position: "relative",
//     zIndex: 1,
//     padding: "100px 24px 60px",
//   },
//   heroContent: {
//     maxWidth: "1100px",
//     margin: "0 auto",
//   },
//   badge: {
//     display: "inline-flex",
//     alignItems: "center",
//     background: "rgba(91,108,244,0.12)",
//     color: "#7c8cff",
//     borderRadius: "999px",
//     padding: "10px 16px",
//     fontSize: "13px",
//     fontWeight: 700,
//     marginBottom: "24px",
//   },
//   heroTitle: {
//     fontSize: "4rem",
//     lineHeight: 1.05,
//     margin: 0,
//     maxWidth: "900px",
//     background: "linear-gradient(90deg, #ffffff, #5b6cf4)",
//     WebkitBackgroundClip: "text",
//     WebkitTextFillColor: "transparent",
//   },
//   heroDescription: {
//     marginTop: "24px",
//     fontSize: "1.05rem",
//     maxWidth: "760px",
//     lineHeight: 1.8,
//     color: "#94a3b8",
//   },
//   heroButtons: {
//     display: "flex",
//     flexWrap: "wrap",
//     gap: "16px",
//     marginTop: "32px",
//   },
//   buttonBase: {
//     display: "inline-flex",
//     alignItems: "center",
//     gap: "10px",
//     borderRadius: "14px",
//     padding: "14px 24px",
//     border: "none",
//     cursor: "pointer",
//     fontWeight: 700,
//     transition: "all 0.18s ease",
//   },
//   primaryButton: {
//     background: "#5b6cf4",
//     color: "#ffffff",
//     boxShadow: "0 20px 50px rgba(91,108,244,0.24)",
//   },
//   secondaryButton: {
//     background: "rgba(13,13,26,0.95)",
//     color: "#d4d4ff",
//     border: "1px solid #2d2e4a",
//   },
//   heroStats: {
//     display: "grid",
//     gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
//     gap: "18px",
//     marginTop: "40px",
//   },
//   statCard: {
//     background: "rgba(13,13,26,0.75)",
//     border: "1px solid #181830",
//     borderRadius: "20px",
//     padding: "22px",
//     display: "flex",
//     flexDirection: "column",
//     gap: "12px",
//   },
//   statValue: {
//     fontSize: "2rem",
//     fontWeight: 900,
//   },
//   statLabel: {
//     color: "#94a3b8",
//     fontSize: "0.95rem",
//   },
//   section: {
//     position: "relative",
//     zIndex: 1,
//     padding: "80px 24px",
//   },
//   sectionHeading: {
//     fontSize: "2.4rem",
//     marginBottom: "24px",
//     fontWeight: 900,
//     maxWidth: "840px",
//     background: "linear-gradient(90deg, #ffffff, #5b6cf4)",
//     WebkitBackgroundClip: "text",
//     WebkitTextFillColor: "transparent",
//   },
//   cardGrid: {
//     display: "grid",
//     gap: "20px",
//     gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
//   },
//   infoCard: {
//     background: "rgba(13,13,26,0.75)",
//     border: "1px solid #181830",
//     borderRadius: "20px",
//     padding: "28px",
//     minHeight: "220px",
//   },
//   cardIcon: {
//     width: "52px",
//     height: "52px",
//     display: "grid",
//     placeItems: "center",
//     borderRadius: "18px",
//     background: "rgba(91,108,244,0.12)",
//     color: "#5b6cf4",
//     marginBottom: "18px",
//   },
//   cardTitle: {
//     fontSize: "1.35rem",
//     marginBottom: "12px",
//     fontWeight: 800,
//   },
//   cardText: {
//     color: "#94a3b8",
//     lineHeight: 1.75,
//   },
//   featureGrid: {
//     display: "grid",
//     gap: "20px",
//     gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
//   },
//   featureCard: {
//     background: "rgba(13,13,26,0.75)",
//     border: "1px solid #181830",
//     borderRadius: "20px",
//     padding: "28px",
//     transition: "transform 0.2s ease",
//   },
//   featureIcon: {
//     width: "46px",
//     height: "46px",
//     display: "grid",
//     placeItems: "center",
//     borderRadius: "16px",
//     background: "rgba(91,108,244,0.12)",
//     color: "#5b6cf4",
//     marginBottom: "16px",
//   },
//   featureTitle: {
//     fontSize: "1.15rem",
//     marginBottom: "10px",
//     fontWeight: 800,
//   },
//   featureText: {
//     color: "#94a3b8",
//     lineHeight: 1.75,
//   },
//   useCaseGrid: {
//     display: "grid",
//     gap: "20px",
//     gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
//   },
//   useCaseCard: {
//     background: "rgba(13,13,26,0.75)",
//     border: "1px solid #181830",
//     borderRadius: "20px",
//     padding: "28px",
//   },
//   useCaseIcon: {
//     width: "46px",
//     height: "46px",
//     display: "grid",
//     placeItems: "center",
//     borderRadius: "16px",
//     background: "rgba(91,108,244,0.12)",
//     color: "#5b6cf4",
//     marginBottom: "16px",
//   },
//   useCaseTitle: {
//     fontSize: "1.15rem",
//     marginBottom: "10px",
//     fontWeight: 800,
//   },
//   useCaseText: {
//     color: "#94a3b8",
//     lineHeight: 1.75,
//   },
//   streamCard: {
//     background: "rgba(13,13,26,0.85)",
//     border: "1px solid #181830",
//     borderRadius: "20px",
//     padding: "20px",
//   },
//   streamRow: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: "18px 16px",
//     borderBottom: "1px solid #16172d",
//   },
//   streamInfo: {
//     display: "flex",
//     gap: "16px",
//     alignItems: "center",
//   },
//   streamTime: {
//     fontFamily: "monospace",
//     color: "#94a3b8",
//     fontSize: "0.9rem",
//     minWidth: "90px",
//   },
//   streamTopic: {
//     fontWeight: 700,
//   },
//   priorityPill: {
//     padding: "8px 14px",
//     borderRadius: "999px",
//     fontSize: "0.8rem",
//     fontWeight: 700,
//     textTransform: "uppercase",
//     border: "1px solid",
//   },
//   priorityLegend: {
//     display: "flex",
//     gap: "18px",
//     flexWrap: "wrap",
//     marginTop: "18px",
//     color: "#94a3b8",
//   },
//   legendItem: {
//     display: "flex",
//     alignItems: "center",
//     gap: "8px",
//     fontSize: "0.95rem",
//   },
//   legendDot: {
//     width: "12px",
//     height: "12px",
//     borderRadius: "50%",
//   },
//   quickGrid: {
//     display: "grid",
//     gap: "20px",
//     gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
//   },
//   quickCard: {
//     background: "rgba(13,13,26,0.75)",
//     border: "1px solid #181830",
//     borderRadius: "20px",
//     padding: "28px",
//   },
//   stepBadge: {
//     width: "40px",
//     height: "40px",
//     borderRadius: "50%",
//     background: "#5b6cf4",
//     color: "white",
//     display: "grid",
//     placeItems: "center",
//     fontWeight: 900,
//     marginBottom: "16px",
//   },
//   stepIcon: {
//     color: "#5b6cf4",
//     marginBottom: "16px",
//   },
//   stepTitle: {
//     fontSize: "1.1rem",
//     marginBottom: "10px",
//     fontWeight: 800,
//   },
//   stepText: {
//     color: "#94a3b8",
//     lineHeight: 1.75,
//   },
//   codeGrid: {
//     display: "grid",
//     gap: "20px",
//     gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
//   },
//   codeCard: {
//     background: "rgba(13,13,26,0.9)",
//     border: "1px solid #181830",
//     borderRadius: "20px",
//     padding: "24px",
//   },
//   codeTitle: {
//     fontSize: "1.1rem",
//     marginBottom: "14px",
//     fontWeight: 800,
//   },
//   codeBlock: {
//     background: "#020617",
//     border: "1px solid #1a1f3b",
//     borderRadius: "14px",
//     padding: "18px",
//     fontFamily: "JetBrains Mono, monospace",
//     fontSize: "0.9rem",
//     color: "#cbd5e1",
//     overflowX: "auto",
//     lineHeight: 1.6,
//     whiteSpace: "pre",
//   },
//   pipelineGrid: {
//     display: "grid",
//     gap: "18px",
//   },
//   pipelineStep: {
//     display: "grid",
//     gridTemplateColumns: "48px 1fr",
//     gap: "18px",
//     alignItems: "flex-start",
//     background: "rgba(13,13,26,0.75)",
//     border: "1px solid #181830",
//     borderRadius: "20px",
//     padding: "24px",
//   },
//   pipelineCircle: {
//     width: "48px",
//     height: "48px",
//     borderRadius: "50%",
//     background: "#5b6cf4",
//     color: "white",
//     display: "grid",
//     placeItems: "center",
//     fontWeight: 900,
//   },
//   pipelineTitle: {
//     margin: 0,
//     fontSize: "1.1rem",
//     fontWeight: 800,
//   },
//   pipelineText: {
//     color: "#94a3b8",
//     marginTop: "10px",
//     lineHeight: 1.75,
//   },
//   faqGrid: {
//     display: "grid",
//     gap: "16px",
//   },
//   faqCard: {
//     background: "rgba(13,13,26,0.75)",
//     border: "1px solid #181830",
//     borderRadius: "18px",
//     overflow: "hidden",
//   },
//   faqButton: {
//     width: "100%",
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: "20px",
//     background: "transparent",
//     border: "none",
//     color: "#e2e8f0",
//     fontSize: "1rem",
//     cursor: "pointer",
//     fontWeight: 700,
//   },
//   faqAnswer: {
//     padding: "0 20px 20px 20px",
//     color: "#94a3b8",
//     lineHeight: 1.8,
//   },
//   ctaSection: {
//     marginTop: "40px",
//     padding: "80px 24px",
//     background: "rgba(13,13,26,0.85)",
//     border: "1px solid #181830",
//     borderRadius: "30px",
//     maxWidth: "1080px",
//     marginLeft: "auto",
//     marginRight: "auto",
//   },
//   ctaContent: {
//     textAlign: "center",
//   },
//   ctaTitle: {
//     fontSize: "3rem",
//     margin: 0,
//     lineHeight: 1.05,
//     maxWidth: "860px",
//     marginLeft: "auto",
//     marginRight: "auto",
//     background: "linear-gradient(90deg, #ffffff, #5b6cf4)",
//     WebkitBackgroundClip: "text",
//     WebkitTextFillColor: "transparent",
//   },
//   ctaDescription: {
//     marginTop: "20px",
//     color: "#94a3b8",
//     fontSize: "1.1rem",
//     lineHeight: 1.8,
//     maxWidth: "720px",
//     marginLeft: "auto",
//     marginRight: "auto",
//   },
//   ctaButtons: {
//     display: "flex",
//     justifyContent: "center",
//     gap: "16px",
//     flexWrap: "wrap",
//     marginTop: "30px",
//   },
// };



import { useState, useEffect, useRef } from "react";

// ── Data ─────────────────────────────────────────────────────────

const FEATURES = [
  {
    id: "realtime",
    icon: "⚡",
    title: "Real-Time Delivery",
    sub: "WebSocket + Redis Pub/Sub",
    desc: "Events fan out to all subscribers across any number of server instances in under 5ms. Persistent connections, zero polling, horizontally scalable from day one.",
    stat: "< 5ms",
    statLabel: "avg delivery",
    color: "#5b6cf4",
  },
  {
    id: "classifier",
    icon: "🧠",
    title: "AI Priority Classifier",
    sub: "Two-path routing engine",
    desc: "Fast path matches topic patterns in O(1). Slow path scores payload using weighted keyword matching and numeric heuristics. Every decision returns source + confidence.",
    stat: "100%",
    statLabel: "auditable",
    color: "#a78bfa",
  },
  {
    id: "queue",
    icon: "📦",
    title: "3-Tier Priority Queue",
    sub: "BullMQ · urgent / normal / low",
    desc: "Three isolated queues with separate worker pools. 50,000 low-priority analytics jobs have zero impact on urgent payment delivery. Independent scaling per tier.",
    stat: "3×",
    statLabel: "isolated queues",
    color: "#38bdf8",
  },
  {
    id: "offline",
    icon: "🔄",
    title: "Offline Sync Engine",
    sub: "Zero message loss guarantee",
    desc: "Disconnected subscribers get events queued idempotently in PostgreSQL. On reconnect: SYNC_START → ordered replay → SYNC_COMPLETE. Clear-after-delivery, never before.",
    stat: "0",
    statLabel: "messages lost",
    color: "#34d399",
  },
  {
    id: "anomaly",
    icon: "📊",
    title: "Z-Score Anomaly Detection",
    sub: "Statistical spike detection",
    desc: "Rolling 30-minute throughput window. Z ≥ 2.0 triggers warning alerts broadcast live over WebSocket. Z ≥ 3.0 is critical — 0.3% probability of normal variation.",
    stat: "30min",
    statLabel: "rolling window",
    color: "#fb923c",
  },
  {
    id: "observability",
    icon: "🛡",
    title: "Full Observability",
    sub: "P50 · P95 · P99 latency",
    desc: "11-page React dashboard: live event feed, queue console, anomaly center, topic explorer, API playground. SLA tracking with breach detection built in.",
    stat: "11",
    statLabel: "dashboard pages",
    color: "#f472b6",
  },
];

const FLOW_STEPS = [
  { n: "01", label: "Producer publishes",  desc: "Any service POSTs an event with topic + JSON payload" },
  { n: "02", label: "Classifier runs",     desc: "AI assigns urgent / normal / low priority from payload patterns" },
  { n: "03", label: "Write-ahead persist", desc: "Event saved to PostgreSQL before Redis — durability guaranteed" },
  { n: "04", label: "Queue enqueued",      desc: "BullMQ routes to the correct priority queue" },
  { n: "05", label: "Worker delivers",     desc: "Redis pub/sub fans out to all subscribed WebSocket connections" },
  { n: "06", label: "Offline handled",     desc: "Missed events queued for replay on reconnect — zero loss" },
];

const STACK = [
  { label: "Node.js 20",    role: "Runtime"          },
  { label: "Express.js",    role: "HTTP server"       },
  { label: "WebSockets",    role: "Real-time layer"   },
  { label: "Redis 7",       role: "Pub/Sub + cache"   },
  { label: "BullMQ",        role: "Priority queues"   },
  { label: "PostgreSQL 16", role: "Durable store"     },
  { label: "React 18",      role: "Dashboard"         },
  { label: "Docker",        role: "Containerisation"  },
  { label: "GitHub Actions",role: "CI/CD"             },
  { label: "Railway",       role: "Deployment"        },
];

const DECISIONS = [
  {
    q: "Why ws over Socket.io?",
    a: "Socket.io hides the distributed systems complexity this project exists to demonstrate. ws is transparent — every line does exactly what you think it does.",
  },
  {
    q: "Why 3 separate queues?",
    a: "Separate worker pools mean a backlog of 50k analytics jobs has zero impact on urgent payment delivery. One shared queue shares worker threads regardless of priority numbers.",
  },
  {
    q: "Why write to PostgreSQL before Redis?",
    a: "Write-ahead durability. If Redis publish fails, the event exists in the DB and can be retried. Publishing to Redis first creates ghost events with no audit trail.",
  },
  {
    q: "Why clear offline queue after delivery?",
    a: "If cleared before delivery and the socket drops mid-replay, those events are permanently lost. Clear-after means the next reconnect starts replay from scratch.",
  },
];

// ── Hooks ────────────────────────────────────────────────────────

function useInView(ref, threshold = 0.15) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return visible;
}

// ── Animated section wrapper ─────────────────────────────────────
function Reveal({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const vis = useInView(ref);
  return (
    <div
      ref={ref}
      style={{
        opacity:    vis ? 1 : 0,
        transform:  vis ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Live event ticker (fake but realistic) ───────────────────────
const TICKER_EVENTS = [
  { topic:"payments",  priority:"urgent", payload:'{"txId":"T-9921","amount":25000,"status":"failed"}' },
  { topic:"orders",    priority:"normal", payload:'{"orderId":"ORD-447","item":"MacBook Pro"}' },
  { topic:"analytics", priority:"low",    payload:'{"sessions":1204,"pageViews":8820}' },
  { topic:"alerts",    priority:"urgent", payload:'{"service":"auth-api","error":"timeout"}' },
  { topic:"inventory", priority:"normal", payload:'{"sku":"PRD-112","stock":0,"reorder":true}' },
  { topic:"payments",  priority:"urgent", payload:'{"txId":"T-9922","amount":4200,"status":"success"}' },
  { topic:"logs",      priority:"low",    payload:'{"level":"info","msg":"health check passed"}' },
  { topic:"dispatch",  priority:"urgent", payload:'{"driverId":"D-44","orderId":"ORD-448","eta":8}' },
];

const P_COLOR = {
  urgent: { color:"#ef4444", bg:"#1a0808", border:"#2a1010" },
  normal: { color:"#63b3ed", bg:"#08101a", border:"#10182a" },
  low:    { color:"#22c55e", bg:"#081408", border:"#101e10" },
};

function LiveTicker() {
  const [items, setItems] = useState([]);
  const [idx,   setIdx]   = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const evt = TICKER_EVENTS[idx % TICKER_EVENTS.length];
      setItems(prev => [{ ...evt, id: Date.now(), at: new Date().toLocaleTimeString() }, ...prev].slice(0, 6));
      setIdx(i => i + 1);
    }, 1400);
    return () => clearInterval(interval);
  }, [idx]);

  return (
    <div style={T.wrap}>
      <div style={T.header}>
        <div style={T.headerDot} />
        <span style={T.headerLabel}>Live Event Feed</span>
        <span style={T.headerCount}>{items.length} events</span>
      </div>
      <div style={T.list}>
        {items.map((evt, i) => {
          const pc = P_COLOR[evt.priority];
          return (
            <div key={evt.id} style={{ ...T.item, opacity: 1 - i * 0.12, animationDelay:`${i * 60}ms` }} className="ticker-item">
              <span style={T.time}>{evt.at}</span>
              <span style={T.topic}>{evt.topic}</span>
              <span style={{ ...T.badge, background:pc.bg, border:`1px solid ${pc.border}`, color:pc.color }}>
                {evt.priority}
              </span>
              <span style={T.payload}>{evt.payload.slice(0, 38)}…</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function LandingPage({ onEnterApp }) {
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeDecision, setActiveDecision] = useState(0);
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Auto-cycle features
  useEffect(() => {
    const t = setInterval(() => setActiveFeature(f => (f + 1) % FEATURES.length), 3500);
    return () => clearInterval(t);
  }, []);

  const feat = FEATURES[activeFeature];

  return (
    <div style={L.root}>

      {/* ── Background grid ── */}
      <div style={L.gridBg} aria-hidden="true" />
      <div style={L.gradientBg} aria-hidden="true" />

      {/* ══════════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════════ */}
      <section style={L.hero}>

        {/* Nav */}
        <nav style={L.nav}>
          <div style={L.navLogo}>⚡ PulseGrid</div>
          <div style={L.navLinks}>
            <a href="#features"  style={L.navLink}>Features</a>
            <a href="#how"       style={L.navLink}>How it works</a>
            <a href="#stack"     style={L.navLink}>Stack</a>
            <a href="#decisions" style={L.navLink}>Design</a>
          </div>
          <button style={L.navCta} onClick={onEnterApp}>
            Open Dashboard →
          </button>
        </nav>

        {/* Hero content */}
        <div style={L.heroContent}>
          <div
            style={{
              ...L.heroLeft,
              opacity:   heroLoaded ? 1 : 0,
              transform: heroLoaded ? "translateY(0)" : "translateY(32px)",
              transition:"opacity 0.9s ease 0.2s, transform 0.9s ease 0.2s",
            }}
          >
            <div style={L.heroPill}>
              <span style={L.heroPillDot} />
              Distributed · Real-Time · Production-Grade
            </div>

            <h1 style={L.heroTitle}>
              <span style={L.heroTitleGlow}>Event Delivery</span>
              <br />
              Infrastructure
            </h1>

            <p style={L.heroSub}>
              Not a chat app. The backbone that powers real-time systems —
              order tracking, payment alerts, driver dispatch. Priority-routed,
              fault-tolerant, observable by design.
            </p>

            <div style={L.heroBtns}>
              <button style={L.heroBtnPrimary} onClick={onEnterApp}>
                Launch Dashboard →
              </button>
              <a href="#how" style={L.heroBtnSecondary}>
                See how it works
              </a>
            </div>

            {/* Quick stats */}
            <div style={L.heroStats}>
              {[
                { val:"< 5ms", label:"avg delivery" },
                { val:"3-tier",label:"priority queue" },
                { val:"0",     label:"messages lost" },
                { val:"76",    label:"tests passing"  },
              ].map(s => (
                <div key={s.label} style={L.heroStat}>
                  <div style={L.heroStatVal}>{s.val}</div>
                  <div style={L.heroStatLabel}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Live ticker */}
          <div
            style={{
              ...L.heroRight,
              opacity:   heroLoaded ? 1 : 0,
              transform: heroLoaded ? "translateX(0)" : "translateX(32px)",
              transition:"opacity 0.9s ease 0.5s, transform 0.9s ease 0.5s",
            }}
          >
            <LiveTicker />
          </div>
        </div>

        {/* Scroll hint */}
        <div style={L.scrollHint}>
          <div style={L.scrollDot} />
          <span style={L.scrollLabel}>scroll to explore</span>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURES SECTION
      ══════════════════════════════════════════════════════════ */}
      <section id="features" style={L.section}>
        <Reveal>
          <div style={L.sectionLabel}>Core Features</div>
          <h2 style={L.sectionTitle}>
            Every layer built for<br />
            <span style={{ color: feat.color, transition:"color 0.4s" }}>production</span>
          </h2>
        </Reveal>

        <div style={L.featGrid}>
          {/* Feature selector */}
          <Reveal delay={0.1} style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
            {FEATURES.map((f, i) => (
              <button
                key={f.id}
                style={{
                  ...L.featTab,
                  borderColor: activeFeature === i ? f.color + "66" : "#14142a",
                  background:  activeFeature === i ? f.color + "0d" : "transparent",
                  color:       activeFeature === i ? f.color : "#3a3a5c",
                }}
                onClick={() => setActiveFeature(i)}
              >
                <span style={L.featTabIcon}>{f.icon}</span>
                <span style={L.featTabLabel}>{f.title}</span>
                {activeFeature === i && <span style={{ marginLeft:"auto", fontSize:"10px", opacity:0.6 }}>▶</span>}
              </button>
            ))}
          </Reveal>

          {/* Feature detail */}
          <Reveal delay={0.2}>
            <div style={{ ...L.featDetail, borderColor: feat.color + "33" }}>
              <div style={{ ...L.featDetailIcon, background: feat.color + "15", color: feat.color }}>
                {feat.icon}
              </div>
              <div style={L.featDetailTitle}>{feat.title}</div>
              <div style={{ ...L.featDetailSub, color: feat.color }}>{feat.sub}</div>
              <p style={L.featDetailDesc}>{feat.desc}</p>
              <div style={L.featDetailStatRow}>
                <div style={{ ...L.featDetailStat, color: feat.color }}>{feat.stat}</div>
                <div style={L.featDetailStatLabel}>{feat.statLabel}</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          HOW IT WORKS — FLOW
      ══════════════════════════════════════════════════════════ */}
      <section id="how" style={{ ...L.section, background:"#0a0a14" }}>
        <Reveal>
          <div style={L.sectionLabel}>Message Flow</div>
          <h2 style={L.sectionTitle}>From publish to delivery<br />in 6 steps</h2>
        </Reveal>

        <div style={L.flowGrid}>
          {FLOW_STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 0.08}>
              <div style={L.flowCard}>
                <div style={L.flowNum}>{step.n}</div>
                <div style={L.flowLabel}>{step.label}</div>
                <div style={L.flowDesc}>{step.desc}</div>
                {i < FLOW_STEPS.length - 1 && (
                  <div style={L.flowArrow}>→</div>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        {/* Architecture ASCII */}
        <Reveal delay={0.3}>
          <div style={L.archBlock}>
            <div style={L.archTitle}>Architecture</div>
            <pre style={L.archPre}>{`Producer → API Gateway → AI Classifier
                            ↓
              ┌─────────────────────────┐
              │     BullMQ Queues       │
              │  urgent  normal  low    │
              │  (×20)   (×10)  (×3)   │
              └─────────────────────────┘
                            ↓
              Queue Worker → Redis Pub/Sub
                                  ↓
              ┌────────────────────────────────┐
              │        WebSocket Server        │
              │   fan-out to all subscribers   │
              └────────────────────────────────┘
                   ↓                  ↓
             Online users       Offline users
             (instant ws)     → offline_queue
                                → replay on reconnect`}</pre>
          </div>
        </Reveal>
      </section>

      {/* ══════════════════════════════════════════════════════════
          TECH STACK
      ══════════════════════════════════════════════════════════ */}
      <section id="stack" style={L.section}>
        <Reveal>
          <div style={L.sectionLabel}>Tech Stack</div>
          <h2 style={L.sectionTitle}>Every tool chosen<br />deliberately</h2>
        </Reveal>

        <div style={L.stackGrid}>
          {STACK.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.04}>
              <div style={L.stackCard}>
                <div style={L.stackLabel}>{s.label}</div>
                <div style={L.stackRole}>{s.role}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          DESIGN DECISIONS
      ══════════════════════════════════════════════════════════ */}
      <section id="decisions" style={{ ...L.section, background:"#0a0a14" }}>
        <Reveal>
          <div style={L.sectionLabel}>Design Decisions</div>
          <h2 style={L.sectionTitle}>Every trade-off<br />explained</h2>
        </Reveal>

        <div style={L.decisionsGrid}>
          <div style={L.decisionsList}>
            {DECISIONS.map((d, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <button
                  style={{
                    ...L.decisionTab,
                    background:  activeDecision === i ? "#10102a" : "transparent",
                    borderColor: activeDecision === i ? "#5b6cf4" : "#14142a",
                    color:       activeDecision === i ? "#8b9cf4" : "#3a3a5c",
                  }}
                  onClick={() => setActiveDecision(i)}
                >
                  <span style={L.decisionQ}>{d.q}</span>
                </button>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2}>
            <div style={L.decisionDetail}>
              <div style={L.decisionIcon}>💡</div>
              <div style={L.decisionQuestion}>{DECISIONS[activeDecision].q}</div>
              <p style={L.decisionAnswer}>{DECISIONS[activeDecision].a}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          WHO IS THIS FOR
      ══════════════════════════════════════════════════════════ */}
      <section style={L.section}>
        <Reveal>
          <div style={L.sectionLabel}>Use Cases</div>
          <h2 style={L.sectionTitle}>Same pattern used at<br />scale companies</h2>
        </Reveal>

        <div style={L.useCaseGrid}>
          {[
            { icon:"🛒", company:"Swiggy / Zomato", use:"Order status updates", desc:"Producer: order service → subscribers: customer app, driver app, kitchen display" },
            { icon:"💳", company:"Razorpay / Juspay",use:"Payment alerts",      desc:"urgent-classified payment events skip the queue — delivered before normal traffic" },
            { icon:"🚗", company:"Uber / Ola",       use:"Driver dispatch",     desc:"Location events fan out to multiple consumers with offline sync for reconnects" },
            { icon:"📦", company:"Zepto / Blinkit",  use:"Inventory tracking",  desc:"Real-time stock events with anomaly detection when order volume spikes" },
          ].map((uc, i) => (
            <Reveal key={uc.company} delay={i * 0.08}>
              <div style={L.useCaseCard}>
                <div style={L.useCaseIcon}>{uc.icon}</div>
                <div style={L.useCaseCompany}>{uc.company}</div>
                <div style={L.useCaseUse}>{uc.use}</div>
                <p style={L.useCaseDesc}>{uc.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════════════════ */}
      <section style={L.ctaSection}>
        <Reveal>
          <div style={L.ctaInner}>
            <div style={L.ctaGlow} aria-hidden="true" />
            <div style={L.ctaLabel}>Ready to explore?</div>
            <h2 style={L.ctaTitle}>PulseGrid is live.<br />See it in action.</h2>
            <p style={L.ctaSub}>
              Register a free account, publish an event, watch it arrive in real time.
              The entire system runs on your machine with one command.
            </p>
            <div style={L.ctaBtns}>
              <button style={L.ctaBtnPrimary} onClick={onEnterApp}>
                Open Dashboard →
              </button>
              <div style={L.ctaCode}>
                <span style={L.ctaCodeCmd}>docker-compose up --build</span>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Global styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #08080f; }

        .ticker-item {
          animation: tickerIn 0.35s ease both;
        }
        @keyframes tickerIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        a { text-decoration: none; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1a1a3a; border-radius: 2px; }

        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(6px); }
        }
      `}</style>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────
const FF = '"JetBrains Mono", "Fira Code", monospace';

const L = {
  root: { background:"#08080f", color:"#e8e6f0", fontFamily:FF, minHeight:"100vh", overflowX:"hidden", position:"relative" },

  gridBg: {
    position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
    backgroundImage:`linear-gradient(#14142a 1px, transparent 1px), linear-gradient(90deg, #14142a 1px, transparent 1px)`,
    backgroundSize:"52px 52px", opacity:0.35,
  },
  gradientBg: {
    position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
    background:`radial-gradient(ellipse 80% 60% at 50% -10%, #5b6cf422 0%, transparent 60%),
                radial-gradient(ellipse 40% 40% at 80% 80%, #a78bfa11 0%, transparent 50%)`,
  },

  // Nav
  nav: { position:"fixed", top:0, left:0, right:0, zIndex:100, display:"flex", alignItems:"center", gap:"24px", padding:"14px 40px", borderBottom:"1px solid #14142a", background:"rgba(8,8,15,0.85)", backdropFilter:"blur(12px)" },
  navLogo: { fontSize:"14px", fontWeight:"700", color:"#e8e6f0", letterSpacing:"0.06em", marginRight:"16px" },
  navLinks: { display:"flex", gap:"24px", flex:1 },
  navLink: { fontSize:"11px", color:"#3a3a5c", letterSpacing:"0.06em", transition:"color 0.15s" },
  navCta: { background:"#5b6cf4", border:"none", borderRadius:"6px", color:"#fff", fontSize:"11px", fontWeight:"600", padding:"8px 18px", cursor:"pointer", fontFamily:FF, letterSpacing:"0.04em", boxShadow:"0 4px 20px #5b6cf433" },

  // Hero
  hero: { position:"relative", zIndex:1, minHeight:"100vh", display:"flex", flexDirection:"column", padding:"0 40px" },
  heroContent: { flex:1, display:"grid", gridTemplateColumns:"1fr 1fr", gap:"60px", alignItems:"center", paddingTop:"100px", paddingBottom:"60px" },
  heroLeft: { display:"flex", flexDirection:"column", gap:"24px" },
  heroPill: { display:"inline-flex", alignItems:"center", gap:"8px", background:"#10102a", border:"1px solid #1e1e3a", borderRadius:"20px", padding:"6px 14px", fontSize:"10px", color:"#5b6cf4", letterSpacing:"0.08em", width:"fit-content" },
  heroPillDot: { width:"5px", height:"5px", borderRadius:"50%", background:"#22c55e", boxShadow:"0 0 6px #22c55e" },
  heroTitle: { fontSize:"52px", fontWeight:"700", lineHeight:"1.05", letterSpacing:"-0.02em", color:"#f0eeff" },
  heroTitleGlow: { background:"linear-gradient(135deg, #7c8cf8, #a78bfa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" },
  heroSub: { fontSize:"13px", color:"#5a5a7a", lineHeight:"1.8", letterSpacing:"0.02em", maxWidth:"440px" },
  heroBtns: { display:"flex", gap:"12px", alignItems:"center" },
  heroBtnPrimary: { background:"#5b6cf4", border:"none", borderRadius:"7px", color:"#fff", fontSize:"12px", fontWeight:"600", padding:"12px 24px", cursor:"pointer", fontFamily:FF, letterSpacing:"0.04em", boxShadow:"0 4px 24px #5b6cf444", transition:"all 0.15s" },
  heroBtnSecondary: { display:"inline-block", background:"transparent", border:"1px solid #1e1e3a", borderRadius:"7px", color:"#5a5a7a", fontSize:"12px", padding:"11px 20px", cursor:"pointer", fontFamily:FF, letterSpacing:"0.04em", transition:"all 0.15s" },
  heroStats: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"16px", paddingTop:"8px", borderTop:"1px solid #14142a" },
  heroStat: { display:"flex", flexDirection:"column", gap:"4px" },
  heroStatVal: { fontSize:"20px", fontWeight:"700", color:"#8b9cf4", letterSpacing:"0.02em" },
  heroStatLabel: { fontSize:"9px", color:"#3a3a5c", letterSpacing:"0.1em", textTransform:"uppercase" },
  heroRight: {},
  scrollHint: { display:"flex", flexDirection:"column", alignItems:"center", gap:"8px", paddingBottom:"28px", opacity:0.4 },
  scrollDot: { width:"6px", height:"6px", borderRadius:"50%", background:"#3a3a5c", animation:"scrollBounce 2s ease-in-out infinite" },
  scrollLabel: { fontSize:"9px", color:"#3a3a5c", letterSpacing:"0.12em", textTransform:"uppercase" },

  // Sections
  section: { position:"relative", zIndex:1, padding:"80px 40px" },
  sectionLabel: { fontSize:"10px", color:"#5b6cf4", letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:"12px" },
  sectionTitle: { fontSize:"36px", fontWeight:"700", lineHeight:"1.15", letterSpacing:"-0.02em", color:"#f0eeff", marginBottom:"48px" },

  // Features
  featGrid: { display:"grid", gridTemplateColumns:"320px 1fr", gap:"24px" },
  featTab: { display:"flex", alignItems:"center", gap:"10px", width:"100%", background:"transparent", border:"1px solid", borderRadius:"7px", padding:"12px 14px", cursor:"pointer", fontFamily:FF, letterSpacing:"0.04em", transition:"all 0.15s", textAlign:"left" },
  featTabIcon: { fontSize:"14px" },
  featTabLabel: { fontSize:"11px", fontWeight:"500" },
  featDetail: { background:"#0d0d1a", border:"1px solid", borderRadius:"10px", padding:"32px", height:"100%", display:"flex", flexDirection:"column", gap:"14px" },
  featDetailIcon: { width:"52px", height:"52px", borderRadius:"12px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"24px", marginBottom:"4px" },
  featDetailTitle: { fontSize:"20px", fontWeight:"700", color:"#f0eeff", letterSpacing:"-0.01em" },
  featDetailSub: { fontSize:"11px", fontWeight:"500", letterSpacing:"0.06em" },
  featDetailDesc: { fontSize:"12px", color:"#5a5a7a", lineHeight:"1.8", letterSpacing:"0.02em", flex:1 },
  featDetailStatRow: { display:"flex", alignItems:"baseline", gap:"8px", paddingTop:"16px", borderTop:"1px solid #14142a", marginTop:"auto" },
  featDetailStat: { fontSize:"32px", fontWeight:"700", lineHeight:1 },
  featDetailStatLabel: { fontSize:"10px", color:"#3a3a5c", letterSpacing:"0.1em", textTransform:"uppercase" },

  // Flow
  flowGrid: { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"16px", marginBottom:"40px", position:"relative" },
  flowCard: { background:"#0d0d1a", border:"1px solid #14142a", borderRadius:"8px", padding:"20px", position:"relative" },
  flowNum: { fontSize:"28px", fontWeight:"700", color:"#1e1e3a", letterSpacing:"-0.02em", marginBottom:"8px" },
  flowLabel: { fontSize:"12px", fontWeight:"600", color:"#8b9cf4", marginBottom:"6px", letterSpacing:"0.04em" },
  flowDesc: { fontSize:"11px", color:"#3a3a5c", lineHeight:"1.7", letterSpacing:"0.02em" },
  flowArrow: { position:"absolute", top:"50%", right:"-14px", transform:"translateY(-50%)", color:"#1e1e3a", fontSize:"18px", zIndex:1 },
  archBlock: { background:"#0a0a12", border:"1px solid #14142a", borderRadius:"8px", padding:"24px" },
  archTitle: { fontSize:"10px", color:"#3a3a5c", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"14px" },
  archPre: { color:"#5b6cf4", fontSize:"11px", lineHeight:"1.7", fontFamily:FF, overflowX:"auto" },

  // Stack
  stackGrid: { display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:"10px" },
  stackCard: { background:"#0d0d1a", border:"1px solid #14142a", borderRadius:"7px", padding:"14px 16px", transition:"border-color 0.15s" },
  stackLabel: { fontSize:"11px", fontWeight:"600", color:"#8b9cf4", marginBottom:"4px", letterSpacing:"0.04em" },
  stackRole: { fontSize:"9px", color:"#3a3a5c", letterSpacing:"0.08em", textTransform:"uppercase" },

  // Decisions
  decisionsGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"24px" },
  decisionsList: { display:"flex", flexDirection:"column", gap:"8px" },
  decisionTab: { width:"100%", background:"transparent", border:"1px solid", borderRadius:"7px", padding:"14px 16px", cursor:"pointer", fontFamily:FF, textAlign:"left", transition:"all 0.15s" },
  decisionQ: { fontSize:"11px", fontWeight:"500", letterSpacing:"0.03em", lineHeight:"1.4" },
  decisionDetail: { background:"#0d0d1a", border:"1px solid #1e1e3a", borderRadius:"10px", padding:"32px", display:"flex", flexDirection:"column", gap:"14px" },
  decisionIcon: { fontSize:"28px" },
  decisionQuestion: { fontSize:"16px", fontWeight:"600", color:"#f0eeff", lineHeight:"1.4", letterSpacing:"0.01em" },
  decisionAnswer: { fontSize:"12px", color:"#5a5a7a", lineHeight:"1.9", letterSpacing:"0.02em" },

  // Use cases
  useCaseGrid: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"16px" },
  useCaseCard: { background:"#0d0d1a", border:"1px solid #14142a", borderRadius:"8px", padding:"20px", display:"flex", flexDirection:"column", gap:"8px" },
  useCaseIcon: { fontSize:"24px", marginBottom:"4px" },
  useCaseCompany: { fontSize:"12px", fontWeight:"700", color:"#8b9cf4", letterSpacing:"0.04em" },
  useCaseUse: { fontSize:"10px", color:"#5b6cf4", letterSpacing:"0.06em", textTransform:"uppercase" },
  useCaseDesc: { fontSize:"11px", color:"#3a3a5c", lineHeight:"1.7", letterSpacing:"0.02em" },

  // CTA
  ctaSection: { position:"relative", zIndex:1, padding:"80px 40px", display:"flex", alignItems:"center", justifyContent:"center" },
  ctaInner: { position:"relative", textAlign:"center", maxWidth:"600px", width:"100%" },
  ctaGlow: { position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"400px", height:"300px", background:"radial-gradient(ellipse, #5b6cf422 0%, transparent 70%)", pointerEvents:"none", zIndex:0 },
  ctaLabel: { position:"relative", fontSize:"10px", color:"#5b6cf4", letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:"16px" },
  ctaTitle: { position:"relative", fontSize:"40px", fontWeight:"700", lineHeight:"1.1", letterSpacing:"-0.02em", color:"#f0eeff", marginBottom:"20px" },
  ctaSub: { position:"relative", fontSize:"12px", color:"#5a5a7a", lineHeight:"1.8", letterSpacing:"0.02em", marginBottom:"32px" },
  ctaBtns: { position:"relative", display:"flex", gap:"14px", justifyContent:"center", alignItems:"center", marginBottom:"32px" },
  ctaBtnPrimary: { background:"#5b6cf4", border:"none", borderRadius:"7px", color:"#fff", fontSize:"12px", fontWeight:"600", padding:"13px 28px", cursor:"pointer", fontFamily:FF, letterSpacing:"0.04em", boxShadow:"0 4px 28px #5b6cf455" },
  ctaCode: { background:"#0d0d1a", border:"1px solid #14142a", borderRadius:"6px", padding:"12px 18px" },
  ctaCodeCmd: { fontSize:"11px", color:"#34d399", fontFamily:FF, letterSpacing:"0.02em" },
  ctaAuthor: { position:"relative", fontSize:"10px", color:"#2a2a4e", letterSpacing:"0.05em" },
};

// Ticker styles
const T = {
  wrap: { background:"#0d0d1a", border:"1px solid #1a1a30", borderRadius:"10px", overflow:"hidden", fontFamily:FF, boxShadow:"0 24px 60px #00000060" },
  header: { display:"flex", alignItems:"center", gap:"8px", padding:"12px 16px", borderBottom:"1px solid #14142a", background:"#0a0a12" },
  headerDot: { width:"6px", height:"6px", borderRadius:"50%", background:"#22c55e", boxShadow:"0 0 6px #22c55e", animation:"scrollBounce 2s infinite" },
  headerLabel: { fontSize:"10px", color:"#3a3a5c", letterSpacing:"0.1em", textTransform:"uppercase", flex:1 },
  headerCount: { fontSize:"10px", color:"#5b6cf4", background:"#10102a", padding:"2px 8px", borderRadius:"10px", border:"1px solid #1e1e3a" },
  list: { padding:"8px", display:"flex", flexDirection:"column", gap:"4px", minHeight:"280px" },
  item: { display:"flex", alignItems:"center", gap:"8px", padding:"8px 10px", background:"#080810", borderRadius:"5px", border:"1px solid #10101e" },
  time: { fontSize:"9px", color:"#2a2a4e", minWidth:"55px", letterSpacing:"0.04em" },
  topic: { fontSize:"10px", color:"#8b9cf4", fontWeight:"600", minWidth:"70px", letterSpacing:"0.03em" },
  badge: { fontSize:"8px", padding:"2px 7px", borderRadius:"3px", letterSpacing:"0.06em", fontWeight:"600", flexShrink:0 },
  payload: { fontSize:"9px", color:"#3a3a5c", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1, letterSpacing:"0.02em" },
};