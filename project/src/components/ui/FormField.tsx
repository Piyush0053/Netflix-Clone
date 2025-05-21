import React from 'react';
import { Field, ErrorMessage } from 'formik';
import { motion } from 'framer-motion';

interface FormFieldProps {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  autocomplete?: string;
}

const FormField: React.FC<FormFieldProps> = ({ name, label, type, placeholder, autocomplete }) => {
  return (
    <div className="mb-4 relative">
      <Field name={name}>
        {({ field, meta }: any) => (
          <div className="relative">
            <input
              {...field}
              type={type}
              className={`w-full p-3 bg-netflix-dark-gray text-white rounded border border-netflix-medium-gray focus:border-netflix-red outline-none transition-all duration-300 ${meta.touched && meta.error ? 'border-netflix-red' : ''}`}
              placeholder={placeholder || ' '}
              id={name}
              autoComplete={autocomplete || 'off'}
            />
            <label
              htmlFor={name}
              className={`absolute text-[#8c8c8c] left-4 top-4 transition-all duration-200 ${field.value ? 'text-xs -translate-y-2.5' : 'peer-focus:text-xs peer-focus:-translate-y-2.5'}`}
            >
              {label}
            </label>
          </div>
        )}
      </Field>
      <ErrorMessage name={name}>
        {(msg) => (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-netflix-red text-sm mt-1"
          >
            {msg}
          </motion.div>
        )}
      </ErrorMessage>
    </div>
  );
};

export default FormField;