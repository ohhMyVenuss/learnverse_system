import React from 'react';
import { Link } from 'react-router-dom';
import learnverseLogo from '../../assets/LearnverseLogo-removebg-preview.png';
import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaPaperPlane,
} from 'react-icons/fa';

const educatorLinks = [
  'Find / Upload Resources',
  'DashBoard',
  'Ranking',
  'Contributors',
  'AI Quizz',
  'Generators',
];

const studentLinks = [
  'Find / Upload Resources',
  'AI Quiz Generator',
  'Community Discussion',
  'Ranking Contributors',
  'My Profile',
];

const contactItems = [
  {
    icon: <FaMapMarkerAlt />,
    bg: 'bg-purple-100 text-[#2D2B4A]',
    text: '3556 Beech Street, San Francisco, California, CA 94108',
  },
  {
    icon: <FaEnvelope />,
    bg: 'bg-red-100 text-[#EA454C]',
    text: 'hello@learnverse.edu',
  },
  {
    icon: <FaPhoneAlt />,
    bg: 'bg-orange-100 text-orange-500',
    text: '+1 (415) 562-3210',
  },
];

const storeBadges = [
  {
    alt: 'App Store',
    src: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg',
  },
  {
    alt: 'Google Play',
    src: 'https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg',
  },
];

function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#F7F8FC] pt-20 text-gray-600">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#C7D2FE]/40 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-80 w-80 translate-x-1/3 translate-y-1/3 rounded-full bg-[#F9A8D4]/40 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr_1fr_1.3fr]">
          {/* Brand */}
          <div className="flex flex-col gap-6">
            <img
              src={learnverseLogo}
              alt="LearnVerse"
              className="h-60 w-auto object-contain"
            />
            <p className="text-sm leading-relaxed text-gray-500">
              LearnVerse is the peer-to-peer platform where students and
              educators collaborate to share academic resources and enrich every
              subject discussion.
            </p>
            <div className="flex flex-wrap gap-3">
              {storeBadges.map((badge) => (
                <a
                  key={badge.alt}
                  href="#"
                  className="inline-flex w-40 items-center justify-center rounded-xl bg-white/80 px-3 py-2 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md"
                >
                  <img src={badge.src} alt={badge.alt} className="h-8" />
                </a>
              ))}
            </div>
          </div>

          {/* Educator links */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
              For Educator
            </p>
            <h3 className="mt-2 text-lg font-bold text-gray-900">
              Guide & Grow
            </h3>
            <ul className="mt-6 space-y-3 text-sm">
              {educatorLinks.map((item) => (
                <li key={item}>
                  <Link
                    to="#"
                    className="transition hover:text-[#EA454C] hover:underline"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Student links */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
              For Student
            </p>
            <h3 className="mt-2 text-lg font-bold text-gray-900">
              Learn & Connect
            </h3>
            <ul className="mt-6 space-y-3 text-sm">
              {studentLinks.map((item) => (
                <li key={item}>
                  <Link
                    to="#"
                    className="transition hover:text-[#EA454C] hover:underline"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="rounded-3xl bg-white/80 p-6 shadow-lg shadow-indigo-50/40 ring-1 ring-white/60 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
              Stay Updated
            </p>
            <h3 className="mt-2 text-lg font-bold text-gray-900">
              Newsletter
            </h3>
            <p className="mt-3 text-sm text-gray-500">
              Weekly insights, featured resources, and product updates straight
              to your inbox.
            </p>
            <div className="relative mt-6">
              <input
                type="email"
                className="w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#EA454C]"
                placeholder="Enter your email address"
              />
              <button className="absolute right-1 top-1 bottom-1 flex items-center gap-1 rounded-full bg-[#2D2B4A] px-4 text-xs font-semibold text-white transition hover:bg-[#3f3c61]">
                <FaPaperPlane className="text-[10px]" />
                Subscribe
              </button>
            </div>

            <div className="mt-6 space-y-4 text-sm">
              {contactItems.map((item) => (
                <div key={item.text} className="flex gap-3">
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl ${item.bg}`}
                  >
                    {item.icon}
                  </div>
                  <p className="flex-1 text-gray-500">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/60 py-6 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} LearnVerse. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-[#EA454C]">
              Terms & Conditions
            </Link>
            <span className="h-4 w-px bg-gray-300" />
            <Link to="/privacy" className="hover:text-[#EA454C]">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;