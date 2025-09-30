import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RibbedSphere from '@/components/RibbedSphere';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqItems = [
  {
    id: 'item-1',
    question: 'How do I get started with the platform?',
    answer: 'Getting started is easy! Simply click the "Tap Anywhere to Start" button on the homepage, and you\'ll be guided through our intuitive onboarding process. You can upload your product images and our AI will help transform them into compelling marketing content.',
  },
  {
    id: 'item-2',
    question: 'What file formats are supported?',
    answer: 'We support all major image formats including JPG, PNG, WEBP, and GIF. For best results, we recommend using high-resolution images (at least 1000x1000 pixels) with clear product visibility.',
  },
  {
    id: 'item-3',
    question: 'How does the AI-powered creativity work?',
    answer: 'Our AI analyzes your product images, extracts key features, colors, and context, then generates multiple variations of marketing content including social media posts, email templates, web banners, and video scripts tailored to your brand.',
  },
  {
    id: 'item-4',
    question: 'Can I customize the generated content?',
    answer: 'Yes! All generated content can be customized and refined. You can edit text, adjust layouts, modify colors, and request regeneration of specific elements until you\'re completely satisfied with the results.',
  },
  {
    id: 'item-5',
    question: 'What are the usage limits?',
    answer: 'Usage limits depend on your subscription plan. Free tier users can generate up to 10 campaigns per month, while premium users enjoy unlimited generations with priority processing and advanced customization options.',
  },
  {
    id: 'item-6',
    question: 'How do I download my creations?',
    answer: 'Once your content is generated, click the "Download" button to access all assets. You can download individual files or bundle everything into a convenient ZIP file. All content is available in multiple formats optimized for different platforms.',
  },
];

export const HelpGuideModal = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="tap-target focus-ring group bg-white/20 border-white/30 hover:bg-white/30 rounded-full"
        >
          <HelpCircle className="mr-2 w-5 h-5 text-black group-hover:text-black/80 transition-colors" />
          <span className="text-black group-hover:text-black/80 transition-colors">
            Help & Guide
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-full sm:max-w-md bg-white/70 backdrop-blur-md border border-white text-foreground overflow-y-auto h-[calc(100vh-48px)] mt-6 ml-6 mb-6 rounded-lg p-12 flex flex-col"
      >
        <div className="flex-shrink-0">
          <SheetHeader className="text-left space-y-3 pb-6">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-black" />
              <SheetTitle className="text-2xl font-semibold text-foreground">
                Help & Guide
              </SheetTitle>
            </div>
            <SheetDescription className="text-muted-foreground text-sm">
              Find answers to common questions about our platform and features
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Accordion type="single" collapsible className="w-full space-y-3">
          {faqItems.map((item) => (
            <AccordionItem 
              key={item.id} 
              value={item.id}
              className="border-none"
            >
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:no-underline py-3 px-0">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-black text-sm leading-relaxed pb-3 px-0">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        </div>

        {/* Bottom branding */}
        <div className="flex-shrink-0 pt-8 flex items-center gap-3">
          <div className="h-8 w-8 flex-shrink-0">
            <RibbedSphere className="w-full h-full" />
          </div>
          <p className="text-xs text-gray-500">
            Bring Your Products to Life
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};
