# **POE2 Party Finder \- Frontend Architecture Plan**

Based on the ERD, backend requirements, and the current UI implementation, the application utilizes a persistent layout with a sidebar for global navigation and a custom title bar for global state management.

## **1\. Global Layout & Persistent Components**

These components are always visible to the user, regardless of which page they are on.

* **Custom Title Bar (Global Session State):** \* Contains standard window controls (minimize, maximize, close).  
  * **Active Session Indicator:** When a user is in a lobby, a compact widget appears here. Keep it simple: Just the Lobby Status ("🔴 Started") and Capacity ("3/5").  
* **Sidebar Navigation:**  
  * **Main Links:** Home (Live Search), Lobby (Your active session or hosting hub).  
  * **Bottom Profile Area:** Displays the user's Avatar, IGN, and a Gear icon to open the Settings page.

## **2\. Home Page (Live Search & Marketplace)**

The default view for finding services.

* **Filter Panel (Completed):** \* Category chips, minimum host rating slider, pricing inputs, and currency dropdowns.  
  * Toggle for "Live Search" (activates SSE stream).  
* **Results Feed:** \* **Implementation:** A single, continuous scrolling list (Virtualized List / Infinite Scroll). Because data updates live via SSE, pagination is not viable.  
  * **Party Cards:** Each card displays:  
    * Host's Name, Rating, and Pinned Badge.  
    * Party Title.  
    * Cost (with Currency Icon).  
    * **Capacity / Spots Taken (e.g., "Filled: 3/5").**  
    * A prominent "Apply" button.

## **3\. The Lobby Page (Active Session / Hosting Hub)**

This is the unified hub for a player's active transaction. It acts dynamically based on the player's current database state.

* **State 1: Empty / Create Party View (Full Page):**  
  * If the user is NOT in a party, this page becomes the dedicated "Create Party" interface.  
  * **Template Manager:** A section to select, create, and save JSON templates.  
  * **Creation Form:** Full-page layout for League, Category, Currency dropdowns, Title, Description, Cost, and Capacity inputs.  
* **State 2: Customer View (When applied to a party):**  
  * Shows the Party details and current Application Status (Pending, Accepted, Rejected, Kicked).  
  * **The "Golden Button":** If Accepted, displays the "Copy Whisper Message" button.  
* **State 3: Host View (When hosting a party):**  
  * **Status Controls:** Buttons to advance the state (Gathering \-\> Started \-\> Ended).  
  * **Applicant Queue:** A real-time list of pending customers showing their Customer Rating.  
  * **Action Buttons:** Accept, Reject, or Kick (during a run) for each applicant.  
  * **Post-Run Rating:** Triggered automatically in this view when the Party status changes to Ended.

## **4\. Settings & Profile Page**

Accessed via the gear icon in the bottom left. This page is tiered with clear headers to separate personal identity from application preferences.

* **\--- Profile & Identity \---**  
  * Displays current ign, host\_rating, and customer\_rating.  
  * **Badge Manager:** View earned badges and toggle the pinned badge.  
  * **IGN Switcher:** Button to fetch the GGG roster and change their active character. *(Disabled if the user is currently in an active lobby).*  
* **\--- Application Settings \---**  
  * Dark Mode toggle (Completed).  
  * Future UI preferences (e.g., "Always on Top" toggle for the Tauri window, notification sounds).

## **5\. Overlays & Popovers**

* **Public Profile Popover:** A lightweight tooltip/popover when clicking another player's name anywhere in the app (like in the Live Search feed or Applicant Queue). It shows their quick stats and pinned badge without forcing the user to navigate to a new page.