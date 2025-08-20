import Link from 'next/link';
import Image from 'next/image';

// Common footer
export default function Footer() {
  const currentYear = new Date().getFullYear(); // Get current year

  return (
    <footer className="bg-gray-800 py-4 text-white">
      <div className="container mx-auto px-4 max-w-6xl grid grid-cols-1 md:grid-cols-[4fr_2fr_2fr] gap-8 border-b border-gray-700 pb-8 mb-8">
        <div>
          <h3 className="text-xl mb-4">About MAPLE Store</h3>
          <p className="text-sm pr-18">We deliver Canadian products directly to your door. Our mission is to provide the highest quality products while ensuring a seamless shopping experience.</p>
        </div>

        <div>
          <h3 className="text-xl mb-4">Quick Links</h3>
          <ul className="space-y-2 list-none pl-0">
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms of Service</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl mb-4">Contact Us</h3>
          <p><Link href="/contact">Contact Us Here</Link></p>
          <div className="flex space-x-4 mt-5">
            <Image src="/icons/facebook-icon.png" alt="Facebook" width={24} height={24} className="w-6 h-6" />
            <Image src="/icons/x-icon.svg" alt="X" width={24} height={24} className="w-6 h-6" />
            <Image src="/icons/youtube-icon.svg" alt="Instagram" width={24} height={24} className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8 text-center text-sm">
        <p>&copy; {currentYear} MAPLE Store. All Rights Reserved.</p>
      </div>
    </footer>
  );
}