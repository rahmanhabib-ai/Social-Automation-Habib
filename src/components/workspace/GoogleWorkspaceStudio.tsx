import React, { useState, useEffect } from 'react';
import {
  Folder,
  FileText,
  Table as TableIcon,
  Upload,
  Plus,
  Trash2,
  ExternalLink,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  FolderPlus,
  ChevronRight,
  Eye,
  Send,
  Download,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Info,
  Calendar,
  User,
  ArrowRight,
  Database
} from 'lucide-react';
import {
  connectGoogleDriveWithPopup,
  disconnectGoogleDrive,
  getCachedToken,
  getCachedUserEmail
} from '../../services/googleAuthHelper';
import {
  listDriveFiles,
  createDriveFolder,
  uploadDriveTextFile,
  deleteDriveFile,
  listSpreadsheets,
  createSpreadsheet,
  getSpreadsheetMetadata,
  readSheetRange,
  appendSheetRows,
  listDocuments,
  createDocument,
  getDocumentContent,
  appendDocumentText,
  WorkspaceDriveFile,
  SheetMetadata,
  DocStructure
} from '../../services/googleWorkspaceService';
import { GoogleDriveSparkStudio } from '../social/GoogleDriveSparkStudio';
import { fetchSocialPosts } from '../../services/socialDb';

export interface GoogleWorkspaceStudioProps {
  initialTab?: 'spark' | 'drive' | 'sheets' | 'docs';
}

export const GoogleWorkspaceStudio: React.FC<GoogleWorkspaceStudioProps> = ({ initialTab = 'spark' }) => {
  // Navigation Tabs (default to 'spark' - Google Drive Production-Packet Importer)
  const [activeTab, setActiveTab] = useState<'drive' | 'sheets' | 'docs' | 'spark'>(initialTab);

  // Auth State
  const [accessToken, setAccessToken] = useState<string | null>(() => getCachedToken());
  const [userEmail, setUserEmail] = useState<string | null>(() => getCachedUserEmail());
  const [isConnecting, setIsConnecting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Status Notification
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // ------------------------------------------
  // Tab 1: Google Drive State
  // ------------------------------------------
  const [driveFiles, setDriveFiles] = useState<WorkspaceDriveFile[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [driveFilter, setDriveFilter] = useState<'all' | 'docs' | 'sheets' | 'folders' | 'media'>('all');
  const [driveSearch, setDriveSearch] = useState('');
  const [folderPath, setFolderPath] = useState<{ id?: string; name: string }[]>([{ name: 'My Drive' }]);

  // Modals
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileContent, setUploadFileContent] = useState('');

  // Mandatory Delete Confirmation Modal
  const [fileToDelete, setFileToDelete] = useState<WorkspaceDriveFile | null>(null);
  const [isDeletingFile, setIsDeletingFile] = useState(false);

  // ------------------------------------------
  // Tab 2: Google Sheets State
  // ------------------------------------------
  const [spreadsheets, setSpreadsheets] = useState<WorkspaceDriveFile[]>([]);
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);
  const [selectedSheetFile, setSelectedSheetFile] = useState<WorkspaceDriveFile | null>(null);
  const [sheetMetadata, setSheetMetadata] = useState<SheetMetadata | null>(null);
  const [activeSubSheet, setActiveSubSheet] = useState<string>('Sheet1');
  const [sheetGridData, setSheetGridData] = useState<any[][]>([]);
  const [isLoadingGrid, setIsLoadingGrid] = useState(false);

  // New Sheet Modal
  const [showNewSheetModal, setShowNewSheetModal] = useState(false);
  const [newSheetTitle, setNewSheetTitle] = useState('');
  const [sheetTemplate, setSheetTemplate] = useState<'blank' | 'social_calendar' | 'lead_crm'>('blank');

  // Add Row Modal
  const [showAddRowModal, setShowAddRowModal] = useState(false);
  const [newRowValues, setNewRowValues] = useState<string[]>([]);

  // ------------------------------------------
  // Tab 3: Google Docs State
  // ------------------------------------------
  const [documents, setDocuments] = useState<WorkspaceDriveFile[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [selectedDocFile, setSelectedDocFile] = useState<WorkspaceDriveFile | null>(null);
  const [activeDocContent, setActiveDocContent] = useState<DocStructure | null>(null);
  const [isLoadingDocBody, setIsLoadingDocBody] = useState(false);

  // New Doc Modal
  const [showNewDocModal, setShowNewDocModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocBody, setNewDocBody] = useState('');

  // Append Text Modal
  const [showAppendModal, setShowAppendModal] = useState(false);
  const [textToAppend, setTextToAppend] = useState('');
  const [isAppending, setIsAppending] = useState(false);

  const showNotify = (type: 'success' | 'error' | 'info', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4500);
  };

  // Connect Google Account
  const handleConnect = async () => {
    setIsConnecting(true);
    setAuthError(null);
    try {
      const res = await connectGoogleDriveWithPopup();
      setAccessToken(res.accessToken);
      if (res.email) setUserEmail(res.email);
      showNotify('success', `Google Workspace সফলভাবে যুক্ত হয়েছে! ${res.email ? `(${res.email})` : ''}`);
    } catch (err: any) {
      console.error('Google Auth Failed:', err);
      setAuthError(err.message || 'Google সাইন-ইন সম্পন্ন করা সম্ভব হয়নি।');
      showNotify('error', err.message || 'সাইন-ইন ব্যর্থ হয়েছে।');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectGoogleDrive();
    setAccessToken(null);
    setUserEmail(null);
    setDriveFiles([]);
    setSpreadsheets([]);
    setDocuments([]);
    setSelectedSheetFile(null);
    setSelectedDocFile(null);
    showNotify('info', 'Google Workspace অ্যাকাউন্ট সংযোগ বিচ্ছিন্ন করা হয়েছে।');
  };

  // ------------------------------------------
  // Load Drive Files
  // ------------------------------------------
  const currentFolderId = folderPath[folderPath.length - 1]?.id;

  const loadDrive = async () => {
    if (!accessToken) return;
    setIsLoadingDrive(true);
    try {
      const res = await listDriveFiles(accessToken, {
        folderId: currentFolderId,
        mimeTypeFilter: driveFilter,
        searchQuery: driveSearch
      });
      setDriveFiles(res.files);
    } catch (err: any) {
      showNotify('error', `ড্রাইভ ফাইল লোড করতে সমস্যা: ${err.message}`);
    } finally {
      setIsLoadingDrive(false);
    }
  };

  useEffect(() => {
    if (accessToken && activeTab === 'drive') {
      loadDrive();
    }
  }, [accessToken, activeTab, currentFolderId, driveFilter]);

  // Navigate into Folder
  const enterFolder = (folder: WorkspaceDriveFile) => {
    setFolderPath(prev => [...prev, { id: folder.id, name: folder.name }]);
  };

  const navigateToCrumb = (index: number) => {
    setFolderPath(prev => prev.slice(0, index + 1));
  };

  // Create Folder
  const handleCreateFolder = async () => {
    if (!accessToken || !newFolderName.trim()) return;
    try {
      await createDriveFolder(accessToken, newFolderName.trim(), currentFolderId);
      showNotify('success', `📁 ফোল্ডার '${newFolderName}' তৈরি হয়েছে!`);
      setNewFolderName('');
      setShowNewFolderModal(false);
      loadDrive();
    } catch (err: any) {
      showNotify('error', `ফোল্ডার তৈরিতে ত্রুটি: ${err.message}`);
    }
  };

  // Upload Text File
  const handleUploadFile = async () => {
    if (!accessToken || !uploadFileName.trim()) return;
    try {
      await uploadDriveTextFile(accessToken, uploadFileName.trim(), uploadFileContent, 'text/plain', currentFolderId);
      showNotify('success', `✅ ফাইল '${uploadFileName}' আপলোড হয়েছে!`);
      setUploadFileName('');
      setUploadFileContent('');
      setShowUploadModal(false);
      loadDrive();
    } catch (err: any) {
      showNotify('error', `আপলোড ত্রুটি: ${err.message}`);
    }
  };

  // Confirm File Deletion (Mandatory Confirmation Dialog)
  const confirmDeleteFile = async () => {
    if (!accessToken || !fileToDelete) return;
    setIsDeletingFile(true);
    try {
      await deleteDriveFile(accessToken, fileToDelete.id);
      showNotify('success', `🗑️ '${fileToDelete.name}' ফাইলটি স্থায়ীভাবে ডিলিট করা হয়েছে।`);
      setFileToDelete(null);
      loadDrive();
      if (activeTab === 'sheets') loadSheetsList();
      if (activeTab === 'docs') loadDocsList();
    } catch (err: any) {
      showNotify('error', `ডিলিট করতে ব্যর্থ: ${err.message}`);
    } finally {
      setIsDeletingFile(false);
    }
  };

  // ------------------------------------------
  // Load Spreadsheets
  // ------------------------------------------
  const loadSheetsList = async () => {
    if (!accessToken) return;
    setIsLoadingSheets(true);
    try {
      const files = await listSpreadsheets(accessToken);
      setSpreadsheets(files);
      if (files.length > 0 && !selectedSheetFile) {
        openSpreadsheet(files[0]);
      }
    } catch (err: any) {
      showNotify('error', `স্প্রেডশিট লোড ত্রুটি: ${err.message}`);
    } finally {
      setIsLoadingSheets(false);
    }
  };

  useEffect(() => {
    if (accessToken && activeTab === 'sheets') {
      loadSheetsList();
    }
  }, [accessToken, activeTab]);

  const openSpreadsheet = async (file: WorkspaceDriveFile) => {
    if (!accessToken) return;
    setSelectedSheetFile(file);
    setIsLoadingGrid(true);
    try {
      const meta = await getSpreadsheetMetadata(accessToken, file.id);
      setSheetMetadata(meta);
      const firstTab = meta.sheets[0]?.title || 'Sheet1';
      setActiveSubSheet(firstTab);

      const grid = await readSheetRange(accessToken, file.id, `${firstTab}!A1:Z50`);
      setSheetGridData(grid.values || []);
    } catch (err: any) {
      showNotify('error', `স্প্রেডশিটের তথ্য পড়তে ব্যর্থ: ${err.message}`);
    } finally {
      setIsLoadingGrid(false);
    }
  };

  const switchSubSheet = async (sheetTitle: string) => {
    if (!accessToken || !selectedSheetFile) return;
    setActiveSubSheet(sheetTitle);
    setIsLoadingGrid(true);
    try {
      const grid = await readSheetRange(accessToken, selectedSheetFile.id, `${sheetTitle}!A1:Z50`);
      setSheetGridData(grid.values || []);
    } catch (err: any) {
      showNotify('error', `শিট লোড করতে ব্যর্থ: ${err.message}`);
    } finally {
      setIsLoadingGrid(false);
    }
  };

  // Create New Spreadsheet
  const handleCreateSpreadsheet = async () => {
    if (!accessToken || !newSheetTitle.trim()) return;
    try {
      let initialSheets = ['Sheet1'];
      if (sheetTemplate === 'social_calendar') {
        initialSheets = ['Campaigns', 'Social_Posts', 'Analytics'];
      } else if (sheetTemplate === 'lead_crm') {
        initialSheets = ['Leads', 'Pipeline', 'Closed_Deals'];
      }

      const res = await createSpreadsheet(accessToken, newSheetTitle.trim(), initialSheets);
      
      // Seed template headers if needed
      if (sheetTemplate === 'social_calendar') {
        await appendSheetRows(accessToken, res.id, 'Social_Posts!A1:G1', [
          ['Post ID', 'Platform', 'Scheduled Date', 'Caption / Brief', 'Status', 'Target URL', 'Hashtags']
        ]);
      } else if (sheetTemplate === 'lead_crm') {
        await appendSheetRows(accessToken, res.id, 'Leads!A1:F1', [
          ['Customer Name', 'Phone Number', 'Source', 'Interest', 'Status', 'Date Added']
        ]);
      }

      showNotify('success', `📊 স্প্রেডশিট '${newSheetTitle}' সফলভাবে তৈরি হয়েছে!`);
      setNewSheetTitle('');
      setShowNewSheetModal(false);
      loadSheetsList();
    } catch (err: any) {
      showNotify('error', `স্প্রেডশিট তৈরিতে ত্রুটি: ${err.message}`);
    }
  };

  // Quick Export Social Posts to Google Sheet
  const handleExportPostsToSheet = async () => {
    if (!accessToken) return;
    try {
      const posts = await fetchSocialPosts();
      const title = `Social Posts Export — ${new Date().toISOString().split('T')[0]}`;
      const res = await createSpreadsheet(accessToken, title, ['Exported_Posts']);
      
      const rows = [
        ['Post ID', 'Platform', 'Content', 'Status', 'Scheduled Time', 'Published Time'],
        ...posts.map(p => [
          p.id,
          (p.platforms || []).join(', '),
          p.content,
          p.status,
          (p as any).scheduledAt || (p as any).scheduledTime || '',
          (p as any).publishedAt || (p as any).publishedTime || ''
        ])
      ];

      await appendSheetRows(accessToken, res.id, 'Exported_Posts!A1', rows);
      showNotify('success', `🎉 ${posts.length} টি পোস্ট নতুন Google Sheet এ এক্সপোর্ট করা হয়েছে!`);
      loadSheetsList();
    } catch (err: any) {
      showNotify('error', `এক্সপোর্টে সমস্যা: ${err.message}`);
    }
  };

  // Add Row to Active Sheet
  const handleAddRow = async () => {
    if (!accessToken || !selectedSheetFile || !activeSubSheet) return;
    try {
      await appendSheetRows(accessToken, selectedSheetFile.id, `${activeSubSheet}!A1`, [newRowValues]);
      showNotify('success', '✅ স্প্রেডশিটে নতুন রো (Row) যুক্ত হয়েছে!');
      setShowAddRowModal(false);
      setNewRowValues([]);
      switchSubSheet(activeSubSheet);
    } catch (err: any) {
      showNotify('error', `রো যুক্ত করতে সমস্যা: ${err.message}`);
    }
  };

  // ------------------------------------------
  // Load Google Docs
  // ------------------------------------------
  const loadDocsList = async () => {
    if (!accessToken) return;
    setIsLoadingDocs(true);
    try {
      const files = await listDocuments(accessToken);
      setDocuments(files);
      if (files.length > 0 && !selectedDocFile) {
        openDocument(files[0]);
      }
    } catch (err: any) {
      showNotify('error', `ডকুমেন্ট তালিকা লোড ত্রুটি: ${err.message}`);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    if (accessToken && activeTab === 'docs') {
      loadDocsList();
    }
  }, [accessToken, activeTab]);

  const openDocument = async (file: WorkspaceDriveFile) => {
    if (!accessToken) return;
    setSelectedDocFile(file);
    setIsLoadingDocBody(true);
    try {
      const doc = await getDocumentContent(accessToken, file.id);
      setActiveDocContent(doc);
    } catch (err: any) {
      showNotify('error', `Google Doc পড়তে সমস্যা: ${err.message}`);
    } finally {
      setIsLoadingDocBody(false);
    }
  };

  // Create New Doc
  const handleCreateDocument = async () => {
    if (!accessToken || !newDocTitle.trim()) return;
    try {
      await createDocument(accessToken, newDocTitle.trim(), newDocBody.trim() || undefined);
      showNotify('success', `📝 Google Doc '${newDocTitle}' সফলভাবে তৈরি হয়েছে!`);
      setNewDocTitle('');
      setNewDocBody('');
      setShowNewDocModal(false);
      loadDocsList();
    } catch (err: any) {
      showNotify('error', `ডকুমেন্ট তৈরিতে ত্রুটি: ${err.message}`);
    }
  };

  // Append Text to Doc
  const handleAppendText = async () => {
    if (!accessToken || !selectedDocFile || !textToAppend.trim()) return;
    setIsAppending(true);
    try {
      await appendDocumentText(accessToken, selectedDocFile.id, textToAppend.trim());
      showNotify('success', '✅ ডকুমেন্টে টেক্সট সফলভাবে অ্যাপেন্ড হয়েছে!');
      setTextToAppend('');
      setShowAppendModal(false);
      openDocument(selectedDocFile);
    } catch (err: any) {
      showNotify('error', `টেক্সট যোগ করতে সমস্যা: ${err.message}`);
    } finally {
      setIsAppending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 lg:p-8">
      {/* Top Banner / Navigation */}
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Google Workspace Studio
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Drive • Sheets • Docs
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-400">
                গুগল ড্রাইভ, স্প্রেডশিট ও ডক্স ইন্টিগ্রেশন — ফাইল ব্রাউজিং, ডাটা এন্ট্রি ও এআই কন্টেন্ট সিঙ্ক।
              </p>
            </div>
          </div>

          {/* Connection Status & Official Google Sign-In Button */}
          <div className="flex items-center space-x-3">
            {accessToken ? (
              <div className="flex items-center space-x-3 bg-slate-800/80 border border-slate-700/60 px-4 py-2 rounded-xl">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <div className="text-left">
                  <div className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{userEmail || 'Google Connected'}</span>
                  </div>
                  <div className="text-[11px] text-emerald-400">Active OAuth Token</div>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="ml-2 px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition"
                  title="Disconnect Google Account"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              /* Official Google Sign-In Material Button */
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="gsi-material-button group relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-900 bg-white hover:bg-slate-100 active:bg-slate-200 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                <div className="gsi-material-button-content-wrapper flex items-center space-x-2.5">
                  <div className="gsi-material-button-icon w-5 h-5 flex-shrink-0">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block', width: '100%', height: '100%' }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents font-medium">
                    {isConnecting ? 'Connecting...' : 'Sign in with Google'}
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Global Notifications */}
        {notification && (
          <div className={`p-4 rounded-xl border flex items-center justify-between text-sm transition-all animate-fadeIn ${
            notification.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : notification.type === 'error'
              ? 'bg-rose-950/40 border-rose-500/30 text-rose-300'
              : 'bg-blue-950/40 border-blue-500/30 text-blue-300'
          }`}>
            <div className="flex items-center space-x-2">
              {notification.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
              {notification.type === 'error' && <AlertTriangle className="w-4 h-4" />}
              {notification.type === 'info' && <Info className="w-4 h-4" />}
              <span>{notification.text}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-xs opacity-75 hover:opacity-100">Dismiss</button>
          </div>
        )}

        {/* Workspace Feature Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('spark')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-sm transition ${
              activeTab === 'spark'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 ring-1 ring-purple-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-semibold">⚡ Production-Packet Importer (Spark & Drive)</span>
          </button>

          <button
            onClick={() => setActiveTab('drive')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-sm transition ${
              activeTab === 'drive'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Folder className="w-4 h-4" />
            <span>Google Drive Explorer</span>
          </button>

          <button
            onClick={() => setActiveTab('sheets')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-sm transition ${
              activeTab === 'sheets'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Google Sheets Manager</span>
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-sm transition ${
              activeTab === 'docs'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Google Docs Studio</span>
          </button>
        </div>

        {/* Non-Authenticated Prompt Banner */}
        {!accessToken && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Layers className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-lg font-semibold text-white">Google Workspace কানেক্ট করুন</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                আপনার Google Drive ফাইল ব্রাউজ করা, Google Sheets ডাটা আপডেট ও এক্সপোর্ট করা, এবং Google Docs এ কন্টেন্ট পড়ার জন্য অনুগ্রহ করে Google একাউন্টে সাইন ইন করুন।
              </p>
            </div>
            <div>
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="gsi-material-button inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-slate-900 bg-white hover:bg-slate-100 rounded-xl shadow-lg transition"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-5 h-5">
                    <svg viewBox="0 0 48 48" style={{ display: 'block', width: '100%', height: '100%' }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                  </div>
                  <span className="font-medium text-slate-800">
                    {isConnecting ? 'অপেক্ষা করুন...' : 'Sign in with Google'}
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: GOOGLE DRIVE EXPLORER */}
        {accessToken && activeTab === 'drive' && (
          <div className="space-y-6">
            {/* Toolbar */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Breadcrumb Path */}
              <div className="flex items-center space-x-1.5 text-sm overflow-x-auto py-1">
                {folderPath.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <button
                      onClick={() => navigateToCrumb(idx)}
                      className={`hover:text-blue-400 transition font-medium whitespace-nowrap ${
                        idx === folderPath.length - 1 ? 'text-white font-semibold' : 'text-slate-400'
                      }`}
                    >
                      {item.name}
                    </button>
                    {idx < folderPath.length - 1 && <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />}
                  </React.Fragment>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center flex-wrap gap-2">
                <button
                  onClick={() => setShowNewFolderModal(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition border border-slate-700"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
                  <span>New Folder</span>
                </button>

                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition border border-slate-700"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-400" />
                  <span>Upload Text File</span>
                </button>

                <button
                  onClick={() => setShowNewDocModal(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium transition border border-indigo-500/30"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>New Doc</span>
                </button>

                <button
                  onClick={() => setShowNewSheetModal(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-medium transition border border-emerald-500/30"
                >
                  <TableIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>New Sheet</span>
                </button>

                <button
                  onClick={loadDrive}
                  disabled={isLoadingDrive}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                  title="Refresh Drive"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingDrive ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs overflow-x-auto w-full sm:w-auto">
                {(['all', 'docs', 'sheets', 'folders', 'media'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setDriveFilter(f)}
                    className={`px-3 py-1.5 rounded-lg font-medium capitalize transition ${
                      driveFilter === f ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="ফাইলের নাম খুঁজুন..."
                  value={driveSearch}
                  onChange={e => setDriveSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && loadDrive()}
                  className="w-full bg-slate-900 border border-slate-800 pl-9 pr-3 py-1.5 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Files Grid / List */}
            {isLoadingDrive ? (
              <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
                <p className="text-sm">Google Drive ফাইল লোড হচ্ছে...</p>
              </div>
            ) : driveFiles.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-400 space-y-3">
                <Folder className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-sm">কোনো ফাইল পাওয়া যায়নি।</p>
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/90 text-xs text-slate-400 uppercase font-semibold">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4 hidden sm:table-cell">Type</th>
                      <th className="py-3 px-4 hidden md:table-cell">Last Modified</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {driveFiles.map(file => {
                      const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                      const isDoc = file.mimeType === 'application/vnd.google-apps.document';
                      const isSheet = file.mimeType === 'application/vnd.google-apps.spreadsheet';

                      return (
                        <tr key={file.id} className="hover:bg-slate-800/40 transition group">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              {isFolder ? (
                                <Folder className="w-5 h-5 text-amber-400 flex-shrink-0" />
                              ) : isDoc ? (
                                <FileText className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                              ) : isSheet ? (
                                <FileSpreadsheet className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                              ) : (
                                <FileText className="w-5 h-5 text-slate-400 flex-shrink-0" />
                              )}
                              
                              <button
                                onClick={() => {
                                  if (isFolder) enterFolder(file);
                                  else if (isDoc) {
                                    setActiveTab('docs');
                                    openDocument(file);
                                  } else if (isSheet) {
                                    setActiveTab('sheets');
                                    openSpreadsheet(file);
                                  } else if (file.webViewLink) {
                                    window.open(file.webViewLink, '_blank');
                                  }
                                }}
                                className="text-left font-medium text-slate-200 hover:text-blue-400 transition truncate max-w-xs md:max-w-md"
                              >
                                {file.name}
                              </button>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-xs text-slate-400 hidden sm:table-cell">
                            {isFolder ? 'Folder' : isDoc ? 'Google Doc' : isSheet ? 'Google Sheet' : 'File'}
                          </td>

                          <td className="py-3 px-4 text-xs text-slate-400 hidden md:table-cell">
                            {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : '—'}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {file.webViewLink && (
                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                                  title="Open in Google Drive"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}

                              {/* Delete Action triggers Explicit Confirmation Modal */}
                              <button
                                onClick={() => setFileToDelete(file)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
                                title="Delete file"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GOOGLE SHEETS MANAGER */}
        {accessToken && activeTab === 'sheets' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Spreadsheets List */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>My Spreadsheets</span>
                  </h3>
                  <button
                    onClick={() => setShowNewSheetModal(true)}
                    className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-medium transition"
                    title="Create New Sheet"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleExportPostsToSheet}
                    className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export Social Posts to Sheet</span>
                  </button>
                </div>

                {isLoadingSheets ? (
                  <div className="py-8 text-center text-xs text-slate-400">স্প্রেডশিট লোড হচ্ছে...</div>
                ) : (
                  <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                    {spreadsheets.map(s => (
                      <button
                        key={s.id}
                        onClick={() => openSpreadsheet(s)}
                        className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between ${
                          selectedSheetFile?.id === s.id
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-white'
                            : 'hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="text-xs font-medium truncate">{s.name}</div>
                          <div className="text-[10px] text-slate-500">
                            {s.modifiedTime ? new Date(s.modifiedTime).toLocaleDateString() : ''}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Spreadsheet Grid & Tabs */}
            <div className="lg:col-span-2 space-y-4">
              {selectedSheetFile ? (
                <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                      <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                        <span>{selectedSheetFile.name}</span>
                      </h2>
                      <p className="text-xs text-slate-400">Google Sheets Live Data Grid</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setNewRowValues(sheetGridData[0] ? new Array(sheetGridData[0].length).fill('') : ['']);
                          setShowAddRowModal(true);
                        }}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition shadow-md"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Row</span>
                      </button>

                      {selectedSheetFile.webViewLink && (
                        <a
                          href={selectedSheetFile.webViewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open in Sheets</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Sub-sheets Tabs */}
                  {sheetMetadata && sheetMetadata.sheets.length > 0 && (
                    <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                      {sheetMetadata.sheets.map(st => (
                        <button
                          key={st.sheetId}
                          onClick={() => switchSubSheet(st.title)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                            activeSubSheet === st.title
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {st.title}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Grid Data View */}
                  {isLoadingGrid ? (
                    <div className="py-16 text-center text-xs text-slate-400">ডাটা রিড হচ্ছে...</div>
                  ) : sheetGridData.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">এই শিটে কোনো ডাটা নেই।</div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-800 rounded-xl max-h-96">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-800/80 text-slate-300">
                            {sheetGridData[0].map((header, colIdx) => (
                              <th key={colIdx} className="py-2.5 px-3 border-r border-b border-slate-700 font-semibold whitespace-nowrap">
                                {header || `Col ${colIdx + 1}`}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {sheetGridData.slice(1).map((row, rowIdx) => (
                            <tr key={rowIdx} className="hover:bg-slate-800/30">
                              {sheetGridData[0].map((_, colIdx) => (
                                <td key={colIdx} className="py-2 px-3 border-r border-slate-800 text-slate-300 whitespace-nowrap truncate max-w-xs">
                                  {row[colIdx] !== undefined ? String(row[colIdx]) : ''}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-2">
                  <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-sm">বাম পাশের তালিকা থেকে একটি স্প্রেডশিট নির্বাচন করুন।</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: GOOGLE DOCS STUDIO */}
        {accessToken && activeTab === 'docs' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Docs List */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span>My Google Docs</span>
                  </h3>
                  <button
                    onClick={() => setShowNewDocModal(true)}
                    className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium transition"
                    title="Create New Doc"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {isLoadingDocs ? (
                  <div className="py-8 text-center text-xs text-slate-400">ডকুমেন্ট লোড হচ্ছে...</div>
                ) : (
                  <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                    {documents.map(d => (
                      <button
                        key={d.id}
                        onClick={() => openDocument(d)}
                        className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between ${
                          selectedDocFile?.id === d.id
                            ? 'bg-indigo-500/10 border border-indigo-500/30 text-white'
                            : 'hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="text-xs font-medium truncate">{d.name}</div>
                          <div className="text-[10px] text-slate-500">
                            {d.modifiedTime ? new Date(d.modifiedTime).toLocaleDateString() : ''}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Doc Content Viewer & Editor */}
            <div className="lg:col-span-2 space-y-4">
              {selectedDocFile ? (
                <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                      <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-400" />
                        <span>{selectedDocFile.name}</span>
                      </h2>
                      <p className="text-xs text-slate-400">Google Docs Live Text & Structure</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowAppendModal(true)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-md"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Append Text</span>
                      </button>

                      {selectedDocFile.webViewLink && (
                        <a
                          href={selectedDocFile.webViewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open in Docs</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {isLoadingDocBody ? (
                    <div className="py-16 text-center text-xs text-slate-400">ডকুমেন্ট রিড হচ্ছে...</div>
                  ) : activeDocContent ? (
                    <div className="space-y-4">
                      {/* Headings Outline */}
                      {activeDocContent.headings.length > 0 && (
                        <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Outline</div>
                          <div className="flex flex-wrap gap-2">
                            {activeDocContent.headings.map((h, i) => (
                              <span key={i} className="text-xs bg-slate-800 px-2 py-0.5 rounded text-indigo-300">
                                {h.text}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Document Body */}
                      <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs md:text-sm text-slate-300 font-mono leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                        {activeDocContent.bodyText.trim() || 'ডকুমেন্টটি খালি রয়েছে।'}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-sm">বাম পাশের তালিকা থেকে একটি Google Doc নির্বাচন করুন।</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SPARK & SOCIAL PRODUCTION PIPELINE */}
        {activeTab === 'spark' && (
          <div className="space-y-4">
            <GoogleDriveSparkStudio />
          </div>
        )}

      </div>

      {/* ==================================================== */}
      {/* MODALS */}
      {/* ==================================================== */}

      {/* Mandatory User Confirmation Dialog for File Deletion */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">ফাইল ডিলিট কনফার্মেশন</h3>
            </div>
            
            <p className="text-sm text-slate-300 leading-relaxed">
              আপনি কি নিশ্চিত যে আপনি আপনার Google Drive থেকে <strong className="text-white">'{fileToDelete.name}'</strong> ফাইলটি স্থায়ীভাবে ডিলিট করতে চান? এই একশনটি রিভার্স করা যাবে না।
            </p>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
              <div><strong>File ID:</strong> {fileToDelete.id}</div>
              <div><strong>Type:</strong> {fileToDelete.mimeType}</div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setFileToDelete(null)}
                disabled={isDeletingFile}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteFile}
                disabled={isDeletingFile}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white transition flex items-center space-x-1.5 shadow-lg shadow-rose-600/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeletingFile ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-amber-400" />
              <span>Create New Folder</span>
            </h3>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">ফোল্ডারের নাম</label>
              <input
                type="text"
                placeholder="e.g. Marketing Briefs 2026"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-amber-500 hover:bg-amber-400 text-slate-950 transition"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload File Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-400" />
              <span>Upload Text / Brief File</span>
            </h3>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">ফাইলের নাম</label>
              <input
                type="text"
                placeholder="e.g. production-brief.txt"
                value={uploadFileName}
                onChange={e => setUploadFileName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-sm text-white focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">ফাইলের কন্টেন্ট</label>
              <textarea
                rows={5}
                placeholder="Enter text or campaign content..."
                value={uploadFileContent}
                onChange={e => setUploadFileContent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-blue-400"
              />
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadFile}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition"
              >
                Upload to Drive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Spreadsheet Modal */}
      {showNewSheetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TableIcon className="w-5 h-5 text-emerald-400" />
              <span>Create Google Spreadsheet</span>
            </h3>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">স্প্রেডশিটের নাম</label>
              <input
                type="text"
                placeholder="e.g. Social Marketing Schedule 2026"
                value={newSheetTitle}
                onChange={e => setNewSheetTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">টেমপ্লেট নির্বাচন করুন</label>
              <select
                value={sheetTemplate}
                onChange={e => setSheetTemplate(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="blank">Blank Spreadsheet</option>
                <option value="social_calendar">Social Content & Campaign Calendar</option>
                <option value="lead_crm">Lead Tracker & Sales CRM</option>
              </select>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowNewSheetModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSpreadsheet}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition"
              >
                Create Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Row Modal */}
      {showAddRowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              <span>Add Row to {activeSubSheet}</span>
            </h3>
            
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {(sheetGridData[0] || ['Col 1', 'Col 2', 'Col 3']).map((header, i) => (
                <div key={i}>
                  <label className="block text-[11px] text-slate-400 mb-1">{header}</label>
                  <input
                    type="text"
                    value={newRowValues[i] || ''}
                    onChange={e => {
                      const updated = [...newRowValues];
                      updated[i] = e.target.value;
                      setNewRowValues(updated);
                    }}
                    placeholder={`Enter ${header}...`}
                    className="w-full bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowAddRowModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRow}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition"
              >
                Save Row
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Google Doc Modal */}
      {showNewDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <span>Create Google Doc</span>
            </h3>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">ডকুমেন্টের শিরোনাম</label>
              <input
                type="text"
                placeholder="e.g. Weekly Marketing Brief"
                value={newDocTitle}
                onChange={e => setNewDocTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">প্রাথমিক কন্টেন্ট (ঐচ্ছিক)</label>
              <textarea
                rows={5}
                placeholder="Write doc content or brief..."
                value={newDocBody}
                onChange={e => setNewDocBody(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowNewDocModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDocument}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition"
              >
                Create Doc
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Append Text to Doc Modal */}
      {showAppendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              <span>Append Text to {selectedDocFile?.name}</span>
            </h3>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">নতুন টেক্সট / আপডেট</label>
              <textarea
                rows={6}
                placeholder="Enter updates, post captions, notes to append..."
                value={textToAppend}
                onChange={e => setTextToAppend(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowAppendModal(false)}
                disabled={isAppending}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAppendText}
                disabled={isAppending}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition"
              >
                {isAppending ? 'Appending...' : 'Append to Doc'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GoogleWorkspaceStudio;
