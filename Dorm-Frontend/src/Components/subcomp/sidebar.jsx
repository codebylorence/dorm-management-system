import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSystem } from '../../context/SystemContext';
import { toast } from 'react-toastify';
import logo from '../../assets/logo.png'
import {
  FaBars,
  FaMoneyCheckAlt,
  FaCog,
  FaHouseUser,
  FaDoorClosed,
  FaSignOutAlt,

} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { GrVmMaintenance } from "react-icons/gr";
import { GrAnnounce } from "react-icons/gr";
import { VscGitStashApply } from "react-icons/vsc";
import { TbContract } from "react-icons/tb";

export default function sidebar({ open, setOpen }) {
  const { logout } = useAuth();
  const { systemSettings } = useSystem();
  const navigate = useNavigate();

  // Generate abbreviation from system name
  const getSystemAbbreviation = (systemName) => {
    if (!systemName) return 'DMS';
    
    // Split by spaces and take first letter of each word
    const words = systemName.split(' ');
    if (words.length >= 2) {
      return words.map(word => word.charAt(0).toUpperCase()).join('');
    }
    
    // If single word, take first 3 characters
    return systemName.substring(0, 3).toUpperCase();
  };

  const menuItems = [
  { name: "Units", icon: <FaDoorClosed />, path: "/" },
  { name: "Tenants", icon: <FaHouseUser />, path: "/tenantoverview" },
  { name: "Payments", icon: <FaMoneyCheckAlt />, path: "/payments" },
  { name: "Settings", icon: <FaCog />, path: "/settings" },

];

 const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error logging out");
    }
  };

  return (
    <div className="flex flex-col md:flex-row">
      <div
        className={`bg-gray-100 md:h-full ${
        open ? "h-screen" : "h-20"
        } w-full md:w-20 p-5 pt-5 md:pt-5 shadow-md relative 
        transition-all duration-300 ease-in-out transform
        ${open ? "w-64 md:w-70" : "w-16"} 
        ${open && "fixed inset-0 z-50 overflow-y-auto md:static"}`}
        >
        <div
        className={`flex items-center mb-6 h-10 ${
        open ? "justify-between" : "justify-start md:justify-center"
        }`}
        >
            {/* LOGO + TITLE */}
            <div className={`flex items-center gap-2 ${!open ? "md:hidden" : ""}`}>
                <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
                <h1 className={`font-RegularMilk text-base  ${!open ? "md:hidden" : ""}`}>
                {getSystemAbbreviation(systemSettings.systemName)}
                </h1>
            </div>

            {/* TOGGLE BUTTON */}
            <button
                className="text-2xl text-[#db6747] ml-auto md:ml-0"
                onClick={() => setOpen(!open)}
            >
                <FaBars />
            </button>
        </div>

        <ul
        className={`pt-2 space-y-7 ${
          open ? "block" : "hidden md:block"
        } flex flex-col items-center md:items-stretch`}
        >
          {menuItems.map((item, index) => (
            <li
              key={index}
              className={`font-LightMilk group hover:bg-[#db6747] rounded-md flex items-center cursor-pointer text-base w-full px-1 py-1 ${
                open ? "justify-start gap-2" : "justify-center"
              }`}
            >
              <Link
                to={item.path}
                className="flex items-center w-full h-full text-inherit no-underline gap-x-2"
              >
                <span className="text-[23px] text-[#db6747] group-hover:text-white transition-colors duration-200 p-1 ">
                  {item.icon}
                </span>
                {open && (
                  <span className="whitespace-nowrap text-sm text-black group-hover:text-white transition-colors duration-200">
                    {item.name}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
         <ul
        className={`pt-7 space-y-7 ${
          open ? "block" : "hidden md:block"
        } flex flex-col items-center md:items-stretch`}
        >
          <li
            onClick={handleLogout}
            className={`font-LightMilk group hover:bg-[#db6747] rounded-md flex items-center cursor-pointer text-base w-full px-1 py-1 ${
              open ? "justify-start gap-2" : "justify-center"
            }`}
          >
            <span className="text-[23px] text-[#db6747] group-hover:text-white transition-colors duration-200 p-1">
              <FaSignOutAlt />
            </span>
            {open && (
              <span className="whitespace-nowrap text-sm text-black group-hover:text-white transition-colors duration-200">
                Log Out
              </span>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
}
