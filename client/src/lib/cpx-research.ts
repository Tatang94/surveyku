import { useQuery } from "@tanstack/react-query";

export interface CPXSurvey {
  id: string;
  title: string;
  description: string;
  reward: string;
  duration: number;
  category: string;
}

export function useCPXSurveyUrl() {
  return useQuery<{ url: string }>({
    queryKey: ["/api/surveys/cpx-url"],
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function loadCPXScript(userId: string, config: any) {
  // Remove existing script if present
  const existingScript = document.getElementById('cpx-script');
  if (existingScript) {
    existingScript.remove();
  }

  // Create config script
  const configScript = document.createElement('script');
  configScript.innerHTML = `
    var cpx_config = {
      app_id: "${config.appId}",
      ext_user_id: "${userId}",
      secure_hash: "${config.secureHash}",
      debug: true
    };
  `;
  document.head.appendChild(configScript);

  // Create CPX script
  const script = document.createElement('script');
  script.id = 'cpx-script';
  script.src = 'https://cdn.cpx-research.com/assets/js/script_tag_v2.0.js';
  script.async = true;
  
  script.onload = () => {
    console.log('CPX Research script loaded successfully');
  };
  
  script.onerror = () => {
    console.error('Failed to load CPX Research script');
  };

  document.head.appendChild(script);
}

export function getCategoryBadgeClass(category: string): string {
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('premium')) return 'category-premium';
  if (categoryLower.includes('cepat') || categoryLower.includes('quick')) return 'category-cepat';
  if (categoryLower.includes('demografi') || categoryLower.includes('demographic')) return 'category-demografi';
  if (categoryLower.includes('teknologi') || categoryLower.includes('technology')) return 'category-teknologi';
  
  return 'category-premium'; // default
}

export function getCategoryIcon(category: string): string {
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('premium')) return 'fas fa-star';
  if (categoryLower.includes('cepat') || categoryLower.includes('quick')) return 'fas fa-clock';
  if (categoryLower.includes('demografi') || categoryLower.includes('demographic')) return 'fas fa-users';
  if (categoryLower.includes('teknologi') || categoryLower.includes('technology')) return 'fas fa-mobile-alt';
  
  return 'fas fa-clipboard-check'; // default
}

export function formatCurrency(amount: string | number): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
}
