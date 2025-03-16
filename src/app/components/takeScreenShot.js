"use client";

import { useEffect, useRef, useState } from "react";

export default function TakeScreenShot() {
  const intervalRef = useRef(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));

  const captureAndSendScreenshot = async (employeeId) => {
    try {
      const track = mediaStream?.getVideoTracks()[0];
      if (!track) return;

      const imageCapture = new ImageCapture(track);
      const bitmap = await imageCapture.grabFrame();

      // Convert bitmap to a canvas
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(bitmap, 0, 0);

      // Convert to Base64
      const screenshot = canvas.toDataURL("image/png");

      // Send screenshot to API
      const response = await fetch("/employerAPI/screenShot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, screenCapture: screenshot }),
      });

      const data = await response.json();
      console.log("Screenshot sent:", data.message);
    } catch (error) {
      //console.error("Error capturing or sending screenshot:", error);
    }
  };

  const stopCapture = () => {
    localStorage.removeItem("permissionToShare");

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log("Screenshot capturing stopped.");
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
      console.log("Media stream stopped.");
    }
  };

  useEffect(() => {
    const startCapture = async () => {
        if (user && user.role === "EMPLOYEE") {
            console.log("User role:", user.role);

            // Only request media stream if it's not already active
            if (!mediaStream) {
                try {
                    const stream = await navigator.mediaDevices.getDisplayMedia({
                        video: { mediaSource: "screen" },
                    });
                    setMediaStream(stream);
                    const track = stream.getVideoTracks()[0];
                    console.log("User selected:", track.getSettings().displaySurface);
                    track.addEventListener("ended", () => {
                        console.log("User stopped screen sharing.");
                        setMediaStream(null);
                        stopCapture();
                    });
                } catch (error) {
                   // console.error("Error accessing display media:", error);
                    console.log(mediaStream);
                    localStorage.setItem("permissionToShare", "false");
                }
            }
            if(mediaStream){
              localStorage.setItem("permissionToShare", "true");
            }

            // Start capturing every 10 seconds
            intervalRef.current = setInterval(() => {
                if (!localStorage.getItem("user")) {
                    stopCapture();
                } else {
                    captureAndSendScreenshot(user.employeeId);
                    
                }
            }, 10000);
        } else {
            stopCapture();
        }
    };

    startCapture();

    const handleStorageChange = () => {
        const updatedUser = JSON.parse(localStorage.getItem("user") || "null");
        setUser(updatedUser);
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
        stopCapture();
        window.removeEventListener("storage", handleStorageChange);
    };
}, [user, mediaStream]);


  return null;
}

