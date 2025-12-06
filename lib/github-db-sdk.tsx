// Bismillah Ar-Rahman Ar-Roheem
// Standardized GitHub DB SDK with Queue System, Schema Evolution, and Nodemailer

interface CloudinaryConfig {
  uploadPreset?: string
  cloudName?: string
  apiKey?: string
  apiSecret?: string
}

interface NodemailerConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
  from: string
}

interface AuthConfig {
  requireEmailVerification?: boolean
  otpTriggers?: string[]
}

interface SchemaDefinition {
  required?: string[]
  types?: Record<string, string>
  defaults?: Record<string, any>
  indexes?: string[]
}

interface UniversalSDKConfig {
  owner: string
  repo: string
  token: string
  branch?: string
  basePath?: string
  mediaPath?: string
  cloudinary?: CloudinaryConfig
  nodemailer?: NodemailerConfig
  templates?: Record<string, string>
  schemas?: Record<string, SchemaDefinition>
  auth?: AuthConfig
}

interface User {
  id?: string
  uid?: string
  email: string
  password?: string
  verified?: boolean
  roles?: string[]
  permissions?: string[]
  name?: string
  avatar?: string
  createdAt?: string
  updatedAt?: string
  [key: string]: any
}

interface Session {
  token: string
  user: User
  created: number
  expiresAt: number
}

interface OTPRecord {
  otp: string
  created: number
  reason: string
  expiresAt: number
}

interface AuditLogEntry {
  action: string
  collection: string
  data: any
  timestamp: number
  userId?: string
}

interface QueryBuilder<T = any> {
  where(fn: (item: T) => boolean): QueryBuilder<T>
  sort(field: string, dir?: "asc" | "desc"): QueryBuilder<T>
  limit(count: number): QueryBuilder<T>
  offset(start: number): QueryBuilder<T>
  project(fields: string[]): QueryBuilder<Partial<T>>
  exec(): Promise<T[]>
  count(): Promise<number>
  first(): Promise<T | null>
}

interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  url: string
  format: string
  width: number
  height: number
  bytes: number
  [key: string]: any
}

interface QueuedWrite {
  collection: string
  data: any[]
  resolve: (value: any) => void
  reject: (reason?: any) => void
  retries: number
  timestamp: number
}

// Blog-specific interfaces
interface BlogPost {
  id?: string
  uid?: string
  title: string
  slug: string
  content: string
  excerpt?: string
  contentType: "richtext" | "markdown"
  status: "draft" | "published" | "scheduled" | "archived"
  categories: string[]
  tags: string[]
  seriesId?: string
  seriesOrder?: number
  authorId: string
  authorName?: string
  publishedAt?: string
  scheduledAt?: string
  createdAt: string
  updatedAt: string
  views: number
  likes: number
  readingTime?: number
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string[]
  canonicalUrl?: string
  schemaMarkup?: object
  allowComments: boolean
  isPinned: boolean
}

interface Category {
  id?: string
  uid?: string
  name: string
  slug: string
  description?: string
  parentId?: string
  order: number
  postCount: number
  createdAt: string
  updatedAt: string
}

interface Tag {
  id?: string
  uid?: string
  name: string
  slug: string
  postCount: number
  createdAt: string
}

interface Series {
  id?: string
  uid?: string
  title: string
  slug: string
  description?: string
  status: "active" | "completed" | "draft"
  postCount: number
  createdAt: string
  updatedAt: string
}

interface Comment {
  id?: string
  uid?: string
  postId: string
  parentId?: string
  authorName: string
  authorEmail: string
  content: string
  status: "pending" | "approved" | "rejected" | "spam"
  likes: number
  createdAt: string
  updatedAt: string
  ipAddress?: string
  userAgent?: string
}

interface Reaction {
  id?: string
  uid?: string
  postId: string
  type: "like" | "love" | "insightful" | "beneficial"
  visitorId: string
  createdAt: string
}

interface Bookmark {
  id?: string
  uid?: string
  postId: string
  visitorId: string
  createdAt: string
}

interface Poll {
  id?: string
  uid?: string
  postId: string
  question: string
  options: { text: string; votes: number }[]
  allowMultiple: boolean
  endsAt?: string
  createdAt: string
}

interface PollVote {
  id?: string
  uid?: string
  pollId: string
  optionIndex: number
  visitorId: string
  createdAt: string
}

interface Newsletter {
  id?: string
  uid?: string
  email: string
  name?: string
  status: "active" | "unsubscribed"
  subscribedAt: string
  unsubscribedAt?: string
}

interface Analytics {
  id?: string
  uid?: string
  postId: string
  event: "view" | "share" | "read_complete"
  visitorId: string
  source?: string
  medium?: string
  userAgent?: string
  createdAt: string
}

interface SiteSettings {
  id?: string
  uid?: string
  siteName: string
  siteDescription: string
  siteUrl: string
  logoUrl?: string
  faviconUrl?: string
  socialLinks: Record<string, string>
  analyticsId?: string
  enableComments: boolean
  enableNewsletter: boolean
  postsPerPage: number
  updatedAt: string
}

class UniversalSDK {
  private owner: string
  private repo: string
  private token: string
  private branch: string
  private basePath: string
  private mediaPath: string
  private cloudinary: CloudinaryConfig
  private nodemailerConfig: NodemailerConfig | null
  private templates: Record<string, string>
  private schemas: Record<string, SchemaDefinition>
  private authConfig: AuthConfig
  private sessionStore: Map<string, Session> = new Map()
  private otpMemory: Map<string, OTPRecord> = new Map()
  private auditLog: AuditLogEntry[] = []
  private cache: Map<string, { data: any[]; etag?: string; sha?: string; timestamp: number }> = new Map()
  private subscribers: Map<string, Set<Function>> = new Map()
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map()
  private writeQueue: QueuedWrite[] = []
  private isProcessingQueue = false
  private initialized = false
  private readonly CACHE_TTL = 30000 // 30 seconds
  private readonly MAX_RETRIES = 5
  private readonly QUEUE_DELAY = 300

  constructor(config: UniversalSDKConfig) {
    this.owner = config.owner
    this.repo = config.repo
    this.token = config.token
    this.branch = config.branch || "main"
    this.basePath = config.basePath || "db"
    this.mediaPath = config.mediaPath || "media"
    this.cloudinary = config.cloudinary || {}
    this.nodemailerConfig = config.nodemailer || null
    this.templates = config.templates || {}
    this.authConfig = config.auth || { requireEmailVerification: false, otpTriggers: [] }

    // Define blog schemas
    this.schemas = {
      posts: {
        required: ["title", "slug", "content", "contentType", "status", "authorId"],
        types: {
          title: "string",
          slug: "string",
          content: "string",
          excerpt: "string",
          contentType: "string",
          status: "string",
          categories: "array",
          tags: "array",
          seriesId: "string",
          seriesOrder: "number",
          authorId: "string",
          authorName: "string",
          publishedAt: "string",
          scheduledAt: "string",
          createdAt: "string",
          updatedAt: "string",
          views: "number",
          likes: "number",
          readingTime: "number",
          metaTitle: "string",
          metaDescription: "string",
          metaKeywords: "array",
          canonicalUrl: "string",
          schemaMarkup: "object",
          allowComments: "boolean",
          isPinned: "boolean",
        },
        defaults: {
          categories: [],
          tags: [],
          views: 0,
          likes: 0,
          allowComments: true,
          isPinned: false,
          status: "draft",
          contentType: "richtext",
        },
      },
      categories: {
        required: ["name", "slug"],
        types: {
          name: "string",
          slug: "string",
          description: "string",
          parentId: "string",
          order: "number",
          postCount: "number",
          createdAt: "string",
          updatedAt: "string",
        },
        defaults: {
          order: 0,
          postCount: 0,
        },
      },
      tags: {
        required: ["name", "slug"],
        types: {
          name: "string",
          slug: "string",
          postCount: "number",
          createdAt: "string",
        },
        defaults: {
          postCount: 0,
        },
      },
      series: {
        required: ["title", "slug"],
        types: {
          title: "string",
          slug: "string",
          description: "string",
          status: "string",
          postCount: "number",
          createdAt: "string",
          updatedAt: "string",
        },
        defaults: {
          status: "active",
          postCount: 0,
        },
      },
      comments: {
        required: ["postId", "authorName", "authorEmail", "content"],
        types: {
          postId: "string",
          parentId: "string",
          authorName: "string",
          authorEmail: "string",
          content: "string",
          status: "string",
          likes: "number",
          createdAt: "string",
          updatedAt: "string",
          ipAddress: "string",
          userAgent: "string",
        },
        defaults: {
          status: "pending",
          likes: 0,
        },
      },
      reactions: {
        required: ["postId", "type", "visitorId"],
        types: {
          postId: "string",
          type: "string",
          visitorId: "string",
          createdAt: "string",
        },
      },
      bookmarks: {
        required: ["postId", "visitorId"],
        types: {
          postId: "string",
          visitorId: "string",
          createdAt: "string",
        },
      },
      polls: {
        required: ["postId", "question", "options"],
        types: {
          postId: "string",
          question: "string",
          options: "array",
          allowMultiple: "boolean",
          endsAt: "string",
          createdAt: "string",
        },
        defaults: {
          allowMultiple: false,
        },
      },
      pollVotes: {
        required: ["pollId", "optionIndex", "visitorId"],
        types: {
          pollId: "string",
          optionIndex: "number",
          visitorId: "string",
          createdAt: "string",
        },
      },
      newsletter: {
        required: ["email"],
        types: {
          email: "string",
          name: "string",
          status: "string",
          subscribedAt: "string",
          unsubscribedAt: "string",
        },
        defaults: {
          status: "active",
        },
      },
      analytics: {
        required: ["postId", "event", "visitorId"],
        types: {
          postId: "string",
          event: "string",
          visitorId: "string",
          source: "string",
          medium: "string",
          userAgent: "string",
          createdAt: "string",
        },
      },
      settings: {
        required: ["siteName"],
        types: {
          siteName: "string",
          siteDescription: "string",
          siteUrl: "string",
          logoUrl: "string",
          faviconUrl: "string",
          socialLinks: "object",
          analyticsId: "string",
          enableComments: "boolean",
          enableNewsletter: "boolean",
          postsPerPage: "number",
          updatedAt: "string",
        },
        defaults: {
          enableComments: true,
          enableNewsletter: true,
          postsPerPage: 10,
          socialLinks: {},
        },
      },
      users: {
        required: ["email"],
        types: {
          email: "string",
          password: "string",
          name: "string",
          avatar: "string",
          verified: "boolean",
          roles: "array",
          permissions: "array",
          createdAt: "string",
          updatedAt: "string",
        },
        defaults: {
          verified: false,
          roles: ["subscriber"],
          permissions: [],
        },
      },
      ...config.schemas,
    }
  }

  private headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github.v3+json",
    }
  }

  private async request(path: string, method = "GET", body: any = null, etag?: string): Promise<any> {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`
    const headers: Record<string, string> = this.headers()

    if (etag && method === "GET") {
      headers["If-None-Match"] = etag
    }

    const options: RequestInit = {
      method,
      headers,
      cache: "no-store",
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const res = await fetch(url, options)

    if (res.status === 304) {
      return { notModified: true }
    }

    if (res.status === 404) {
      throw new Error("Not Found")
    }

    if (res.status === 409) {
      throw new Error("409 Conflict - SHA mismatch")
    }

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`GitHub API Error ${res.status}: ${errorText}`)
    }

    const json = await res.json()
    return { ...json, etag: res.headers.get("ETag") }
  }

  // Schema Evolution System
  async ensureCollectionExists(collection: string): Promise<boolean> {
    try {
      await this.request(`${this.basePath}/${collection}.json`)
      return true
    } catch (e) {
      if ((e as Error).message.includes("Not Found")) {
        // Create empty collection
        await this.request(`${this.basePath}/${collection}.json`, "PUT", {
          message: `Initialize ${collection} collection`,
          content: btoa(JSON.stringify([])),
          branch: this.branch,
        })
        return true
      }
      throw e
    }
  }

  async initializeSchemas(): Promise<void> {
    const collections = Object.keys(this.schemas)

    for (const collection of collections) {
      await this.ensureCollectionExists(collection)
    }

    this.initialized = true
  }

  async migrateSchema(collection: string, migrationFn: (data: any[]) => any[]): Promise<void> {
    const data = await this.get(collection, true)
    const migratedData = migrationFn(data)
    await this.save(collection, migratedData)
  }

  // Core CRUD Operations with Queue System
  async get<T = any>(collection: string, force = false): Promise<T[]> {
    // Ensure collection exists
    if (!this.initialized) {
      await this.ensureCollectionExists(collection)
    }

    const cacheEntry = this.cache.get(collection)
    const now = Date.now()

    if (cacheEntry && !force && now - cacheEntry.timestamp < this.CACHE_TTL) {
      return cacheEntry.data
    }

    try {
      const res = await this.request(`${this.basePath}/${collection}.json`, "GET", null, cacheEntry?.etag)

      if (res.notModified && cacheEntry) {
        cacheEntry.timestamp = now
        return cacheEntry.data
      }

      const data = JSON.parse(atob(res.content))
      this.cache.set(collection, { data, etag: res.etag, sha: res.sha, timestamp: now })
      this.notifySubscribers(collection, data)
      return data
    } catch (e) {
      if ((e as Error).message.includes("Not Found")) {
        await this.ensureCollectionExists(collection)
        this.cache.set(collection, { data: [], etag: undefined, sha: undefined, timestamp: now })
        return []
      }
      throw e
    }
  }

  private notifySubscribers(collection: string, data: any[]): void {
    const subs = this.subscribers.get(collection)
    if (subs) {
      subs.forEach((cb) => {
        try {
          cb(data)
        } catch (e) {
          console.error("Subscriber callback error:", e)
        }
      })
    }
  }

  subscribe<T = any>(collection: string, callback: (data: T[]) => void): () => void {
    if (!this.subscribers.has(collection)) {
      this.subscribers.set(collection, new Set())
    }
    this.subscribers.get(collection)!.add(callback)

    if (!this.pollingIntervals.has(collection)) {
      this.pollCollection(collection)
      const intervalId = setInterval(() => this.pollCollection(collection), 5000)
      this.pollingIntervals.set(collection, intervalId)
    }

    // Immediately provide current data
    const cached = this.cache.get(collection)
    if (cached) {
      callback(cached.data)
    } else {
      this.get(collection).then((data) => callback(data))
    }

    return () => this.unsubscribe(collection, callback)
  }

  unsubscribe(collection: string, callback: Function): void {
    const subs = this.subscribers.get(collection)
    if (subs) {
      subs.delete(callback)
      if (subs.size === 0) {
        const interval = this.pollingIntervals.get(collection)
        if (interval) {
          clearInterval(interval)
          this.pollingIntervals.delete(collection)
        }
      }
    }
  }

  private async pollCollection(collection: string): Promise<void> {
    try {
      await this.get(collection, true)
    } catch (error) {
      console.error(`Polling failed for ${collection}:`, error)
    }
  }

  // Queue-based write system to prevent SHA conflicts
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.writeQueue.length === 0) {
      return
    }

    this.isProcessingQueue = true
    const write = this.writeQueue[0]

    try {
      const { collection, data, resolve } = write

      // Always fetch latest SHA before writing
      let currentSha: string | undefined
      try {
        const file = await this.request(`${this.basePath}/${collection}.json`)
        currentSha = file.sha
      } catch (e) {
        if (!(e as Error).message.includes("Not Found")) {
          throw e
        }
      }

      const payload: any = {
        message: `Update ${collection} - ${new Date().toISOString()}`,
        content: btoa(JSON.stringify(data, null, 2)),
        branch: this.branch,
      }

      if (currentSha) {
        payload.sha = currentSha
      }

      await this.request(`${this.basePath}/${collection}.json`, "PUT", payload)

      this.writeQueue.shift()
      this.cache.set(collection, {
        data,
        sha: undefined,
        etag: undefined,
        timestamp: Date.now(),
      })
      this.notifySubscribers(collection, data)
      resolve(data)
    } catch (error: any) {
      if (error.message.includes("409") && write.retries < this.MAX_RETRIES) {
        write.retries++
        // Re-fetch data and retry
        await this.get(write.collection, true)
      } else {
        write.reject(error)
        this.writeQueue.shift()
      }
    } finally {
      this.isProcessingQueue = false
      if (this.writeQueue.length > 0) {
        setTimeout(() => this.processQueue(), this.QUEUE_DELAY)
      }
    }
  }

  private save<T = any>(collection: string, data: T[]): Promise<T[]> {
    return new Promise((resolve, reject) => {
      // Optimistic update
      const cached = this.cache.get(collection)
      this.cache.set(collection, {
        ...cached,
        data,
        timestamp: Date.now(),
      })
      this.notifySubscribers(collection, data)

      this.writeQueue.push({
        collection,
        data,
        resolve,
        reject,
        retries: 0,
        timestamp: Date.now(),
      })

      if (!this.isProcessingQueue) {
        this.processQueue()
      }
    })
  }

  async insert<T = any>(collection: string, item: Partial<T>): Promise<T & { id: string; uid: string }> {
    const arr = await this.get<T>(collection)
    const schema = this.schemas[collection]

    if (schema?.defaults) {
      item = { ...schema.defaults, ...item }
    }

    this.validateSchema(collection, item)

    const id = (Math.max(0, ...arr.map((x: any) => Number.parseInt(x.id) || 0)) + 1).toString()
    const uid = crypto.randomUUID()
    const now = new Date().toISOString()

    const newItem = {
      uid,
      id,
      createdAt: now,
      updatedAt: now,
      ...item,
    } as T & { id: string; uid: string }

    arr.push(newItem)
    await this.save(collection, arr)
    this.addAuditLog("insert", collection, newItem)

    return newItem
  }

  async bulkInsert<T = any>(collection: string, items: Partial<T>[]): Promise<(T & { id: string; uid: string })[]> {
    const arr = await this.get<T>(collection)
    const schema = this.schemas[collection]
    const base = Math.max(0, ...arr.map((x: any) => Number.parseInt(x.id) || 0))
    const now = new Date().toISOString()

    const newItems = items.map((item, i) => {
      if (schema?.defaults) {
        item = { ...schema.defaults, ...item }
      }
      this.validateSchema(collection, item)
      return {
        uid: crypto.randomUUID(),
        id: (base + i + 1).toString(),
        createdAt: now,
        updatedAt: now,
        ...item,
      } as T & { id: string; uid: string }
    })

    const result = [...arr, ...newItems]
    await this.save(collection, result)
    newItems.forEach((n) => this.addAuditLog("insert", collection, n))

    return newItems
  }

  async update<T = any>(collection: string, key: string, updates: Partial<T>): Promise<T> {
    const arr = await this.get<T>(collection, true)
    const itemIndex = arr.findIndex((x: any) => x.id === key || x.uid === key)

    if (itemIndex === -1) {
      throw new Error(`Item with key "${key}" not found in collection "${collection}".`)
    }

    const updatedItem = {
      ...arr[itemIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    this.validateSchema(collection, updatedItem)
    arr[itemIndex] = updatedItem

    await this.save(collection, arr)
    this.addAuditLog("update", collection, updatedItem)

    return updatedItem
  }

  async bulkUpdate<T = any>(collection: string, updates: (Partial<T> & { id?: string; uid?: string })[]): Promise<T[]> {
    const arr = await this.get<T>(collection)
    const now = new Date().toISOString()

    const updatedItems = updates.map((u) => {
      const i = arr.findIndex((x: any) => x.id === u.id || x.uid === u.uid)
      if (i < 0) throw new Error(`Item not found: ${u.id || u.uid}`)

      const upd = { ...arr[i], ...u, updatedAt: now }
      this.validateSchema(collection, upd)
      arr[i] = upd
      return upd
    })

    await this.save(collection, arr)
    updatedItems.forEach((u) => this.addAuditLog("update", collection, u))

    return updatedItems
  }

  async delete<T = any>(collection: string, key: string): Promise<void> {
    const arr = await this.get<T>(collection)
    const deleted = arr.filter((x: any) => x.id === key || x.uid === key)
    const filtered = arr.filter((x: any) => x.id !== key && x.uid !== key)

    await this.save(collection, filtered)
    deleted.forEach((d) => this.addAuditLog("delete", collection, d))
  }

  async bulkDelete<T = any>(collection: string, keys: string[]): Promise<T[]> {
    const arr = await this.get<T>(collection)
    const deleted = arr.filter((x: any) => keys.includes(x.id) || keys.includes(x.uid))
    const filtered = arr.filter((x: any) => !keys.includes(x.id) && !keys.includes(x.uid))

    await this.save(collection, filtered)
    deleted.forEach((d) => this.addAuditLog("delete", collection, d))

    return deleted
  }

  // Query Builder
  query<T = any>(collection: string): QueryBuilder<T> {
    const filters: ((item: T) => boolean)[] = []
    let sortField: string | null = null
    let sortDir: "asc" | "desc" = "asc"
    let limitCount: number | null = null
    let offsetStart = 0
    let projectFields: string[] | null = null

    const builder: QueryBuilder<T> = {
      where: (fn) => {
        filters.push(fn)
        return builder
      },
      sort: (field, dir = "asc") => {
        sortField = field
        sortDir = dir
        return builder
      },
      limit: (count) => {
        limitCount = count
        return builder
      },
      offset: (start) => {
        offsetStart = start
        return builder
      },
      project: (fields) => {
        projectFields = fields
        return builder as any
      },
      exec: async () => {
        let data = await this.get<T>(collection)

        // Apply filters
        filters.forEach((fn) => {
          data = data.filter(fn)
        })

        // Apply sorting
        if (sortField) {
          data.sort((a: any, b: any) => {
            const aVal = a[sortField!]
            const bVal = b[sortField!]
            if (aVal < bVal) return sortDir === "asc" ? -1 : 1
            if (aVal > bVal) return sortDir === "asc" ? 1 : -1
            return 0
          })
        }

        // Apply offset and limit
        if (offsetStart > 0) {
          data = data.slice(offsetStart)
        }
        if (limitCount !== null) {
          data = data.slice(0, limitCount)
        }

        // Apply projection
        if (projectFields) {
          data = data.map((item: any) => {
            const projected: any = {}
            projectFields!.forEach((f) => {
              if (f in item) projected[f] = item[f]
            })
            return projected
          })
        }

        return data
      },
      count: async () => {
        let data = await this.get<T>(collection)
        filters.forEach((fn) => {
          data = data.filter(fn)
        })
        return data.length
      },
      first: async () => {
        const result = await builder.limit(1).exec()
        return result[0] || null
      },
    }

    return builder
  }

  // Find helpers
  async findById<T = any>(collection: string, id: string): Promise<T | null> {
    const data = await this.get<T>(collection)
    return data.find((x: any) => x.id === id || x.uid === id) || null
  }

  async findOne<T = any>(collection: string, predicate: (item: T) => boolean): Promise<T | null> {
    const data = await this.get<T>(collection)
    return data.find(predicate) || null
  }

  async findMany<T = any>(collection: string, predicate: (item: T) => boolean): Promise<T[]> {
    const data = await this.get<T>(collection)
    return data.filter(predicate)
  }

  // Schema Validation
  private validateSchema(collection: string, item: any): void {
    const schema = this.schemas[collection]
    if (!schema) return // Check required fields
    ;(schema.required || []).forEach((r) => {
      if (!(r in item) || item[r] === undefined || item[r] === null) {
        throw new Error(`Missing required field: ${r} in collection ${collection}`)
      }
    })

    // Check types
    Object.entries(item).forEach(([k, v]) => {
      if (v === undefined || v === null) return

      const t = schema.types?.[k]
      if (t) {
        const ok =
          (t === "string" && typeof v === "string") ||
          (t === "number" && typeof v === "number") ||
          (t === "boolean" && typeof v === "boolean") ||
          (t === "object" && typeof v === "object" && !Array.isArray(v)) ||
          (t === "array" && Array.isArray(v)) ||
          (t === "date" && (v instanceof Date || !isNaN(Date.parse(v as string)))) ||
          (t === "uuid" && typeof v === "string")

        if (!ok) {
          throw new Error(`Field ${k} should be ${t}, got ${typeof v}`)
        }
      }
    })
  }

  setSchema(collection: string, schema: SchemaDefinition): void {
    this.schemas[collection] = schema
  }

  getSchema(collection: string): SchemaDefinition | null {
    return this.schemas[collection] || null
  }

  // Audit Logging
  private addAuditLog(action: string, collection: string, data: any): void {
    this.auditLog.push({
      action,
      collection,
      data: { id: data.id, uid: data.uid },
      timestamp: Date.now(),
    })

    // Keep only last 1000 entries
    if (this.auditLog.length > 1000) {
      this.auditLog = this.auditLog.slice(-1000)
    }
  }

  getAuditLog(): AuditLogEntry[] {
    return [...this.auditLog]
  }

  // Email with Nodemailer (Server-side only)
  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    if (!this.nodemailerConfig) {
      throw new Error("Nodemailer not configured")
    }

    // This will be called from server action/API route
    const response = await fetch("/api/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to,
        subject,
        html,
        from: this.nodemailerConfig.from,
      }),
    })

    if (!response.ok) {
      throw new Error("Email send failed")
    }

    return true
  }

  async sendOTP(email: string, reason = "verify"): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes

    this.otpMemory.set(email, { otp, created: Date.now(), reason, expiresAt })

    const tpl =
      this.templates.otp?.replace("{{otp}}", otp) ||
      `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Your Verification Code</h2>
        <p>Your OTP for ${reason} is:</p>
        <h1 style="color: #05B34D; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        <p>This code expires in 10 minutes.</p>
      </div>`

    await this.sendEmail(email, `OTP for ${reason}`, tpl)
    return otp
  }

  verifyOTP(email: string, otp: string): boolean {
    const rec = this.otpMemory.get(email)
    if (!rec || rec.otp !== otp) {
      throw new Error("Invalid OTP")
    }
    if (Date.now() > rec.expiresAt) {
      this.otpMemory.delete(email)
      throw new Error("OTP expired")
    }
    this.otpMemory.delete(email)
    return true
  }

  // Password Hashing (using Web Crypto)
  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hash = await crypto.subtle.digest("SHA-256", data)
    return btoa(String.fromCharCode(...new Uint8Array(hash)))
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    const inputHash = await this.hashPassword(password)
    return inputHash === hash
  }

  // Auth Methods
  async register(email: string, password: string, profile: Partial<User> = {}): Promise<User> {
    if (!this.validateEmailFormat(email)) {
      throw new Error("Invalid email format")
    }

    const users = await this.get<User>("users")
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Email already registered")
    }

    const hashedPassword = await this.hashPassword(password)
    const user = await this.insert<User>("users", {
      email: email.toLowerCase(),
      password: hashedPassword,
      verified: !this.authConfig.requireEmailVerification,
      ...profile,
    })

    if (this.authConfig.otpTriggers?.includes("register")) {
      await this.sendOTP(email, "registration")
    }

    return user
  }

  async login(email: string, password: string): Promise<string | { otpRequired: boolean }> {
    const users = await this.get<User>("users")
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

    if (!user) {
      throw new Error("Invalid credentials")
    }

    const passwordValid = await this.verifyPassword(password, user.password!)
    if (!passwordValid) {
      throw new Error("Invalid credentials")
    }

    if (this.authConfig.otpTriggers?.includes("login")) {
      await this.sendOTP(email, "login")
      return { otpRequired: true }
    }

    return this.createSession(user)
  }

  async verifyLoginOTP(email: string, otp: string): Promise<string> {
    this.verifyOTP(email, otp)
    const users = await this.get<User>("users")
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

    if (!user) {
      throw new Error("User not found")
    }

    return this.createSession(user)
  }

  private createSession(user: User): string {
    const token = crypto.randomUUID()
    const session: Session = {
      token,
      user: { ...user, password: undefined },
      created: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    }

    this.sessionStore.set(token, session)
    return token
  }

  validateSession(token: string): User | null {
    const session = this.sessionStore.get(token)
    if (!session) return null

    if (Date.now() > session.expiresAt) {
      this.sessionStore.delete(token)
      return null
    }

    return session.user
  }

  logout(token: string): void {
    this.sessionStore.delete(token)
  }

  async requestPasswordReset(email: string): Promise<void> {
    const users = await this.get<User>("users")
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

    if (!user) {
      // Don't reveal if email exists
      return
    }

    await this.sendOTP(email, "password-reset")
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<boolean> {
    this.verifyOTP(email, otp)

    const users = await this.get<User>("users")
    const userIndex = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase())

    if (userIndex === -1) {
      throw new Error("User not found")
    }

    users[userIndex].password = await this.hashPassword(newPassword)
    users[userIndex].updatedAt = new Date().toISOString()

    await this.save("users", users)
    return true
  }

  validateEmailFormat(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Cloudinary Integration
  async uploadToCloudinary(file: File, folder = ""): Promise<CloudinaryUploadResult> {
    if (!this.cloudinary.uploadPreset || !this.cloudinary.cloudName) {
      throw new Error("Cloudinary configuration is incomplete")
    }

    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", this.cloudinary.uploadPreset)
    if (folder) formData.append("folder", folder)

    const res = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudinary.cloudName}/upload`, {
      method: "POST",
      body: formData,
    })

    const json = await res.json()
    if (!res.ok) {
      throw new Error(json.error?.message || "Upload failed")
    }

    return json
  }

  getMediaUrl(publicId: string, options = ""): string {
    if (!this.cloudinary.cloudName) {
      throw new Error("Cloudinary cloudName not set")
    }
    return `https://res.cloudinary.com/${this.cloudinary.cloudName}/image/upload/${options}/${publicId}`
  }

  // Utility Methods
  generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  calculateReadingTime(content: string): number {
    const wordsPerMinute = 200
    const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).length
    return Math.ceil(wordCount / wordsPerMinute)
  }

  async init(): Promise<UniversalSDK> {
    await this.initializeSchemas()
    return this
  }

  isReady(): boolean {
    return !!(this.owner && this.repo && this.token && this.initialized)
  }

  async waitForReady(maxWait = 10000): Promise<boolean> {
    const start = Date.now()
    while (!this.isReady()) {
      if (Date.now() - start > maxWait) {
        throw new Error("SDK not ready")
      }
      await new Promise((res) => setTimeout(res, 100))
    }
    return true
  }

  reset(): void {
    this.sessionStore.clear()
    this.otpMemory.clear()
    this.auditLog = []
    this.cache.clear()
  }
}

export default UniversalSDK
export type {
  UniversalSDKConfig,
  CloudinaryConfig,
  NodemailerConfig,
  AuthConfig,
  SchemaDefinition,
  User,
  Session,
  QueryBuilder,
  CloudinaryUploadResult,
  BlogPost,
  Category,
  Tag,
  Series,
  Comment,
  Reaction,
  Bookmark,
  Poll,
  PollVote,
  Newsletter,
  Analytics,
  SiteSettings,
}
