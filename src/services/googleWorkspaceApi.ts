import { getAccessToken } from './googleAuth';

/**
 * Helper to ensure token is valid and make authorized requests.
 */
async function authorizedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated with Google. Please sign in with Google first.');
  }

  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail = errJson.error?.message || JSON.stringify(errJson);
    } catch {
      errorDetail = await response.text();
    }
    throw new Error(`Google API Error (${response.status}): ${errorDetail || response.statusText}`);
  }

  return response;
}

/* =========================================================================
   1. GMAIL API
   ========================================================================= */

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  unread: boolean;
}

/**
 * Fetch list of recent email messages from user's Gmail.
 */
export async function listRecentEmails(maxResults = 10, query = ''): Promise<GmailMessageSummary[]> {
  const qParam = query ? `&q=${encodeURIComponent(query)}` : '';
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}${qParam}`;
  const res = await authorizedFetch(url);
  const data = await res.json();

  if (!data.messages || !Array.isArray(data.messages)) {
    return [];
  }

  // Fetch details for the first batch of messages
  const messageDetails = await Promise.all(
    data.messages.slice(0, 10).map(async (msg: { id: string }) => {
      try {
        const detailRes = await authorizedFetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`
        );
        const detail = await detailRes.json();
        
        const headers = detail.payload?.headers || [];
        const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
        const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || 'Unknown Sender';
        const date = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || '';
        const unread = detail.labelIds?.includes('UNREAD') || false;

        return {
          id: detail.id,
          threadId: detail.threadId,
          subject,
          from,
          date,
          snippet: detail.snippet || '',
          unread,
        };
      } catch (e) {
        console.warn(`Failed to fetch email detail for ${msg.id}:`, e);
        return null;
      }
    })
  );

  return messageDetails.filter((m): m is GmailMessageSummary => m !== null);
}

/**
 * Send an email via Gmail API (MANDATORY: Caller must present confirmation dialog).
 */
export async function sendEmailMessage(to: string, subject: string, bodyText: string): Promise<{ id: string }> {
  // Construct RFC 2822 email format
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const emailLines = [
    `To: ${to}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    bodyText,
  ];
  const email = emailLines.join('\r\n');

  // Convert to Base64URL
  const base64Encoded = btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await authorizedFetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    body: JSON.stringify({
      raw: base64Encoded,
    }),
  });

  return await res.json();
}

/* =========================================================================
   2. GOOGLE CALENDAR API
   ========================================================================= */

export interface CalendarEventItem {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink?: string;
}

/**
 * List upcoming events from Primary Google Calendar.
 */
export async function listCalendarEvents(maxResults = 15): Promise<CalendarEventItem[]> {
  const now = new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(now)}&singleEvents=true&orderBy=startTime&maxResults=${maxResults}`;
  const res = await authorizedFetch(url);
  const data = await res.json();
  return data.items || [];
}

/**
 * Create a new event on Primary Google Calendar (MANDATORY: Caller must present confirmation dialog).
 */
export async function createCalendarEvent(params: {
  summary: string;
  description?: string;
  location?: string;
  startDateTime: string; // ISO String
  endDateTime: string;   // ISO String
}): Promise<CalendarEventItem> {
  const payload = {
    summary: params.summary,
    description: params.description || '',
    location: params.location || '',
    start: {
      dateTime: params.startDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: params.endDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };

  const res = await authorizedFetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return await res.json();
}

/**
 * Delete a calendar event (MANDATORY: Caller must present confirmation dialog).
 */
export async function deleteCalendarEvent(eventId: string): Promise<void> {
  await authorizedFetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: 'DELETE',
  });
}

/* =========================================================================
   3. GOOGLE TASKS API
   ========================================================================= */

export interface GoogleTaskItem {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  updated?: string;
}

export interface GoogleTaskList {
  id: string;
  title: string;
}

/**
 * List user's Google Task lists.
 */
export async function listTaskLists(): Promise<GoogleTaskList[]> {
  const res = await authorizedFetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists');
  const data = await res.json();
  return data.items || [];
}

/**
 * Fetch tasks for a given task list.
 */
export async function listTasks(taskListId = '@default'): Promise<GoogleTaskItem[]> {
  const res = await authorizedFetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks?showCompleted=true&showHidden=true`);
  const data = await res.json();
  return data.items || [];
}

/**
 * Create a new task in Google Tasks (MANDATORY: Caller must present confirmation dialog).
 */
export async function createGoogleTask(title: string, notes = '', dueDate?: string, taskListId = '@default'): Promise<GoogleTaskItem> {
  const payload: any = {
    title,
    notes,
  };
  if (dueDate) {
    payload.due = new Date(dueDate).toISOString();
  }

  const res = await authorizedFetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return await res.json();
}

/**
 * Update task status (e.g. mark completed/needsAction).
 */
export async function updateGoogleTaskStatus(taskId: string, status: 'needsAction' | 'completed', taskListId = '@default'): Promise<GoogleTaskItem> {
  const res = await authorizedFetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return await res.json();
}

/**
 * Delete a task (MANDATORY: Caller must present confirmation dialog).
 */
export async function deleteGoogleTask(taskId: string, taskListId = '@default'): Promise<void> {
  await authorizedFetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${taskId}`, {
    method: 'DELETE',
  });
}

/* =========================================================================
   4. GOOGLE CHAT API
   ========================================================================= */

export interface ChatSpace {
  name: string; // "spaces/AAA..."
  displayName?: string;
  type?: string;
}

export interface ChatMessage {
  name: string;
  text?: string;
  createTime?: string;
  sender?: {
    displayName?: string;
    avatarUrl?: string;
  };
}

/**
 * List available Google Chat spaces.
 */
export async function listChatSpaces(): Promise<ChatSpace[]> {
  try {
    const res = await authorizedFetch('https://chat.googleapis.com/v1/spaces');
    const data = await res.json();
    return data.spaces || [];
  } catch (err) {
    console.warn('Could not load Chat spaces:', err);
    return [];
  }
}

/**
 * List messages in a Google Chat space.
 */
export async function listChatMessages(spaceName: string): Promise<ChatMessage[]> {
  const res = await authorizedFetch(`https://chat.googleapis.com/v1/${spaceName}/messages?pageSize=25`);
  const data = await res.json();
  return data.messages || [];
}

/**
 * Send a message to a Google Chat space (MANDATORY: Caller must present confirmation dialog).
 */
export async function sendChatMessage(spaceName: string, text: string): Promise<ChatMessage> {
  const res = await authorizedFetch(`https://chat.googleapis.com/v1/${spaceName}/messages`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
  return await res.json();
}

/* =========================================================================
   5. GOOGLE CONTACTS (People API)
   ========================================================================= */

export interface GoogleContactItem {
  resourceName: string;
  displayName: string;
  email?: string;
  phone?: string;
  organization?: string;
}

/**
 * Fetch Google Contacts connections.
 */
export async function listGoogleContacts(): Promise<GoogleContactItem[]> {
  const res = await authorizedFetch(
    'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,organizations&pageSize=50'
  );
  const data = await res.json();
  
  if (!data.connections || !Array.isArray(data.connections)) {
    return [];
  }

  return data.connections.map((c: any) => {
    const nameObj = c.names?.[0];
    const emailObj = c.emailAddresses?.[0];
    const phoneObj = c.phoneNumbers?.[0];
    const orgObj = c.organizations?.[0];

    return {
      resourceName: c.resourceName,
      displayName: nameObj?.displayName || '(Unnamed Contact)',
      email: emailObj?.value || '',
      phone: phoneObj?.value || '',
      organization: orgObj?.name || '',
    };
  });
}

/**
 * Create a new Contact in Google Contacts (MANDATORY: Caller must present confirmation dialog).
 */
export async function createGoogleContact(params: {
  givenName: string;
  familyName?: string;
  email?: string;
  phone?: string;
  organization?: string;
}): Promise<GoogleContactItem> {
  const payload: any = {
    names: [{ givenName: params.givenName, familyName: params.familyName || '' }],
  };

  if (params.email) {
    payload.emailAddresses = [{ value: params.email, type: 'work' }];
  }
  if (params.phone) {
    payload.phoneNumbers = [{ value: params.phone, type: 'mobile' }];
  }
  if (params.organization) {
    payload.organizations = [{ name: params.organization, title: 'Caseworker / Resource Contact' }];
  }

  const res = await authorizedFetch('https://people.googleapis.com/v1/people:createContact?personFields=names,emailAddresses,phoneNumbers,organizations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const created = await res.json();
  return {
    resourceName: created.resourceName,
    displayName: created.names?.[0]?.displayName || params.givenName,
    email: params.email || '',
    phone: params.phone || '',
    organization: params.organization || '',
  };
}

/* =========================================================================
   6. GOOGLE DRIVE API
   ========================================================================= */

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
  size?: string;
  iconLink?: string;
}

/**
 * List files in user's Google Drive.
 */
export async function listDriveFiles(query = ''): Promise<GoogleDriveFile[]> {
  let q = "trashed = false";
  if (query) {
    q += ` and name contains '${query.replace(/'/g, "\\'")}'`;
  }

  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,modifiedTime,webViewLink,size,iconLink)&pageSize=30&orderBy=modifiedTime desc`;
  const res = await authorizedFetch(url);
  const data = await res.json();
  return data.files || [];
}

/**
 * Upload a text or markdown document into Google Drive (e.g. saved benefit form, rights card).
 * (MANDATORY: Caller must present confirmation dialog).
 */
export async function uploadTextToDrive(fileName: string, content: string, mimeType = 'text/plain'): Promise<GoogleDriveFile> {
  const metadata = {
    name: fileName,
    mimeType: mimeType,
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([content], { type: mimeType }));

  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,modifiedTime', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Drive Upload Failed: ${err}`);
  }

  return await res.json();
}

/**
 * Delete a file in Google Drive (MANDATORY: Caller must present confirmation dialog).
 */
export async function deleteDriveFile(fileId: string): Promise<void> {
  await authorizedFetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
  });
}
