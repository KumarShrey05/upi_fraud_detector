'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun, LogOut, X, HelpCircle, Shield, Info, } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useClerk, useUser } from '@clerk/nextjs';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { BottomNav } from '@/components/layout/Bottom-nav';

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);
  const [darkMode, setDarkMode] =
    useState(false);
  const [activeModal, setActiveModal] =
    useState(null);

  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  });

  const [toastClosing, setToastClosing] =
    useState(false);

  const router = useRouter();
  const { signOut } = useClerk();
  const { isSignedIn } = useUser();

  useEffect(() => {
    const savedTheme =
      localStorage.getItem('theme');

    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add(
        'dark'
      );
    }
  }, []);

  const showToastMessage = (
    message,
    type = 'success'
  ) => {
    setToast({
      show: true,
      message,
      type,
    });

    setToastClosing(false);

    setTimeout(() => {
      setToastClosing(true);
    }, 2000);

    setTimeout(() => {
      setToast({
        show: false,
        message: '',
        type: 'success',
      });
      setToastClosing(false);
    }, 2400);
  };

  const handleDarkModeToggle = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);

    if (newMode) {
      document.documentElement.classList.add(
        'dark'
      );
      localStorage.setItem(
        'theme',
        'dark'
      );
    } else {
      document.documentElement.classList.remove(
        'dark'
      );
      localStorage.setItem(
        'theme',
        'light'
      );
    }
  };

  const handleComingSoon = (
    feature
  ) => {
    showToastMessage(
      `${feature} - Stay tuned, coming soon...`
    );
  };

  const handleLogout = async () => {
    await signOut({ redirectUrl: '/login' });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      <div className="flex-1 flex flex-col">
        <Topbar
          onMenuClick={() =>
            setSidebarOpen(
              !sidebarOpen
            )
          }
          userName="Settings"
        />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">

            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold">
                Settings
              </h1>
              <p className="text-muted-foreground">
                Manage your preferences
                and support
              </p>
            </div>

            {/* Appearance */}
            <Card
              title="Appearance"
              icon={
                darkMode ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )
              }
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    Dark Mode
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Toggle app theme
                  </p>
                </div>

                <button
                  onClick={
                    handleDarkModeToggle
                  }
                  className={`cursor-pointer relative w-12 h-6 rounded-full transition-colors ${darkMode
                    ? 'bg-blue-600'
                    : 'bg-gray-300'
                    }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${darkMode
                      ? 'translate-x-6'
                      : ''
                      }`}
                  />
                </button>
              </div>
            </Card>

            {/* Help */}
            <Card
              title="Help & Support"
              icon={
                <HelpCircle className="w-5 h-5" />
              }
            >
              <SupportItem
                text="Contact Support"
                onClick={() =>
                  handleComingSoon(
                    'Contact Support'
                  )
                }
              />

              <SupportItem
                text="Report Issue"
                onClick={() =>
                  handleComingSoon(
                    'Report Issue'
                  )
                }
              />

              <SupportItem
                text="FAQs"
                onClick={() =>
                  setActiveModal(
                    'faq'
                  )
                }
              />
            </Card>

            {/* Privacy */}
            <Card
              title="Privacy & Security"
              icon={
                <Shield className="w-5 h-5" />
              }
            >
              <SupportItem
                text="Privacy Policy"
                onClick={() =>
                  setActiveModal(
                    'privacy'
                  )
                }
              />

              <SupportItem
                text="Terms & Conditions"
                onClick={() =>
                  setActiveModal(
                    'terms'
                  )
                }
              />
            </Card>

            {/* About */}
            <Card
              title="About App"
              icon={
                <Info className="w-5 h-5" />
              }
            >
              <div className="space-y-2 text-sm text-muted-foreground leading-6 tracking-wide">
                <p>Version: 1.0.0</p>
                <p>Release: Stable</p>
                <p>Security Engine: Active</p>
                <p>© 2026 UPay • Built by Kumar Shrey</p>
              </div>
            </Card>

            {/* Logout */}
            {isSignedIn && (
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 text-white rounded-2xl py-4 font-semibold flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-all"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            )}
          </div>
        </main>
      </div>

      <BottomNav />

      {/* Modal */}
      {activeModal && (
        <Modal
          title={
            activeModal === 'faq'
              ? 'FAQs'
              : activeModal ===
                'privacy'
                ? 'Privacy Policy'
                : 'Terms & Conditions'
          }
          onClose={() =>
            setActiveModal(null)
          }
        >
          {activeModal === 'faq' && (
            <FAQContent />
          )}
          {activeModal ===
            'privacy' && (
              <PrivacyContent />
            )}
          {activeModal ===
            'terms' && (
              <TermsContent />
            )}
        </Modal>
      )}

      {/* Toast */}
      {toast.show && (
        <div
          className={`fixed top-20 right-0 z-50 ${toastClosing
            ? 'toast-out'
            : 'toast-edge-slide'
            }`}
        >
          <div
            className={`w-80 border-l border-t border-b shadow-2xl px-4 py-3 ${toast.type ===
              'error'
              ? 'bg-red-600/95 border-red-500 text-white'
              : 'bg-green-600/95 border-green-500 text-white'
              }`}
          >
            <p className="text-sm font-semibold">
              {toast.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({
  title,
  icon,
  children,
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        {icon}
        <h2 className="text-lg font-bold">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function SupportItem({
  text,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border border-border bg-background p-3 hover:bg-muted transition-all cursor-pointer mb-3"
    >
      {text}
    </button>
  );
}

function Modal({
  children,
  onClose,
  title,
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-xl font-bold">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="cursor-pointer rounded-xl p-2 hover:bg-muted transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {children}
        </div>
      </div>
    </div>
  );
}

function FAQContent() {
  const faqs = [
    {
      q: 'Is this a real payment application?',
      a: 'No. This application is a self-developed demo and portfolio project created for educational purposes. All transactions and fraud alerts shown inside the app are part of a simulation environment.',
    },
    {
      q: 'How does fraud detection work?',
      a: 'The platform uses a hybrid fraud detection engine that combines rule-based validation checks with machine learning risk scoring to identify suspicious UPI transactions.',
    },
    {
      q: 'Why am I asked for OTP verification?',
      a: 'OTP verification is triggered for transactions identified as medium-risk or high-risk based on amount thresholds, recipient behavior, and fraud indicators.',
    },
    {
      q: 'Why was my transaction blocked?',
      a: 'Transactions may be blocked if the recipient appears suspicious, the amount exceeds risk thresholds, or the fraud detection model predicts abnormal activity.',
    },
    {
      q: 'How are fraud insights generated?',
      a: 'Fraud insights are generated using transaction history, blocked payment counts, OTP verification frequency, risk patterns, and hybrid model-based threat analysis.',
    },
    {
      q: 'Is my data secure?',
      a: 'User authentication is managed through Clerk and OTP communication is handled through Resend. Limited technical data may also be processed by deployment platforms for hosting and logging.',
    },
    {
      q: 'Can I use this app for real UPI payments?',
      a: 'No. This application is not connected to any real banking or UPI network. It is intended only for simulation and demonstration purposes.',
    },
    {
      q: 'How is the threat level calculated?',
      a: 'Threat levels are determined based on blocked transactions, transaction amount anomalies, OTP verification patterns, and model-based risk ratios.',
    },
  ];

  return (
    <div className="space-y-4">
      {faqs.map((item, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border bg-background p-5 shadow-sm"
        >
          <h3 className="font-semibold text-base">
            {item.q}
          </h3>

          <p className="text-sm text-muted-foreground mt-2 leading-7">
            {item.a}
          </p>
        </div>
      ))}
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-6 text-sm leading-7">
      <section>
        <h3 className="font-semibold text-base mb-2">
          Overview
        </h3>
        <p className="text-muted-foreground">
          This application is a self-developed educational and portfolio project
          built to demonstrate secure UPI payment workflows and fraud detection
          simulation.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">
          Data Processing
        </h3>
        <p className="text-muted-foreground">
          User authentication and account-related information are securely
          processed through Clerk. OTP verification and email communication are
          handled through Resend.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">
          Infrastructure & Hosting
        </h3>
        <p className="text-muted-foreground">
          Limited technical logs, request metadata, and performance analytics may
          be processed by deployment platforms such as Vercel, Railway, or
          Netlify for application hosting and monitoring.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">
          Financial Disclaimer
        </h3>
        <p className="text-muted-foreground">
          No real banking credentials, UPI rails, or live monetary transactions
          are processed through this application.
        </p>
      </section>
    </div>
  );
}

function TermsContent() {
  return (
    <div className="space-y-6 text-sm leading-7">
      <section>
        <h3 className="font-semibold text-base mb-2">
          Intended Use
        </h3>
        <p className="text-muted-foreground">
          This application is intended strictly for educational, demonstration,
          and portfolio purposes.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">
          Simulation Notice
        </h3>
        <p className="text-muted-foreground">
          All balances, transactions, OTP flows, fraud alerts, and insights are
          simulated and do not represent real financial activity.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">
          User Responsibility
        </h3>
        <p className="text-muted-foreground">
          Users must not rely on this platform for actual financial operations
          or monetary transfers.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">
          Third-Party Services
        </h3>
        <p className="text-muted-foreground">
          By using this application, users acknowledge that third-party services
          such as Clerk, Resend, and hosting platforms may process limited
          technical and authentication-related data.
        </p>
      </section>
    </div>
  );
}