
import React, { useState } from 'react';
import { BusinessProfile } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import TextArea from './ui/TextArea';

interface BusinessProfileViewProps {
  onSubmit: (profile: BusinessProfile) => void;
}

const BusinessProfileView: React.FC<BusinessProfileViewProps> = ({ onSubmit }) => {
  const [profile, setProfile] = useState<BusinessProfile>({
    sector: '',
    kpis: '',
    customerTypes: '',
    productMix: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(profile);
  };
  
  const isFormValid = Object.values(profile).every(field => field.trim() !== '');

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Card className="max-w-2xl w-full">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-white mb-2">Create Your Business Profile</h2>
          <p className="text-gray-400 mb-6">This context helps the AI provide personalized analysis and recommendations.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Industry / Sector"
              name="sector"
              value={profile.sector}
              onChange={handleChange}
              placeholder="e.g., SaaS, E-commerce, Retail"
              required
            />
            <TextArea
              label="Key Performance Indicators (KPIs)"
              name="kpis"
              value={profile.kpis}
              onChange={handleChange}
              placeholder="e.g., Monthly Recurring Revenue (MRR), Customer Acquisition Cost (CAC), Churn Rate"
              required
              rows={3}
            />
            <Input
              label="Primary Customer Types"
              name="customerTypes"
              value={profile.customerTypes}
              onChange={handleChange}
              placeholder="e.g., SMBs, Enterprise clients, Individual consumers"
              required
            />
            <Input
              label="Product / Service Mix"
              name="productMix"
              value={profile.productMix}
              onChange={handleChange}
              placeholder="e.g., Subscription tiers (Basic, Pro), One-time purchase items"
              required
            />
            <div className="pt-4">
              <Button type="submit" disabled={!isFormValid} className="w-full">
                Continue to Data Upload
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default BusinessProfileView;
