import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
          <HelpCircle className="mr-2 w-5 h-5 text-primary group-hover:text-primary/80 transition-colors" />
          <span className="text-primary group-hover:text-primary/80 transition-colors">
            Help & Guide
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-full sm:max-w-md bg-white text-foreground overflow-y-auto h-[calc(100vh-72px)] mt-9 ml-9 mb-9 rounded-r-lg p-12"
      >
        <SheetHeader className="text-left space-y-3 pb-6">
          <SheetTitle className="text-2xl font-semibold text-foreground">
            Help & Guide
          </SheetTitle>
          <SheetDescription className="text-muted-foreground text-sm">
            Find answers to common questions about our platform and features
          </SheetDescription>
        </SheetHeader>

        <Accordion type="single" collapsible className="w-full space-y-3">
          {faqItems.map((item) => (
            <AccordionItem 
              key={item.id} 
              value={item.id}
              className="border-none"
            >
              <AccordionTrigger className="text-left text-sm font-normal text-foreground hover:no-underline py-3 px-0">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-3 px-0">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </SheetContent>
    </Sheet>
  );
};
