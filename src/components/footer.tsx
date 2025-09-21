import Link from "next/link";
import { InstagramIcon, TwitterIcon, PhoneIcon as WhatsappIcon, MailIcon, PhoneIcon } from "lucide-react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-[#212121] text-[#9ca3af] text-base py-8 px-5 md:px-20 mt-5">
      <h1 className="text-white text-lg font-medium md:text-2xl mb-8">
        <Image src={"/assets/44.png"} width={100} height={100} alt="44-wagr" />
      </h1>

      <div className="container mx-auto grid grid-cols-2 lg:grid-cols-4 justify-around gap-10">
        {/* Betting Section */}
        <div className="flex flex-col gap-4 col-span-1">
          <h3 className="flex items-center gap-2 text-lg font-medium text-white">Betting</h3>
          <ul className="space-y-2 text-white/65">
            <li>
              <Link href="#" className="text-sm hover:underline underline-offset-4">
                Crash Game
              </Link>
            </li>
            <li>
              <Link href="#" className="text-sm hover:underline underline-offset-4">
                Dice Game
              </Link>
            </li>
            <li>
              <Link href="#" className="text-sm hover:underline underline-offset-4">
                Poly Market
              </Link>
            </li>
            <li>
              <Link href="#" className="text-sm hover:underline underline-offset-4">
                Aviator
              </Link>
            </li>
            <li>
              <Link href="#" className="text-sm hover:underline underline-offset-4">
                Flip Game
              </Link>
            </li>
            <li>
              <Link href="#" className="text-sm hover:underline underline-offset-4">
                Wheel
              </Link>
            </li>
          </ul>
        </div>

        {/* Support Section */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">Support</h3>
          <ul className=" space-y-2 text-white/65 text-sm">
            <li>24/7 Live Chat Assistance</li>
            <li>Quick Response via Email</li>
            <li>Secure & Fair Play Policy</li>
            <li>Step-by-Step Game Guides</li>
          </ul>
        </div>

        {/* About Us Section */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">About Us</h3>
          <div className="space-y-2 text-white/65 ">
            <p className="text-sm">
              44Betting is your trusted platform for innovative and entertaining betting experiences. We combine fun,
              transparency, and fairness to give players the best possible gaming journey.
            </p>
            <div className="flex items-center gap-2">
              <MailIcon className="h-4 w-4" />
              <a href="mailto:info@44betting.com" className="text-sm hover:underline underline-offset-4">
                info@44betting.com
              </a>
            </div>
            <div className="flex items-center gap-2">
              <PhoneIcon className="h-4 w-4" />
              <a href="tel:+2348012345678" className="text-sm hover:underline underline-offset-4">
                +234 801 234 5678
              </a>
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        <div>
          <h3 className="text-lg font-medium text-white mb-4">FAQs</h3>
          <ul className=" space-y-2 text-white/65 text-sm">
            <li>How do I create an account?</li>
            <li>What payment methods are supported?</li>
            <li>How do I withdraw my winnings?</li>
            <li>Is my data and money secure?</li>
          </ul>
        </div>
      </div>

      {/* Mobile: Social links bottom left */}
      <div className="lg:hidden mt-8 pt-8 ">
        <div className="flex gap-4 mb-4 text-white/50">
          <Link href="#" aria-label="Instagram">
            <InstagramIcon className="h-6 w-6 hover:text-white transition-colors" />
          </Link>
          <Link href="#" aria-label="Twitter">
            <TwitterIcon className="h-6 w-6 hover:text-white transition-colors" />
          </Link>
          <Link href="#" aria-label="WhatsApp">
            <WhatsappIcon className="h-6 w-6 hover:text-white transition-colors" />
          </Link>
        </div>
        <div className="text-center text-xs text-white/65">
          &copy; {new Date().getFullYear()} 44Betting. All rights reserved.
        </div>
      </div>

      {/* Desktop Footer Bottom */}
      <div className="hidden lg:flex container mx-auto justify-between items-center text-xs text-white/50 mt-8 pt-8 border-t border-white/12">
        <div></div>
        <div className="text-center text-white/65">
          &copy; {new Date().getFullYear()} 44Betting. All rights reserved.
        </div>
        <div className="flex gap-4">
          <Link href="#" aria-label="Instagram">
            <InstagramIcon className="h-6 w-6 hover:text-white transition-colors" />
          </Link>
          <Link href="#" aria-label="Twitter">
            <TwitterIcon className="h-6 w-6 hover:text-white transition-colors" />
          </Link>
          <Link href="#" aria-label="WhatsApp">
            <WhatsappIcon className="h-6 w-6 hover:text-white transition-colors" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
