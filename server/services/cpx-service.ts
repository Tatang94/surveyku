import crypto from "crypto";

export interface CPXConfig {
  appId: string;
  secureHash: string;
  postbackUrl: string;
}

export class CPXService {
  private config: CPXConfig;

  constructor() {
    this.config = {
      appId: process.env.CPX_APP_ID || process.env.CPX_RESEARCH_APP_ID || "default_app_id",
      secureHash: process.env.CPX_SECURE_HASH || process.env.CPX_RESEARCH_SECURE_HASH || "default_secure_hash",
      postbackUrl: process.env.CPX_POSTBACK_URL || `${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}/api/postback/cpx`,
    };
  }

  generateSecureHash(userId: string): string {
    const hashString = `${userId}-${this.config.secureHash}`;
    return crypto.createHash('md5').update(hashString).digest('hex');
  }

  generateSurveyUrl(userId: string, userEmail?: string, userProfile?: {
    birthdayDay?: string;
    birthdayMonth?: string;
    birthdayYear?: string;
    gender?: string;
    countryCode?: string;
    zipCode?: string;
  }): string {
    const secureHashMd5 = this.generateSecureHash(userId);
    const baseUrl = "https://offers.cpx-research.com/index.php";
    
    const params = new URLSearchParams({
      app_id: this.config.appId,
      ext_user_id: userId,
      secure_hash: secureHashMd5,
      email: userEmail || '',
      subid_1: '',
      subid_2: '',
      main_info: 'true',
    });

    if (userProfile) {
      if (userProfile.birthdayDay) params.append('birthday_day', userProfile.birthdayDay);
      if (userProfile.birthdayMonth) params.append('birthday_month', userProfile.birthdayMonth);
      if (userProfile.birthdayYear) params.append('birthday_year', userProfile.birthdayYear);
      if (userProfile.gender) params.append('gender', userProfile.gender);
      if (userProfile.countryCode) params.append('user_country_code', userProfile.countryCode);
      if (userProfile.zipCode) params.append('zip_code', userProfile.zipCode);
    }

    return `${baseUrl}?${params.toString()}`;
  }

  async fetchAvailableSurveys(userId: string, userAgent: string, ipAddress: string): Promise<any> {
    const secureHashMd5 = this.generateSecureHash(userId);
    const apiUrl = "https://live-api.cpx-research.com/api/get-surveys.php";
    
    const params = new URLSearchParams({
      app_id: this.config.appId,
      ext_user_id: userId,
      secure_hash: secureHashMd5,
      output_method: 'api',
      ip_user: ipAddress,
      user_agent: encodeURIComponent(userAgent),
      limit: '20',
    });

    try {
      const response = await fetch(`${apiUrl}?${params.toString()}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching CPX surveys:', error);
      return { surveys: [] };
    }
  }

  validatePostback(params: {
    user_id: string;
    survey_id: string;
    reward_amount: string;
    status: string;
    hash?: string;
  }): boolean {
    // Implement postback validation logic
    // This should verify the hash sent by CPX Research
    const expectedHash = this.generateSecureHash(params.user_id);
    return params.hash === expectedHash;
  }

  getScriptTagConfig(userId: string): string {
    const secureHashMd5 = this.generateSecureHash(userId);
    
    return `
      <script type="text/javascript">
        var cpx_config = {
          app_id: "${this.config.appId}",
          ext_user_id: "${userId}",
          secure_hash: "${secureHashMd5}",
          postback_url: "${this.config.postbackUrl}"
        };
      </script>
      <script type="text/javascript" src="https://cdn.cpx-research.com/assets/js/script_tag_v2.0.js"></script>
    `;
  }
}

export const cpxService = new CPXService();
