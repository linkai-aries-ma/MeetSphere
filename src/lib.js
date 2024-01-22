
function createLink(invitation) {
    // Get URL base (scheme://host:port)
    const base = `${window.location.protocol}//${window.location.host}`;

    // Encode invitation in json > base64
    const json = JSON.stringify(invitation);
    const base64 = btoa(json);

    // Create link
    return `${base}/schedule?invitation=${base64}`;
}