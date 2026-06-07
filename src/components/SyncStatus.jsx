import React, { useEffect, useState } from "react";
import { Check, Cloud, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { useAppContext } from "../hooks/useAppContext";
import { cn } from "../lib/utils";

export function SyncStatus() {
  const { syncStatus, lastSyncTime, syncedDeviceCount } = useAppContext();
  const [showDetails, setShowDetails] = useState(false);

  const getStatusConfig = () => {
    switch (syncStatus) {
      case "syncing":
        return {
          icon: Cloud,
          label: "Syncing...",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          dotColor: "bg-blue-600"
        };
      case "synced":
        return {
          icon: Check,
          label: "Synced",
          color: "text-green-600",
          bgColor: "bg-green-50",
          dotColor: "bg-green-600"
        };
      case "error":
        return {
          icon: AlertCircle,
          label: "Sync Error",
          color: "text-red-600",
          bgColor: "bg-red-50",
          dotColor: "bg-red-600"
        };
      case "offline":
        return {
          icon: WifiOff,
          label: "Offline",
          color: "text-amber-600",
          bgColor: "bg-amber-50",
          dotColor: "bg-amber-600"
        };
      default:
        return {
          icon: Check,
          label: "Synced",
          color: "text-green-600",
          bgColor: "bg-green-50",
          dotColor: "bg-green-600"
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <div className="flex items-center gap-2 relative">
      {/* Animated sync indicator */}
      <div
        className={cn(
          "relative flex items-center justify-center",
          "w-8 h-8 rounded-full cursor-pointer transition-all",
          config.bgColor,
          "hover:ring-2 hover:ring-offset-2 hover:ring-gray-300"
        )}
        onMouseEnter={() => setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
        title={`${config.label} • ${syncedDeviceCount} device${syncedDeviceCount > 1 ? "s" : ""} • Last sync: ${lastSyncTime?.toLocaleTimeString() || "never"}`}
      >
        <StatusIcon className={cn("w-4 h-4", config.color, syncStatus === "syncing" && "animate-spin")} />
        {syncStatus === "syncing" && (
          <div className="absolute w-8 h-8 rounded-full border-2 border-transparent border-t-current animate-pulse" />
        )}
      </div>

      {/* Popup details */}
      {showDetails && (
        <div className="absolute right-0 top-full mt-2 bg-gray-900 text-white text-sm rounded-lg p-3 whitespace-nowrap shadow-lg z-50 pointer-events-none">
          <div className="font-semibold">{config.label}</div>
          <div className="text-gray-300">
            {lastSyncTime ? `${lastSyncTime.toLocaleTimeString()}` : "Never synced"}
          </div>
          <div className="text-gray-400">
            {syncedDeviceCount > 1 ? `${syncedDeviceCount} devices active` : "1 device"}
          </div>
        </div>
      )}
    </div>
  );
}

export default SyncStatus;
