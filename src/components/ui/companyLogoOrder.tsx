import React, { useState, useEffect } from 'react';

// Define a type for the component's props
type CompanyLogoProps = {
  companyName: string;
};

const CompanyLogo: React.FC<CompanyLogoProps> = ({ companyName }) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (companyName !== "") {
      // Construct the URL for Clearbit's Logo API
      const fetchLogoUrl = `https://logo.clearbit.com/${encodeURIComponent(companyName)}`;
      setLogoUrl(fetchLogoUrl);
    } else {
      setLogoUrl(null); // Clear the logo URL if the company name is empty
    }
  }, [companyName]);

  if (!logoUrl) {
    return null; // Return null if there's no logo URL
  }

  return <img src={logoUrl} alt={`${companyName} logo`} className="h-20 object-contain" />;
};

export default CompanyLogo;