/* ==========================================================================
   LIFE — the "off the clock" page
   Add a moment: drop a photo into images/life/ (ideally < 400 KB, ~1600px
   wide), then add an entry to the top of "moments".

     kind   "ocean" | "mountains" | "elsewhere"
     image  path to the photo (optional; text-only moments work too)

   Example:
     { kind: "ocean", title: "Dawn patrol", place: "Pacific Beach",
       date: "Oct 2026", image: "images/life/dawn-patrol.jpg",
       text: "Glassy, chest high, nobody out." },
   ========================================================================== */

window.LIFE = {
  // Optional cover photos for the two chapter cards. Leave null to use the illustrations.
  covers: { ocean: null, mountains: null },

  moments: []
};
