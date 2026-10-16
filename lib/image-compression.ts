// Browser-native image compression for storage uploads.
//
// Photos coming off a phone are several megabytes and the storage buckets carry no
// size limit, so uploads are shrunk here before they leave the browser. No dependency
// and no `"use client"` directive: the browser APIs only run inside the function body,
// so a server component that transitively imports a service using this module is safe.

export interface CompressImageOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

/**
 * Only these are worth re-encoding. Everything else is passed through untouched:
 * an SVG logo must stay vector (rasterizing it to a fixed pixel width destroys the
 * scaling that matters for the sidebar and the printed receipt), an animated GIF would
 * collapse to its first frame, and a PDF cannot be drawn to a canvas at all.
 */
const COMPRESSIBLE_TYPES = ["image/jpeg", "image/png", "image/webp"]

const EXT_BY_TYPE: Record<string, string> = {
  "image/webp": ".webp",
  "image/png": ".png",
  "image/jpeg": ".jpg",
}

/**
 * Scale an image down and re-encode it as WebP.
 *
 * This function NEVER rejects and always settles: the callers
 * (`expenseService.uploadReceiptProof`, `schoolSettingsService.uploadLogo`) `await` it
 * without a try/catch and have no fallback, so surfacing an error here would fail the
 * whole upload instead of quietly storing the original. Every failure path resolves
 * with the original file.
 */
export async function compressImage(
  file: File,
  options: CompressImageOptions = {}
): Promise<File> {
  if (!COMPRESSIBLE_TYPES.includes(file.type)) return file

  const { maxWidth = 1200, maxHeight = 1200, quality = 0.75 } = options

  return new Promise<File>((resolve) => {
    // The setup itself is guarded too: a throw in a Promise executor REJECTS the promise, and
    // URL.createObjectURL can throw for a detached File or where there is no blob URL store.
    // The callers await this with no fallback, so a rejection here would fail the entire
    // upload rather than storing the original.
    let objectUrl: string | null = null
    try {
      objectUrl = URL.createObjectURL(file)
      const img = new Image()

      img.onload = () => {
        try {
          // A source with no intrinsic size (an SVG lacking width/height/viewBox, or a
          // truncated file) would give a 0x0 canvas and a null blob.
          if (!img.naturalWidth || !img.naturalHeight) return resolve(file)

          let width = img.naturalWidth
          let height = img.naturalHeight

          // Scale down preserving aspect ratio. Never scales up.
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width)
              width = maxWidth
            } else {
              width = Math.round((width * maxHeight) / height)
              height = maxHeight
            }
          }

          const canvas = document.createElement("canvas")
          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext("2d")
          // Without this guard a null context silently draws nothing and the promise
          // would hang forever, leaving the submit button spinning.
          if (!ctx) return resolve(file)

          ctx.drawImage(img, 0, 0, width, height)

          // toBlob throws synchronously on a tainted canvas, which is why this whole body
          // is wrapped.
          canvas.toBlob(
            (blob) => {
              if (!blob) return resolve(file)

              // Canvas silently falls back to PNG where WebP encoding is unsupported, so
              // the extension and MIME are derived from what was actually produced rather
              // than assumed. Supabase sets the stored Content-Type from this blob's type,
              // and both callers build the object path from the file name's extension.
              const mime = EXT_BY_TYPE[blob.type] ? blob.type : "image/png"
              const ext = EXT_BY_TYPE[mime]
              // Also handles an extensionless name, where the replace is a no-op.
              const name = file.name.replace(/\.[^./\\]+$/, "") + ext

              resolve(new File([blob], name, { type: mime, lastModified: Date.now() }))
            },
            "image/webp",
            quality
          )
        } catch (error) {
          console.error("Image compression failed, uploading the original:", error)
          resolve(file)
        } finally {
          // Revoked once the draw and encode are under way; revoking earlier aborts the decode.
          if (objectUrl) URL.revokeObjectURL(objectUrl)
        }
      }

      img.onerror = () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl)
        resolve(file)
      }

      img.src = objectUrl
    } catch (error) {
      console.error("Image compression could not start, uploading the original:", error)
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      resolve(file)
    }
  })
}
