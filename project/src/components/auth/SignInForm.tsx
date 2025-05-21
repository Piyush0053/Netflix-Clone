import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { signIn } from '../../lib/supabase';
import FormField from '../ui/FormField';
import { ChevronRight } from 'lucide-react';
import './Auth.css';

const SignInSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required'),
});

const SignInForm: React.FC = () => {
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (
    values: { email: string; password: string },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      const { data, error } = await signIn(values.email, values.password);
      
      if (error) {
        if (error.message === 'You are already logged in on another device. Please log out from that device first.') {
          toast.error('Already logged in on another device. Please log out from there first.', { duration: 5000 });
        } else {
          toast.error(error.message || 'Invalid email or password');
        }
        throw error;
      }

      if (data) {
        // Supabase handles session storage automatically
        // We just need to redirect to the browse page
        toast.success('Sign in successful!');
        navigate('/browse');
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
      // Error is already handled above with toast message
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="form-container glass-effect"
    >
      <h1 className="text-3xl font-bold mb-2">Sign In</h1>
      <p className="text-netflix-light-gray mb-8">
        Sign in to your Netflix account
      </p>
      
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={SignInSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <FormField
              name="email"
              label="Email"
              type="email"
              autocomplete="username email"
            />
            
            <FormField
              name="password"
              label="Password"
              type="password"
              autocomplete="current-password"
            />
            
            <div className="flex items-center justify-between mt-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 mr-2"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <span className="text-sm text-netflix-light-gray">Remember me</span>
              </label>
              
              <Link to="/forgot-password" className="text-sm text-netflix-light-gray hover:underline">
                Forgot password?
              </Link>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-red btn-xl w-full mt-8 flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In <ChevronRight size={20} className="ml-1" />
                </>
              )}
            </button>
          </Form>
        )}
      </Formik>
      
      <div className="mt-16 text-netflix-light-gray">
        <p>
          New to Netflix?{' '}
          <Link to="/signup" className="text-white hover:underline">
            Sign up now
          </Link>
        </p>
        <p className="mt-4 text-sm">
          This page is protected by Google reCAPTCHA to ensure you're not a bot.
        </p>
      </div>
    </motion.div>
  );
};

export default SignInForm; 