import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSystem } from '../context/SystemContext';
import { toast } from 'react-toastify';
import logo from '../assets/logo.png';
import loginBg from '../assets/landingpagebg.png';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { systemSettings } = useSystem();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Please enter both username and password');
      return;
    }

    setLoading(true);

    try {
      await login(username, password);
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="w-full max-w-md px-6">
        {/* Login Card */}
        <div className="bg-gradient-to-r from-[#fee8da] to-[#efd4c4] shadow-[15px_13px_0px_#330101] rounded-2xl p-8">
          {/* Logo and Title */}
          <div className="flex flex-col items-center mb-8">
            <img src={logo} alt="Logo" className="w-24 h-24 object-contain mb-4" />
            <h1 className="font-[BoldMilk] tracking-[10px] text-[32px] text-[#4b150d] uppercase">
              {getSystemAbbreviation(systemSettings.systemName)}
            </h1>
            <p className="font-[LightMilk] text-[#4b150d] text-sm mt-2">
              {systemSettings.systemName}
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Input */}
            <div>
              <label 
                htmlFor="username" 
                className="block text-[#4b150d] font-[LightMilk] text-sm mb-2"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-[#4b150d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747] text-[#4b150d] font-[BAHNSCHRIFT]"
                placeholder="Enter your username"
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-[#4b150d] font-[LightMilk] text-sm mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-[#4b150d] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#db6747] text-[#4b150d] font-[BAHNSCHRIFT]"
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 bg-gradient-to-r from-[#db6747] to-[#c44d30] text-white font-[BoldMilk] tracking-widest uppercase rounded-lg shadow-[8px_8px_0px_#330101] hover:shadow-[12px_12px_0px_#330101] transition-all duration-200 ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:translate-x-1 hover:-translate-y-1'
              }`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-[#4b150d] text-xs font-[LightMilk]">
              For assistance, contact your administrator
            </p>
          </div>
        </div>

        {/* Version Info */}
        <div className="text-center mt-6">
          <p className="text-white text-xs font-[LightMilk] drop-shadow-lg">
            Version {systemSettings.version} © 2025
          </p>
        </div>
      </div>
    </div>
  );
}

