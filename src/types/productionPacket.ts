/**
 * Google Drive Production-Packet Types for ChartLogic & Spark Ingestion
 */

export type PacketFormat = 'REEL' | 'IMAGE' | 'LONG_VIDEO' | 'UNKNOWN';
export type PacketLabel = 'PRODUCTION' | 'TEST';
export type PacketValidationStatus = 'VALIDATED' | 'DRAFT_INCOMPLETE' | 'NOT_A_COMPLETE_PACKET' | 'INVALID';

export interface SceneItem {
  sceneNumber: number;
  timeRange: string;
  durationSeconds?: number;
  visualPrompt: string;
  textOverlay?: string;
  audioVoiceCue?: string;
  notes?: string;
}

export interface ViewerChapter {
  timestamp: string;
  seconds: number;
  title: string;
}

export interface PlatformMetadataPackage {
  platform: 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'telegram' | 'whatsapp' | 'twitter' | 'linkedin';
  language: 'bn' | 'en' | 'es' | 'ar' | 'hi';
  title?: string;
  caption: string;
  hashtags: string[];
  firstComment?: string;
  pinnedComment?: string;
  callToAction?: string;
}

export interface FlowAssetBrief {
  briefIndex: number;
  targetScene?: number;
  durationSeconds?: number;
  prompt: string;
  aspectRatio: string;
  motionNotes?: string;
  cameraAngles?: string;
  rawJson?: any;
}

export interface CoverDesignJson {
  aspectRatio: string;
  headline?: string;
  subheadline?: string;
  visualTheme?: string;
  artStyle?: string;
  prompt?: string;
  colorPalette?: string[];
  elements?: string[];
  rawJson?: any;
}

export interface ValidationFinding {
  code: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  section?: string;
}

export interface ProductionPacketValidation {
  status: PacketValidationStatus;
  isComplete: boolean;
  score: number; // 0 - 100
  estimatedDurationSeconds: number;
  targetDurationSeconds: number;
  timingType: 'measured' | 'estimated' | 'unspecified';
  findings: ValidationFinding[];
  languagesCovered: string[];
  platformPackagesCount: number;
  flowBriefsCount: number;
  hasCoverDesignJson: boolean;
  isCompletionReportOnly: boolean;
}

export interface ProductionPacket {
  id: string; // Internal unique ID (e.g. drive file ID)
  sourceDocId: string;
  sourceDocTitle: string;
  sourceDocUrl: string;
  folderId: string;
  modifiedTime: string;
  importedAt: string;
  lastSyncAt: string;
  contentHash: string;
  version: number;

  // Metadata
  contentId: string;
  revision: string;
  format: PacketFormat;
  topic: string;
  label: PacketLabel; // 'PRODUCTION' | 'TEST'
  
  // Publication timing
  targetPublication: {
    date?: string;
    time?: string;
    timezone?: string;
    isoString?: string;
    rawString?: string;
  };
  
  // Runtime & format
  runtime: {
    targetSeconds: number;
    estimatedSeconds: number;
    formatted: string;
    isEstimated: boolean;
  };
  aspectRatio: '9:16' | '16:9' | '1:1' | '4:5' | 'UNKNOWN';

  // Narration
  narrations: Record<string, string>; // e.g. { BN_CLEAN: '...', EN_CLEAN: '...', ES_CLEAN: '...' }
  performanceDirections: string; // Directions/acting instructions (clean narration excludes this)

  // Visuals & Scenes
  scenes: SceneItem[];
  viewerChapters: ViewerChapter[];
  flowAssetBriefs: FlowAssetBrief[];
  coverDesignJson: CoverDesignJson | null;

  // Multi-platform Multi-language packages
  platformMetadata: PlatformMetadataPackage[];

  // Evidence & Asset links
  evidenceSources: { title?: string; url: string; note?: string }[];
  assetLinks: { name: string; url: string; type?: string }[];

  // Unrecognized fields preserved for review
  unrecognizedFields: Record<string, string>;

  // Validation
  validation: ProductionPacketValidation;

  // Original raw document text
  rawText: string;

  // Media rendering tracking (Separated from packet completeness)
  renderingStatus: {
    audioRendered: boolean;
    visualsRendered: boolean;
    videoRendered: boolean;
    thumbnailRendered: boolean;
    notes?: string;
  };
}

export interface FolderSyncConfig {
  folderUrl: string;
  folderId: string;
  includeSubfolders: boolean;
  autoSyncEnabled: boolean;
  autoSyncIntervalSeconds: number;
  lastSuccessfulSyncAt: string | null;
  lastSyncError: string | null;
  totalImportedCount: number;
  activeFilter: 'all' | 'REEL' | 'IMAGE' | 'LONG_VIDEO' | 'VALIDATED' | 'DRAFT_INCOMPLETE' | 'TEST';
}
