/**
 * Document Writer - Storage Module
 * Handles local storage operations for documents
 */

class DocumentStorage {
  constructor() {
    this.DB_NAME = "DocumentWriterDB";
    this.DB_VERSION = 1;
    this.STORE_NAME = "documents";
    this.db = null;
    this.currentDocId = null;
    this.autoSaveTimer = null;
    this.autoSaveDelay = 2000; // 2 seconds
  }

  /**
   * Initialize IndexedDB
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error("Failed to open IndexedDB:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log("IndexedDB initialized successfully");
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create documents store
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, {
            keyPath: "id",
            autoIncrement: true,
          });

          // Create indexes
          store.createIndex("title", "title", { unique: false });
          store.createIndex("createdAt", "createdAt", { unique: false });
          store.createIndex("updatedAt", "updatedAt", { unique: false });
        }
      };
    });
  }

  /**
   * Create a new document
   */
  async createDocument(data = {}) {
    const doc = {
      title: data.title || "Untitled Document",
      content: data.content || "",
      chapters: data.chapters || [{ id: 1, title: "Chapter 1", content: "" }],
      settings: {
        fontFamily: "Georgia",
        fontSize: 12,
        lineHeight: 1.5,
        ...data.settings,
      },
      template: data.template || "blank",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.STORE_NAME], "readwrite");
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.add(doc);

      request.onsuccess = () => {
        doc.id = request.result;
        this.currentDocId = doc.id;
        console.log("Document created:", doc.id);
        resolve(doc);
      };

      request.onerror = () => {
        console.error("Failed to create document:", request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Save/update current document
   */
  async saveDocument(data) {
    if (!this.currentDocId) {
      return this.createDocument(data);
    }

    const doc = {
      id: this.currentDocId,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.STORE_NAME], "readwrite");
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.put(doc);

      request.onsuccess = () => {
        console.log("Document saved:", doc.id);
        resolve(doc);
      };

      request.onerror = () => {
        console.error("Failed to save document:", request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Load a document by ID
   */
  async loadDocument(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.STORE_NAME], "readonly");
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        if (request.result) {
          this.currentDocId = id;
          console.log("Document loaded:", id);
          resolve(request.result);
        } else {
          reject(new Error("Document not found"));
        }
      };

      request.onerror = () => {
        console.error("Failed to load document:", request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get all documents
   */
  async getAllDocuments() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.STORE_NAME], "readonly");
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        // Sort by updatedAt descending
        const docs = request.result.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
        );
        resolve(docs);
      };

      request.onerror = () => {
        console.error("Failed to get documents:", request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Delete a document
   */
  async deleteDocument(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.STORE_NAME], "readwrite");
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        if (this.currentDocId === id) {
          this.currentDocId = null;
        }
        console.log("Document deleted:", id);
        resolve();
      };

      request.onerror = () => {
        console.error("Failed to delete document:", request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Schedule auto-save
   */
  scheduleAutoSave(callback) {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }

    this.autoSaveTimer = setTimeout(() => {
      callback();
    }, this.autoSaveDelay);
  }

  /**
   * Export document as JSON
   */
  exportAsJSON(doc) {
    const blob = new Blob([JSON.stringify(doc, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.title || "document"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Import document from JSON file
   */
  async importFromJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          const doc = await this.createDocument(data);
          resolve(doc);
        } catch (error) {
          reject(new Error("Invalid JSON file"));
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }

  /**
   * Clear current document
   */
  newDocument() {
    this.currentDocId = null;
  }

  /**
   * Get current document ID
   */
  getCurrentDocId() {
    return this.currentDocId;
  }
}

// Export singleton instance
window.documentStorage = new DocumentStorage();
