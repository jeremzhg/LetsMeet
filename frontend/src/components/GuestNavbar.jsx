import { useRef, useEffect, useState } from "react";

const GuestNavbar = ({ onHeightChange }) => {
  const navRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (navRef.current && typeof onHeightChange === "function") {
      const height = navRef.current.offsetHeight;
      onHeightChange(height);
    }
  }, [onHeightChange, isOpen]);

  return (
    <nav
      ref={navRef}
      className="sticky top-0 z-50 w-full bg-white shadow-sm transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo on far left */}
          <div className="flex-shrink-0 flex items-center">
            <a
              href="#home"
              className="text-blue-600 font-bold text-2xl tracking-tight"
            >
              LetsMeet
            </a>
          </div>

          {/* Desktop Center Links */}
          <div className="hidden lg:flex flex-1 justify-center space-x-2 xl:space-x-4">
            <a
              href="#home"
              className="text-gray-600 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:-translate-y-0.5"
            >
              Home
            </a>
            <a
              href="#browse-events"
              className="text-gray-600 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:-translate-y-0.5"
            >
              Browse Events
            </a>
            <a
              href="#browse-sponsors"
              className="text-gray-600 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:-translate-y-0.5"
            >
              Browse Sponsors
            </a>
            <a
              href="#about-us"
              className="text-gray-600 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:-translate-y-0.5"
            >
              About Us
            </a>
          </div>

          {/* Desktop Right Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            <button className="bg-gray-100 text-gray-900 hover:bg-gray-200 px-6 py-2 rounded-full font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              Login
            </button>
            <button className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-full font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg shadow-blue-500/30">
              Sign Up
            </button>
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 rounded-lg transition-colors border-0 shadow-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg border-t border-gray-100 rounded-b-xl transition-all duration-300 mt-2 mx-2">
          <a
            href="#home"
            className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 text-center"
          >
            Home
          </a>
          <a
            href="#browse-events"
            className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 text-center"
          >
            Browse Events
          </a>
          <a
            href="#browse-sponsors"
            className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 text-center"
          >
            Browse Sponsors
          </a>
          <a
            href="#about-us"
            className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 text-center"
          >
            About Us
          </a>
          <div className="mt-4 border-t border-gray-200 pt-4 flex flex-col space-y-3">
            <button className="w-full bg-gray-100 text-gray-900 hover:bg-gray-200 px-4 py-3 rounded-full font-semibold transition-colors">
              Login
            </button>
            <button className="w-full bg-blue-600 text-white hover:bg-blue-700 px-4 py-3 rounded-full font-semibold transition-colors">
              Sign Up
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default GuestNavbar;
