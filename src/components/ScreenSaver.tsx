import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import RibbedSphere from '@/components/RibbedSphere';
import { HelpGuideModal } from '@/components/HelpGuideModal';

// Import card images
import campaignExample1 from '@/assets/campaign-example-1.webp';
import campaignExample2 from '@/assets/campaign-example-2.webp';
import adidasShoe from '@/assets/gazelle-shoes.avif';
import campaignExample4 from '@/assets/campaign-example-4.webp';
import campaignExample5 from '@/assets/campaign-example-5.webp';

const sentences = [
  "Transform your ideas into compelling marketing content with AI-powered creativity",
  "Generate product titles, descriptions, and catalogs in seconds"
];
const ScreenSaver = () => {
  const navigate = useNavigate();
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  
  // Card data with images and titles
  const cards = [
    {
      id: 1,
      image: campaignExample1,
      title: "Skincare Campaign",
      height: "h-40 sm:h-48 md:h-64 lg:h-72 xl:h-80 2xl:h-96" // tallest outer card (left end)
    },
    {
      id: 2,
      image: campaignExample2,
      title: "App Launch Campaign",
      height: "h-28 sm:h-36 md:h-48 lg:h-56 xl:h-64 2xl:h-72" // medium card
    },
    {
      id: 3,
      image: adidasShoe,
      title: "Product Showcase",
      height: "h-24 sm:h-32 md:h-40 lg:h-48 xl:h-56 2xl:h-64" // smallest center card
    },
    {
      id: 4,
      image: campaignExample4,
      title: "Website Design",
      height: "h-28 sm:h-36 md:h-48 lg:h-56 xl:h-64 2xl:h-72" // medium card
    },
    {
      id: 5,
      image: campaignExample5,
      title: "E-commerce Campaign",
      height: "h-40 sm:h-48 md:h-64 lg:h-72 xl:h-80 2xl:h-96" // tallest outer card (right end)
    }
  ];

  // Typing animation with sentence cycling
  useEffect(() => {
    let currentIndex = 0;
    let typingInterval: NodeJS.Timeout;
    let sentenceCycleTimeout: NodeJS.Timeout;
    let localSentenceIndex = 0;
    
    const startTyping = (sentenceIndex: number) => {
      const currentText = sentences[sentenceIndex];
      setDisplayedText('');
      setIsTypingComplete(false);
      currentIndex = 0;
      
      typingInterval = setInterval(() => {
        if (currentIndex < currentText.length) {
          const newText = currentText.slice(0, currentIndex + 1);
          setDisplayedText(newText);
          currentIndex++;
        } else {
          setIsTypingComplete(true);
          clearInterval(typingInterval);
          
          // Schedule next sentence after completion
          sentenceCycleTimeout = setTimeout(() => {
            localSentenceIndex = (localSentenceIndex + 1) % sentences.length;
            setCurrentSentenceIndex(localSentenceIndex);
            startTyping(localSentenceIndex);
          }, 20000);
        }
      }, 18);
    };

    // Start initial typing
    startTyping(localSentenceIndex);

    return () => {
      clearInterval(typingInterval);
      clearTimeout(sentenceCycleTimeout);
    };
  }, []); // Empty dependency array - only run once

  // Card animation - starts after typing completes
  useEffect(() => {
    if (!isTypingComplete) return;

    const startCardAnimation = () => {
      setShowCards(true);
      // Delay before cards become visible (rise up animation)
      setTimeout(() => {
        setCardsVisible(true);
      }, 500);
    };

    startCardAnimation();
  }, [isTypingComplete]);

  // Dissolve/reappear loop - starts after cards are shown
  useEffect(() => {
    if (!cardsVisible) return;

    const dissolveLoop = () => {
      const interval = setInterval(() => {
        setCardsVisible(false);
        setTimeout(() => {
          setCardsVisible(true);
        }, 1000); // 1s dissolve transition
      }, 30000); // 30s visible duration

      return interval;
    };

    const interval = dissolveLoop();
    return () => clearInterval(interval);
  }, [cardsVisible]);
  const handleClick = () => {
    navigate('/welcome');
  };
  return <div className="min-h-screen w-full bg-gradient-to-b from-gray-400 via-gray-200 to-white cursor-pointer relative overflow-hidden" onClick={handleClick}>
      {/* Background Video */}
      <video 
        className="absolute inset-0 w-full h-full object-cover object-center opacity-70 z-0" 
        autoPlay 
        loop 
        muted 
        playsInline
        onError={(e) => {
          console.warn('Background video failed to load, continuing without video');
          e.currentTarget.style.display = 'none';
        }}
      >
        <source src="/background-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 z-30 flex justify-between items-start p-8">
        {/* Help & Guide - Top Left */}
        <div onClick={e => e.stopPropagation()}>
          <HelpGuideModal />
        </div>

        {/* Previous Works - Top Right */}
        <Button
          variant="outline"
          size="lg"
          className="tap-target group bg-white/20 border-white/30 hover:bg-white/30 rounded-full"
          onClick={e => {
            e.stopPropagation();
            navigate('/gallery');
          }}
        >
          <svg className="mr-2 w-5 h-5 text-black group-hover:text-black/80 transition-colors" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" fillRule="evenodd" d="M9.44,2.67,3.13,5A.2.2,0,0,0,3,5.19V18.91a.18.18,0,0,0,.13.18l6.39,2.24a.2.2,0,0,0,.27-.19L9.71,2.86A.2.2,0,0,0,9.44,2.67Z"/>
            <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" x1="13" y1="5.05" x2="13" y2="19.05"/>
            <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" x1="17" y1="5.05" x2="17" y2="19.05"/>
            <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" x1="21" y1="5.05" x2="21" y2="19.05"/>
          </svg>
          <span className="text-black group-hover:text-black/80 transition-colors">
            Gallery
          </span>
        </Button>
      </div>

      {/* Central content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen text-center px-4 sm:px-6 md:px-8 pt-20">
        <div className="animate-content-appear relative -mt-32 sm:-mt-48 md:-mt-64 lg:-mt-72">
          {/* Chatbot Icon with Speech Bubble */}
          <div className="absolute -left-32 -top-16 flex items-start space-x-4">
            
          </div>

          {/* Logo and Slogan */}
          <div className="mb-8">
            <div className="flex flex-col items-center justify-center mb-3">
              <div className="h-16 w-16 sm:h-20 sm:w-20 md:h-28 md:w-28 lg:h-32 lg:w-32 xl:h-40 xl:w-40 mb-6 sm:mb-7 md:mb-8">
                <RibbedSphere className="w-full h-full" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold">
                <span className="text-black">Bring Your Products to </span><span className="text-primary">Life</span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl text-muted-foreground font-medium mx-auto min-h-[1.5rem] sm:min-h-[2rem] lg:min-h-[2.5rem] xl:min-h-[3rem] flex items-center justify-center px-4">
              {currentSentenceIndex === 0 ? (
                <>
                  {displayedText.includes("with AI-powered") ? (
                    <>
                      Transform your ideas into compelling marketing content<br />
                      {displayedText.substring(displayedText.indexOf("with AI-powered"))}
                    </>
                  ) : (
                    displayedText
                  )}
                </>
              ) : (
                displayedText
              )}
              
            </p>
          </div>

          {/* Get Started Button */}
          <Button size="lg" className="tap-target focus-ring px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 lg:px-8 lg:py-3 xl:px-10 xl:py-4 text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg animate-button-breath rounded-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={e => {
          e.stopPropagation();
          handleClick();
        }}>
            Tap Anywhere to Start
          </Button>
        </div>
      </div>

      {/* Animated Content Cards */}
      {showCards && (
        <div className="absolute bottom-0 left-0 right-0 z-10">
          {/* Cards Container */}
          <div className="flex justify-between items-end gap-2 sm:gap-3 md:gap-4 px-2 sm:px-3 md:px-4">
            {cards.map((card, index) => (
              <div
                key={card.id}
                className={`
                  ${card.height} flex-1 rounded-3xl overflow-hidden bg-white/70 backdrop-blur-md border border-white p-4
                  transform transition-all duration-700 ease-out
                  ${cardsVisible 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-full opacity-0'
                  }
                `}
                style={{
                  transitionDelay: cardsVisible ? `${index * 200}ms` : '0ms'
                }}
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            ))}
          </div>

          {/* Soft white gradient overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        </div>
      )}

      {/* Accessibility */}
      <div className="sr-only">
        <h2>Boost your product with Magic Sphere</h2>
        <p>Tap anywhere to start creating compelling marketing content with AI assistance</p>
      </div>
    </div>;
};
export default ScreenSaver;