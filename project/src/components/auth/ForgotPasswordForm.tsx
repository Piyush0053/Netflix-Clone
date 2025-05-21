import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { resetPassword } from '../../lib/index';
import FormField from '../ui/FormField';
import { ChevronRight } from 'lucide-react';

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
});

const ForgotPasswordForm: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (
    values: { email: string },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      const { data, error } = await resetPassword(values.email);
      
      if (error) {
        throw error;
      }

      toast.success('Password reset instructions sent to your email');
      navigate('/signin');
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast.error(error.message || 'Failed to send reset email');
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
      <h1 className="text-3xl font-bold mb-2">Forgot Password</h1>
      <p className="text-netflix-light-gray mb-8">
        We'll send you an email with instructions to reset your password
      </p>
      
      <Formik
        initialValues={{ email: '' }}
        validationSchema={ForgotPasswordSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <FormField
              name="email"
              label="Email"
              type="email"
            />
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-red btn-xl w-full mt-8 flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Send Reset Link <ChevronRight size={20} className="ml-1" />
                </>
              )}
            </button>
          </Form>
        )}
      </Formik>
      
      <div className="mt-16 text-netflix-light-gray">
        <p>
          Remember your password?{' '}
          <Link to="/signin" className="text-white hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default ForgotPasswordForm; 