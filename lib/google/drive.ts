/* eslint-disable @typescript-eslint/no-unused-vars */
import { google, drive_v3 } from 'googleapis'
import { Readable } from 'stream'

function getDriveClient(accessToken: string) {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })
  return google.drive({ version: 'v3', auth })
}

const DEFAULT_FIELDS = 'id, name, mimeType, webViewLink, iconLink, thumbnailLink, modifiedTime, size, parents, shared, description'

export async function listFiles(
  accessToken: string,
  folderId?: string,
  query?: string,
  pageSize = 50,
  pageToken?: string
) {
  const drive = getDriveClient(accessToken)
  
  let q = query || ''
  if (folderId) {
    if (q) q += ' and '
    q += `'${folderId}' in parents`
  }

  const res = await drive.files.list({
    q,
    pageSize,
    pageToken,
    fields: `nextPageToken, files(${DEFAULT_FIELDS})`,
  })

  return { files: res.data.files, nextPageToken: res.data.nextPageToken }
}

export async function getFile(accessToken: string, fileId: string): Promise<drive_v3.Schema$File> {
  const drive = getDriveClient(accessToken)
  const res = await drive.files.get({
    fileId,
    fields: '*',
  })
  return res.data
}

export async function createFolder(accessToken: string, name: string, parentId?: string): Promise<drive_v3.Schema$File> {
  const drive = getDriveClient(accessToken)
  const res = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined,
    },
    fields: DEFAULT_FIELDS,
  })
  return res.data
}

export async function uploadFile(
  accessToken: string,
  metadata: { name: string; parents?: string[] },
  mediaBuffer: Buffer,
  mimeType: string
): Promise<drive_v3.Schema$File> {
  const drive = getDriveClient(accessToken)
  const mediaStream = new Readable()
  mediaStream.push(mediaBuffer)
  mediaStream.push(null)

  const res = await drive.files.create({
    requestBody: metadata,
    media: {
      mimeType,
      body: mediaStream,
    },
    fields: DEFAULT_FIELDS,
  })
  return res.data
}

export async function searchFiles(accessToken: string, query: string) {
  const drive = getDriveClient(accessToken)
  const res = await drive.files.list({
    q: `fullText contains '${query}'`,
    fields: `files(${DEFAULT_FIELDS})`,
  })
  return res.data.files
}

export async function createDoc(accessToken: string, title: string, folderId?: string): Promise<drive_v3.Schema$File> {
  const drive = getDriveClient(accessToken)
  const res = await drive.files.create({
    requestBody: {
      name: title,
      mimeType: 'application/vnd.google-apps.document',
      parents: folderId ? [folderId] : undefined,
    },
    fields: DEFAULT_FIELDS,
  })
  return res.data
}

export async function createSheet(accessToken: string, title: string, folderId?: string): Promise<drive_v3.Schema$File> {
  const drive = getDriveClient(accessToken)
  const res = await drive.files.create({
    requestBody: {
      name: title,
      mimeType: 'application/vnd.google-apps.spreadsheet',
      parents: folderId ? [folderId] : undefined,
    },
    fields: DEFAULT_FIELDS,
  })
  return res.data
}

export async function shareFile(accessToken: string, fileId: string, email: string, role: string) {
  const drive = getDriveClient(accessToken)
  const res = await drive.permissions.create({
    fileId,
    requestBody: {
      type: 'user',
      role,
      emailAddress: email,
    },
  })
  return res.data
}

export async function getFolderTree(accessToken: string, _rootId = 'root') {
  const drive = getDriveClient(accessToken)
  const res = await drive.files.list({
    q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false",
    fields: 'files(id, name, parents)',
  })
  return res.data.files
}

export async function getChanges(accessToken: string, startPageToken: string) {
  const drive = getDriveClient(accessToken)
  const res = await drive.changes.list({
    pageToken: startPageToken,
  })
  return { changes: res.data.changes, newStartPageToken: res.data.newStartPageToken }
}
