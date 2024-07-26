import React, { useState, useEffect } from 'react';

type CompanyLogoProps = {
  companyName: string;
};

const CompanyLogo: React.FC<CompanyLogoProps> = ({ companyName }) => {
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    // Construct the URL for Clearbit's Logo API
    if (companyName !== "") {
      const fetchLogoUrl = `https://logo.clearbit.com/${encodeURIComponent(companyName)}`;
      setLogoUrl(fetchLogoUrl);
    } else {
      // Fallback image if companyName is not provided
      setLogoUrl("https://s3.amazonaws.com/boretec.com/images/genericCompany.jpeg");
    }
  }, [companyName]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://s3.amazonaws.com/boretec.com/images/genericCompany.jpeg';
  };

  return (
    <img
      src={logoUrl}
      alt={`${companyName || 'Generic Company'}`}
      className="h-10"
      onError={handleImageError}
    />
  );
};

export default CompanyLogo;
