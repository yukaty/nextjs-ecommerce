import Link from 'next/link';
import { FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa';

// Common footer
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-stone-100 mt-12 py-4 text-stone-700">
      <div className="container mx-auto px-4 max-w-6xl grid grid-cols-1 md:grid-cols-[4fr_2fr_2fr] gap-8 border-b border-stone-300 pb-8 mb-8">
        <div>
          <h3 className="text-xl mb-4">About MAPLE Store</h3>
          <p className="text-sm pr-18">We deliver Canadian products directly to your door. Our mission is to provide the highest quality products while ensuring a seamless shopping experience.</p>
        </div>

        <div>
          <h3 className="text-xl mb-4">Quick Links</h3>
          <ul className="space-y-2 list-none pl-0">
            <li><Link href="/privacy" className="hover:text-brand-500 transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-brand-500 transition-colors">Terms of Service</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl mb-4">Contact Us</h3>
          <p><Link href="/contact" className="hover:text-brand-500 transition-colors">Send Message</Link></p>
          <div className="flex space-x-4 mt-5">
            <FaFacebook className="w-6 h-6 text-stone-500 hover:text-brand-500 transition-colors cursor-pointer" />
            <FaInstagram className="w-6 h-6 text-stone-500 hover:text-brand-500 transition-colors cursor-pointer" />
            <FaYoutube className="w-6 h-6 text-stone-500 hover:text-brand-500 transition-colors cursor-pointer" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 text-center text-sm">
        <p>&copy; {currentYear} MAPLE Store. All Rights Reserved.</p>
      </div>
    </footer>
  );
}