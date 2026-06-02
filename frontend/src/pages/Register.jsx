import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { api } from '../utils/api';
import { useToast } from '../components/Toast';

const Register = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    
    if (!confirmPassword) newErrors.confirmPassword = 'Confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      // Base API URL is handled in api.js
      const response = await api.post('/auth/register', { name, email, password });
      
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        showToast('Account created successfully!', 'success');
        navigate('/dashboard');
      } else {
        showToast(response.message || 'Registration failed. Please try again.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'An error occurred during registration.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-2xl">
            K
          </div>
          <h1 className="font-bold text-2xl text-gray-800">Create Account</h1>
          <p className="text-gray-500 text-sm">Join the KitPup community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); if (errors.name) setErrors({...errors, name: null}); }}
              placeholder="John Doe"
              className={`w-full px-4 py-2 rounded-lg border ${errors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-200'} focus:ring-2 focus:outline-none transition-all`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({...errors, email: null}); }}
              placeholder="you@example.com"
              className={`w-full px-4 py-2 rounded-lg border ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-200'} focus:ring-2 focus:outline-none transition-all`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({...errors, password: null}); }}
                placeholder="Min. 8 characters"
                className={`w-full px-4 py-2 rounded-lg border pr-10 ${errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-200'} focus:ring-2 focus:outline-none transition-all`}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors({...errors, confirmPassword: null}); }}
                placeholder="Confirm password"
                className={`w-full px-4 py-2 rounded-lg border pr-10 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-200'} focus:ring-2 focus:outline-none transition-all`}
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-6 disabled:opacity-70"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account? <Link to="/login" className="text-orange-600 hover:text-orange-700 font-medium">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
