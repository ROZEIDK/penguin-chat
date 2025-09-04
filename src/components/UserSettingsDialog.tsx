import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Settings, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserSettings {
  theme: string;
  searchEngine: string;
  startupBehavior: string;
  blockTrackers: boolean;
  blockThirdPartyCookies: boolean;
  sendDoNotTrack: boolean;
  blockFingerprinting: boolean;
}

export function UserSettingsDialog() {
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'dark',
    searchEngine: 'google',
    startupBehavior: 'start_page',
    blockTrackers: true,
    blockThirdPartyCookies: true,
    sendDoNotTrack: true,
    blockFingerprinting: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load stored settings
    const stored = localStorage.getItem('user-settings');
    if (stored) {
      setSettings(JSON.parse(stored));
    }
  }, []);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      localStorage.setItem('user-settings', JSON.stringify(settings));
      
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (key: keyof UserSettings, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-card max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">User Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-card-foreground">Theme</Label>
            <Select value={settings.theme} onValueChange={(value) => updateSetting('theme', value)}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-card-foreground">Search Engine</Label>
            <Select value={settings.searchEngine} onValueChange={(value) => updateSetting('searchEngine', value)}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="bing">Bing</SelectItem>
                <SelectItem value="duckduckgo">DuckDuckGo</SelectItem>
                <SelectItem value="yahoo">Yahoo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-card-foreground">Startup Behavior</Label>
            <Select value={settings.startupBehavior} onValueChange={(value) => updateSetting('startupBehavior', value)}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="start_page">Start Page</SelectItem>
                <SelectItem value="new_tab">New Tab</SelectItem>
                <SelectItem value="last_session">Restore Last Session</SelectItem>
                <SelectItem value="custom_urls">Custom URLs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-card-foreground">Privacy Settings</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="block-trackers" className="text-card-foreground">Block Trackers</Label>
              <Switch
                id="block-trackers"
                checked={settings.blockTrackers}
                onCheckedChange={(checked) => updateSetting('blockTrackers', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="block-cookies" className="text-card-foreground">Block Third-Party Cookies</Label>
              <Switch
                id="block-cookies"
                checked={settings.blockThirdPartyCookies}
                onCheckedChange={(checked) => updateSetting('blockThirdPartyCookies', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="do-not-track" className="text-card-foreground">Send Do Not Track</Label>
              <Switch
                id="do-not-track"
                checked={settings.sendDoNotTrack}
                onCheckedChange={(checked) => updateSetting('sendDoNotTrack', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="block-fingerprinting" className="text-card-foreground">Block Fingerprinting</Label>
              <Switch
                id="block-fingerprinting"
                checked={settings.blockFingerprinting}
                onCheckedChange={(checked) => updateSetting('blockFingerprinting', checked)}
              />
            </div>
          </div>

          <Button 
            onClick={handleSaveSettings} 
            disabled={isLoading}
            className="w-full gap-2"
          >
            <Save className="h-4 w-4" />
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}