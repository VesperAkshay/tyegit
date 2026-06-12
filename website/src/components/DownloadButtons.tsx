"use client";

import React, { useState, useEffect } from "react";

const WindowsIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 448 512" fill="currentColor"><path d="M0 93.7l183.6-25.3v177.4H0V93.7zm0 324.6l183.6 25.3V268.4H0v149.9zm203.8 28L448 480V268.4H203.8v177.9zm0-380.6v180.1H448V32L203.8 65.7z"/></svg>
);

const MacIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.3 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
);

const LinuxIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 448 512" fill="currentColor"><path d="M220.8 123.3c1 .5 1.8 1.7 3 1.7 1.1 0 2.8-.4 2.9-1.5.2-1.4-1.9-2.3-3.2-2.9-1.7-.7-3.9-1-5.5-.1-.4.2-.8.7-.6 1.1.3 1.3 2.3 1.1 3.4 1.7zm-21.9 1.7c1.2 0 2-1.2 3-1.7 1.1-.6 3.1-.4 3.5-1.7.2-.4-.2-.9-.6-1.1-1.6-.9-3.8-.6-5.5.1-1.3.6-3.4 1.5-3.2 2.9.1 1 1.8 1.5 2.8 1.5zM420 432.1c-3.6-8.8-20.6-42.5-50.4-59.6-5.4-3.1-11-5.2-16.7-7.2-3.2-1-6.1-2-9-3.4-7.1-3.3-8.3-7.2-8.5-10.6-26.4 14.3-60.5 14.3-86.8 0-1.1 5.8-5 11.2-13.4 14.5-2.7 1.1-5.3 1.9-7.7 2.7-5.7 1.9-11.4 3.8-16.7 7-29.6 17.1-46.7 50.7-50.4 59.6-1.5 3.5-2.3 7-2.3 10.4v1.5c.3 18.2 24.2 32.8 45.4 41 23.3 9 52 14 78 14 26 0 54.7-5 78-14 21.2-8.2 45.1-22.8 45.4-41v-1.5c0-3.4-.8-6.9-2.3-10.4zm-143.7-5.5c-4.4 0-7.8-2.5-7.8-5.6s3.4-5.6 7.8-5.6 7.8 2.5 7.8 5.6-3.4 5.6-7.8 5.6zm13.1-20.5c-3.9-1.5-8.4-2.8-13.1-2.8-4.7 0-9.2 1.3-13.1 2.8-7.9 2.9-14 8.2-14 14.3 0 6.1 6.1 11.4 14 14.3 3.9 1.5 8.4 2.8 13.1 2.8 4.7 0 9.2-1.3 13.1-2.8 7.9-2.9 14-8.2 14-14.3 0-6.1-6.1-11.4-14-14.3zM224 48c-42.3 0-68.5 21.3-68.5 68.5 0 20.3 3.2 42.4 8.7 65.5-2.6 1.7-5 3.9-6.9 6.7-12.7 19.3-8.8 59.9.4 78.6 3.6 7.3 11.5 15.6 22 21.9 1.4-6.6 4.6-12.6 9-18.4-.2-1.5-.2-2.9-.2-4.3 0-14.7 6.4-27.1 13.3-37.4l-.1-1.3c0-34.9 8.2-64.8 22.3-64.8 14 0 22.3 29.8 22.3 64.8l-.1 1.3c6.9 10.3 13.3 22.7 13.3 37.4 0 1.4 0 2.8-.2 4.3 4.4 5.8 7.6 11.8 9 18.4 10.5-6.3 18.4-14.6 22-21.9 9.2-18.7 13.1-59.3.4-78.6-1.9-2.8-4.3-5-6.9-6.7 5.5-23.1 8.7-45.2 8.7-65.5C292.5 69.3 266.3 48 224 48zm33.6 78.4c-4.4 0-7.8-2.5-7.8-5.6s3.4-5.6 7.8-5.6 7.8 2.5 7.8 5.6-3.4 5.6-7.8 5.6zm-67.2 0c-4.4 0-7.8-2.5-7.8-5.6s3.4-5.6 7.8-5.6 7.8 2.5 7.8 5.6-3.4 5.6-7.8 5.6z"/></svg>
);

export function DownloadButtons() {
  const [os, setOs] = useState<"windows" | "mac" | "linux" | "unknown">("unknown");
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Basic OS detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes("win")) {
      setOs("windows");
    } else if (userAgent.includes("mac")) {
      setOs("mac");
    } else if (userAgent.includes("linux") && !userAgent.includes("android")) {
      setOs("linux");
    } else {
      setOs("windows"); // Fallback to windows as default primary
    }
  }, []);

  const handleWindowsDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDownloading(true);
    try {
      const res = await fetch("https://api.github.com/repos/VesperAkshay/tyegit/releases/latest");
      if (res.ok) {
        const data = await res.json();
        const exeAsset = data.assets?.find((a: any) => a.name.endsWith(".exe") || a.name.endsWith(".msi"));
        if (exeAsset && exeAsset.browser_download_url) {
          const downloadUrl = exeAsset.browser_download_url;
          // Security validation: ensure the URL comes from GitHub and uses HTTPS
          if (downloadUrl.startsWith("https://github.com/")) {
            window.location.href = downloadUrl;
            setIsDownloading(false);
            return;
          }
        }
      }
      window.location.href = "https://github.com/VesperAkshay/tyegit/releases/latest";
    } catch (err) {
      window.location.href = "https://github.com/VesperAkshay/tyegit/releases/latest";
    }
    setIsDownloading(false);
  };

  const PrimaryWindows = () => (
    <a 
      href="https://github.com/VesperAkshay/tyegit/releases/latest"
      onClick={handleWindowsDownload}
      className="bg-signal text-white font-bold uppercase tracking-wide px-8 py-3 rounded-sm button-bevel flex items-center space-x-3 hover:brightness-110 active:brightness-90 transition-all cursor-pointer"
    >
      <WindowsIcon />
      <span>{isDownloading ? "Starting..." : "Download for Windows"}</span>
    </a>
  );

  const PrimaryMacSoon = () => (
    <div className="bg-chrome-indigo text-white font-bold uppercase tracking-wide px-8 py-3 rounded-sm button-bevel flex items-center space-x-3 opacity-80 cursor-not-allowed">
      <MacIcon />
      <span>Mac Version Coming Soon</span>
    </div>
  );

  const PrimaryLinuxSoon = () => (
    <div className="bg-chrome-indigo text-white font-bold uppercase tracking-wide px-8 py-3 rounded-sm button-bevel flex items-center space-x-3 opacity-80 cursor-not-allowed">
      <LinuxIcon />
      <span>Linux Version Coming Soon</span>
    </div>
  );

  const SecondaryWindows = () => (
    <a 
      href="https://github.com/VesperAkshay/tyegit/releases/latest"
      onClick={handleWindowsDownload}
      className="flex items-center space-x-1.5 opacity-90 hover:opacity-100 cursor-pointer bg-white/60 px-3 py-1 rounded-sm border border-chrome-indigo/30 transition-all text-signal"
    >
      <WindowsIcon />
      <span>Windows</span>
    </a>
  );

  const SecondaryMacSoon = () => (
    <div className="flex items-center space-x-1.5 opacity-60 cursor-not-allowed bg-white/40 px-3 py-1 rounded-sm border border-chrome-indigo/20">
      <MacIcon />
      <span>Mac</span>
      <span className="bg-chrome-indigo text-white px-1.5 py-0.5 rounded-xs text-[9px] ml-1">Soon</span>
    </div>
  );

  const SecondaryLinuxSoon = () => (
    <div className="flex items-center space-x-1.5 opacity-60 cursor-not-allowed bg-white/40 px-3 py-1 rounded-sm border border-chrome-indigo/20">
      <LinuxIcon />
      <span>Linux</span>
      <span className="bg-chrome-indigo text-white px-1.5 py-0.5 rounded-xs text-[9px] ml-1">Soon</span>
    </div>
  );

  return (
    <div className="flex flex-col items-center space-y-4 z-20">
      {/* Primary OS Button */}
      {os === "windows" && <PrimaryWindows />}
      {os === "mac" && <PrimaryMacSoon />}
      {os === "linux" && <PrimaryLinuxSoon />}
      {os === "unknown" && <PrimaryWindows />}

      {/* Secondary platforms */}
      <div className="flex items-center space-x-4 text-xs font-bold uppercase tracking-wide text-ink mt-2">
        {os !== "windows" && <SecondaryWindows />}
        {os !== "mac" && <SecondaryMacSoon />}
        {os !== "linux" && <SecondaryLinuxSoon />}
      </div>
    </div>
  );
}
