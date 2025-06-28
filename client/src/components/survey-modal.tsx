import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCPXSurveyUrl } from "@/lib/cpx-research";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ExternalLink } from "lucide-react";
import type { Survey } from "@shared/schema";

interface SurveyModalProps {
  survey: Survey | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SurveyModal({ survey, isOpen, onClose }: SurveyModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const { data: urlData } = useCPXSurveyUrl();

  useEffect(() => {
    if (isOpen && survey) {
      setIsLoading(true);
      // Simulate loading time
      const timer = setTimeout(() => setIsLoading(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, survey]);

  if (!survey) return null;

  const handleOpenInNewTab = () => {
    if (urlData?.url) {
      window.open(urlData.url, '_blank');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full max-h-full w-screen h-screen p-0 m-0">
        <DialogHeader className="p-4 pb-2 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-medium">{survey.title}</DialogTitle>
              <p className="text-sm text-gray-500 mt-1">{survey.description}</p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1">
          {isLoading ? (
            <div className="survey-loading">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-gray-600">Memuat survey...</p>
              <Skeleton className="h-96 w-full mt-4" />
            </div>
          ) : urlData?.url ? (
            <div className="w-full h-full">
              <iframe 
                src={urlData.url}
                width="100%" 
                height="100%"
                frameBorder="0"
                title={survey.title}
                className="w-full h-full"
                onLoad={() => setIsLoading(false)}
                style={{ minHeight: 'calc(100vh - 80px)' }}
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Survey Tidak Tersedia
              </h3>
              <p className="text-gray-600 mb-4">
                Maaf, survey ini sedang tidak tersedia. Silakan coba lagi nanti.
              </p>
              <Button onClick={onClose}>Tutup</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
