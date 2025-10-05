import { useState, useEffect } from "react";
import { calculateTimeToDepart } from "@/lib/signal-utils";

interface CountdownTimerProps {
  etd_next: string | null;
}

export function CountdownTimer({ etd_next }: CountdownTimerProps) {
  const [time, setTime] = useState(calculateTimeToDepart(etd_next));
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(calculateTimeToDepart(etd_next));
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [etd_next]);
  
  return <span className="font-mono">{time}</span>;
}
