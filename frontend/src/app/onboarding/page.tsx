'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// 1. Define the Zod Schema (Matches your FastAPI Pydantic Schema exactly)
const profileSchema = z.object({
  age: z.number().min(18, 'You must be at least 18').max(120, 'Invalid age'),
  biological_sex: z.string().refine((val) => ['Male', 'Female', 'Other'].includes(val), {
    message: 'Please select a biological sex',
  }),
  antibiotic_history_6_months: z.boolean(),
  daily_fiber_grams: z.number().min(0, 'Cannot be negative').max(100, 'Check fiber amount'),
  vegetarian_or_vegan: z.boolean(),
});

// Infer the TypeScript type from the Zod schema
type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Onboarding() {
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  // 2. Initialize React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      antibiotic_history_6_months: false,
      vegetarian_or_vegan: false,
    },
  });

  // 3. Handle the form submission to FastAPI
  const onSubmit = async (data: ProfileFormValues) => {
    setSubmitStatus({ type: null, message: '' });
    try {
      const response = await fetch('http://localhost:8000/api/v1/proxy-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to save profile');
      
      const result = await response.json();
      setSubmitStatus({ 
        type: 'success', 
        message: `Profile saved successfully! Database ID: ${result.id}` 
      });
      // In the future, we would redirect the user to the dashboard here
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'Failed to connect to the server.' });
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-950 text-gray-100">
      <div className="w-full max-w-md p-8 bg-gray-900 rounded-xl shadow-2xl border border-gray-800">
        <h1 className="text-2xl font-bold mb-6 text-white text-center">Microbiome Proxy Quiz</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Age Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Age</label>
            <input
              type="number"
              {...register('age', { valueAsNumber: true })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.age && <p className="text-red-400 text-xs mt-1">{errors.age.message}</p>}
          </div>

          {/* Biological Sex */}
          <div>
            <label className="block text-sm font-medium mb-2">Biological Sex</label>
            <select
              {...register('biological_sex')}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.biological_sex && <p className="text-red-400 text-xs mt-1">{errors.biological_sex.message}</p>}
          </div>

          {/* Fiber Intake */}
          <div>
            <label className="block text-sm font-medium mb-2">Daily Fiber Intake (grams)</label>
            <input
              type="number"
              {...register('daily_fiber_grams', { valueAsNumber: true })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.daily_fiber_grams && <p className="text-red-400 text-xs mt-1">{errors.daily_fiber_grams.message}</p>}
          </div>

          {/* Booleans (Checkboxes) */}
          <div className="space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('antibiotic_history_6_months')}
                className="w-5 h-5 rounded border-gray-700 text-indigo-600 focus:ring-indigo-500 bg-gray-800"
              />
              <span className="text-sm font-medium">Antibiotics in the last 6 months?</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('vegetarian_or_vegan')}
                className="w-5 h-5 rounded border-gray-700 text-indigo-600 focus:ring-indigo-500 bg-gray-800"
              />
              <span className="text-sm font-medium">Are you Vegetarian or Vegan?</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 rounded-md font-bold text-white transition-colors"
          >
            {isSubmitting ? 'Saving...' : 'Complete Onboarding'}
          </button>
        </form>

        {/* Status Messages */}
        {submitStatus.type && (
          <div className={`mt-6 p-4 rounded-md text-sm text-center ${
            submitStatus.type === 'success' ? 'bg-emerald-900/50 border border-emerald-800 text-emerald-400' : 'bg-red-900/50 border border-red-800 text-red-400'
          }`}>
            {submitStatus.message}
          </div>
        )}
      </div>
    </main>
  );
}