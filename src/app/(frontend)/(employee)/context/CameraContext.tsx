"use client";
import { createContext, useState, useRef, useEffect, ReactNode } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import TrackerModal from "../(timeKeeping)/modals/tracker-form/page";

interface CameraContextType {
  videoRef: React.RefObject<HTMLVideoElement>;
  startCamera: () => void;
  stopCamera: () => void;
  stream: MediaStream | null;
}

export const CameraContext = createContext<CameraContextType | null>(null);

export const CameraProvider = ({ children }: { children: ReactNode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceapi, setFaceApi] = useState<any>(null);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const cameraStartedRef = useRef(false);
  const [isLarge, setIsLarge] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loggedActivitiesSet = useRef(new Set<string>());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userResponseRef = useRef(false);
  // const [modalTimer, setModalTimer] = useState(10);
  const [employeeId, setEmployeeId] = useState("");

  const [sleepingTimer, setSleepingTimer] = useState(0);
  const [idleTimer, setIdleTimer] = useState(0);
  const [isAsleep, setIsAsleep] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const lastLoggedTime = useRef<number | null>(null);
  const [message, setMessage] = useState("");
  const [currentActivity, setCurrentActivity] = useState("");


  const updateOnClose = async ()=>{

    const response = await fetch(`/employerAPI/getEmployeeStatus?employeeId=${employeeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });
  }

  const handleModalResponse = async (response: boolean) => {
    userResponseRef.current = response;
    setIsModalOpen(false);

    if (response) {
      if(currentActivity==="Sleeping"){
        updateActivity("User is sleeping", "Sleeping");
        setSleepingTimer(0); 
        setIsAsleep(false);
        startCamera();
      }
      else if(currentActivity==="Idle"){
        updateActivity("User is out of area", "Idle");
        setIdleTimer(0); 
        setIsIdle(false);
        startCamera();
      }
      loggedActivitiesSet.current.clear(); 
      return;
    } 
  };
 
  
  useEffect(() => {
    if (isModalOpen) {
      if(currentActivity==="Idle"){
        setMessage("Are you still there? Please confirm your presence");
      }
      else if(currentActivity==="Sleeping"){
      setMessage("Are you asleep? Please confirm your presence");
      }
      stopCamera();
    }
  }, [isModalOpen,currentActivity]);

  const [position, setPosition] = useState(() => ({
    x: typeof window !== "undefined" ? window.innerWidth - 120 : 0,
    y: typeof window !== "undefined" ? window.innerHeight - 100 : 0,
  }));

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setEmployeeId(user.employeeId);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const updateActivity = async (remarks: string, activity: string) => {
    if (!employeeId) {
      console.warn("Employee ID not found. Skipping update.");
      return;
    }

    try {
      const currentTime = new Date().toISOString();
      const response = await fetch(`/employeeAPI/humanActivityLog?activity=${activity}&employeeId=${employeeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          end: currentTime,
          remarks: remarks,
        }),
      });

      loggedActivitiesSet.current.clear(); 

      if (!response.ok) {
        throw new Error("Failed to update activity");
      }

      const data = await response.json();
      console.log("Activity updated successfully:", data);
    } catch (error) {
      console.error("❌ Error updating activity:", error);
    }
  };

  const logActivity = async (activity: string) => {
    if (!employeeId) {
      console.warn("Employee ID not found. Skipping log.");
      return;
    }
    if(activity!=="Yawning")
    {
        // Check if the activity has already been logged
        if (loggedActivitiesSet.current.has(activity)) {
          console.log(`Activity "${activity}" already logged. Skipping.`);
          return; // Skip logging if the activity has already been logged
        }

        // Add activity to the set so it is marked as logged
        loggedActivitiesSet.current.add(activity);
    }

    try {
      const startTime = new Date().toISOString();
      let end=null;
      let userRemarks=null;
      if(activity==="Yawning"){
         end = new Date().toISOString();
         userRemarks = "User is Yawning";
      }
      const response = await fetch("/employeeAPI/humanActivityLog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity,
          employeeId,
          start: startTime,
          end: end,
          remarks: userRemarks,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to log activity");
      }
    } catch (error) {
      console.error("❌ Error logging activity:", error);
    }
  };

  const toggleSize = () => {
    setIsLarge((prev) => {
      const newSize = !prev;
      if (newSize) {
        setPosition({
          x: (window.innerWidth - 200) / 2,
          y: (window.innerHeight - 200) / 2,
        });
      } else {
        setPosition((prev) => ({
          x: Math.min(prev.x, window.innerWidth - 150),
          y: Math.min(prev.y, window.innerHeight - 120),
        }));
      }
      return newSize;
    });
  };

  useEffect(() => {
    const updatePosition = () => {
      setPosition((prev) => ({
        x: Math.min(prev.x, window.innerWidth - 150),
        y: Math.min(prev.y, window.innerHeight - 120),
      }));
    };

    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, []);

  const startDrag = (e: React.MouseEvent) => {
    setDragging(true);
    setOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const onDrag = (e: MouseEvent) => {
    if (!dragging) return;

    setPosition((prev) => ({
      x: Math.max(0, Math.min(e.clientX - offset.x, window.innerWidth - 150)),
      y: Math.max(0, Math.min(e.clientY - offset.y, window.innerHeight - 120)),
    }));
  };

  const stopDrag = () => setDragging(false);

  useEffect(() => {
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("mouseup", stopDrag);
    return () => {
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup", stopDrag);
    };
  }, [dragging]);

  useEffect(() => {
    const initFaceApi = async () => {
      try {
        const faceApiModule = await import("@vladmandic/face-api");
        setFaceApi(faceApiModule);

        await tf.setBackend("webgl");
        await tf.ready();

        await loadModels(faceApiModule);

        setModelsLoaded(true);
      } catch (error) {
        console.error("❌ Error initializing Face API:", error);
      }
    };

    initFaceApi();
  }, []);

  const loadModels = async (faceApi: any) => {
    try {
      await faceApi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceApi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceApi.nets.faceRecognitionNet.loadFromUri("/models");
      await faceApi.nets.ssdMobilenetv1.loadFromUri("/models");
    } catch (error) {
      console.error("❌ Error loading Face API models:", error);
    }
  };

  const startCamera = async () => {
    try {
      if (cameraStartedRef.current) return; // Prevent multiple starts
  
      const permissionStatus = await navigator.permissions.query({ name: "camera" as PermissionName });
  
      if (permissionStatus.state === "denied") {
        console.error("❌ Camera access denied by user.");
        return;
      }
  
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
  
      const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(newStream);
      cameraStartedRef.current = true;
  
      const waitForVideo = async () => {
        return new Promise<void>((resolve) => {
          const checkVideo = () => {
            if (videoRef.current) {
              videoRef.current.srcObject = newStream;
              resolve();
            } else {
              requestAnimationFrame(checkVideo);
            }
          };
          checkVideo();
        });
      };
  
      await waitForVideo();
    } catch (error) {
      console.error("❌ Error accessing camera:", error);
      
    }
  };
  

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      cameraStartedRef.current = false;
    }
  };

  const detectUserState = async () => {
    if (!videoRef.current || !modelsLoaded || !faceapi || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const videoContainer = videoContainerRef.current;
    if (videoContainer) {
      canvas.width = videoContainer.clientWidth;
      canvas.height = videoContainer.clientHeight;
    }

    ctx?.clearRect(0, 0, canvas.width, canvas.height);

    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

        if (!detection || !detection.landmarks) {
          console.log("No face detected");
          setIdleTimer((prev) => {
            const updatedTimer = prev + 1; // Increment the timer by 1
            console.log(`Idle Timer: ${updatedTimer}`);
    
            if (updatedTimer >= 10 && !isIdle && !isModalOpen) {
              console.log("User is out of area");
              logActivity("Idle");
              if (currentActivity !== "Idle") {
                setCurrentActivity("Idle");
              }
              setIsIdle(true);
              setIsModalOpen(true); // Open modal
            }
    
            return updatedTimer; // Return the updated timer state
          });
          return; // Exit early if no face detected
        } else {
          if (isIdle && isModalOpen) {
            setIdleTimer(0); // Reset timer if eyes are open
            setIsIdle(false); // Mark user as awake if previously asleep
          }
        }
      const landmarks = detection.landmarks;
      const topLip = landmarks.getMouth()[13];
      const bottomLip = landmarks.getMouth()[19];
      const mouthHeight = bottomLip.y - topLip.y;

      if (mouthHeight > 20) {
        const currentTime = Date.now();
        
        if (!lastLoggedTime.current || currentTime - lastLoggedTime.current >= 5000) {
          console.log("User is yawning");
          logActivity("Yawning");  // Log activity if the condition is met and 5 seconds passed
  
          // Update the last logged time
          lastLoggedTime.current = currentTime;
        }
      }

      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();
      const leftEyeHeight = leftEye[1].y - leftEye[5].y;
      const leftEyeWidth = leftEye[3].x - leftEye[0].x;
      const leftEyeRatio = leftEyeHeight / leftEyeWidth;

      const rightEyeHeight = rightEye[1].y - rightEye[5].y;
      const rightEyeWidth = rightEye[3].x - rightEye[0].x;
      const rightEyeRatio = rightEyeHeight / rightEyeWidth;

      console.log("left eye: " + leftEyeRatio + " right eye: " + rightEyeRatio);

      if (leftEyeRatio > -0.28 && rightEyeRatio > -0.28) {
        setSleepingTimer((prev) => {
          const updatedTimer = prev + 1; // Increment the timer by 1
          console.log(`Sleeping Timer: ${updatedTimer}`);

          if (updatedTimer >= 10 && !isAsleep && !isModalOpen) {
            console.log("User is sleeping");
            logActivity("Sleeping");
            if (currentActivity !== "Sleeping") {
              setCurrentActivity("Sleeping");
            }
            setIsAsleep(true);
            setIsModalOpen(true); // Open modal
          }

          return updatedTimer; // Return the updated timer state
        });
      } else {
        setSleepingTimer(0); // Reset timer if eyes are open
        if (isAsleep && isModalOpen) {
          setIsAsleep(false); // Mark user as awake if previously asleep
        }
      }
    } catch (error) {
      console.error("❌ Error detecting face:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      detectUserState();
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [modelsLoaded, faceapi]);

  return (
    <CameraContext.Provider value={{ videoRef, startCamera, stopCamera, stream }}>
      {children}
      {stream && (
        <div
          ref={videoContainerRef}
          title="Drag me everywhere or double click me to view larger..."
          className="fixed cursor-pointer"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: isLarge ? "300px" : "100px",
            height: isLarge ? "280px" : "80px",
            zIndex: 1000,
          }}
          onMouseDown={startDrag}
          onDoubleClick={toggleSize}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full border rounded-md shadow-md bg-black"
          />
          <canvas ref={canvasRef} className="absolute top-0 left-0" />
          
        </div>
      )}
      <TrackerModal 
            isOpen={isModalOpen} 
            onClose={() => {
              handleModalResponse(true);
              updateOnClose();
            }}
            refresh={() => {}} 
            setMessage={message} 
          />
    </CameraContext.Provider>
  );
};
