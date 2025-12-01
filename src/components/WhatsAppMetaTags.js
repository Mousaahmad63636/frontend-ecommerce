// src/components/WhatsAppMetaTags.js
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { getImageUrl } from '../utils/imageUtils';

const WhatsAppMetaTags = ({ product }) => {
  if (!product) return null;
  
  const imageUrl = product.images && product.images.length > 0 
    ? getImageUrl(product.images[0], true) 
    : 'https://spotlylb.com/placeholder.jpg';
    
  return (
    <Helmet prioritizeSeoTags>
      {/* Force only one image for sharing */}
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:title" content={product.name} />
      <meta property="og:description" content={product.description.substring(0, 160)} />
      <meta property="og:type" content="product" />
      <meta property="og:url" content={window.location.href} />
    </Helmet>
  );
};

export default WhatsAppMetaTags;