/**
 * Google Workspace API Service (Client-Side)
 * Provides unified, type-safe API operations for Google Drive, Google Sheets, and Google Docs
 * Using the authenticated OAuth Access Token.
 */

export interface WorkspaceDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  createdTime?: string;
  size?: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  parents?: string[];
  owners?: { displayName: string; emailAddress: string }[];
}

export interface SheetMetadata {
  id: string;
  title: string;
  sheets: {
    sheetId: number;
    title: string;
    index: number;
    rowCount?: number;
    columnCount?: number;
  }[];
}

export interface DocStructure {
  id: string;
  title: string;
  revisionId?: string;
  bodyText: string;
  headings: { text: string; level: number }[];
  paragraphsCount: number;
}

// ==========================================
// 1. Google Drive APIs
// ==========================================

export async function listDriveFiles(
  accessToken: string,
  options?: {
    folderId?: string;
    mimeTypeFilter?: 'all' | 'docs' | 'sheets' | 'folders' | 'media';
    searchQuery?: string;
    pageSize?: number;
    pageToken?: string;
  }
): Promise<{ files: WorkspaceDriveFile[]; nextPageToken?: string }> {
  const parts: string[] = ['trashed = false'];

  if (options?.folderId) {
    parts.push(`'${options.folderId}' in parents`);
  }

  if (options?.mimeTypeFilter && options.mimeTypeFilter !== 'all') {
    if (options.mimeTypeFilter === 'docs') {
      parts.push("mimeType = 'application/vnd.google-apps.document'");
    } else if (options.mimeTypeFilter === 'sheets') {
      parts.push("mimeType = 'application/vnd.google-apps.spreadsheet'");
    } else if (options.mimeTypeFilter === 'folders') {
      parts.push("mimeType = 'application/vnd.google-apps.folder'");
    } else if (options.mimeTypeFilter === 'media') {
      parts.push(
        "(mimeType contains 'image/' or mimeType contains 'video/' or mimeType = 'application/pdf')"
      );
    }
  }

  if (options?.searchQuery?.trim()) {
    const escaped = options.searchQuery.replace(/'/g, "\\'");
    parts.push(`name contains '${escaped}'`);
  }

  const q = parts.join(' and ');
  const pageSize = options?.pageSize || 40;
  const fields = 'nextPageToken,files(id,name,mimeType,modifiedTime,createdTime,size,webViewLink,webContentLink,iconLink,thumbnailLink,parents,owners)';

  let url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=${encodeURIComponent(fields)}&pageSize=${pageSize}&orderBy=folder,modifiedTime desc`;
  if (options?.pageToken) {
    url += `&pageToken=${encodeURIComponent(options.pageToken)}`;
  }

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Google Drive ফাইল আনতে ব্যর্থ হয়েছে (${res.status})`);
  }

  const data = await res.json();
  return {
    files: data.files || [],
    nextPageToken: data.nextPageToken
  };
}

export async function createDriveFolder(
  accessToken: string,
  folderName: string,
  parentFolderId?: string
): Promise<WorkspaceDriveFile> {
  const metadata: any = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder'
  };
  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const res = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(metadata)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Google Drive ফোল্ডার তৈরি করতে ব্যর্থ হয়েছে');
  }

  return await res.json();
}

export async function uploadDriveTextFile(
  accessToken: string,
  fileName: string,
  content: string,
  mimeType: string = 'text/plain',
  parentFolderId?: string
): Promise<WorkspaceDriveFile> {
  const metadata: any = {
    name: fileName,
    mimeType
  };
  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelim = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelim;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartRequestBody
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'ফাইল আপলোড করতে ব্যর্থ হয়েছে');
  }

  return await res.json();
}

/**
 * Permanently deletes or moves a file to trash in Google Drive.
 * MANDATORY: Call this only after explicit user confirmation in the UI.
 */
export async function deleteDriveFile(
  accessToken: string,
  fileId: string
): Promise<boolean> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'ফাইল ডিলিট করতে ব্যর্থ হয়েছে');
  }

  return true;
}

// ==========================================
// 2. Google Sheets APIs
// ==========================================

export async function listSpreadsheets(
  accessToken: string,
  searchQuery?: string
): Promise<WorkspaceDriveFile[]> {
  const result = await listDriveFiles(accessToken, {
    mimeTypeFilter: 'sheets',
    searchQuery,
    pageSize: 30
  });
  return result.files;
}

export async function createSpreadsheet(
  accessToken: string,
  title: string,
  initialSheets: string[] = ['Sheet1']
): Promise<SheetMetadata> {
  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: { title },
      sheets: initialSheets.map(s => ({
        properties: { title: s }
      }))
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Google Spreadsheet তৈরি করতে ব্যর্থ হয়েছে');
  }

  const data = await res.json();
  return {
    id: data.spreadsheetId,
    title: data.properties?.title || title,
    sheets: (data.sheets || []).map((s: any) => ({
      sheetId: s.properties?.sheetId,
      title: s.properties?.title,
      index: s.properties?.index,
      rowCount: s.properties?.gridProperties?.rowCount,
      columnCount: s.properties?.gridProperties?.columnCount
    }))
  };
}

export async function getSpreadsheetMetadata(
  accessToken: string,
  spreadsheetId: string
): Promise<SheetMetadata> {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=spreadsheetId,properties.title,sheets.properties`,
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'স্প্রেডশিটের তথ্য পেতে ব্যর্থ হয়েছে');
  }

  const data = await res.json();
  return {
    id: data.spreadsheetId,
    title: data.properties?.title || 'Spreadsheet',
    sheets: (data.sheets || []).map((s: any) => ({
      sheetId: s.properties?.sheetId,
      title: s.properties?.title,
      index: s.properties?.index,
      rowCount: s.properties?.gridProperties?.rowCount,
      columnCount: s.properties?.gridProperties?.columnCount
    }))
  };
}

export async function readSheetRange(
  accessToken: string,
  spreadsheetId: string,
  range: string
): Promise<{ range: string; values: any[][] }> {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'স্প্রেডশিটের ডাটা পড়তে ব্যর্থ হয়েছে');
  }

  const data = await res.json();
  return {
    range: data.range,
    values: data.values || []
  };
}

export async function appendSheetRows(
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: any[][]
): Promise<any> {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values })
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'স্প্রেডশিটে ডাটা যোগ করতে ব্যর্থ হয়েছে');
  }

  return await res.json();
}

export async function updateSheetRange(
  accessToken: string,
  spreadsheetId: string,
  range: string,
  values: any[][]
): Promise<any> {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values })
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'স্প্রেডশিট আপডেট করতে ব্যর্থ হয়েছে');
  }

  return await res.json();
}

// ==========================================
// 3. Google Docs APIs
// ==========================================

export async function listDocuments(
  accessToken: string,
  searchQuery?: string
): Promise<WorkspaceDriveFile[]> {
  const result = await listDriveFiles(accessToken, {
    mimeTypeFilter: 'docs',
    searchQuery,
    pageSize: 30
  });
  return result.files;
}

export async function createDocument(
  accessToken: string,
  title: string,
  initialBody?: string
): Promise<{ documentId: string; title: string }> {
  // 1. Create empty doc
  const res = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Google Doc তৈরি করতে ব্যর্থ হয়েছে');
  }

  const doc = await res.json();

  // 2. If initial content provided, insert it
  if (initialBody && initialBody.trim()) {
    try {
      await appendDocumentText(accessToken, doc.documentId, initialBody);
    } catch (insertErr) {
      console.warn('Initial body insert warning:', insertErr);
    }
  }

  return {
    documentId: doc.documentId,
    title: doc.title || title
  };
}

export async function getDocumentContent(
  accessToken: string,
  documentId: string
): Promise<DocStructure> {
  const res = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Google Doc লোড করতে ব্যর্থ হয়েছে');
  }

  const data = await res.json();
  const title = data.title || 'Untitled Document';
  const headings: { text: string; level: number }[] = [];
  let fullText = '';
  let paragraphsCount = 0;

  if (Array.isArray(data.body?.content)) {
    for (const elem of data.body.content) {
      if (elem.paragraph) {
        paragraphsCount++;
        let pText = '';
        if (Array.isArray(elem.paragraph.elements)) {
          for (const pe of elem.paragraph.elements) {
            if (pe.textRun?.content) {
              pText += pe.textRun.content;
            }
          }
        }
        fullText += pText;

        const namedStyle = elem.paragraph.paragraphStyle?.namedStyleType;
        if (namedStyle && namedStyle.startsWith('HEADING_')) {
          const lvl = parseInt(namedStyle.replace('HEADING_', ''), 10) || 1;
          const cleanText = pText.trim();
          if (cleanText) {
            headings.push({ text: cleanText, level: lvl });
          }
        }
      }
    }
  }

  return {
    id: data.documentId,
    title,
    revisionId: data.revisionId,
    bodyText: fullText,
    headings,
    paragraphsCount
  };
}

export async function appendDocumentText(
  accessToken: string,
  documentId: string,
  textToAppend: string
): Promise<any> {
  // First get doc to determine endIndex
  const docRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}?fields=body.content`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!docRes.ok) {
    throw new Error('ডকুমেন্ট ইনডেক্স যাচাই করতে ব্যর্থ হয়েছে');
  }
  const docData = await docRes.json();
  const content = docData.body?.content || [];
  const lastElement = content[content.length - 1];
  const endIndex = Math.max(1, (lastElement?.endIndex || 2) - 1);

  const res = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: { index: endIndex },
            text: '\n' + textToAppend
          }
        }
      ]
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'ডকুমেন্টে টেক্সট যোগ করতে ব্যর্থ হয়েছে');
  }

  return await res.json();
}
