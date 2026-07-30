import { create } from 'zustand'

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  webViewLink?: string
  iconLink?: string
  thumbnailLink?: string
  modifiedTime?: string
  size?: string
  parents?: string[]
  shared?: boolean
  description?: string
}

export interface FolderNode {
  id: string
  name: string
  children: FolderNode[]
  isExpanded: boolean
}

export interface Breadcrumb {
  id: string
  name: string
}

export type ViewMode = 'grid' | 'list'
export type SortField = 'name' | 'modifiedTime' | 'size'

interface DocumentStore {
  files: DriveFile[]
  folders: FolderNode[]
  activeFolderId: string | null
  selectedFileId: string | null
  viewMode: ViewMode
  sortBy: SortField
  searchQuery: string
  breadcrumbs: Breadcrumb[]
  isUploadModalOpen: boolean
  isLoading: boolean
  error: string | null
  nextPageToken: string | null
  
  setFiles: (files: DriveFile[]) => void
  appendFiles: (files: DriveFile[], nextPageToken: string | null) => void
  setFolders: (folders: FolderNode[]) => void
  toggleFolder: (id: string) => void
  setActiveFolderId: (id: string | null) => void
  selectFile: (id: string | null) => void
  setViewMode: (mode: ViewMode) => void
  setSortBy: (field: SortField) => void
  setSearchQuery: (query: string) => void
  setBreadcrumbs: (crumbs: Breadcrumb[]) => void
  openUploadModal: () => void
  closeUploadModal: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useDocumentStore = create<DocumentStore>((set) => ({
  files: [],
  folders: [],
  activeFolderId: null,
  selectedFileId: null,
  viewMode: 'grid',
  sortBy: 'name',
  searchQuery: '',
  breadcrumbs: [],
  isUploadModalOpen: false,
  isLoading: false,
  error: null,
  nextPageToken: null,

  setFiles: (files) => set({ files }),
  appendFiles: (files, nextPageToken) => set((state) => ({ 
    files: [...state.files, ...files], 
    nextPageToken 
  })),
  setFolders: (folders) => set({ folders }),
  toggleFolder: (id) => set((state) => {
    const toggleNode = (nodes: FolderNode[]): FolderNode[] => nodes.map(node => {
      if (node.id === id) return { ...node, isExpanded: !node.isExpanded }
      if (node.children) return { ...node, children: toggleNode(node.children) }
      return node
    })
    return { folders: toggleNode(state.folders) }
  }),
  setActiveFolderId: (id) => set({ activeFolderId: id }),
  selectFile: (id) => set({ selectedFileId: id }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSortBy: (field) => set({ sortBy: field }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setBreadcrumbs: (crumbs) => set({ breadcrumbs: crumbs }),
  openUploadModal: () => set({ isUploadModalOpen: true }),
  closeUploadModal: () => set({ isUploadModalOpen: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error })
}))
