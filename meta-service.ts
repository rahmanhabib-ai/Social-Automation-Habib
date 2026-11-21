import fs from 'fs';
import path from 'path';

export interface MetaConnectedPage {
  id: string;
  name: string;
  category?: string;
  picture?: string;
  accessToken: string;
  isPermanent: boolean;
  followersCount?: number;
  fanCount?: number;
  instagramAccountId?: string;
  instagramUsername?: string;
  instagramProfilePic?: string;
  whatsappNumber?: string;
  link?: string;
  tasks?: string[];
  isActive: boolean;
  connectedAt: string;
  lastSyncedAt: string;
}

export interface MetaConnectedGroup {
  id: string;
  name: string;
  picture?: string;
  privacy?: string;
  memberCount?: number;
  administrator: boolean;
  linkedPageId?: string;
  isActive: boolean;
  connectedAt: string;
}

export interface MetaUserProfile {
  id: string;
  name: string;
  email?: string;
  picture?: string;
  longLivedUserToken?: string;
  tokenExpiresAt?: string;
  connectedAt: string;
}

export interface MetaStorageData {
  user: MetaUserProfile | null;
  pages: MetaConnectedPage[];
  groups: MetaConnectedGroup[];
  appId: string;
  appSecret: string;
  lastSync: string;
}

const STORAGE_PATH = path.join(process.cwd(), 'meta_connected_accounts.json');

// Default Meta Developer App Credentials (can be overridden by user or env)
const DEFAULT_APP_ID = process.env.META_APP_ID || '1148293749819204';
const DEFAULT_APP_SECRET = process.env.META_APP_SECRET || '';

function loadStorage(): MetaStorageData {
  try {
    if (fs.existsSync(STORAGE_PATH)) {
      const raw = fs.readFileSync(STORAGE_PATH, 'utf-8');
      const data = JSON.parse(raw);
      return {
        user: data.user || null,
        pages: Array.isArray(data.pages) ? data.pages : [],
        groups: Array.isArray(data.groups) ? data.groups : [],
        appId: data.appId || DEFAULT_APP_ID,
        appSecret: data.appSecret || DEFAULT_APP_SECRET,
        lastSync: data.lastSync || new Date().toISOString()
      };
    }
  } catch (e) {
    console.warn('[Meta Storage] Error loading data, using defaults:', e);
  }

  return {
    user: null,
    pages: [],
    groups: [],
    appId: DEFAULT_APP_ID,
    appSecret: DEFAULT_APP_SECRET,
    lastSync: new Date().toISOString()
  };
}

function saveStorage(data: MetaStorageData) {
  try {
    fs.writeFileSync(STORAGE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('[Meta Storage] Failed to save storage:', e);
  }
}

export class MetaOAuthService {
  private data: MetaStorageData;

  constructor() {
    this.data = loadStorage();
  }

  public getAppCredentials() {
    return {
      appId: this.data.appId || DEFAULT_APP_ID,
      appSecret: this.data.appSecret || DEFAULT_APP_SECRET
    };
  }

  public setAppCredentials(appId: string, appSecret: string) {
    this.data.appId = appId.trim();
    this.data.appSecret = appSecret.trim();
    saveStorage(this.data);
  }

  /**
   * Generates official Facebook OAuth Dialog URL with complete scopes
   */
  public generateOAuthUrl(redirectUri: string, customAppId?: string, state = 'meta_oauth_secure_state'): string {
    const appId = customAppId || this.data.appId || DEFAULT_APP_ID;
    const scopes = [
      'public_profile',
      'email',
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
      'pages_manage_messages',
      'pages_read_user_content',
      'publish_to_groups',
      'groups_access_member_info',
      'business_management'
    ].join(',');

    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      scope: scopes,
      response_type: 'code',
      auth_type: 'rerequest',
      state: state
    });

    return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
  }

  /**
   * Full Exchange Pipeline:
   * 1. Authorization code -> Short-Lived User Token
   * 2. Short-Lived Token -> 60-Day Long-Lived User Token
   * 3. Long-Lived Token -> /me/accounts for Never-Expiring Page Access Tokens
   * 4. /me/groups for Group Admin details
   */
  public async exchangeCodeAndSyncAccounts(
    codeOrToken: string,
    redirectUri: string,
    customAppId?: string,
    customAppSecret?: string,
    isDirectToken = false
  ): Promise<{
    user: MetaUserProfile;
    pages: MetaConnectedPage[];
    groups: MetaConnectedGroup[];
  }> {
    const appId = customAppId || this.data.appId || DEFAULT_APP_ID;
    const appSecret = customAppSecret || this.data.appSecret || DEFAULT_APP_SECRET;

    let longLivedUserToken = codeOrToken;

    if (!isDirectToken) {
      if (!appSecret) {
        throw new Error('Meta App Secret is required for code exchange. Please configure App Secret or provide direct User Access Token.');
      }

      // Step 1: Exchange code for Short-Lived Token
      const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${encodeURIComponent(appId)}&client_secret=${encodeURIComponent(appSecret)}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${encodeURIComponent(codeOrToken)}`;
      const tokenRes = await fetch(tokenUrl);
      const tokenData = await tokenRes.json();

      if (tokenData.error) {
        throw new Error(`Meta Token Exchange Failed: ${tokenData.error.message || JSON.stringify(tokenData.error)}`);
      }

      const shortLivedToken = tokenData.access_token;

      // Step 2: Exchange Short-Lived Token for Long-Lived Token (60 Days)
      const longTokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${encodeURIComponent(appId)}&client_secret=${encodeURIComponent(appSecret)}&fb_exchange_token=${encodeURIComponent(shortLivedToken)}`;
      const longTokenRes = await fetch(longTokenUrl);
      const longTokenData = await longTokenRes.json();

      longLivedUserToken = longTokenData.access_token || shortLivedToken;
    }

    // Step 3: Fetch User Profile
    const meUrl = `https://graph.facebook.com/v19.0/me?fields=id,name,email,picture.width(200).height(200)&access_token=${encodeURIComponent(longLivedUserToken)}`;
    const meRes = await fetch(meUrl);
    const meData = await meRes.json();

    if (meData.error) {
      throw new Error(`Failed to fetch user profile: ${meData.error.message}`);
    }

    const userProfile: MetaUserProfile = {
      id: meData.id,
      name: meData.name || 'Facebook User',
      email: meData.email || '',
      picture: meData.picture?.data?.url || '',
      longLivedUserToken: longLivedUserToken,
      tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      connectedAt: new Date().toISOString()
    };

    // Step 4: Fetch All Pages with Never-Expiring Page Access Tokens
    const accountsUrl = `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,category,access_token,tasks,picture.width(200).height(200),followers_count,fan_count,is_published,link,whatsapp_number,instagram_business_account{id,username,profile_picture_url}&access_token=${encodeURIComponent(longLivedUserToken)}&limit=100`;
    const accountsRes = await fetch(accountsUrl);
    const accountsData = await accountsRes.json();

    const pagesList: MetaConnectedPage[] = [];
    if (Array.isArray(accountsData?.data)) {
      for (const item of accountsData.data) {
        pagesList.push({
          id: item.id,
          name: item.name,
          category: item.category || 'Business / Brand',
          picture: item.picture?.data?.url || '',
          accessToken: item.access_token, // Never expiring page token
          isPermanent: true,
          followersCount: item.followers_count || item.fan_count || 0,
          fanCount: item.fan_count || 0,
          instagramAccountId: item.instagram_business_account?.id,
          instagramUsername: item.instagram_business_account?.username,
          instagramProfilePic: item.instagram_business_account?.profile_picture_url,
          whatsappNumber: item.whatsapp_number,
          link: item.link || `https://facebook.com/${item.id}`,
          tasks: Array.isArray(item.tasks) ? item.tasks : ['MANAGE', 'CREATE_CONTENT'],
          isActive: true,
          connectedAt: new Date().toISOString(),
          lastSyncedAt: new Date().toISOString()
        });
      }
    }

    // Step 5: Fetch Groups
    let groupsList: MetaConnectedGroup[] = [];
    try {
      const groupsUrl = `https://graph.facebook.com/v19.0/me/groups?fields=id,name,administrator,member_count,privacy,icon,picture.width(200).height(200)&access_token=${encodeURIComponent(longLivedUserToken)}&limit=100`;
      const groupsRes = await fetch(groupsUrl);
      const groupsData = await groupsRes.json();
      if (Array.isArray(groupsData?.data)) {
        groupsList = groupsData.data.map((g: any) => ({
          id: g.id,
          name: g.name,
          picture: g.picture?.data?.url || g.icon || '',
          privacy: g.privacy || 'CLOSED',
          memberCount: g.member_count || 0,
          administrator: Boolean(g.administrator),
          isActive: true,
          connectedAt: new Date().toISOString()
        }));
      }
    } catch (grpErr) {
      console.warn('[Meta Groups] Non-fatal notice fetching groups:', grpErr);
    }

    // Merge or update local persistent storage
    this.data.user = userProfile;
    
    // Merge pages (keep active settings if page existed before)
    const existingMap = new Map(this.data.pages.map(p => [p.id, p]));
    const mergedPages = pagesList.map(newPage => {
      const old = existingMap.get(newPage.id);
      return {
        ...newPage,
        isActive: old ? old.isActive : true
      };
    });

    this.data.pages = mergedPages;
    this.data.groups = groupsList;
    this.data.lastSync = new Date().toISOString();
    saveStorage(this.data);

    return {
      user: this.data.user,
      pages: this.data.pages,
      groups: this.data.groups
    };
  }

  /**
   * Get all connected pages and groups
   */
  public getStatus() {
    return {
      isConnected: Boolean(this.data.user && this.data.pages.length > 0),
      user: this.data.user,
      pagesCount: this.data.pages.length,
      activePagesCount: this.data.pages.filter(p => p.isActive).length,
      groupsCount: this.data.groups.length,
      pages: this.data.pages,
      groups: this.data.groups,
      lastSync: this.data.lastSync
    };
  }

  /**
   * Toggle a page active status
   */
  public togglePage(pageId: string, isActive?: boolean): MetaConnectedPage | null {
    const page = this.data.pages.find(p => p.id === pageId);
    if (!page) return null;

    page.isActive = typeof isActive === 'boolean' ? isActive : !page.isActive;
    saveStorage(this.data);
    return page;
  }

  /**
   * Remove / unlink a specific page
   */
  public removePage(pageId: string): boolean {
    const initialLen = this.data.pages.length;
    this.data.pages = this.data.pages.filter(p => p.id !== pageId);
    if (this.data.pages.length !== initialLen) {
      saveStorage(this.data);
      return true;
    }
    return false;
  }

  /**
   * Unlink all Meta accounts and tokens
   */
  public disconnectAll(): void {
    this.data.user = null;
    this.data.pages = [];
    this.data.groups = [];
    this.data.lastSync = new Date().toISOString();
    saveStorage(this.data);
  }

  /**
   * Publish Post to a Facebook Page (Feed or Photo)
   */
  public async publishToPage(
    pageId: string,
    postData: {
      message: string;
      imageUrl?: string;
      imageBuffer?: Buffer;
      link?: string;
    }
  ): Promise<{ success: boolean; postId?: string; error?: string; permalink?: string }> {
    const page = this.data.pages.find(p => p.id === pageId);
    if (!page || !page.accessToken) {
      throw new Error(`Page with ID ${pageId} is not connected or missing access token.`);
    }

    const token = page.accessToken;

    try {
      // If photo post
      if (postData.imageUrl || postData.imageBuffer) {
        let photoEndpoint = `https://graph.facebook.com/v19.0/${pageId}/photos`;
        
        if (postData.imageUrl && postData.imageUrl.startsWith('http')) {
          const bodyParams = new URLSearchParams({
            url: postData.imageUrl,
            caption: postData.message || '',
            access_token: token
          });

          const res = await fetch(photoEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: bodyParams.toString()
          });

          const resData = await res.json();
          if (resData.error) {
            throw new Error(`Meta Photo Publish Error: ${resData.error.message}`);
          }

          return {
            success: true,
            postId: resData.id || resData.post_id,
            permalink: `https://facebook.com/${resData.id || resData.post_id}`
          };
        } else if (postData.imageBuffer || (postData.imageUrl && postData.imageUrl.startsWith('data:image'))) {
          // Handle base64 / buffer upload
          const base64Data = postData.imageUrl?.replace(/^data:image\/\w+;base64,/, '') || postData.imageBuffer?.toString('base64');
          if (base64Data) {
            const formData = new FormData();
            const binaryBlob = Buffer.from(base64Data, 'base64');
            const fileBlob = new Blob([binaryBlob], { type: 'image/png' });
            formData.append('source', fileBlob, 'post_banner.png');
            formData.append('caption', postData.message || '');
            formData.append('access_token', token);

            const res = await fetch(photoEndpoint, {
              method: 'POST',
              body: formData
            });

            const resData = await res.json();
            if (resData.error) {
              throw new Error(`Meta Photo Upload Error: ${resData.error.message}`);
            }

            return {
              success: true,
              postId: resData.id || resData.post_id,
              permalink: `https://facebook.com/${resData.id || resData.post_id}`
            };
          }
        }
      }

      // Text / Link Feed Post
      const feedEndpoint = `https://graph.facebook.com/v19.0/${pageId}/feed`;
      const bodyParams = new URLSearchParams({
        message: postData.message,
        access_token: token
      });

      if (postData.link) {
        bodyParams.append('link', postData.link);
      }

      const res = await fetch(feedEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: bodyParams.toString()
      });

      const resData = await res.json();
      if (resData.error) {
        throw new Error(`Meta Feed Publish Error: ${resData.error.message}`);
      }

      return {
        success: true,
        postId: resData.id,
        permalink: `https://facebook.com/${resData.id}`
      };
    } catch (err: any) {
      console.error('[Meta Publish] Error:', err);
      throw err;
    }
  }

  /**
   * Publish Post to a Facebook Group
   */
  public async publishToGroup(
    groupId: string,
    postData: {
      message: string;
      imageUrl?: string;
      link?: string;
    }
  ): Promise<{ success: boolean; postId?: string; error?: string }> {
    const group = this.data.groups.find(g => g.id === groupId);
    if (!group) {
      throw new Error(`Group with ID ${groupId} not found in connected list.`);
    }

    // Use Long-Lived User Token or Admin Page Token
    const userToken = this.data.user?.longLivedUserToken || this.data.pages[0]?.accessToken;
    if (!userToken) {
      throw new Error('No valid token found to post to Facebook Group. Please connect your Facebook account.');
    }

    try {
      const endpoint = `https://graph.facebook.com/v19.0/${groupId}/feed`;
      const bodyParams = new URLSearchParams({
        message: postData.message,
        access_token: userToken
      });

      if (postData.link) bodyParams.append('link', postData.link);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: bodyParams.toString()
      });

      const resData = await res.json();
      if (resData.error) {
        throw new Error(`Facebook Group Post Error: ${resData.error.message}`);
      }

      return {
        success: true,
        postId: resData.id
      };
    } catch (err: any) {
      console.error('[Meta Group Publish] Error:', err);
      throw err;
    }
  }

  /**
   * Manually add or sync a page using Page Access Token directly
   */
  public async addPageDirect(pageId: string, pageAccessToken: string): Promise<MetaConnectedPage> {
    const pageUrl = `https://graph.facebook.com/v19.0/${encodeURIComponent(pageId)}?fields=id,name,category,picture.width(200).height(200),followers_count,fan_count,link,whatsapp_number,instagram_business_account{id,username,profile_picture_url}&access_token=${encodeURIComponent(pageAccessToken)}`;
    const res = await fetch(pageUrl);
    const data = await res.json();

    if (data.error) {
      throw new Error(`Failed to verify page: ${data.error.message}`);
    }

    const newPage: MetaConnectedPage = {
      id: data.id,
      name: data.name,
      category: data.category || 'Business / Brand',
      picture: data.picture?.data?.url || '',
      accessToken: pageAccessToken,
      isPermanent: true,
      followersCount: data.followers_count || data.fan_count || 0,
      fanCount: data.fan_count || 0,
      instagramAccountId: data.instagram_business_account?.id,
      instagramUsername: data.instagram_business_account?.username,
      instagramProfilePic: data.instagram_business_account?.profile_picture_url,
      whatsappNumber: data.whatsapp_number,
      link: data.link || `https://facebook.com/${data.id}`,
      isActive: true,
      connectedAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString()
    };

    // Upsert into pages array
    const idx = this.data.pages.findIndex(p => p.id === newPage.id);
    if (idx >= 0) {
      this.data.pages[idx] = newPage;
    } else {
      this.data.pages.push(newPage);
    }

    saveStorage(this.data);
    return newPage;
  }
}

export const metaOAuthService = new MetaOAuthService();
