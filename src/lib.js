
function createLink(invitation) {
    // Get URL base (scheme://host:port)
    const base = `${window.location.protocol}//${window.location.host}`;

    // Encode invitation in json > base64
    const json = JSON.stringify(invitation);
    const base64 = btoa(json);

    // Create link
    return `${base}/schedule?invitation=${base64}`;
}

console.log('lib.js loaded')

console.log(createLink({
    id: 'ab1ab1d0-1677-46a6-a95d-e0d990a08c48',
    title: 'Cat meeting',
    description: 'We should let our cats meet to see if they get along together.',
    location: 'My house',
    creator: 'Azalea',

    regularity: 'weekly',
    duration: 60,
    timezone: 'America/New_York',
    daysRequired: 2
}))