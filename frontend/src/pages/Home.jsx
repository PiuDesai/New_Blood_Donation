import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Droplets, ShieldCheck, Zap, Users, ArrowRight, Activity, Calendar, MapPin } from "lucide-react";
import { Button } from "../components/Common/Button";
import { Card } from "../components/Common/Card";

const Home = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Droplets, title: "Smart Matching", desc: "AI-driven matching between donors and patients based on location and urgency." },
    { icon: ShieldCheck, title: "Verified Network", desc: "All blood banks and medical institutions are strictly verified for safety." },
    { icon: Zap, title: "Real-time Alerts", desc: "Instant notifications for emergency blood requirements in your immediate area." },
    { icon: Activity, title: "Live Inventory", desc: "Track live blood stock levels across multiple city-wide blood banks." }
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden font-['Plus_Jakarta_Sans']">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-50 px-6 md:px-20 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-red-200 group-hover:rotate-12 transition-transform">B</div>
          <span className="text-xl font-black text-gray-900 tracking-tighter">BloodMatrix</span>
        </div>
        <div className="hidden md:flex items-center gap-10">
          <a href="#features" className="text-sm font-bold text-gray-500 hover:text-red-600 transition-colors">Features</a>
          <a href="#mission" className="text-sm font-bold text-gray-500 hover:text-red-600 transition-colors">Mission</a>
          <Button 
            onClick={() => navigate("/role-selection")}
            className="bg-red-600 hover:bg-red-700 h-11 px-8 rounded-xl text-sm font-black uppercase tracking-widest"
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 md:px-20 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full mb-8">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-widest">Active Life-Saving Network</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-gray-900 leading-[0.9] tracking-tighter mb-8">
              The Next Gen <br />
              <span className="text-red-600 underline decoration-red-100 decoration-8 underline-offset-[12px]">Life-Saving</span> <br />
              Network.
            </h1>
            <p className="text-xl text-gray-500 font-bold leading-relaxed mb-12 max-w-xl">
              BloodMatrix bridges the gap between donors and patients using real-time geolocation and smart inventory tracking. Fast, reliable, and completely transparent.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Button 
                onClick={() => navigate("/role-selection")}
                className="h-16 px-10 rounded-2xl bg-red-600 hover:bg-red-700 text-lg font-black uppercase tracking-widest shadow-2xl shadow-red-200 flex items-center gap-3 group"
              >
                Join the Network <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </Button>
              <div className="flex items-center gap-4 px-6">
                <div className="text-xs font-bold text-gray-400">
                  <span className="text-gray-900 font-black tracking-widest uppercase">Verified Heroes & Centers</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            {/* Banner / Abstract UI Visual */}
            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(220,38,38,0.2)]">
              <div className="aspect-[4/5] bg-gradient-to-br from-red-600 to-pink-600 p-12 flex flex-col justify-between relative overflow-hidden">
                <div className="relative z-20">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center text-white mb-8 border border-white/20">
                    <Heart size={32} fill="white" />
                  </div>
                  <h3 className="text-4xl font-black text-white leading-tight mb-4">Urgent Help <br />Nearby</h3>
                  <p className="text-red-50 lg:text-lg font-bold">Fastest response for emergency requirements.</p>
                </div>
                
                <div className="relative z-20 space-y-4">
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white text-xs font-black uppercase tracking-widest">Inventory Health</span>
                      <span className="text-white text-xs font-black">82%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white w-[82%]"></div>
                    </div>
                  </div>
                </div>

                {/* Abstract Background Elements */}
                <Droplets size={400} className="absolute -bottom-20 -right-20 text-white/5 rotate-12" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full"></div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-10 -right-10 z-20 bg-white p-6 rounded-[2rem] shadow-2xl border border-gray-50 flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Security Status</p>
                <p className="text-sm font-black text-gray-900">Protocols Nominal</p>
              </div>
            </motion.div>

            <motion.div 
              animate={{ x: [0, 20, 0] }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-10 -left-10 z-20 bg-white p-6 rounded-[2rem] shadow-2xl border border-gray-50 flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <MapPin size={24} />
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Donors</p>
                <p className="text-sm font-black text-gray-900">Verified Network</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 md:px-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h4 className="text-red-600 font-black uppercase text-xs tracking-[0.3em] mb-4">Engineered for speed</h4>
            <h2 className="text-5xl font-black text-gray-900 tracking-tighter">Why Choose BloodMatrix?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Card className="h-full p-10 border-none shadow-xl shadow-gray-100/50 group-hover:shadow-red-100 group-hover:bg-red-600 transition-all duration-500 overflow-hidden relative">
                  <f.icon size={40} className="text-red-600 group-hover:text-white mb-8 transition-colors relative z-10" />
                  <h3 className="text-xl font-black text-gray-900 group-hover:text-white mb-4 relative z-10">{f.title}</h3>
                  <p className="text-gray-500 font-bold text-sm leading-relaxed group-hover:text-red-50 transition-colors relative z-10">{f.desc}</p>
                  <f.icon size={150} className="absolute -bottom-10 -right-10 text-gray-50 group-hover:text-white/5 transition-all duration-500 opacity-50" />
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section id="mission" className="py-32 px-6 md:px-20 bg-gray-50/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square bg-red-600 rounded-[4rem] overflow-hidden relative group">
              <img 
                src="https://images.unsplash.com/photo-1615461066841-6116ecaaba74?auto=format&fit=crop&q=80&w=2000" 
                alt="Our Mission" 
                className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 flex items-center justify-center p-12">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl text-center">
                  <Heart size={48} className="text-white mx-auto mb-4" fill="white" />
                  <p className="text-white text-2xl font-black italic">"Every drop is a second chance at life."</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-red-100 rounded-full blur-3xl opacity-50"></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h4 className="text-red-600 font-black uppercase text-xs tracking-[0.3em] mb-4">Our Mission</h4>
            <h2 className="text-5xl font-black text-gray-900 tracking-tighter mb-8 leading-tight">
              Democratizing Healthcare Access Through <span className="text-red-600">Technology.</span>
            </h2>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-white shadow-xl rounded-2xl flex-shrink-0 flex items-center justify-center text-red-600">
                  <Users size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-gray-900 mb-2">Community First</h4>
                  <p className="text-gray-500 font-bold leading-relaxed">We believe in the power of people. BloodMatrix is built on the foundation of human kindness, connecting those who can help with those in need.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-white shadow-xl rounded-2xl flex-shrink-0 flex items-center justify-center text-red-600">
                  <Zap size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-gray-900 mb-2">Zero Delay</h4>
                  <p className="text-gray-500 font-bold leading-relaxed">In medical emergencies, every second counts. Our goal is to reduce blood search time from hours to mere minutes through real-time tracking.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-32 px-6 md:px-20">
        <div className="max-w-7xl mx-auto bg-gray-900 rounded-[4rem] p-12 md:p-24 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10 text-center">
            <div>
              <p className="text-6xl font-black text-white mb-2 tracking-tighter">99.9%</p>
              <p className="text-red-500 font-black uppercase text-xs tracking-widest">Uptime Reliability</p>
            </div>
            <div>
              <p className="text-6xl font-black text-white mb-2 tracking-tighter">150+</p>
              <p className="text-red-500 font-black uppercase text-xs tracking-widest">Partner Banks</p>
            </div>
            <div>
              <p className="text-6xl font-black text-white mb-2 tracking-tighter">24/7</p>
              <p className="text-red-500 font-black uppercase text-xs tracking-widest">Active Support</p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-600/20 to-transparent"></div>
          <Activity size={400} className="absolute -bottom-40 -left-20 text-white/5" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 md:px-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-black">B</div>
            <span className="text-lg font-black text-gray-900 tracking-tighter">BloodMatrix</span>
          </div>
          <p className="text-gray-400 font-bold text-sm">© 2024 BloodMatrix. Saving lives, one unit at a time.</p>
          <div className="flex gap-8">
            {["Twitter", "Instagram", "LinkedIn"].map(s => (
              <a key={s} href="#" className="text-sm font-black text-gray-900 hover:text-red-600 transition-colors">{s}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;