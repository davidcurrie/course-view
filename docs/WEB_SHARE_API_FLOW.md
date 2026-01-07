# Web Share API Flow - Visual Summary

## Current Problem: URL-Only Sharing ❌

```
┌─────────────┐                              ┌─────────────┐
│   Alice     │                              │     Bob     │
│             │                              │             │
│  Event Data │                              │  No Data    │
│  in Browser │                              │  in Browser │
│  IndexedDB  │                              │  IndexedDB  │
└──────┬──────┘                              └──────┬──────┘
       │                                            │
       │ 1. Click "Share"                           │
       ├────────────────────────────────────────────┤
       │                                            │
       │ 2. Copy URL:                               │
       │    course-view.app/map/abc123              │
       │────────────────────────────────────────────▶
       │                                            │
       │                                            │ 3. Open URL
       │                                            ├─────────┐
       │                                            │         │
       │                                            │ ERROR!  │
       │                                            │ Event   │
       │                                            │ Not     │
       │                                            │ Found   │
       │                                            ◀─────────┘
       │                                            │

❌ Problem: URL points to event ID "abc123" but Bob has no data
   for that ID in his local IndexedDB storage.
```

---

## Solution: Web Share API with Files ✅

```
┌─────────────┐                              ┌─────────────┐
│   Alice     │                              │     Bob     │
│             │                              │             │
│  Event Data │                              │  No Data    │
│  in Browser │                              │  in Browser │
│  IndexedDB  │                              │  IndexedDB  │
└──────┬──────┘                              └──────┬──────┘
       │                                            │
       │ 1. Click "Share"                           │
       ├─────────┐                                  │
       │         │                                  │
       │ 2. Package into files:                     │
       │    📄 manifest.json                        │
       │    🗺️  map.jpg                             │
       │    📍 map.jgw                              │
       │    📋 courses.xml                          │
       ◀─────────┘                                  │
       │                                            │
       │ 3. Open native share dialog                │
       │    (iOS: Share sheet)                      │
       │    (Android: Share menu)                   │
       ├─────────┐                                  │
       │         │                                  │
       │ Options:│                                  │
       │  📱 AirDrop                                │
       │  💬 Messages                               │
       │  📧 Email                                  │
       │  💬 WhatsApp                               │
       ◀─────────┘                                  │
       │                                            │
       │ 4. Send via AirDrop                        │
       │    (All 4 files transferred)               │
       │────────────────────────────────────────────▶
       │                                            │
       │                                            │ 5. Receive files
       │                                            ├─────────┐
       │                                            │         │
       │                                            │ Files:  │
       │                                            │ 📄 ✓    │
       │                                            │ 🗺️  ✓    │
       │                                            │ 📍 ✓    │
       │                                            │ 📋 ✓    │
       │                                            ◀─────────┘
       │                                            │
       │                                            │ 6. Import to app
       │                                            ├─────────┐
       │                                            │         │
       │                                            │ Process │
       │                                            │ files → │
       │                                            │ Store   │
       │                                            │ in DB   │
       │                                            ◀─────────┘
       │                                            │
       │                                     ┌──────▼──────┐
       │                                     │  Event Data │
       │                                     │  in Browser │
       │                                     │  IndexedDB  │
       │                                     └─────────────┘

✅ Success: Bob now has the actual event data stored locally
   and can view the map with courses and GPS tracking!
```

---

## Detailed Step-by-Step

### Sender Side (Alice)

**Step 1: Package Event**
```typescript
// Click "Share" button
↓
// eventSharer.packageEventForSharing('abc123')
↓
Read from IndexedDB:
  - Event metadata (name, date, courses)
  - Map image Blob
  - Georeferencing data
  - Control positions
↓
Create 4 files:

  1. manifest.json (metadata)
  {
    "appName": "Course View",
    "eventName": "Spring Classic 2024",
    "eventDate": "2024-06-15",
    "courses": [...],
    "georeferencing": {...}
  }

  2. map.jpg (image data from Blob)
  Binary JPEG data

  3. map.jgw (georeferencing)
  0.0001
  0
  0
  -0.0001
  -0.12
  51.52

  4. courses.xml (reconstructed IOF XML)
  <?xml version="1.0"?>
  <CourseData>
    <Course>
      <Name>Course A</Name>
      <CourseControl>...</CourseControl>
    </Course>
  </CourseData>
```

**Step 2: Share Files**
```typescript
// eventSharer.shareEvent('abc123')
↓
navigator.share({
  title: "Course View Event: Spring Classic 2024",
  text: "Orienteering event - Open in Course View app",
  files: [manifestFile, mapFile, jgwFile, courseFile]
})
↓
Native share dialog appears:

┌────────────────────────────────────┐
│  Share "Spring Classic 2024"       │
├────────────────────────────────────┤
│  📱 AirDrop                        │
│  💬 Messages                       │
│  📧 Mail                           │
│  💬 WhatsApp                       │
│  📂 Save to Files                  │
│  ⋮  More...                        │
└────────────────────────────────────┘
```

### Recipient Side (Bob)

**Step 3: Receive Files**

Via **AirDrop** (iOS):
```
iPhone notification:
"Alice would like to share 4 items"

[Decline] [Accept]
```

Via **Messages**:
```
Message from Alice:
Spring Classic 2024

Attachments:
📄 spring-classic-manifest.json
🗺️  spring-classic-map.jpg
📍 spring-classic-map.jgw
📋 spring-classic-courses.xml

[Download All]
```

**Step 4: Import to Course View**

**Option A (Future): Automatic**
```
Tap manifest.json file
↓
iOS recognizes .json and asks:
"Open with Course View?"
↓
[Open]
↓
Course View automatically imports all associated files
↓
"Successfully imported Spring Classic 2024!"
```

**Option B (Initial): Manual**
```
Open Course View app
↓
Go to "Import Shared Event"
↓
Select all 4 files from Downloads/Files
↓
App validates manifest
↓
App processes:
  - Validates manifest.json is Course View export
  - Reads map.jpg into Blob
  - Parses map.jgw into georef object
  - Parses courses.xml into course objects
  - Stores everything in IndexedDB
↓
"Successfully imported Spring Classic 2024!"
↓
Event appears in Events list
```

---

## Key Advantages

### 1. **Native User Experience**
Users already know how to share photos/documents on their device. This uses the same familiar interface.

### 2. **Works Offline**
Once files are received, they can be imported even without internet connection.

### 3. **Multiple Transfer Methods**
- **AirDrop**: Instant wireless transfer (iOS/Mac)
- **Messages/Email**: Delayed but universal
- **Cloud Storage**: Dropbox, Google Drive, etc.
- **Physical Transfer**: Save to USB, SD card

### 4. **No Backend Required**
Still maintains offline-first architecture. No server sees or stores the data.

### 5. **Full Data Transfer**
Recipient gets everything they need - no manual file coordination.

---

## Browser Support Matrix

| Platform | Browser | Support | Notes |
|----------|---------|---------|-------|
| **iOS 14+** | Safari | ✅ Full | Best experience with AirDrop |
| **iOS** | Chrome | ⚠️ Limited | Uses Safari WebView |
| **Android 8+** | Chrome 89+ | ✅ Full | Excellent sharing options |
| **Android** | Firefox | ❌ None | Fallback to URL sharing |
| **macOS** | Safari 14+ | ⚠️ Partial | Can share to Mail, Messages |
| **macOS** | Chrome | ⚠️ Partial | Limited share targets |
| **Windows** | Any | ⚠️ Limited | Few native share targets |

**Detection:**
```typescript
if (canUseWebShare()) {
  // Show "Share Event (with files)" button
  // Uses Web Share API with actual data transfer
} else {
  // Show "Share URL" button with warning
  // Falls back to current URL-only approach
}
```

---

## File Sizes

Typical event package size:

```
manifest.json:     ~5 KB    (metadata)
map.jpg:       2-15 MB    (varies by map resolution)
map.jgw:          <1 KB    (6 lines of numbers)
courses.xml:    5-50 KB    (varies by course count)
─────────────────────────
Total:        ~2-15 MB    (mostly map image)
```

**Transfer methods and limits:**
- **AirDrop**: No size limit (practical limit ~5 GB)
- **Messages (iMessage)**: ~100 MB per message
- **Email**: Typically 25 MB limit
- **WhatsApp**: 16 MB per file limit (may need compression)

---

## Migration Path

### Phase 1: Implement Core (Week 1)
- Add `eventSharer.ts` service
- Update EventCard with feature detection
- Test on iOS and Android

### Phase 2: Import UI (Week 2)
- Create "Import Shared Event" page
- Validate manifest and files
- Handle errors gracefully

### Phase 3: Polish (Week 3)
- Optimize file sizes (compress images if too large)
- Add progress indicators
- Better error messages
- Documentation for users

### Phase 4: Advanced (Future)
- Automatic file association (tap manifest → open app)
- Selective course sharing
- Event merging capabilities
- ZIP export fallback for unsupported browsers

---

## Comparison to Alternatives

### Alternative 1: Backend Server
```
✅ Pros: Simple URL sharing, instant sync
❌ Cons: Requires server, hosting costs, privacy concerns,
         loses offline-first architecture
```

### Alternative 2: URL-Encoded Data
```
✅ Pros: No files needed, works with URL
❌ Cons: URL length limits (~2 MB), messy URLs,
         poor UX for large events
```

### Alternative 3: Web Share API ← Recommended
```
✅ Pros: Native UX, true data transfer, offline-first,
         no backend, privacy preserved
❌ Cons: Browser support gaps (Firefox), requires import UI
```

---

## User Education

Users will need brief instructions:

**Sender:**
> "Tap Share to send your event to another device. This will share the actual map and course files, not just a link."

**Recipient:**
> "You received 4 files for an orienteering event. Open Course View and go to Import → Shared Event, then select all 4 files."

**Future (with file association):**
> "You received an event. Tap the manifest file to import it into Course View."

---

## Conclusion

The Web Share API provides the best solution for Course View's sharing limitation:

- ✅ Solves the data transfer problem
- ✅ Uses native mobile sharing (familiar to users)
- ✅ Maintains offline-first architecture
- ✅ No backend required (privacy + simplicity)
- ✅ Works with existing file formats
- ⚠️ Requires import UI development
- ⚠️ Browser support gaps need fallbacks

**Recommendation:** Implement with progressive enhancement - use Web Share API where supported, fall back to ZIP download on desktop/Firefox.
