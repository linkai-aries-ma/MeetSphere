/**
 * Create a local invitation link
 *
 * @param invitation {Invitation} Invitation object (check lib.d.ts)
 * @returns {string} Local invitation link
 */
function createLink(invitation) {
    // Get URL base (scheme://host:port)
    const base = `${window.location.protocol}//${window.location.host}`;

    // Encode invitation in json > base64
    const json = JSON.stringify(invitation);
    const base64 = btoa(json);

    // Create link
    return `${base}/schedule?invitation=${base64}`;
}

/**
 * Create an empty 2D availability array
 * @param days {number} Number of days
 * @returns {number[][]} 2D array of 0s, each sub-array represents a day, each element represents 15 minutes
 */
function emptyAvailability(days) {
    return Array(days).fill(0).map(() => Array(24 * 4).fill(0));
}

/**
 * Randomly shuffle an array.
 * This code segment comes from https://stackoverflow.com/a/2450976
 *
 * @param array {Array} Array to shuffle
 * @returns {Array} Shuffled array
 */
function shuffle(array) {
    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex > 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}

/**
 * Register an overlay
 *
 * @param selector {string} CSS selector of the overlay
 * @returns {function, function} Show and hide functions
 */
function registerOverlay(selector) {
    const overlay = $(selector)

    // Toggle functions
    const show = () => overlay.css('display', 'flex');
    const hide = () => overlay.css('display', 'none');

    // Click outside to hide
    overlay.click(hide);

    // Disable inner click event propagation
    $(`${selector} > div`).click(e => e.stopPropagation());

    return [show, hide];
}

const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

console.log('lib.js loaded')


// Below is an example of how to use the functions above to create an invitation link

let avail = emptyAvailability(7);
// Set Friday 9:00 to 10:00 to 1 (available)
Array(4).fill(0).map((_, i) => avail[5][9 * 4 + i] = 1);
// Set Monday 10:00 to 11:00 to 1 (available)
Array(4).fill(0).map((_, i) => avail[1][10 * 4 + i] = 2);
// Set Wednesday 13:00 to 19:00 to 1 (available)
Array(4 * 6).fill(0).map((_, i) => avail[3][13 * 4 + i] = 3);

const DEBUG_INVITATION = {
    id: 'ab1ab1d0-1677-46a6-a95d-e0d990a08c48',
    title: 'Cat meeting',
    description: 'We should let our cats meet to see if they get along together.',
    location: 'Azalea\'s house',
    organizer: 'Azalea',
    participant: 'Lily',

    regularity: 'weekly',
    duration: 60,
    timezone: 'America/New_York',
    daysRequired: 1,
    availability: avail,
}

console.log(createLink(DEBUG_INVITATION))