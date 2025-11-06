"use client"

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { UploadCloud } from "lucide-react"

import { cn } from "@/lib/utils"
import { THEMES, useModeStore } from "../lib/mode"

type ImageUploadDialogProps = {
  onFileSelected?: (file: File) => void
}

const ACCEPTED_FILE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/heic", "image/heif"]
const MAX_FILE_SIZE = 8 * 1024 * 1024 // 8 MB

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function ImageUploadDialog({ onFileSelected }: ImageUploadDialogProps) {
  const [open, setOpen] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { mode } = useModeStore()
  const theme = THEMES[mode]

  const acceptAttribute = useMemo(() => ACCEPTED_FILE_TYPES.join(","), [])

  const resetState = useCallback(() => {
    setSelectedFile(null)
    setError(null)
    setDragActive(false)
  }, [])

  const handleFile = useCallback(
    (file?: File | null) => {
      if (!file) return
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        setError("Bitte wählen Sie eine Bilddatei (PNG, JPG, JPEG, WEBP, HEIC).")
        setSelectedFile(null)
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        setError("Die Datei ist zu groß (max. 8 MB).")
        setSelectedFile(null)
        return
      }

      setSelectedFile(file)
      setError(null)
      onFileSelected?.(file)
    },
    [onFileSelected]
  )

  const triggerFileDialog = () => {
    setError(null)
    inputRef.current?.click()
  }

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    handleFile(file ?? null)
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragActive(false)
    const file = event.dataTransfer.files?.[0]
    handleFile(file ?? null)
  }

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (!dragActive) setDragActive(true)
  }

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const related = event.relatedTarget as Node | null
    if (!related || !event.currentTarget.contains(related)) {
      setDragActive(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          resetState()
        }
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md bg-zinc-900/70 px-3 py-1.5 text-sm text-zinc-300 ring-1 ring-zinc-800 transition hover:text-white hover:ring-zinc-700"
          title="Bild einer Aufgabe hochladen"
        >
          <UploadCloud size={16} />
          Bild
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px] bg-[#0f0f10]/90 border-zinc-800 text-white">
        <DialogHeader className="space-y-2 text-center">
          <DialogTitle>Bild hochladen</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Wählen Sie ein Bild einer mathematischen Aufgabe aus.
          </DialogDescription>
        </DialogHeader>

        <input
          ref={inputRef}
          type="file"
          accept={acceptAttribute}
          className="hidden"
          onChange={onInputChange}
        />

        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={cn(
            "mt-4 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-zinc-700/70 bg-zinc-900/40 px-6 py-10 text-center transition-colors",
            dragActive && "border-lime-400/70 bg-lime-500/10 text-lime-200"
          )}
        >
          <UploadCloud className={cn("h-12 w-12 text-zinc-500", dragActive && "text-lime-300")} />
          <p className="text-sm text-zinc-300">Datei hierher ziehen oder</p>
          <Button
            type="button"
            onClick={triggerFileDialog}
            className="mt-1"
            style={{ background: theme.accent, color: "#0b0b0b" }}
          >
            Datei auswählen
          </Button>
          <p className="text-xs text-zinc-500">
            Unterstützte Formate: PNG, JPG, JPEG, WEBP, HEIC (max. 8 MB)
          </p>
        </div>

        {selectedFile && (
          <div className="mt-4 w-full rounded-md border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-left text-sm text-zinc-200">
            <div className="font-semibold text-white">{selectedFile.name}</div>
            <div className="text-xs text-zinc-500">{formatFileSize(selectedFile.size)}</div>
          </div>
        )}

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </DialogContent>
    </Dialog>
  )
}
