'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = (usePathname() ?? '').toLowerCase();

  // Hide the public footer on admin dashboards & their subpages
  const hide =
    pathname === '/auso' ||
    pathname.startsWith('/auso/') ||
    pathname === '/sau' ||
    pathname.startsWith('/sau/');

  if (hide) return null;

  // Public site footer
  return (
    <footer className="bg-gray-800 text-white mt-16">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-4">AU Impact</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Empowering students through volunteering, fundraising, and community engagement at Assumption University. 
              Join us in making a positive impact on our campus and beyond.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/public/event" className="text-gray-300 hover:text-white transition-colors">Events</Link></li>
              <li><Link href="/public/fundraising" className="text-gray-300 hover:text-white transition-colors">Fundraising</Link></li>
              <li><Link href="/public/merchandise" className="text-gray-300 hover:text-white transition-colors">Merchandise</Link></li>
              <li><Link href="/public/announcements" className="text-gray-300 hover:text-white transition-colors">Announcements</Link></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="text-gray-300 hover:text-white transition-colors">Login</Link></li>
              <li><Link href="/public/create-account" className="text-gray-300 hover:text-white transition-colors">Create Account</Link></li>
              <li><Link href="/public/profile" className="text-gray-300 hover:text-white transition-colors">Profile</Link></li>
              <li><Link href="/public/search" className="text-gray-300 hover:text-white transition-colors">Search</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} AU Impact. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}