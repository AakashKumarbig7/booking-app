'use client';
import React from 'react'
import Lottie from 'lottie-react';
import animationData from '@/public/loading.json';


const loading = () => {
  return (
    <div className='flex justify-center items-center align-middle h-screen'>
            <Lottie
              animationData={animationData}
              loop={true}
              autoplay={true}
            />
          </div>
  )
}

export default loading