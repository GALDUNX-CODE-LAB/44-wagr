import Link from "next/link";
import Image from "next/image";
import { InstagramIcon, TwitterIcon, PhoneIcon as WhatsappIcon, MailIcon, PhoneIcon } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#212121] text-[#9ca3af] text-sm py-10 px-6 md:px-20 mt-10 border-t border-white/10">
      <div className="flex items-center mb-10">
        <Image src="/assets/44.png" width={100} height={100} alt="44-wagr" />
      </div>

      <div className="container mx-auto grid grid-cols-2 lg:grid-cols-4 gap-10">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-medium text-white">Betting</h3>
          <ul className="space-y-2 text-white/70">
            <li>
              <Link href="#" className="hover:underline underline-offset-4">
                Crash Game
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:underline underline-offset-4">
                Dice Game
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:underline underline-offset-4">
                Poly Market
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:underline underline-offset-4">
                Aviator
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:underline underline-offset-4">
                Flip Game
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:underline underline-offset-4">
                Wheel
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-medium text-white mb-4">Support</h3>
          <ul className="space-y-2 text-white/70">
            <li>24/7 Live Chat Assistance</li>
            <li>Quick Response via Email</li>
            <li>Secure & Fair Play Policy</li>
            <li>Step-by-Step Game Guides</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-medium text-white mb-4">About Us</h3>
          <div className="space-y-3 text-white/70">
            <p>
              44Wagr offers transparent and engaging blockchain-based betting experiences. We combine fun, fairness, and
              crypto innovation for all players.
            </p>
            <div className="flex items-center gap-2">
              <MailIcon className="h-4 w-4" />
              <a href="mailto:info@44wagr.com" className="hover:underline underline-offset-4">
                info@44wagr.com
              </a>
            </div>
            <div className="flex items-center gap-2">
              <PhoneIcon className="h-4 w-4" />
              <a href="tel:+2348012345678" className="hover:underline underline-offset-4">
                +234 801 234 5678
              </a>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-white mb-4">FAQs</h3>
          <ul className="space-y-2 text-white/70">
            <li>How do I create an account?</li>
            <li>What payment methods are supported?</li>
            <li>How do I withdraw my winnings?</li>
            <li>Is my data and money secure?</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 mt-10 pt-6 flex flex-col lg:flex-row items-center justify-between gap-4 text-xs text-white/60">
        <div className="text-center lg:text-left space-y-1">
          <p>&copy; {new Date().getFullYear()} 44Wagr. All rights reserved.</p>
          <p>
            Gambling can be addictive. Play responsibly. Only for individuals aged{" "}
            <span className="text-primary font-semibold">18 years and above.</span>
          </p>
        </div>

        <div className="flex items-center gap-4 text-white/60">
          <Link href="#" aria-label="Instagram" className="hover:text-primary transition-colors">
            <InstagramIcon className="h-5 w-5" />
          </Link>
          <Link href="#" aria-label="Twitter" className="hover:text-primary transition-colors">
            <TwitterIcon className="h-5 w-5" />
          </Link>
          <Link href="#" aria-label="WhatsApp" className="hover:text-primary transition-colors">
            <WhatsappIcon className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
