/**
 * Formats a 24-hour time string (e.g. "14:30:00" or "09:00") into a 12-hour format with AM/PM (e.g. "2:30 PM" or "9:00 AM").
 */
export function formatTime12Hour(timeString: string | null | undefined): string {
    if (!timeString) return '';
    try {
        const parts = timeString.split(':');
        if (parts.length < 2) return timeString;
        
        let hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        
        if (isNaN(hours) || isNaN(minutes)) return timeString;
        
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // The hour '0' should be '12'
        const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
        
        return `${hours}:${minutesStr} ${ampm}`;
    } catch (e) {
        return timeString;
    }
}
