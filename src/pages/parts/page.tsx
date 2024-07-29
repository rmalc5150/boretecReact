"use client"

import { useState } from 'react';
import PartsCards from '../../components/sections/PartsCards'

const Parts = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Function to toggle mobile menu
    const toggleMobileMenu = () => {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    };
  return (
    
      <div className="w-full h-screen bg-gray-100">

<nav className="bg-white p-2 md:mx-2 md:my-2 md:rounded-xl md:border md:border-gray-100">
    <div className="mx-auto px-4">
        <div className="flex justify-between">
            <div className="flex space-x-7">
                <div>
                 
                    <a href="https://Boretec.com/index.html" className="flex px-2 text-gray-600">
                        <div>
                            <img src="https://boretec.com/images/boretecBlack.png" alt="Logo" className="h-20 w-20 mx-auto"/>
                        </div>
                    </a>
                </div>
           
                <div className="hidden md:flex items-center space-x-8">

                    <a href="https://Boretec.com/products.html" className="hover:text-black font-medium text-gray-500">Products</a>
                    <a href="https://Boretec.com/about.html" className="hover:text-black font-medium text-gray-500">About Us</a>


                    <a href="https://Boretec.com/blog.html" className="hover:text-black font-medium text-gray-500">Blog</a>

                    <a href="https://Boretec.com/contact-us.html" className="hover:text-black font-medium text-gray-500">Contact Us</a>
                </div>
            </div>
        
           

            <div className="hidden md:flex items-center space-x-3">
                <a href="tel:+18647081250"
                    className="inline-flex items-center text-base font-medium bg-transparent text-gray-900 opacity-50 hover:opacity-100">
                    <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M11.914857,14.1427403 L14.1188827,11.9387145 C14.7276032,11.329994 14.8785122,10.4000511 14.4935235,9.63007378 L14.3686433,9.38031323 C13.9836546,8.61033591 14.1345636,7.680393 14.7432841,7.07167248 L17.4760882,4.33886839 C17.6713503,4.14360624 17.9879328,4.14360624 18.183195,4.33886839 C18.2211956,4.37686904 18.2528214,4.42074752 18.2768552,4.46881498 L19.3808309,6.67676638 C20.2253855,8.3658756 19.8943345,10.4059034 18.5589765,11.7412615 L12.560151,17.740087 C11.1066115,19.1936265 8.95659008,19.7011777 7.00646221,19.0511351 L4.5919826,18.2463085 C4.33001094,18.1589846 4.18843095,17.8758246 4.27575484,17.613853 C4.30030124,17.5402138 4.34165566,17.4733009 4.39654309,17.4184135 L7.04781491,14.7671417 C7.65653544,14.1584211 8.58647835,14.0075122 9.35645567,14.3925008 L9.60621621,14.5173811 C10.3761935,14.9023698 11.3061364,14.7514608 11.914857,14.1427403 Z"
                            fill="#000000" />
                    </svg>
                    <span className="text-sm">(864) 708-1250</span>
                </a>

                <a href="https://inventory.boretec.com"
                    className="inline-flex items-center text-base opacity-50 hover:opacity-100">
                    <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M5,6 L19,6 C20.1045695,6 21,6.8954305 21,8 L21,17 C21,18.1045695 20.1045695,19 19,19 L5,19 C3.8954305,19 3,18.1045695 3,17 L3,8 C3,6.8954305 3.8954305,6 5,6 Z M18.1444251,7.83964668 L12,11.1481833 L5.85557487,7.83964668 C5.4908718,7.6432681 5.03602525,7.77972206 4.83964668,8.14442513 C4.6432681,8.5091282 4.77972206,8.96397475 5.14442513,9.16035332 L11.6444251,12.6603533 C11.8664074,12.7798822 12.1335926,12.7798822 12.3555749,12.6603533 L18.8555749,9.16035332 C19.2202779,8.96397475 19.3567319,8.5091282 19.1603533,8.14442513 C18.9639747,7.77972206 18.5091282,7.6432681 18.1444251,7.83964668 Z"
                            fill="#000000" />
                    </svg>
                    </a>
            </div>


       
        
            <div className="md:hidden flex items-center">
                <button className="outline-none mobile-menu-button" onClick={toggleMobileMenu}>
                    <svg className=" w-6 h-6 text-gray-400 hover:text-gray-500" x-show="!showMenu" fill="none"
                        strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </div>
        </div>
    </div>
  
    <div className={`mobile-menu ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <ul className="">
            <li><a href="https://Boretec.com/products.html" className="hover:text-black font-medium text-gray-500">Products</a></li>
            <li><a href="https://Boretec.com/about.html" className="hover:text-black font-medium text-gray-500">About Us</a></li>
            <li><a href="https://Boretec.com/blog.html" className="hover:text-black font-medium text-gray-500">Blog</a></li>
            <li><a href="https://Boretec.com/contact-us.html" className="hover:text-black font-medium text-gray-500">Contact Us</a></li>

        </ul>
    </div>
</nav>
<div className="flex justify-end mt-1 md:mt-0 items-top px-2 text-xs opacity-70 font-semibold">
    <p className="">Providers of</p><img src="https://boretec.com/images/mcL-logo.png" alt="McL Logo"
        className="h-6 ml-1"/>
</div>
    <div className="px-2">
    <PartsCards />
    </div>
    </div>
    
  )
}

export default Parts