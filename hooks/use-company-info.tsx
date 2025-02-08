import { useState, useEffect } from 'react';
import axios from 'axios';

interface CompanyInfo {
  sectionName: string;
  telephone: string | null;
  mobileWazir: string | null;
  mobileDin: string | null;
  email: string | null;
}

export const useCompanyInfo = (sectionId: string) => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      if (!sectionId) {
        setError('Section ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`/api/sections/${sectionId}/info`);
        setCompanyInfo(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch company information');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyInfo();
  }, [sectionId]);

  return { companyInfo, loading, error };
};