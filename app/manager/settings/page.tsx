"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/AuthContext"
import { useSchoolSettings } from "@/hooks/useSchoolSettings"
import { schoolSettingsService, SchoolSettings } from "@/services/schoolSettingsService"
import { Settings, Upload } from "lucide-react"

export default function SettingsPage() {
  const { toast } = useToast()
  const { profile } = useAuth()
  const { settings, isLoading, mutate } = useSchoolSettings()
  const canEdit = profile?.role === 'owner' || profile?.role === 'manager'

  const [schoolName, setSchoolName] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [registrationFee, setRegistrationFee] = useState(500)
  const [logoUrl, setLogoUrl] = useState("/home.png")
  const [previousLogoUrls, setPreviousLogoUrls] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (settings) {
      setSchoolName(settings.school_name || "")
      setAddress(settings.address || "")
      setPhone(settings.phone || "")
      setRegistrationFee(settings.default_registration_fee || 500)
      setLogoUrl(settings.logo_url || "/home.png")
      setPreviousLogoUrls(settings.previous_logo_urls || [])
    }
  }, [settings])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canEdit) return

    setIsSaving(true)
    try {
      await schoolSettingsService.updateSettings({
        school_name: schoolName,
        address,
        phone,
        default_registration_fee: registrationFee,
        logo_url: logoUrl,
      })
      await mutate()
      toast({ title: "Success", description: "School settings updated." })
    } catch (error) {
      console.error("Failed to save settings:", error)
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !canEdit) return

    setIsUploading(true)
    try {
      const updated = await schoolSettingsService.uploadLogo(file)
      setLogoUrl(updated.logo_url || "/home.png")
      setPreviousLogoUrls(updated.previous_logo_urls || [])
      await mutate()
      toast({ title: "Success", description: "Logo uploaded." })
    } catch (error) {
      console.error("Failed to upload logo:", error)
      toast({ title: "Error", description: "Failed to upload logo.", variant: "destructive" })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSelectPreviousLogo = async (url: string) => {
    if (!canEdit) return
    try {
      const updated = await schoolSettingsService.selectPreviousLogo(url)
      setLogoUrl(updated.logo_url || "/home.png")
      setPreviousLogoUrls(updated.previous_logo_urls || [])
      await mutate()
      toast({ title: "Success", description: "Logo updated." })
    } catch (error) {
      console.error("Failed to select previous logo:", error)
      toast({ title: "Error", description: "Failed to update logo.", variant: "destructive" })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            School Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
            {/* Logo Section */}
            <div className="space-y-3">
              <Label>School Logo</Label>
              <div className="flex items-center gap-4">
                <img
                  src={logoUrl}
                  alt="School Logo"
                  className="h-16 w-auto object-contain rounded border"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/home.png' }}
                />
                {canEdit && (
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploading ? "Uploading..." : "Upload Logo"}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </div>
                )}
              </div>

              {previousLogoUrls.length > 0 && (
                <div className="space-y-2">
                  <Label>Previous Logos</Label>
                  <div className="flex items-center gap-3">
                    {previousLogoUrls.slice(0, 3).map((url) => (
                      <img
                        key={url}
                        src={url}
                        alt="Previous Logo"
                        className="h-12 w-auto object-contain rounded border cursor-pointer transition-colors hover:border-primary"
                        title="Click to use this logo"
                        onClick={() => handleSelectPreviousLogo(url)}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/home.png' }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* School Name */}
            <div className="space-y-2">
              <Label htmlFor="schoolName">School Name</Label>
              <Input
                id="schoolName"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                disabled={!canEdit}
                placeholder="Kennedy Management System"
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={!canEdit}
                placeholder="School address"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!canEdit}
                placeholder="Phone number"
              />
            </div>

            {/* Registration Fee */}
            <div className="space-y-2">
              <Label htmlFor="registrationFee">Default Registration Fee (DA)</Label>
              <Input
                id="registrationFee"
                type="number"
                min="0"
                value={registrationFee}
                onChange={(e) => setRegistrationFee(Number.parseInt(e.target.value) || 0)}
                disabled={!canEdit}
              />
            </div>

            {canEdit && (
              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            )}

            {!canEdit && (
              <p className="text-sm text-muted-foreground">Only the school owner or manager can modify settings.</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
