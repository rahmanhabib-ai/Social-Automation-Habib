import React from 'react';
import SocialMediaTopNav from './SocialMediaTopNav';
import { SparkCampaignStudio } from './SparkCampaignStudio';

export default function SparkAiSchedulerPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <SocialMediaTopNav activeTab="spark_ai_scheduler" />
      <SparkCampaignStudio />
    </div>
  );
}
