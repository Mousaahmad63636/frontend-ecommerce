import { useState } from 'react';

export function useForm(initialValues = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validate = (validationRules) => {
    const newErrors = {};
    Object.keys(validationRules).forEach(key => {
      const value = values[key];
      const rules = validationRules[key];
      
      if (rules.required && !value) {
        newErrors[key] = 'This field is required';
      } else if (rules.minLength && value.length < rules.minLength) {
        newErrors[key] = `Must be at least ${rules.minLength} characters`;
      } else if (rules.pattern && !rules.pattern.test(value)) {
        newErrors[key] = rules.message || 'Invalid format';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
  };

  return {
    values,
    errors,
    handleChange,
    validate,
    resetForm,
    setValues
  };
}