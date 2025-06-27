import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import SurveyModal from "./survey-modal";
import { formatCurrency, getCategoryBadgeClass, getCategoryIcon } from "@/lib/cpx-research";
import { AlertTriangle, RefreshCw } from "lucide-react";
import type { Survey } from "@shared/schema";

export default function AvailableSurveys() {
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { data: surveysData, isLoading, refetch } = useQuery<{ surveys: Survey[] }>({
    queryKey: ["/api/surveys"],
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
  });

  const surveys = surveysData?.surveys || [];

  const handleStartSurvey = (survey: Survey) => {
    setSelectedSurvey(survey);
    setShowModal(true);
  };

  const handleLoadMore = () => {
    refetch();
  };

  return (
    <>
      <Card>
        <CardHeader className="border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Survey Tersedia</h3>
          <p className="mt-1 text-sm text-gray-500">
            Pilih survey yang sesuai dengan profil Anda untuk mendapatkan penghasilan maksimal
          </p>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Profile Completion Alert */}
          <Alert className="bg-accent/10 border-accent/20 mb-6">
            <AlertTriangle className="h-4 w-4 text-accent" />
            <AlertDescription>
              <div className="flex flex-col space-y-2">
                <p className="text-accent font-medium">Lengkapi Profil Anda</p>
                <p className="text-accent/80 text-sm">
                  Profil yang lengkap meningkatkan peluang mendapat survey dengan bayaran tinggi.{" "}
                  <a href="#" className="font-medium underline">Lengkapi sekarang</a>
                </p>
                <div className="mt-3">
                  <Progress value={65} className="h-2" />
                  <p className="text-xs text-accent/70 mt-1">Profil 65% lengkap</p>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Survey List */}
          <div className="space-y-4">
            {isLoading ? (
              // Loading skeletons
              [...Array(4)].map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <Skeleton className="h-20 w-full" />
                </div>
              ))
            ) : surveys.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Tidak ada survey tersedia saat ini.</p>
                <Button 
                  variant="outline" 
                  onClick={handleLoadMore}
                  className="mt-4"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Survey
                </Button>
              </div>
            ) : (
              surveys.map((survey) => (
                <div 
                  key={survey.id} 
                  className="survey-item border border-gray-200 rounded-lg p-4"
                  onClick={() => handleStartSurvey(survey)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`category-badge ${getCategoryBadgeClass(survey.category)}`}>
                          <i className={`${getCategoryIcon(survey.category)} mr-1`}></i>
                          {survey.category}
                        </span>
                        <span className="text-sm text-gray-500">{survey.duration} menit</span>
                      </div>
                      <h4 className="text-md font-medium text-gray-900 mb-1">{survey.title}</h4>
                      <p className="text-sm text-gray-600">{survey.description}</p>
                    </div>
                    <div className="ml-4 flex flex-col items-end">
                      <div className="text-lg font-bold text-secondary mb-1">
                        {formatCurrency(survey.reward)}
                      </div>
                      <Button 
                        className="bg-primary text-white hover:bg-primary/90"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartSurvey(survey);
                        }}
                      >
                        Mulai Survey
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Load More Button */}
          {surveys.length > 0 && (
            <div className="mt-6 text-center">
              <Button 
                variant="outline" 
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Muat Survey Lainnya
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <SurveyModal 
        survey={selectedSurvey}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedSurvey(null);
        }}
      />
    </>
  );
}
