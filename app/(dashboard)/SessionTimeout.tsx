"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

//const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes

const INACTIVITY_LIMIT = 15 * 60 * 1000;  // 15 mins inactive session handle 

export default function SessionTimeout() {
    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;

        const logoutUser = async () => {
            await supabase.auth.signOut();

            window.location.href = "/login";
        };

        const resetTimer = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                logoutUser();
            }, INACTIVITY_LIMIT);
        };

        const activityEvents = [
            "mousedown",
            "mousemove",
            "keydown",
            "scroll",
            "touchstart",
            "click",
        ];

        activityEvents.forEach((event) => {
            window.addEventListener(
                event,
                resetTimer
            );
        });

        // Start the timer when the component loads
        resetTimer();

        return () => {
            clearTimeout(timeoutId);

            activityEvents.forEach((event) => {
                window.removeEventListener(
                    event,
                    resetTimer
                );
            });
        };
    }, []);

    return null;
}